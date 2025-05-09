using DocManagementBackend.Data;
using DocManagementBackend.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

namespace DocManagementBackend.Services
{
    public class DocumentWorkflowService
    {
        private readonly ApplicationDbContext _context;

        public DocumentWorkflowService(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Assigns a document to a circuit workflow and sets it to the initial status
        /// </summary>
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
                    .Include(c => c.Statuses)
                    .FirstOrDefaultAsync(c => c.Id == circuitId && c.IsActive);

                if (circuit == null)
                    throw new InvalidOperationException($"Circuit ID {circuitId} not found or not active");

                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                    throw new KeyNotFoundException($"User ID {userId} not found");

                // Find initial status for the circuit
                var initialStatus = circuit.Statuses.FirstOrDefault(s => s.IsInitial);
                if (initialStatus == null)
                    throw new InvalidOperationException("Circuit has no initial status defined");

                // Assign document to circuit
                document.CircuitId = circuitId;
                document.Circuit = circuit;
                document.Status = 1; // In Progress
                document.CurrentStatusId = initialStatus.Id;
                document.CurrentStatus = initialStatus;
                document.IsCircuitCompleted = false;

                // Create history entry
                var historyEntry = new DocumentCircuitHistory
                {
                    DocumentId = documentId,
                    StepId = null, // Now using null since StepId is nullable
                    StatusId = initialStatus.Id,
                    ProcessedByUserId = userId,
                    ProcessedAt = DateTime.UtcNow,
                    Comments = "Document assigned to circuit",
                    IsApproved = true
                };
                _context.DocumentCircuitHistory.Add(historyEntry);

                // Create document status record
                var documentStatus = new DocumentStatus
                {
                    DocumentId = documentId,
                    StatusId = initialStatus.Id,
                    IsComplete = false
                };
                _context.DocumentStatus.Add(documentStatus);

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

        /// <summary>
        /// Moves a document to a new status via defined steps/transitions
        /// </summary>
        public async Task<bool> MoveToNextStatusAsync(int documentId, int targetStatusId, int userId, string comments = "")
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var document = await _context.Documents
                    .Include(d => d.Circuit)
                    .Include(d => d.CurrentStatus)
                    .FirstOrDefaultAsync(d => d.Id == documentId);

                if (document == null || document.CurrentStatusId == null)
                    throw new KeyNotFoundException("Document not found or not in a workflow");

                if (document.IsCircuitCompleted)
                    throw new InvalidOperationException("Document workflow is already completed");

                var circuit = document.Circuit;
                if (circuit == null)
                    throw new InvalidOperationException("Document is not assigned to a circuit");

                var currentStatus = document.CurrentStatus;
                if (currentStatus == null)
                    throw new InvalidOperationException("Current status not found");

                var targetStatus = await _context.Status.FindAsync(targetStatusId);
                if (targetStatus == null)
                    throw new InvalidOperationException("Target status not found");

                if (targetStatus.CircuitId != circuit.Id)
                    throw new InvalidOperationException("Target status doesn't belong to document's circuit");

                // Handle transition based on transition type
                Step? step = null;
                
                // If the target status is flexible, we can move to it without a defined step
                if (targetStatus.IsFlexible)
                {
                    // No step needed for flexible statuses
                }
                else
                {
                // Check if there's a valid step (transition) from current to target status
                    step = await _context.Steps
                    .FirstOrDefaultAsync(s =>
                        s.CircuitId == circuit.Id &&
                        s.CurrentStatusId == document.CurrentStatusId &&
                        s.NextStatusId == targetStatusId);

                if (step == null)
                    throw new InvalidOperationException($"No valid transition found from current status to target status");
                }

                // Update document status
                document.CurrentStatusId = targetStatusId;
                document.CurrentStatus = targetStatus;
                
                // Update document's step if applicable
                if (step != null)
                {
                    document.CurrentStepId = step.Id;
                    document.CurrentStep = step;
                }
                
                document.UpdatedAt = DateTime.UtcNow;

                // Create history entry for the transition
                var historyEntry = new DocumentCircuitHistory
                {
                    DocumentId = documentId,
                    StepId = step?.Id,
                    StatusId = targetStatusId,
                    ProcessedByUserId = userId,
                    ProcessedAt = DateTime.UtcNow,
                    Comments = string.IsNullOrEmpty(comments) ? 
                        $"Moved from {currentStatus.Title} to {targetStatus.Title}" : 
                        comments,
                    IsApproved = true
                };
                _context.DocumentCircuitHistory.Add(historyEntry);

                // Create or update document status record
                var documentStatus = await _context.DocumentStatus
                    .FirstOrDefaultAsync(ds => ds.DocumentId == documentId && ds.StatusId == targetStatusId);

                if (documentStatus == null)
                {
                    documentStatus = new DocumentStatus
                    {
                        DocumentId = documentId,
                        StatusId = targetStatusId,
                        IsComplete = false
                    };
                    _context.DocumentStatus.Add(documentStatus);
                }

                // If the status is final, mark the document as completed
                if (targetStatus.IsFinal)
                {
                    document.IsCircuitCompleted = true;
                    document.Status = 2; // Completed
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

        /// <summary>
        /// Returns a document to a previous status based on available transitions
        /// </summary>
        public async Task<bool> ReturnToPreviousStatusAsync(int documentId, int targetStatusId, int userId, string comments = "")
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var document = await _context.Documents
                    .Include(d => d.Circuit)
                    .Include(d => d.CurrentStatus)
                    .FirstOrDefaultAsync(d => d.Id == documentId);

                if (document == null || document.CurrentStatusId == null)
                    throw new KeyNotFoundException("Document not found or not in a workflow");

                var circuit = document.Circuit;
                if (circuit == null)
                    throw new InvalidOperationException("Document is not assigned to a circuit");

                var currentStatus = document.CurrentStatus;
                if (currentStatus == null)
                    throw new InvalidOperationException("Current status not found");

                var targetStatus = await _context.Status.FindAsync(targetStatusId);
                if (targetStatus == null)
                    throw new InvalidOperationException("Target status not found");

                if (targetStatus.CircuitId != circuit.Id)
                    throw new InvalidOperationException("Target status doesn't belong to document's circuit");

                // Check if there is a transition from the target status to the current status
                // This verifies that we're going "backwards" in the workflow
                var backwardStep = await _context.Steps
                    .FirstOrDefaultAsync(s =>
                        s.CircuitId == circuit.Id &&
                        s.CurrentStatusId == targetStatusId &&
                        s.NextStatusId == document.CurrentStatusId);

                if (backwardStep == null && !targetStatus.IsFlexible)
                    throw new InvalidOperationException($"Cannot return to this status from current status");

                // Update document status
                document.CurrentStatusId = targetStatusId;
                document.CurrentStatus = targetStatus;
                document.UpdatedAt = DateTime.UtcNow;

                // If the document was completed and we're going back, it's no longer complete
                if (document.IsCircuitCompleted)
                {
                    document.IsCircuitCompleted = false;
                    document.Status = 1; // In Progress
                }

                // Create history entry for the transition
                var historyEntry = new DocumentCircuitHistory
                {
                    DocumentId = documentId,
                    StepId = null, // Now using null since StepId is nullable
                    StatusId = targetStatusId,
                    ProcessedByUserId = userId,
                    ProcessedAt = DateTime.UtcNow,
                    Comments = string.IsNullOrEmpty(comments) ? $"Returned from {currentStatus.Title} to {targetStatus.Title}" : comments,
                    IsApproved = true
                };
                _context.DocumentCircuitHistory.Add(historyEntry);

                // Create or update document status record
                var documentStatus = await _context.DocumentStatus
                    .FirstOrDefaultAsync(ds => ds.DocumentId == documentId && ds.StatusId == targetStatusId);

                if (documentStatus == null)
                {
                    documentStatus = new DocumentStatus
                    {
                        DocumentId = documentId,
                        StatusId = targetStatusId,
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

        /// <summary>
        /// Updates the completion state of a document's status
        /// </summary>
        public async Task<bool> CompleteDocumentStatusAsync(int documentId, int statusId, int userId, bool isComplete, string comments = "")
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var document = await _context.Documents
                    .FirstOrDefaultAsync(d => d.Id == documentId);

                if (document == null || document.CurrentStatusId == null)
                    throw new KeyNotFoundException("Document not found or not in a workflow");

                // Get the status and verify it belongs to the document's circuit
                var status = await _context.Status.FindAsync(statusId);
                if (status == null)
                    throw new KeyNotFoundException("Status not found");

                if (status.CircuitId != document.CircuitId)
                    throw new InvalidOperationException("Status does not belong to the document's circuit");

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

                // Update the document's IsCircuitCompleted status based on the completion state
                document.IsCircuitCompleted = isComplete;
                if (isComplete) 
                {
                    document.Status = 2; // Set document status to "Completed"
                }
                else
                {
                    document.Status = 1; // Set document status to "In Progress"
                }

                // Create history entry
                var historyEntry = new DocumentCircuitHistory
                {
                    DocumentId = documentId,
                    StepId = null, // Now using null since StepId is nullable
                    StatusId = statusId,
                    ProcessedByUserId = userId,
                    ProcessedAt = DateTime.UtcNow,
                    Comments = comments,
                    IsApproved = isComplete
                };
                _context.DocumentCircuitHistory.Add(historyEntry);

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

        /// <summary>
        /// Gets available transitions from the current status
        /// </summary>
        public async Task<List<StatusDto>> GetAvailableTransitionsAsync(int documentId)
        {
            Console.WriteLine($"GetAvailableTransitionsAsync called for documentId={documentId}");
            
            var document = await _context.Documents
                .Include(d => d.Circuit)
                .Include(d => d.CurrentStatus)
                .FirstOrDefaultAsync(d => d.Id == documentId);

            if (document == null || document.CurrentStatusId == null || document.CircuitId == null)
                throw new InvalidOperationException("Document not found or not in a workflow");

            Console.WriteLine($"Document current status: {document.CurrentStatus?.Title}, CircuitId: {document.CircuitId}");

            if (document.IsCircuitCompleted)
            {
                Console.WriteLine("Document workflow is already completed, no transitions available");
                return new List<StatusDto>(); // No transitions available if completed
            }

            // Find all possible next statuses based on steps defined for the current status
            var steps = await _context.Steps
                .Include(s => s.CurrentStatus)
                .Include(s => s.NextStatus)
                .Where(s =>
                    s.CircuitId == document.CircuitId &&
                    s.CurrentStatusId == document.CurrentStatusId)
                .ToListAsync();

            Console.WriteLine($"Found {steps.Count} steps for the current status");
            foreach (var step in steps)
            {
                Console.WriteLine($"Step: {step.Id}, CurrentStatus: {step.CurrentStatus?.Title}, NextStatus: {step.NextStatus?.Title}");
            }

            // Get the statuses for the available steps
            var nextStatusIds = steps.Select(s => s.NextStatusId).Distinct().ToList();
            Console.WriteLine($"Next status IDs from steps: {string.Join(", ", nextStatusIds)}");

            var statuses = await _context.Status
                .Where(s => nextStatusIds.Contains(s.Id))
                .Select(s => new StatusDto
                {
                    StatusId = s.Id,
                    StatusKey = s.StatusKey,
                    Title = s.Title,
                    Description = s.Description,
                    IsRequired = s.IsRequired,
                    IsInitial = s.IsInitial,
                    IsFinal = s.IsFinal,
                    IsFlexible = s.IsFlexible,
                    CircuitId = s.CircuitId,
                    // Empty transition info for now
                    TransitionInfo = ""
                })
                .ToListAsync();
            
            Console.WriteLine($"Found {statuses.Count} statuses for the available steps");
            
            // Set transition info after retrieving from database to avoid LINQ translation issues
            foreach (var status in statuses)
            {
                var step = steps.FirstOrDefault(s => s.NextStatusId == status.StatusId);
                
                if (status.IsFinal)
                {
                    status.TransitionInfo = "Complete document";
                }
                else if (step != null)
                {
                    status.TransitionInfo = $"Move to {status.Title}";
                }
                else
                {
                    status.TransitionInfo = $"Move to {status.Title}";
                }
                
                Console.WriteLine($"Status: {status.Title}, IsFinal: {status.IsFinal}, IsFlexible: {status.IsFlexible}, TransitionInfo: {status.TransitionInfo}");
            }

            // Also include any flexible statuses in the circuit
            Console.WriteLine("Fetching flexible statuses...");
            var flexibleStatuses = await _context.Status
                .Where(s =>
                    s.CircuitId == document.CircuitId &&
                    s.IsFlexible &&
                    s.Id != document.CurrentStatusId && // Don't include current status
                    !nextStatusIds.Contains(s.Id)) // Don't duplicate statuses
                .ToListAsync();

            Console.WriteLine($"Found {flexibleStatuses.Count} flexible statuses");
            foreach (var fs in flexibleStatuses)
            {
                Console.WriteLine($"Flexible status: {fs.Title}, ID: {fs.Id}");
                
                var statusDto = new StatusDto
                {
                    StatusId = fs.Id,
                    StatusKey = fs.StatusKey,
                    Title = fs.Title,
                    Description = fs.Description,
                    IsRequired = fs.IsRequired,
                    IsInitial = fs.IsInitial,
                    IsFinal = fs.IsFinal,
                    IsFlexible = fs.IsFlexible,
                    CircuitId = fs.CircuitId,
                    TransitionInfo = $"Move to {fs.Title}"
                };
                
                statuses.Add(statusDto);
            }

            Console.WriteLine($"Total available transitions: {statuses.Count}");
            return statuses;
        }

        /// <summary>
        /// Gets the document's workflow history
        /// </summary>
        public async Task<IEnumerable<DocumentCircuitHistory>> GetDocumentCircuitHistory(int documentId)
        {
            return await _context.DocumentCircuitHistory
                .Where(h => h.DocumentId == documentId)
                .Include(h => h.ProcessedBy)
                .Include(h => h.Action)
                .Include(h => h.Status)
                .OrderByDescending(h => h.ProcessedAt)
                .ToListAsync();
        }

        /// <summary>
        /// Processes an action for a document in its current status
        /// </summary>
        public async Task<bool> ProcessActionAsync(int documentId, int actionId, int userId, string comments = "", bool isApproved = true)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var document = await _context.Documents
                    .Include(d => d.Circuit)
                    .FirstOrDefaultAsync(d => d.Id == documentId);

                if (document == null || document.CircuitId == null || document.CurrentStatusId == null)
                    throw new InvalidOperationException("Document not assigned to circuit or status");

                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Id == userId);

                if (user == null)
                    throw new KeyNotFoundException($"User ID {userId} not found");

                var action = await _context.Actions.FindAsync(actionId);
                if (action == null)
                    throw new KeyNotFoundException($"Action ID {actionId} not found");

                // Create history entry
                var historyEntry = new DocumentCircuitHistory
                {
                    DocumentId = documentId,
                    StepId = null, // Now using null since StepId is nullable
                    ActionId = actionId,
                    StatusId = document.CurrentStatusId,
                    ProcessedByUserId = userId,
                    ProcessedAt = DateTime.UtcNow,
                    Comments = comments,
                    IsApproved = isApproved
                };
                _context.DocumentCircuitHistory.Add(historyEntry);

                // Handle rejection if the action is not approved
                if (!isApproved)
                {
                    document.Status = 3; // Rejected
                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();
                    return true;
                }

                // Check if action is associated with any steps that have the current status
                var steps = await _context.StepActions
                    .Include(sa => sa.Step)
                    .Where(sa =>
                        sa.ActionId == actionId &&
                        sa.Step.CurrentStatusId == document.CurrentStatusId &&
                        sa.Step.CircuitId == document.CircuitId)
                    .Select(sa => sa.Step)
                    .ToListAsync();

                // If there are steps associated with this action and current status,
                // auto-advance to the next status if action.AutoAdvance is true
                if (steps.Any() && action.AutoAdvance)
                {
                    // Take the first available transition
                    var step = steps.First();
                    await MoveToNextStatusAsync(
                        documentId,
                        step.NextStatusId,
                        userId,
                        $"Auto-advanced by action: {action.Title}");
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

        /// <summary>
        /// Deletes a document and all its related data including workflow history
        /// </summary>
        public async Task<bool> DeleteDocumentAsync(int documentId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // Delete related records in DocumentStepHistory first
                var stepHistoryRecords = await _context.DocumentStepHistory
                    .Where(dsh => dsh.DocumentId == documentId)
                    .ToListAsync();

                if (stepHistoryRecords.Any())
                {
                    _context.DocumentStepHistory.RemoveRange(stepHistoryRecords);
                    await _context.SaveChangesAsync();
                }

                // Delete related records in DocumentCircuitHistory
                var circuitHistoryRecords = await _context.DocumentCircuitHistory
                    .Where(dch => dch.DocumentId == documentId)
                    .ToListAsync();

                if (circuitHistoryRecords.Any())
                {
                    _context.DocumentCircuitHistory.RemoveRange(circuitHistoryRecords);
                    await _context.SaveChangesAsync();
                }

                // Delete related document statuses
                var documentStatuses = await _context.DocumentStatus
                    .Where(ds => ds.DocumentId == documentId)
                    .ToListAsync();

                if (documentStatuses.Any())
                {
                    _context.DocumentStatus.RemoveRange(documentStatuses);
                    await _context.SaveChangesAsync();
                }

                // Get the document itself
                var document = await _context.Documents.FindAsync(documentId);
                if (document == null)
                {
                    await transaction.RollbackAsync();
                    return false;
                }

                // Finally delete the document
                _context.Documents.Remove(document);
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

        /// <summary>
        /// Checks if a document can move to a specific status
        /// </summary>
        public async Task<bool> CanMoveToStatusAsync(int documentId, int targetStatusId)
        {
            Console.WriteLine($"CanMoveToStatusAsync called with documentId={documentId}, targetStatusId={targetStatusId}");
            
            var document = await _context.Documents
                .Include(d => d.CurrentStatus)
                .FirstOrDefaultAsync(d => d.Id == documentId);

            if (document == null || document.CurrentStatusId == null || document.CircuitId == null || document.IsCircuitCompleted)
            {
                Console.WriteLine("Document not found, not in workflow, or already completed");
                return false;
            }

            Console.WriteLine($"Document current status: {document.CurrentStatus?.Title}, CircuitId: {document.CircuitId}");

            // Check if the target status belongs to the document's circuit
            var targetStatus = await _context.Status.FindAsync(targetStatusId);
            if (targetStatus == null || targetStatus.CircuitId != document.CircuitId)
            {
                Console.WriteLine($"Target status not found or belongs to different circuit. Target CircuitId: {targetStatus?.CircuitId}");
                return false;
            }

            Console.WriteLine($"Target status: {targetStatus.Title}, IsFlexible: {targetStatus.IsFlexible}");

            // If the status is flexible, it can always be reached
            if (targetStatus.IsFlexible)
            {
                Console.WriteLine("Target status is flexible, transition is allowed");
                return true;
            }

            // Check if there's a step/transition from current status to target status
            var hasStep = await _context.Steps.AnyAsync(s =>
                s.CircuitId == document.CircuitId &&
                s.CurrentStatusId == document.CurrentStatusId &&
                s.NextStatusId == targetStatusId);

            Console.WriteLine($"Has direct step from current to target status: {hasStep}");
            return hasStep;
        }

        /// <summary>
        /// Gets a document's workflow status information
        /// </summary>
        public async Task<DocumentWorkflowStatusDto> GetDocumentWorkflowStatusAsync(int documentId)
        {
            var document = await _context.Documents
                .Include(d => d.Circuit)
                .Include(d => d.CurrentStatus)
                .Include(d => d.CurrentStep)
                .FirstOrDefaultAsync(d => d.Id == documentId);

            if (document == null)
                throw new KeyNotFoundException("Document not found");

            if (document.CircuitId == null || document.CurrentStatusId == null)
                throw new InvalidOperationException("Document is not in a workflow");

            // Get available transitions safely with try-catch
            List<StatusDto> availableTransitions = new List<StatusDto>();
            try
            {
                availableTransitions = await GetAvailableTransitionsAsync(documentId);
            }
            catch (Exception ex)
            {
                // Log the exception but continue with an empty transitions list
                Console.WriteLine($"Error getting available transitions: {ex.Message}");
            }

            // Get document status records
            var documentStatuses = await _context.DocumentStatus
                .Where(ds => ds.DocumentId == documentId)
                .Include(ds => ds.Status)
                .Include(ds => ds.CompletedBy)
                .ToListAsync();

            var statuses = documentStatuses.Select(ds => new DocumentStatusDto
            {
                StatusId = ds.StatusId,
                Title = ds.Status?.Title ?? "Unknown",
                IsRequired = ds.Status?.IsRequired ?? false,
                IsComplete = ds.IsComplete,
                CompletedBy = ds.CompletedBy?.Username,
                CompletedAt = ds.CompletedAt
            }).ToList();

            // Get status of the document
            var statusText = document.Status switch
            {
                0 => "Draft",
                1 => "In Progress",
                2 => "Completed",
                3 => "Rejected",
                _ => "Unknown"
            };

            // Check if advance to next step is allowed (all required statuses must be complete)
            bool canAdvanceToNextStep = false;
            bool canReturnToPreviousStep = false;
            
            try
            {
                // Check if document can advance to next step
                canAdvanceToNextStep = await CanMoveToNextStatusAsync(documentId);
                
                // Check if document can return to previous step
                canReturnToPreviousStep = document.Circuit?.AllowBacktrack == true;
            }
            catch (Exception)
            {
                // Silently handle errors - defaults remain false
            }

            // Get available actions for the document
            var availableActions = new List<ActionDto>();
            try
            {
                if (document.CurrentStatusId.HasValue)
                {
                    // Get actions from steps that have current status as their current status
                    availableActions = await _context.StepActions
                        .Include(sa => sa.Step)
                        .Include(sa => sa.Action)
                        .Where(sa => sa.Step.CurrentStatusId == document.CurrentStatusId)
                        .Select(sa => new ActionDto
                        {
                            ActionId = sa.Action.Id,
                            Title = sa.Action.Title,
                            Description = sa.Action.Description ?? ""
                        })
                        .ToListAsync();
                }
            }
            catch (Exception)
            {
                // Silently handle errors
            }

            var result = new DocumentWorkflowStatusDto
            {
                DocumentId = document.Id,
                DocumentTitle = document.Title,
                CircuitId = document.CircuitId,
                CircuitTitle = document.Circuit?.Title ?? "Unknown",
                CurrentStatusId = document.CurrentStatusId,
                CurrentStatusTitle = document.CurrentStatus?.Title ?? "Unknown",
                CurrentStepId = document.CurrentStepId,
                CurrentStepTitle = document.CurrentStep?.Title ?? "",
                Status = document.Status,
                StatusText = statusText,
                IsCircuitCompleted = document.IsCircuitCompleted,
                Statuses = statuses,
                AvailableStatusTransitions = availableTransitions,
                AvailableActions = availableActions,
                CanAdvanceToNextStep = canAdvanceToNextStep,
                CanReturnToPreviousStep = canReturnToPreviousStep
            };

            return result;
        }

        /// <summary>
        /// Determines if a document can move to the next status
        /// </summary>
        private async Task<bool> CanMoveToNextStatusAsync(int documentId)
        {
            var document = await _context.Documents
                .Include(d => d.Circuit)
                .Include(d => d.CurrentStatus)
                .FirstOrDefaultAsync(d => d.Id == documentId);

            if (document == null || document.CurrentStatusId == null || document.CircuitId == null)
                return false;

            // Check if there are any next statuses available
            var availableTransitions = await GetAvailableTransitionsAsync(documentId);
            
            // If there are no available transitions, document can't move forward
            if (!availableTransitions.Any())
                return false;
            
            // Check if any flexible statuses are available
            var hasFlexibleTransitions = availableTransitions.Any(s => s.IsFlexible);
            
            // Check for final status
            var isFinalStatus = document.CurrentStatus?.IsFinal ?? false;
            
            // Document can move if it's not in final status and has available transitions
            return !isFinalStatus && (availableTransitions.Any() || hasFlexibleTransitions);
        }
    }
}