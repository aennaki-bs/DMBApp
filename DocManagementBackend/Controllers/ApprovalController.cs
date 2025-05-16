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
        private readonly UserAuthorizationService _authService;

        public ApprovalController(
            ApplicationDbContext context, 
            DocumentWorkflowService workflowService,
            UserAuthorizationService authService)
        {
            _context = context;
            _workflowService = workflowService;
            _authService = authService;
        }

        // CORE APPROVAL WORKFLOW APIS

        [HttpGet("pending")]
        public async Task<ActionResult<IEnumerable<PendingApprovalDto>>> GetPendingApprovals()
        {
            var authResult = await _authService.AuthorizeUserAsync(User);
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var userId = authResult.UserId;
            var user = authResult.User!;

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

                if (rule?.RuleType == RuleType.Sequential && group != null)
                {
                    // Get existing responses
                    var responses = await _context.ApprovalResponses
                        .Where(r => r.ApprovalWritingId == approval.Id)
                        .ToListAsync();

                    var respondedUserIds = responses.Select(r => r.UserId).ToList();

                    // Get ordered users in the group
                    var orderedUsers = group.ApprovatorsGroupUsers
                        .Where(gu => gu.OrderIndex.HasValue)
                        .OrderBy(gu => gu.OrderIndex!.Value)
                        .ToList();

                    // If no responses yet, only first user can approve
                    if (!responses.Any() && orderedUsers.Any())
                    {
                        if (orderedUsers.First().UserId != userId)
                            continue;
                    }
                    else if (orderedUsers.Any() && respondedUserIds.Any())
                    {
                        // Find the next user in sequence
                        var highestRespondedIndex = orderedUsers
                            .Where(gu => respondedUserIds.Contains(gu.UserId))
                            .Max(gu => gu.OrderIndex!.Value);

                        var nextUser = orderedUsers
                            .FirstOrDefault(gu => gu.OrderIndex!.Value > highestRespondedIndex);

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
            var authResult = await _authService.AuthorizeUserAsync(User);
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var userId = authResult.UserId;

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
            var authResult = await _authService.AuthorizeUserAsync(User);
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var userId = authResult.UserId;
            var user = authResult.User!;

            // Retrieve the approval history for the document
            var histories = await _context.ApprovalWritings
                .Include(a => a.ProcessedBy)
                .Include(a => a.Step)
                .Include(a => a.Document)
                .Include(a => a.Approvator)
                .Include(a => a.ApprovatorsGroup)
                .Where(a => a.DocumentId == documentId)
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();

            var approvalHistory = new List<ApprovalHistoryDto>();

            foreach (var writing in histories)
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

        // STEP CONFIGURATION APIS

        [HttpGet("configure/steps")]
        public async Task<ActionResult<IEnumerable<StepWithApprovalDto>>> GetStepsWithApproval()
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var steps = await _context.Steps
                .Include(s => s.Circuit)
                .Include(s => s.CurrentStatus)
                .Include(s => s.NextStatus)
                .OrderBy(s => s.CircuitId)
                .ThenBy(s => s.Id)
                .ToListAsync();

            var stepWithApprovalDtos = steps.Select(s => new StepWithApprovalDto
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
            }).ToList();

            return Ok(stepWithApprovalDtos);
        }

        [HttpPost("configure/step/{stepId}")]
        public async Task<IActionResult> ConfigureStepApproval(
            int stepId, [FromBody] StepApprovalConfigDto config)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var userId = authResult.UserId;
            
            var step = await _context.Steps.FindAsync(stepId);
            if (step == null)
                return NotFound("Step not found.");

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Update the step's RequiresApproval flag
                step.RequiresApproval = config.RequiresApproval;
                
                if (config.RequiresApproval)
                {
                    // Clear existing approvators and groups
                    step.ApprovatorId = null;
                    step.ApprovatorsGroupId = null;
                    
                    // Add new configuration based on the approval type
                    if (config.ApprovalType == "Single" && config.SingleApproverId.HasValue)
                    {
                        // Verify the approver exists
                        var approver = await _context.Users.FindAsync(config.SingleApproverId.Value);
                        if (approver == null)
                            return NotFound("Approver user not found.");
                        
                        // Check if this user already has an approvator record
                        var approvator = await _context.Approvators
                            .FirstOrDefaultAsync(a => a.UserId == config.SingleApproverId.Value);
                            
                        if (approvator == null)
                        {
                            // Create new approvator
                            approvator = new Approvator
                            {
                                UserId = config.SingleApproverId.Value,
                                Comment = config.Comment ?? string.Empty,
                                StepId = stepId  // Set the StepId relationship
                            };
                            
                            _context.Approvators.Add(approvator);
                            await _context.SaveChangesAsync(); // Save to get ID
                        }
                        else
                        {
                            // Update existing approvator's StepId
                            approvator.StepId = stepId;
                            await _context.SaveChangesAsync();
                        }
                        
                        step.ApprovatorId = approvator.Id;
                    }
                    else if (config.ApprovalType == "Group" && 
                             config.GroupApproverIds != null && 
                             config.GroupApproverIds.Any())
                    {
                        // Create group
                        var group = new ApprovatorsGroup
                        {
                            Name = config.GroupName ?? $"Approvers for Step {stepId}",
                            Comment = config.Comment ?? string.Empty,
                            StepId = stepId  // Set the StepId relationship
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
                        await _context.SaveChangesAsync();
                        
                        step.ApprovatorsGroupId = group.Id;
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
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var step = await _context.Steps
                .Include(s => s.Circuit)
                .Include(s => s.CurrentStatus)
                .Include(s => s.NextStatus)
                .Include(s => s.Approvator)
                .ThenInclude(a => a != null ? a.User : null)
                .Include(s => s.ApprovatorsGroup)
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
                if (step.ApprovatorId.HasValue && step.Approvator != null)
                {
                    config.ApprovalType = "Single";
                    config.SingleApproverId = step.Approvator.UserId;
                    config.SingleApproverName = step.Approvator.User?.Username ?? string.Empty;
                    config.Comment = step.Approvator.Comment;
                }
                else if (step.ApprovatorsGroupId.HasValue && step.ApprovatorsGroup != null)
                {
                    // Check for group
                    config.ApprovalType = "Group";
                    config.GroupName = step.ApprovatorsGroup.Name;
                    config.Comment = step.ApprovatorsGroup.Comment;
                    
                    // Get group users
                    var groupUsers = await _context.ApprovatorsGroupUsers
                        .Include(gu => gu.User)
                        .Where(gu => gu.GroupId == step.ApprovatorsGroupId.Value)
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
                        .FirstOrDefaultAsync(r => r.GroupId == step.ApprovatorsGroupId.Value);
                        
                    if (rule != null)
                    {
                        config.RuleType = rule.RuleType.ToString();
                    }
                }
            }
            
            return Ok(config);
        }

        // APPROVER MANAGEMENT APIS

        [HttpGet("eligible-approvers")]
        public async Task<ActionResult<IEnumerable<ApproverInfoDto>>> GetEligibleApprovers()
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

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

        [HttpPost("groups")]
        public async Task<IActionResult> CreateApprovatorsGroup([FromBody] CreateApprovatorsGroupDto request)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Create group
                var group = new ApprovatorsGroup
                {
                    Name = request.Name,
                    Comment = request.Comment ?? string.Empty
                };
                
                _context.ApprovatorsGroups.Add(group);
                await _context.SaveChangesAsync(); // Save to get group ID
                
                // Add users to group
                for (int i = 0; i < request.UserIds.Count; i++)
                {
                    var groupUser = new ApprovatorsGroupUser
                    {
                        GroupId = group.Id,
                        UserId = request.UserIds[i],
                        OrderIndex = request.RuleType == "Sequential" ? i : null
                    };
                    
                    _context.ApprovatorsGroupUsers.Add(groupUser);
                }
                
                // Create rule
                RuleType ruleType;
                switch (request.RuleType)
                {
                    case "All":
                        ruleType = RuleType.All;
                        break;
                    case "Sequential":
                        ruleType = RuleType.Sequential;
                        break;
                    default:
                        ruleType = RuleType.Any;
                        break;
                }
                
                var rule = new ApprovatorsGroupRule
                {
                    GroupId = group.Id,
                    RuleType = ruleType
                };
                
                _context.ApprovatorsGroupRules.Add(rule);
                
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                
                return CreatedAtAction(nameof(GetApprovatorsGroup), new { id = group.Id }, new
                {
                    group.Id,
                    group.Name,
                    group.Comment,
                    RuleType = rule.RuleType.ToString(),
                    UserIds = request.UserIds
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpGet("groups/{id}")]
        public async Task<ActionResult<ApprovatorsGroupDetailDto>> GetApprovatorsGroup(int id)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var group = await _context.ApprovatorsGroups
                .FirstOrDefaultAsync(g => g.Id == id);
                
            if (group == null)
                return NotFound("Approvers group not found.");
                
            var rule = await _context.ApprovatorsGroupRules
                .FirstOrDefaultAsync(r => r.GroupId == id);
                
            var users = await _context.ApprovatorsGroupUsers
                .Include(gu => gu.User)
                .Where(gu => gu.GroupId == id)
                .OrderBy(gu => gu.OrderIndex)
                .ToListAsync();
                
            var result = new ApprovatorsGroupDetailDto
            {
                Id = group.Id,
                Name = group.Name,
                Comment = group.Comment,
                RuleType = rule?.RuleType.ToString() ?? "All",
                Approvers = users.Select(u => new ApproverInfoDto
                {
                    UserId = u.UserId,
                    Username = u.User?.Username ?? string.Empty,
                    OrderIndex = u.OrderIndex
                }).ToList()
            };
            
            return Ok(result);
        }

        [HttpGet("groups")]
        public async Task<ActionResult<IEnumerable<ApprovatorsGroupDetailDto>>> GetAllApprovatorsGroups()
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var groups = await _context.ApprovatorsGroups.ToListAsync();
            var result = new List<ApprovatorsGroupDetailDto>();

            foreach (var group in groups)
            {
                var rule = await _context.ApprovatorsGroupRules
                    .FirstOrDefaultAsync(r => r.GroupId == group.Id);

                var users = await _context.ApprovatorsGroupUsers
                    .Include(gu => gu.User)
                    .Where(gu => gu.GroupId == group.Id)
                    .OrderBy(gu => gu.OrderIndex)
                    .ToListAsync();

                result.Add(new ApprovatorsGroupDetailDto
                {
                    Id = group.Id,
                    Name = group.Name,
                    Comment = group.Comment,
                    RuleType = rule?.RuleType.ToString() ?? "All",
                    Approvers = users.Select(u => new ApproverInfoDto
                    {
                        UserId = u.UserId,
                        Username = u.User?.Username ?? string.Empty,
                        OrderIndex = u.OrderIndex
                    }).ToList()
                });
            }

            return Ok(result);
        }

        [HttpDelete("groups/{id}")]
        public async Task<IActionResult> DeleteApprovatorsGroup(int id)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var group = await _context.ApprovatorsGroups.FindAsync(id);
            if (group == null)
                return NotFound("Approvers group not found.");
            
            // Check if group is in use
            var inUse = await _context.Steps.AnyAsync(s => s.ApprovatorsGroupId == id) ||
                       await _context.ApprovalWritings.AnyAsync(aw => aw.ApprovatorsGroupId == id);
                       
            if (inUse)
                return BadRequest("Cannot delete group that is in use by steps or approval writings.");
            
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Update any steps using this group
                var stepsUsingGroup = await _context.Steps
                    .Where(s => s.ApprovatorsGroupId == id)
                    .ToListAsync();
                
                foreach (var step in stepsUsingGroup)
                {
                    step.ApprovatorsGroupId = null;
                    if (!step.ApprovatorId.HasValue)
                    {
                        step.RequiresApproval = false;
                    }
                }

                // Remove group users
                var groupUsers = await _context.ApprovatorsGroupUsers
                    .Where(gu => gu.GroupId == id)
                    .ToListAsync();
                _context.ApprovatorsGroupUsers.RemoveRange(groupUsers);
                
                // Remove group rules
                var groupRules = await _context.ApprovatorsGroupRules
                    .Where(gr => gr.GroupId == id)
                    .ToListAsync();
                _context.ApprovatorsGroupRules.RemoveRange(groupRules);
                
                // Remove group
                _context.ApprovatorsGroups.Remove(group);
                
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                
                return Ok("Approvers group deleted successfully.");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        // GROUP USER MANAGEMENT APIS

        [HttpPost("groups/{groupId}/users")]
        public async Task<IActionResult> AddUserToGroup(int groupId, [FromBody] AddUserToGroupDto request)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            // Validate the group exists
            var group = await _context.ApprovatorsGroups
                .Include(g => g.ApprovatorsGroupUsers)
                .FirstOrDefaultAsync(g => g.Id == groupId);
                
            if (group == null)
                return NotFound("Approvers group not found.");

            // Validate the user exists
            var user = await _context.Users.FindAsync(request.UserId);
            if (user == null)
                return NotFound("User not found.");

            // Check if user is already in the group
            var existingUser = await _context.ApprovatorsGroupUsers
                .FirstOrDefaultAsync(gu => gu.GroupId == groupId && gu.UserId == request.UserId);
                
            if (existingUser != null)
                return BadRequest("User is already a member of this group.");

            // Get group rule to determine if we need to handle sequential ordering
            var rule = await _context.ApprovatorsGroupRules
                .FirstOrDefaultAsync(r => r.GroupId == groupId);
                
            bool isSequential = rule?.RuleType == RuleType.Sequential;
            
            // For sequential groups, handle order index
            int? orderIndex = null;
            
            if (isSequential)
            {
                // If order index is provided, verify it's valid
                if (request.OrderIndex.HasValue)
                {
                    // Check if that position is already taken
                    var existingUserAtIndex = await _context.ApprovatorsGroupUsers
                        .FirstOrDefaultAsync(gu => gu.GroupId == groupId && gu.OrderIndex == request.OrderIndex.Value);
                        
                    if (existingUserAtIndex != null)
                        return BadRequest($"Order index {request.OrderIndex.Value} is already assigned to another user.");
                        
                    orderIndex = request.OrderIndex.Value;
                }
                else
                {
                    // If no order index is provided, append to the end
                    var maxIndex = await _context.ApprovatorsGroupUsers
                        .Where(gu => gu.GroupId == groupId && gu.OrderIndex.HasValue)
                        .MaxAsync(gu => (int?)gu.OrderIndex) ?? -1;
                        
                    orderIndex = maxIndex + 1;
                }
            }

            // Create the new group user
            var groupUser = new ApprovatorsGroupUser
            {
                GroupId = groupId,
                UserId = request.UserId,
                OrderIndex = orderIndex
            };
            
            _context.ApprovatorsGroupUsers.Add(groupUser);
            await _context.SaveChangesAsync();
            
            return Ok(new
            {
                groupUser.Id,
                groupUser.GroupId,
                groupUser.UserId,
                Username = user.Username,
                groupUser.OrderIndex
            });
        }

        [HttpDelete("groups/{groupId}/users/{userId}")]
        public async Task<IActionResult> RemoveUserFromGroup(int groupId, int userId)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            // Check if the user is in the group
            var groupUser = await _context.ApprovatorsGroupUsers
                .FirstOrDefaultAsync(gu => gu.GroupId == groupId && gu.UserId == userId);
                
            if (groupUser == null)
                return NotFound("User is not a member of this group.");

            // Check if this group is being used in active approvals
            var groupInUse = await _context.ApprovalWritings
                .AnyAsync(aw => aw.ApprovatorsGroupId == groupId && 
                              (aw.Status == ApprovalStatus.Open || aw.Status == ApprovalStatus.InProgress));
                
            if (groupInUse)
                return BadRequest("Cannot remove user from a group that is being used in active approvals.");

            // Get rule to check if we need to handle sequential ordering
            var rule = await _context.ApprovatorsGroupRules
                .FirstOrDefaultAsync(r => r.GroupId == groupId);
                
            bool isSequential = rule?.RuleType == RuleType.Sequential;
            
            // Remove the user
            _context.ApprovatorsGroupUsers.Remove(groupUser);
            
            // If sequential, reorder remaining users to maintain consecutive ordering
            if (isSequential && groupUser.OrderIndex.HasValue)
            {
                var usersToReorder = await _context.ApprovatorsGroupUsers
                    .Where(gu => gu.GroupId == groupId && 
                             gu.OrderIndex.HasValue && 
                             gu.OrderIndex.Value > groupUser.OrderIndex.Value)
                    .OrderBy(gu => gu.OrderIndex)
                    .ToListAsync();
                    
                foreach (var user in usersToReorder)
                {
                    user.OrderIndex = user.OrderIndex!.Value - 1;
                }
            }
            
            await _context.SaveChangesAsync();
            
            return Ok("User removed from group successfully.");
        }

        [HttpGet("groups/{groupId}/users")]
        public async Task<ActionResult<IEnumerable<ApproverInfoDto>>> GetGroupUsers(int groupId)
        {
            var authResult = await _authService.AuthorizeUserAsync(User);
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            // Validate the group exists
            var group = await _context.ApprovatorsGroups
                .FirstOrDefaultAsync(g => g.Id == groupId);
                
            if (group == null)
                return NotFound("Approvers group not found.");

            // Get users in the group
            var groupUsers = await _context.ApprovatorsGroupUsers
                .Where(gu => gu.GroupId == groupId)
                .Include(gu => gu.User)
                .ThenInclude(u => u!.Role)
                .OrderBy(gu => gu.OrderIndex)
                .Select(gu => new ApproverInfoDto
                {
                    UserId = gu.UserId,
                    Username = gu.User!.Username,
                    Role = gu.User.Role!.RoleName,
                    OrderIndex = gu.OrderIndex
                })
                .ToListAsync();

            return Ok(groupUsers);
        }
    }
}