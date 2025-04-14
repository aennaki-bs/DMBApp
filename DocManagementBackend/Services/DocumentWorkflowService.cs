using DocManagementBackend.Data;
using DocManagementBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace DocManagementBackend.Services
{
    public class DocumentWorkflowService
    {
        private readonly ApplicationDbContext _context;

        public DocumentWorkflowService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> AssignDocumentToCircuitAsync(int documentId, int circuitId, int userId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var document = await _context.Documents
                    .Include(d => d.Circuit)
                    .FirstOrDefaultAsync(d => d.Id == documentId);

                if (document == null)
                    throw new KeyNotFoundException($"Document ID {documentId} not found");

                var circuit = await _context.Circuits
                    .Include(c => c.Steps.OrderBy(cd => cd.OrderIndex))
                    .FirstOrDefaultAsync(c => c.Id == circuitId && c.IsActive);

                if (circuit == null || !circuit.Steps.Any())
                    throw new InvalidOperationException($"Circuit ID {circuitId} not found or has no steps");

                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                    throw new KeyNotFoundException($"User ID {userId} not found");

                // Assign document to circuit
                document.CircuitId = circuitId;
                document.Circuit = circuit;
                document.Status = 1; // In Progress

                // Find first step
                var firstStep = circuit.Steps.OrderBy(cd => cd.OrderIndex).First();
                document.CurrentStepId = firstStep.Id;
                document.CurrentStep = firstStep;
                document.IsCircuitCompleted = false;

                // Create history entry
                var historyEntry = new DocumentCircuitHistory
                {
                    DocumentId = documentId,
                    Document = document,
                    StepId = firstStep.Id,
                    Step = firstStep,
                    ProcessedByUserId = userId,
                    ProcessedBy = user,
                    ProcessedAt = DateTime.UtcNow,
                    Comments = "Document assigned to circuit",
                    IsApproved = true
                };
                _context.DocumentCircuitHistory.Add(historyEntry);

                // Initialize document statuses
                var stepStatuses = await _context.Status
                    .Where(s => s.StepId == firstStep.Id)
                    .ToListAsync();

                foreach (var status in stepStatuses)
                {
                    var documentStatus = new DocumentStatus
                    {
                        DocumentId = documentId,
                        StatusId = status.Id,
                        IsComplete = false
                    };
                    _context.DocumentStatus.Add(documentStatus);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> ProcessActionAsync(int documentId, int actionId, int userId, string comments = "", bool isApproved = true)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var document = await _context.Documents
                    .Include(d => d.Circuit)
                    .Include(d => d.CurrentStep)
                    .FirstOrDefaultAsync(d => d.Id == documentId);

                if (document == null || document.CircuitId == null || document.CurrentStepId == null)
                    throw new InvalidOperationException("Document not assigned to circuit or step");

                var user = await _context.Users
                    .Include(u => u.Role)
                    .FirstOrDefaultAsync(u => u.Id == userId);

                if (user == null)
                    throw new KeyNotFoundException($"User ID {userId} not found");

                var action = await _context.Actions.FindAsync(actionId);
                if (action == null)
                    throw new KeyNotFoundException($"Action ID {actionId} not found");

                // Verify user has permission to perform this action on this step
                var step = document.CurrentStep;
                if (step == null)
                    throw new InvalidOperationException("Current step not found");

                if (step.ResponsibleRoleId.HasValue && step.ResponsibleRoleId != user.RoleId)
                    throw new UnauthorizedAccessException("User does not have permission for this step");

                // Verify action is valid for this step
                var stepAction = await _context.StepActions
                    .FirstOrDefaultAsync(sa => sa.StepId == step.Id && sa.ActionId == actionId);

                if (stepAction == null)
                    throw new InvalidOperationException($"Action ID {actionId} not valid for step ID {step.Id}");

                // Find which statuses this action affects
                var affectedStatuses = await _context.ActionStatusEffects
                    .Where(ase => ase.ActionId == actionId && ase.StepId == step.Id)
                    .ToListAsync();

                // Update document statuses
                foreach (var effect in affectedStatuses)
                {
                    var documentStatus = await _context.DocumentStatus
                        .FirstOrDefaultAsync(ds => ds.DocumentId == documentId && ds.StatusId == effect.StatusId);

                    if (documentStatus == null)
                    {
                        documentStatus = new DocumentStatus
                        {
                            DocumentId = documentId,
                            StatusId = effect.StatusId,
                            IsComplete = false
                        };
                        _context.DocumentStatus.Add(documentStatus);
                    }

                    // Set status as complete based on action effect
                    documentStatus.IsComplete = effect.SetsComplete;
                    documentStatus.CompletedByUserId = userId;
                    documentStatus.CompletedAt = DateTime.UtcNow;
                }

                // Create history entry
                var historyEntry = new DocumentCircuitHistory
                {
                    DocumentId = documentId,
                    StepId = step.Id,
                    ActionId = actionId,
                    ProcessedByUserId = userId,
                    ProcessedAt = DateTime.UtcNow,
                    Comments = comments,
                    IsApproved = isApproved
                };
                _context.DocumentCircuitHistory.Add(historyEntry);

                // Check if action is rejection
                if (!isApproved)
                {
                    document.Status = 3; // Rejected
                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();
                    return true;
                }

                // Check if all required statuses are complete to advance
                await _context.Entry(step).Collection(s => s.Statuses).LoadAsync();
                var requiredStatuses = step.Statuses.Where(s => s.IsRequired).ToList();

                var allComplete = true;
                foreach (var requiredStatus in requiredStatuses)
                {
                    var docStatus = await _context.DocumentStatus
                        .FirstOrDefaultAsync(ds => ds.DocumentId == documentId && ds.StatusId == requiredStatus.Id);

                    if (docStatus == null || !docStatus.IsComplete)
                    {
                        allComplete = false;
                        break;
                    }
                }

                // If all required statuses complete, advance to next step
                if (allComplete)
                {
                    await AdvanceToNextStepAsync(document, userId, $"All required actions completed by {user.Username}");
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> MoveToNextStepAsync(int documentId, int currentStepId, int nextStepId, int userId, string comments)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var document = await _context.Documents
                    .Include(d => d.Circuit)
                    .Include(d => d.CurrentStep)
                    .FirstOrDefaultAsync(d => d.Id == documentId);

                if (document == null)
                    throw new KeyNotFoundException("Document not found.");

                if (!document.CircuitId.HasValue)
                    throw new InvalidOperationException("Document is not assigned to a circuit.");

                if (document.IsCircuitCompleted)
                    throw new InvalidOperationException("Document workflow is already completed.");

                if (document.CurrentStepId != currentStepId)
                    throw new InvalidOperationException("Current step ID doesn't match the document's current step.");

                // Get the next step
                var nextStep = await _context.Steps.FindAsync(nextStepId);
                if (nextStep == null)
                    throw new KeyNotFoundException("Next step not found.");

                // Verify the next step belongs to the same circuit
                if (nextStep.CircuitId != document.CircuitId)
                    throw new InvalidOperationException("Next step doesn't belong to the document's circuit.");

                // Verify the user is authorized for this action (if the step has role requirements)
                var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);
                if (user == null)
                    throw new KeyNotFoundException("User not found.");

                if (nextStep.ResponsibleRoleId.HasValue && nextStep.ResponsibleRoleId != user.RoleId)
                {
                    var requiredRole = await _context.Roles.FindAsync(nextStep.ResponsibleRoleId.Value);
                    throw new UnauthorizedAccessException($"Only users with role '{requiredRole?.RoleName}' can move documents to this step.");
                }

                // Check if all required statuses are complete for the current step
                var requiredStatuses = await _context.Status
                    .Where(s => s.StepId == currentStepId && s.IsRequired)
                    .ToListAsync();

                foreach (var status in requiredStatuses)
                {
                    var documentStatus = await _context.DocumentStatus
                        .FirstOrDefaultAsync(ds => ds.DocumentId == documentId && ds.StatusId == status.Id);

                    if (documentStatus == null || !documentStatus.IsComplete)
                        throw new InvalidOperationException($"Required status '{status.Title}' is not complete.{documentStatus!.IsComplete}");
                }

                // Update document to move to next step
                document.CurrentStepId = nextStepId;
                document.CurrentStep = nextStep;
                document.UpdatedAt = DateTime.UtcNow;

                // Mark document as completed if this is the final step
                if (nextStep.IsFinalStep)
                {
                    document.IsCircuitCompleted = true;
                    document.Status = 2; // Completed
                }

                // Create document history record
                var history = new DocumentCircuitHistory
                {
                    DocumentId = documentId,
                    StepId = nextStepId,
                    ProcessedByUserId = userId,
                    ProcessedAt = DateTime.UtcNow,
                    Comments = comments,
                    IsApproved = true
                };

                // Create document statuses for the new step
                var nextStepStatuses = await _context.Status
                    .Where(s => s.StepId == nextStepId)
                    .ToListAsync();

                foreach (var status in nextStepStatuses)
                {
                    var documentStatus = new DocumentStatus
                    {
                        DocumentId = documentId,
                        StatusId = status.Id,
                        IsComplete = false
                    };

                    _context.DocumentStatus.Add(documentStatus);
                }

                _context.DocumentCircuitHistory.Add(history);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> CompleteDocumentStatusAsync(int documentId, int statusId, int userId, bool isComplete, string comments)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var document = await _context.Documents
                    .Include(d => d.Circuit)
                    .Include(d => d.CurrentStep)
                    .FirstOrDefaultAsync(d => d.Id == documentId);

                if (document == null)
                    throw new KeyNotFoundException("Document not found.");

                if (!document.CircuitId.HasValue)
                    throw new InvalidOperationException("Document is not assigned to a circuit.");

                if (document.IsCircuitCompleted)
                    throw new InvalidOperationException("Document workflow is already completed.");

                if (document.CurrentStepId == null)
                    throw new InvalidOperationException("Document does not have a current step in the workflow.");

                // Get the status
                var status = await _context.Status.FindAsync(statusId);
                if (status == null)
                    throw new KeyNotFoundException("Status not found.");

                // Verify the status belongs to the current step
                if (status.StepId != document.CurrentStepId)
                    throw new InvalidOperationException("The status must belong to the document's current step.");

                // Verify the user has the appropriate role for the current step if required
                var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);
                if (user == null)
                    throw new KeyNotFoundException("User not found.");

                if (document.CurrentStep!.ResponsibleRoleId.HasValue &&
                    document.CurrentStep.ResponsibleRoleId != user.RoleId)
                {
                    var requiredRole = await _context.Roles.FindAsync(document.CurrentStep.ResponsibleRoleId.Value);
                    throw new UnauthorizedAccessException(
                        $"Only users with role '{requiredRole?.RoleName}' can update statuses in this step.");
                }

                // Get or create the document status
                var documentStatus = await _context.DocumentStatus
                    .FirstOrDefaultAsync(ds => ds.DocumentId == documentId && ds.StatusId == statusId);

                if (documentStatus == null)
                {
                    documentStatus = new DocumentStatus
                    {
                        DocumentId = documentId,
                        StatusId = statusId,
                        IsComplete = isComplete,
                        CompletedByUserId = isComplete ? userId : null,
                        CompletedAt = isComplete ? DateTime.UtcNow : null
                    };
                    _context.DocumentStatus.Add(documentStatus);
                }
                else
                {
                    documentStatus.IsComplete = isComplete;
                    documentStatus.CompletedByUserId = isComplete ? userId : null;
                    documentStatus.CompletedAt = isComplete ? DateTime.UtcNow : null;
                }

                // Create document history record
                var history = new DocumentCircuitHistory
                {
                    DocumentId = documentId,
                    StepId = document.CurrentStepId.Value,
                    StatusId = statusId,
                    ProcessedByUserId = userId,
                    ProcessedAt = DateTime.UtcNow,
                    // Comments = comments,
                    IsApproved = true
                };

                _context.DocumentCircuitHistory.Add(history);

                // If all required statuses are complete, check if we should automatically
                // update the document status
                if (isComplete)
                {
                    // Check if all required statuses are now complete
                    var requiredStatuses = await _context.Status
                        .Where(s => s.StepId == document.CurrentStepId && s.IsRequired)
                        .ToListAsync();

                    bool allComplete = true;

                    foreach (var reqStatus in requiredStatuses)
                    {
                        if (reqStatus.Id == statusId)
                            continue; // We're setting this one complete

                        var docStatus = await _context.DocumentStatus
                            .FirstOrDefaultAsync(ds => ds.DocumentId == documentId && ds.StatusId == reqStatus.Id);

                        if (docStatus == null || !docStatus.IsComplete)
                        {
                            allComplete = false;
                            break;
                        }
                    }

                    // If all required statuses are complete, we can update the document status
                    if (allComplete && requiredStatuses.Count > 0)
                    {
                        // This is just setting a flag that all requirements are met
                        // It does not automatically advance the document to the next step
                        document.Status = 1; // In progress and ready to move
                        document.UpdatedAt = DateTime.UtcNow;
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        private async Task AdvanceToNextStepAsync(Document document, int userId, string comments)
        {
            var currentStep = document.CurrentStep;
            if (currentStep == null)
                throw new InvalidOperationException("Current step not found");

            // If final step, complete the circuit
            if (currentStep.IsFinalStep)
            {
                document.IsCircuitCompleted = true;
                document.Status = 2; // Completed

                // Create history entry for completion
                var completionHistory = new DocumentCircuitHistory
                {
                    DocumentId = document.Id,
                    StepId = currentStep.Id,
                    ProcessedByUserId = userId,
                    ProcessedAt = DateTime.UtcNow,
                    Comments = "Circuit completed",
                    IsApproved = true
                };
                _context.DocumentCircuitHistory.Add(completionHistory);

                return;
            }

            // Find next step based on circuit flow
            var circuit = document.Circuit;
            Step? nextStep;

            if (circuit!.HasOrderedFlow && currentStep.NextStepId.HasValue)
            {
                // For ordered flow, use the explicitly defined next step
                nextStep = await _context.Steps.FindAsync(currentStep.NextStepId.Value);
                if (nextStep == null)
                    throw new InvalidOperationException("Next step not found");
            }
            else
            {
                // For unordered flow, find the next appropriate step
                // This implementation would depend on your business rules
                // Here's a simple example that just takes the next by order index
                nextStep = await _context.Steps
                    .Where(s => s.CircuitId == circuit.Id && s.OrderIndex > currentStep.OrderIndex)
                    .OrderBy(s => s.OrderIndex)
                    .FirstOrDefaultAsync();

                if (nextStep == null)
                    throw new InvalidOperationException("No next step found for unordered flow");
            }

            // Update document's current step
            document.CurrentStepId = nextStep.Id;
            document.CurrentStep = nextStep;

            // Create history entry for step transition
            var transitionHistory = new DocumentCircuitHistory
            {
                DocumentId = document.Id,
                StepId = nextStep.Id,
                ProcessedByUserId = userId,
                ProcessedAt = DateTime.UtcNow,
                Comments = comments,
                IsApproved = true
            };
            _context.DocumentCircuitHistory.Add(transitionHistory);

            // Initialize new step's statuses
            var stepStatuses = await _context.Status
                .Where(s => s.StepId == nextStep.Id)
                .ToListAsync();

            foreach (var status in stepStatuses)
            {
                var documentStatus = new DocumentStatus
                {
                    DocumentId = document.Id,
                    StatusId = status.Id,
                    IsComplete = false
                };
                _context.DocumentStatus.Add(documentStatus);
            }
        }

        public async Task<bool> ReturnToPreviousStepAsync(int documentId, int userId, string comments)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var document = await _context.Documents
                    .Include(d => d.Circuit)
                    .Include(d => d.CurrentStep)
                    .FirstOrDefaultAsync(d => d.Id == documentId);

                if (document == null || document.CircuitId == null || document.CurrentStepId == null)
                    throw new InvalidOperationException("Document not assigned to circuit or step");

                var circuit = document.Circuit;
                if (circuit == null || !circuit.AllowBacktrack)
                    throw new InvalidOperationException("Backtracking not allowed for this circuit");

                var currentStep = document.CurrentStep;
                if (currentStep == null || !currentStep.PrevStepId.HasValue)
                    throw new InvalidOperationException("No previous step available");

                var previousStep = await _context.Steps.FindAsync(currentStep.PrevStepId.Value);
                if (previousStep == null)
                    throw new InvalidOperationException("Previous step not found");

                // Clear current step's statuses
                var currentStatuses = await _context.DocumentStatus
                    .Where(ds => ds.DocumentId == documentId &&
                           _context.Status.Any(s => s.Id == ds.StatusId && s.StepId == currentStep.Id))
                    .ToListAsync();

                _context.DocumentStatus.RemoveRange(currentStatuses);

                // Update document's current step
                document.CurrentStepId = previousStep.Id;
                document.CurrentStep = previousStep;

                // Create history entry for backtracking
                var backtrackHistory = new DocumentCircuitHistory
                {
                    DocumentId = document.Id,
                    StepId = previousStep.Id,
                    ProcessedByUserId = userId,
                    ProcessedAt = DateTime.UtcNow,
                    Comments = comments,
                    IsApproved = true
                };
                _context.DocumentCircuitHistory.Add(backtrackHistory);

                // Restore previous step's statuses
                // This might vary based on your requirements - you could either:
                // 1. Restore them to their previous state
                // 2. Reset them all to incomplete
                // Here we'll reset them to their previous state
                var previousStatuses = await _context.DocumentCircuitHistory
                    .Where(h => h.DocumentId == documentId && h.StepId == previousStep.Id)
                    .OrderByDescending(h => h.ProcessedAt)
                    .Include(h => h.Status)
                    .ToListAsync();

                foreach (var status in await _context.Status.Where(s => s.StepId == previousStep.Id).ToListAsync())
                {
                    var latestStatus = previousStatuses
                        .FirstOrDefault(h => h.StatusId == status.Id);

                    var documentStatus = new DocumentStatus
                    {
                        DocumentId = document.Id,
                        StatusId = status.Id,
                        IsComplete = latestStatus?.IsApproved ?? false,
                        CompletedByUserId = latestStatus?.ProcessedByUserId,
                        CompletedAt = latestStatus?.ProcessedAt
                    };
                    _context.DocumentStatus.Add(documentStatus);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<IEnumerable<DocumentCircuitHistory>> GetDocumentCircuitHistory(int documentId)
        {
            return await _context.DocumentCircuitHistory
                .Where(h => h.DocumentId == documentId)
                .Include(h => h.Step)
                .Include(h => h.ProcessedBy)
                .Include(h => h.Action)
                .Include(h => h.Status)
                .OrderByDescending(h => h.ProcessedAt)
                .ToListAsync();
        }
    }
}