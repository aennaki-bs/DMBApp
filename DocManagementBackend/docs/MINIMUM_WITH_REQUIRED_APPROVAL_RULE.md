# MinimumWithRequired Approval Rule Implementation

## Overview

The new `MinimumWithRequired` approval rule allows for more flexible approval workflows that combine both minimum approval thresholds and mandatory approvers. This rule ensures that:

1. A minimum number of users have approved the request
2. Specific users marked as "required" have approved the request
3. The approval is only complete when BOTH conditions are met

## Database Schema Changes

### ApprovatorsGroupRule Table
Two new fields have been added:

```sql
ALTER TABLE [ApprovatorsGroupRules] ADD [MinimumApprovals] int NULL;
ALTER TABLE [ApprovatorsGroupRules] ADD [RequiredMemberIdsJson] nvarchar(max) NULL;
```

### RuleType Enum
New enum value added:
```csharp
public enum RuleType
{
    Any = 0,                    // Any user in the group can approve
    All = 1,                    // All users must approve
    Sequential = 2,             // Users must approve in specified order
    MinimumWithRequired = 3     // Minimum number of approvals + required members must approve
}
```

## Model Changes

### ApprovatorsGroupRule Class
```csharp
public class ApprovatorsGroupRule
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    public int GroupId { get; set; }
    
    [Required]
    public RuleType RuleType { get; set; } = RuleType.All;
    
    // For MinimumWithRequired rule type
    public int? MinimumApprovals { get; set; }
    
    // JSON field to store required member IDs
    public string? RequiredMemberIdsJson { get; set; }
    
    // Helper property to work with RequiredMemberIds as a List<int>
    [NotMapped]
    public List<int> RequiredMemberIds { get; set; }
}
```

### ApprovalStatusSummary Class
New class to track approval progress:
```csharp
public class ApprovalStatusSummary
{
    public int MinimumRequired { get; set; }
    public int CurrentApprovals { get; set; }
    public int RequiredMembersTotal { get; set; }
    public int RequiredMembersApproved { get; set; }
    public List<int> RequiredMembersPending { get; set; }
    public bool IsMinimumMet { get; set; }
    public bool AreAllRequiredApproved { get; set; }
    public bool IsComplete { get; set; }
}
```

## Service Layer Changes

### DocumentWorkflowService
- Updated `ProcessApprovalResponseAsync` to handle the new rule type
- Added `EvaluateMinimumWithRequiredRule` helper method
- Added `GetMinimumWithRequiredApprovalStatusAsync` method for status tracking

### ApprovalController
- Updated all approval type assignments to include "MinimumWithRequired"
- Added new endpoint `GET /api/Approval/{approvalId}/status-summary`
- Updated approval logic to allow any group member to approve (no sequence required)

## Example Usage

### Scenario
A group of 5 members: Ahmed, Marouan, Hamza (required), Ali, Khalid
- Rule: Minimum 2 approvals required
- Required member: Hamza (userId = 3)

### Configuration
```csharp
var rule = new ApprovatorsGroupRule
{
    GroupId = 1,
    RuleType = RuleType.MinimumWithRequired,
    MinimumApprovals = 2,
    RequiredMemberIds = new List<int> { 3 } // Hamza's userId
};
```

### Approval Scenarios

#### Scenario 1: Ahmed and Ali approve first
- Current approvals: 2 (meets minimum)
- Required members approved: 0 (Hamza hasn't approved)
- **Status: InProgress** ❌

#### Scenario 2: Hamza then approves
- Current approvals: 3 (exceeds minimum)
- Required members approved: 1 (Hamza approved)
- **Status: Accepted** ✅

#### Scenario 3: Only Marouan and Hamza approve
- Current approvals: 2 (meets minimum)
- Required members approved: 1 (Hamza approved)
- **Status: Accepted** ✅

## API Endpoints

### Get Approval Status Summary
```http
GET /api/Approval/{approvalId}/status-summary
```

**Response:**
```json
{
    "minimumRequired": 2,
    "currentApprovals": 2,
    "requiredMembersTotal": 1,
    "requiredMembersApproved": 1,
    "requiredMembersPending": [],
    "isMinimumMet": true,
    "areAllRequiredApproved": true,
    "isComplete": true
}
```

## Migration Applied

Migration `20250721100333_AddMinimumWithRequiredApprovalRule` has been successfully applied to the database.

## Testing the Implementation

To test the new rule:

1. Create an approval group with multiple users
2. Set the rule type to `MinimumWithRequired`
3. Configure `MinimumApprovals` and `RequiredMemberIds`
4. Create an approval request
5. Have different users approve and check the status
6. Verify that approval is only accepted when both conditions are met

## Benefits

1. **Flexibility**: Combines minimum thresholds with mandatory approvers
2. **Security**: Ensures critical stakeholders always review important requests
3. **Efficiency**: Doesn't require all group members to approve if minimum + required are met
4. **Transparency**: Clear status tracking shows exactly what's needed for completion

## Future Enhancements

Possible future improvements:
- Priority levels for required members
- Time-based escalation rules
- Conditional required members based on request amount/type
- Integration with external approval systems 