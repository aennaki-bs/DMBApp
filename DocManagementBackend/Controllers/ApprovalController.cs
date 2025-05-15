// Controllers/ApprovalController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DocManagementBackend.Data;
using DocManagementBackend.Models;
using DocManagementBackend.Services;
using System.Security.Claims;

namespace DocManagementBackend.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ApprovalController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly DocumentWorkflowService _workflowService;

        public ApprovalController(ApplicationDbContext context, DocumentWorkflowService workflowService)
        {
            _context = context;
            _workflowService = workflowService;
        }

        [HttpGet("pending")]
        public async Task<ActionResult<IEnumerable<PendingApprovalDto>>> GetPendingApprovals()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized("User ID claim is missing.");

            int userId = int.Parse(userIdClaim);
            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return BadRequest("User not found.");

            if (!user.IsActive)
                return Unauthorized("User account is deactivated. Please contact an admin!");

            // Get all pending approvals for this user
            var pendingApprovals = new List<PendingApprovalDto>();

            // 1. Get single-user approvals
            var singleApprovals = await _context.ApprovalWritings
                .Include(aw => aw.Document)
                .Include(aw => aw.Step)
                .Include(aw => aw.ProcessedBy)
                .Where(aw => 
                    aw.ApprovatorId.HasValue && 
                    aw.Status == ApprovalStatus.Open &&
                    _context.Approvators
                        .Any(a => a.Id == aw.ApprovatorId && a.UserId == userId))
                .ToListAsync();

            foreach (var approval in singleApprovals)
            {
                pendingApprovals.Add(new PendingApprovalDto
                {
                    ApprovalId = approval.Id,
                    DocumentId = approval.DocumentId,
                    DocumentKey = approval.Document?.DocumentKey ?? string.Empty,
                    DocumentTitle = approval.Document?.Title ?? string.Empty,
                    StepTitle = approval.Step?.Title ?? string.Empty,
                    RequestedBy = approval.ProcessedBy?.Username ?? string.Empty,
                    RequestDate = approval.CreatedAt,
                    Comments = approval.Comments,
                    ApprovalType = "Single"
                });
            }

            // 2. Get group approvals
            var groupApprovals = await _context.ApprovalWritings
                .Include(aw => aw.Document)
                .Include(aw => aw.Step)
                .Include(aw => aw.ProcessedBy)
                .Where(aw => 
                    aw.ApprovatorsGroupId.HasValue && 
                    (aw.Status == ApprovalStatus.Open || aw.Status == ApprovalStatus.InProgress) &&
                    _context.ApprovatorsGroupUsers
                        .Any(gu => gu.GroupId == aw.ApprovatorsGroupId && gu.UserId == userId))
                .ToListAsync();

            foreach (var approval in groupApprovals)
            {
                // Check if user has already responded
                bool hasResponded = await _context.ApprovalResponses
                    .AnyAsync(ar => ar.ApprovalWritingId == approval.Id && ar.UserId == userId);

                if (hasResponded)
                    continue;

                // For sequential rule, check if it's this user's turn
                var group = await _context.ApprovatorsGroups
                    .Include(g => g.ApprovatorsGroupUsers)
                    .FirstOrDefaultAsync(g => g.Id == approval.ApprovatorsGroupId);

                var rule = await _context.ApprovatorsGroupRules
                    .FirstOrDefaultAsync(r => r.GroupId == approval.ApprovatorsGroupId);

                if (rule?.RuleType == RuleType.Sequential)
                {
                    // Get existing responses
                    var responses = await _context.ApprovalResponses
                        .Where(r => r.ApprovalWritingId == approval.Id)
                        .ToListAsync();

                    var respondedUserIds = responses.Select(r => r.UserId).ToList();

                    // Get ordered users in the group
                    var orderedUsers = group?.ApprovatorsGroupUsers
                        .Where(gu => gu.OrderIndex.HasValue)
                        .OrderBy(gu => gu.OrderIndex.Value)
                        .ToList();

                    // If no responses yet, only first user can approve
                    if (!responses.Any())
                    {
                        if (orderedUsers?.First().UserId != userId)
                            continue;
                    }
                    else
                    {
                        // Find the next user in sequence
                        var highestRespondedIndex = orderedUsers
                            .Where(gu => respondedUserIds.Contains(gu.UserId))
                            .Max(gu => gu.OrderIndex.Value);

                        var nextUser = orderedUsers
                            .FirstOrDefault(gu => gu.OrderIndex.Value > highestRespondedIndex);

                        if (nextUser?.UserId != userId)
                            continue;
                    }
                }

                pendingApprovals.Add(new PendingApprovalDto
                {
                    ApprovalId = approval.Id,
                    DocumentId = approval.DocumentId,
                    DocumentKey = approval.Document?.DocumentKey ?? string.Empty,
                    DocumentTitle = approval.Document?.Title ?? string.Empty,
                    StepTitle = approval.Step?.Title ?? string.Empty,
                    RequestedBy = approval.ProcessedBy?.Username ?? string.Empty,
                    RequestDate = approval.CreatedAt,
                    Comments = approval.Comments,
                    ApprovalType = rule?.RuleType == RuleType.Sequential ? "Sequential" :
                                 rule?.RuleType == RuleType.All ? "All" : "Any"
                });
            }

            return Ok(pendingApprovals);
        }

        [HttpPost("{approvalId}/respond")]
        public async Task<IActionResult> RespondToApproval(int approvalId, [FromBody] ApprovalResponseDto response)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized("User ID claim is missing.");

            int userId = int.Parse(userIdClaim);
            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return BadRequest("User not found.");

            if (!user.IsActive)
                return Unauthorized("User account is deactivated. Please contact an admin!");

            try
            {
                bool result = await _workflowService.ProcessApprovalResponseAsync(
                    approvalId, userId, response.IsApproved, response.Comments);

                return Ok(new { IsApproved = response.IsApproved, Result = result });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpGet("history/{documentId}")]
        public async Task<ActionResult<IEnumerable<ApprovalHistoryDto>>> GetApprovalHistory(int documentId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized("User ID claim is missing.");

            int userId = int.Parse(userIdClaim);
            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return BadRequest("User not found.");

            if (!user.IsActive)
                return Unauthorized("User account is deactivated. Please contact an admin!");

            var approvalHistory = new List<ApprovalHistoryDto>();

            // Get all approval writings for this document
            var approvalWritings = await _context.ApprovalWritings
                .Include(aw => aw.Step)
                .Include(aw => aw.ProcessedBy)
                .Where(aw => aw.DocumentId == documentId)
                .OrderByDescending(aw => aw.CreatedAt)
                .ToListAsync();

            foreach (var writing in approvalWritings)
            {
                var historyItem = new ApprovalHistoryDto
                {
                    ApprovalId = writing.Id,
                    StepTitle = writing.Step?.Title ?? string.Empty,
                    RequestedBy = writing.ProcessedBy?.Username ?? string.Empty,
                    RequestDate = writing.CreatedAt,
                    Status = writing.Status.ToString(),
                    Comments = writing.Comments,
                    Responses = new List<ApprovalResponseHistoryDto>()
                };

                // Get responses for this approval
                var responses = await _context.ApprovalResponses
                    .Include(r => r.User)
                    .Where(r => r.ApprovalWritingId == writing.Id)
                    .OrderBy(r => r.ResponseDate)
                    .ToListAsync();

                foreach (var response in responses)
                {
                    historyItem.Responses.Add(new ApprovalResponseHistoryDto
                    {
                        ResponderName = response.User?.Username ?? string.Empty,
                        ResponseDate = response.ResponseDate,
                        IsApproved = response.IsApproved,
                        Comments = response.Comments
                    });
                }

                approvalHistory.Add(historyItem);
            }

            return Ok(approvalHistory);
        }

        [HttpGet("configure/steps")]
        public async Task<ActionResult<IEnumerable<StepWithApprovalDto>>> GetStepsWithApproval()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized("User ID claim is missing.");

            int userId = int.Parse(userIdClaim);
            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return BadRequest("User not found.");

            if (!user.IsActive)
                return Unauthorized("User account is deactivated. Please contact an admin!");

            if (user.Role!.RoleName != "Admin" && user.Role!.RoleName != "FullUser")
                return Unauthorized("User not allowed to view step configuration.");

            var steps = await _context.Steps
                .Include(s => s.Circuit)
                .Include(s => s.CurrentStatus)
                .Include(s => s.NextStatus)
                .Select(s => new StepWithApprovalDto
                {
                    StepId = s.Id,
                    StepKey = s.StepKey,
                    CircuitId = s.CircuitId,
                    CircuitTitle = s.Circuit!.Title,
                    Title = s.Title,
                    Descriptif = s.Descriptif,
                    CurrentStatusId = s.CurrentStatusId,
                    CurrentStatusTitle = s.CurrentStatus!.Title,
                    NextStatusId = s.NextStatusId,
                    NextStatusTitle = s.NextStatus!.Title,
                    RequiresApproval = s.RequiresApproval
                })
                .ToListAsync();

            return Ok(steps);
        }

        [HttpPost("configure/step/{stepId}")]
        public async Task<IActionResult> ConfigureStepApproval(
            int stepId, [FromBody] StepApprovalConfigDto config)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized("User ID claim is missing.");

            int userId = int.Parse(userIdClaim);
            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return BadRequest("User not found.");

            if (!user.IsActive)
                return Unauthorized("User account is deactivated. Please contact an admin!");

            if (user.Role!.RoleName != "Admin" && user.Role!.RoleName != "FullUser")
                return Unauthorized("User not allowed to configure step approval.");

            var step = await _context.Steps.FindAsync(stepId);
            if (step == null)
                return NotFound("Step not found.");

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Update the step's RequiresApproval flag
                step.RequiresApproval =config.RequiresApproval;
                
                if (config.RequiresApproval)
                {
                    // Clear existing approvators and groups
                    var existingApprovators = await _context.Approvators
                        .Where(a => a.StepId == stepId)
                        .ToListAsync();
                    _context.Approvators.RemoveRange(existingApprovators);
                    
                    var existingGroups = await _context.ApprovatorsGroups
                        .Where(g => g.StepId == stepId)
                        .ToListAsync();
                    
                    foreach (var group in existingGroups)
                    {
                        // Also remove group users and rules
                        var groupUsers = await _context.ApprovatorsGroupUsers
                            .Where(gu => gu.GroupId == group.Id)
                            .ToListAsync();
                        _context.ApprovatorsGroupUsers.RemoveRange(groupUsers);
                        
                        var groupRules = await _context.ApprovatorsGroupRules
                            .Where(gr => gr.GroupId == group.Id)
                            .ToListAsync();
                        _context.ApprovatorsGroupRules.RemoveRange(groupRules);
                    }
                    
                    _context.ApprovatorsGroups.RemoveRange(existingGroups);
                    
                    // Add new configuration based on the approval type
                    if (config.ApprovalType == "Single" && config.SingleApproverId.HasValue)
                    {
                        var approvator = new Approvator
                        {
                            StepId = stepId,
                            UserId = config.SingleApproverId.Value,
                            Comment = config.Comment ?? string.Empty
                        };
                        
                        _context.Approvators.Add(approvator);
                    }
                    else if (config.ApprovalType == "Group" && 
                             config.GroupApproverIds != null && 
                             config.GroupApproverIds.Any())
                    {
                        // Create group
                        var group = new ApprovatorsGroup
                        {
                            StepId = stepId,
                            Name = config.GroupName ?? $"Approvers for Step {stepId}",
                            Comment = config.Comment ?? string.Empty
                        };
                        
                        _context.ApprovatorsGroups.Add(group);
                        await _context.SaveChangesAsync(); // Save to get group ID
                        
                        // Add users to group
                        for (int i = 0; i < config.GroupApproverIds.Count; i++)
                        {
                            var groupUser = new ApprovatorsGroupUser
                            {
                                GroupId = group.Id,
                                UserId = config.GroupApproverIds[i],
                                OrderIndex = config.RuleType == "Sequential" ? i : null
                            };
                            
                            _context.ApprovatorsGroupUsers.Add(groupUser);
                        }
                        
                        // Create rule
                        RuleType ruleType;
                        
                        switch (config.RuleType)
                        {
                            case "Any":
                                ruleType = RuleType.Any;
                                break;
                            case "Sequential":
                                ruleType = RuleType.Sequential;
                                break;
                            default:
                                ruleType = RuleType.All;
                                break;
                        }
                        
                        var rule = new ApprovatorsGroupRule
                        {
                            GroupId = group.Id,
                            RuleType = ruleType
                        };
                        
                        _context.ApprovatorsGroupRules.Add(rule);
                    }
                    else
                    {
                        return BadRequest("Invalid approval configuration. Must specify either a single approver or a group.");
                    }
                }
                
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                
                return Ok("Step approval configuration updated successfully.");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpGet("configure/step/{stepId}")]
        public async Task<ActionResult<StepApprovalConfigDetailDto>> GetStepApprovalConfig(int stepId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized("User ID claim is missing.");

            int userId = int.Parse(userIdClaim);
            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return BadRequest("User not found.");

            if (!user.IsActive)
                return Unauthorized("User account is deactivated. Please contact an admin!");

            if (user.Role!.RoleName != "Admin" && user.Role!.RoleName != "FullUser")
                return Unauthorized("User not allowed to view step configuration.");

            var step = await _context.Steps
                .Include(s => s.Circuit)
                .Include(s => s.CurrentStatus)
                .Include(s => s.NextStatus)
                .FirstOrDefaultAsync(s => s.Id == stepId);
                
            if (step == null)
                return NotFound("Step not found.");
                
            var config = new StepApprovalConfigDetailDto
            {
                StepId = step.Id,
                StepKey = step.StepKey,
                CircuitId = step.CircuitId,
                CircuitTitle = step.Circuit?.Title ?? string.Empty,
                Title = step.Title,
                Descriptif = step.Descriptif,
                CurrentStatusId = step.CurrentStatusId,
                CurrentStatusTitle = step.CurrentStatus?.Title ?? string.Empty,
                NextStatusId = step.NextStatusId,
                NextStatusTitle = step.NextStatus?.Title ?? string.Empty,
                RequiresApproval = step.RequiresApproval,
                ApprovalType = "None",
                Comment = string.Empty
            };
            
            if (step.RequiresApproval)
            {
                // Check for single approver
                var approvator = await _context.Approvators
                    .Include(a => a.User)
                    .FirstOrDefaultAsync(a => a.StepId == stepId);
                    
                if (approvator != null)
                {
                    config.ApprovalType = "Single";
                    config.SingleApproverId = approvator.UserId;
                    config.SingleApproverName = approvator.User?.Username ?? string.Empty;
                    config.Comment = approvator.Comment;
                }
                else
                {
                    // Check for group
                    var group = await _context.ApprovatorsGroups
                        .FirstOrDefaultAsync(g => g.StepId == stepId);
                        
                    if (group != null)
                    {
                        config.ApprovalType = "Group";
                        config.GroupName = group.Name;
                        config.Comment = group.Comment;
                        
                        // Get group users
                        var groupUsers = await _context.ApprovatorsGroupUsers
                            .Include(gu => gu.User)
                            .Where(gu => gu.GroupId == group.Id)
                            .OrderBy(gu => gu.OrderIndex)
                            .ToListAsync();
                            
                        config.GroupApprovers = groupUsers.Select(gu => new ApproverInfoDto
                        {
                            UserId = gu.UserId,
                            Username = gu.User?.Username ?? string.Empty,
                            OrderIndex = gu.OrderIndex
                        }).ToList();
                        
                        // Get rule
                        var rule = await _context.ApprovatorsGroupRules
                            .FirstOrDefaultAsync(r => r.GroupId == group.Id);
                            
                        if (rule != null)
                        {
                            config.RuleType = rule.RuleType.ToString();
                        }
                    }
                }
            }
            
            return Ok(config);
        }

        [HttpGet("eligible-approvers")]
        public async Task<ActionResult<IEnumerable<ApproverInfoDto>>> GetEligibleApprovers()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized("User ID claim is missing.");

            int userId = int.Parse(userIdClaim);
            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return BadRequest("User not found.");

            if (!user.IsActive)
                return Unauthorized("User account is deactivated. Please contact an admin!");

            if (user.Role!.RoleName != "Admin" && user.Role!.RoleName != "FullUser")
                return Unauthorized("User not allowed to view eligible approvers.");

            // Get all users with Admin or FullUser roles
            var eligibleUsers = await _context.Users
                .Include(u => u.Role)
                .Where(u => u.IsActive && (u.Role!.RoleName == "Admin" || u.Role.RoleName == "FullUser"))
                .OrderBy(u => u.Username)
                .Select(u => new ApproverInfoDto
                {
                    UserId = u.Id,
                    Username = u.Username,
                    Role = u.Role!.RoleName
                })
                .ToListAsync();

            return Ok(eligibleUsers);
        }
    }
}