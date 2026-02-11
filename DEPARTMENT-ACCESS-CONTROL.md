# Department-Based Voting Access Control

## Overview

The NACOS Voting System now includes comprehensive department-based access control to ensure students can only vote in elections they're eligible for.

## Access Control Rules

### 1. College Membership Restriction
**Rule**: Only students from departments within the College of Computing Sciences can vote.

**Implementation**:
- The `ElectionSettings` model has an `allowedDepartments` field
- When fetching voting data, the system checks if the user's department is in the allowed list
- If not, voting access is denied with an appropriate message

**Example**:
```javascript
// Only CS department students can vote in this election
allowedDepartments: [csDepartmentId]

// Multiple departments can vote
allowedDepartments: [csDepartmentId, itDepartmentId, seDepartmentId]
```

### 2. Department-Level Voting Restriction
**Rule**: Students can only vote for positions in their own department.

**Implementation**:
- When fetching department-level offices and candidates, only those matching the user's department are returned
- During vote casting, validation ensures:
  - Office belongs to user's department
  - Candidate belongs to user's department
  - User cannot vote across departments

**Example**:
- CS student can vote for: CS Department President
- CS student CANNOT vote for: Cybersecurity Department President

### 3. College-Level Voting
**Rule**: All eligible students (from allowed departments) can vote for college-level positions.

**Implementation**:
- College-level offices and candidates are available to all students whose departments are in `allowedDepartments`
- No department restriction for college-level voting

## Technical Implementation

### Backend Changes

#### 1. Vote Controller - getVotingData()
```typescript
// Check if user's department is allowed
const userDeptId = user.department._id.toString();
const allowedDeptIds = settings.allowedDepartments.map(d => d._id.toString());

if (!allowedDeptIds.includes(userDeptId)) {
  return res.status(403).json({ 
    message: 'Your department is not participating in this election',
    allowedToVote: false
  });
}

// Only return department offices/candidates for user's department
const departmentOffices = await Office.find({ 
  level: 'department', 
  department: user.department,  // Only user's department
  isActive: true 
});
```

#### 2. Vote Controller - castVote()
```typescript
// Validate department-level votes
if (office.level === 'department') {
  const officeDeptId = office.department.toString();
  if (officeDeptId !== userDeptId) {
    throw new Error('You cannot vote for positions in other departments');
  }
}

if (candidate.level === 'department') {
  const candidateDeptId = candidate.department.toString();
  if (candidateDeptId !== userDeptId) {
    throw new Error('You cannot vote for candidates from other departments');
  }
}
```

### Frontend Changes

#### VotingPage Component
```typescript
// Handle access denied state
const [accessDenied, setAccessDenied] = useState(false);
const [accessMessage, setAccessMessage] = useState('');

// Check response for access restrictions
if (allowedToVote === false) {
  setAccessDenied(true);
  setAccessMessage(response.data.message);
  return;
}

// Display access denied UI
if (accessDenied) {
  return <AccessDeniedMessage />;
}
```

## Usage Scenarios

### Scenario 1: Single Department Election
**Setup**: Only Computer Science department is voting

```javascript
// In admin settings or seed script
await ElectionSettings.create({
  isElectionActive: true,
  allowedDepartments: [csDepartmentId],
  resultVisibility: 'hidden'
});
```

**Result**:
- ✅ CS students can vote for college + CS department positions
- ❌ IT students get "Your department is not participating" message
- ❌ Cybersecurity students cannot access voting
- ❌ Data Science students cannot access voting

### Scenario 2: Multiple Departments Election
**Setup**: CS and IT departments are both voting

```javascript
await ElectionSettings.updateOne({}, {
  allowedDepartments: [csDepartmentId, itDepartmentId]
});
```

**Result**:
- ✅ CS students vote for college + CS department positions
- ✅ IT students vote for college + IT department positions
- ❌ CS students CANNOT vote for IT department positions
- ❌ IT students CANNOT vote for CS department positions
- ❌ Other departments cannot access voting

### Scenario 3: College-Wide Election
**Setup**: All departments voting

```javascript
await ElectionSettings.updateOne({}, {
  allowedDepartments: [csDeptId, itDeptId, seDeptId, cybDeptId, dsDeptId]
});
```

**Result**:
- ✅ All students can vote for college-level positions
- ✅ Each student votes for their own department's positions only
- ❌ Cross-department voting is prevented

## Admin Configuration

### How to Configure Allowed Departments

#### Option 1: From Admin Dashboard (Recommended)
1. Login as admin
2. Go to "Settings" tab
3. Select which departments can participate
4. Save changes

#### Option 2: Database Seed Script
```typescript
const settings = await ElectionSettings.create({
  isElectionActive: false,
  allowedDepartments: [
    departments[0]._id, // Computer Science
    departments[1]._id, // IT & ICT
  ],
  resultVisibility: 'hidden'
});
```

#### Option 3: API Call
```bash
curl -X PUT http://localhost:5000/api/admin/settings \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "allowedDepartments": ["dept_id_1", "dept_id_2"],
    "isElectionActive": true
  }'
```

## Security Considerations

### 1. Multi-Layer Validation
```
Client-Side → Backend API → Database Constraints
    ↓              ↓              ↓
  UI Check    Auth Check    Data Integrity
```

### 2. Vote Integrity
- Users cannot manipulate requests to vote for other departments
- All votes are validated against user's department
- Database structure enforces referential integrity

### 3. Audit Trail
```typescript
// Each vote records the department
{
  voter: userId,
  candidate: candidateId,
  office: officeId,
  level: 'department',
  department: userDepartmentId,  // Tracks which dept voted
  timestamp: Date
}
```

## Testing Department Restrictions

### Test Case 1: Access Denied
```bash
# Register CS student
POST /api/auth/register
{
  "studentId": "CS/2020/001",
  "department": "CS_DEPT_ID",
  ...
}

# Set only IT department as allowed
PUT /api/admin/settings
{
  "allowedDepartments": ["IT_DEPT_ID"]
}

# Try to vote
GET /api/vote/data
# Expected: 403 Forbidden - "Your department is not participating"
```

### Test Case 2: Cross-Department Voting Prevention
```bash
# Login as CS student
# Try to vote for IT department candidate
POST /api/vote/cast
{
  "votes": [
    {
      "officeId": "IT_DEPT_PRESIDENT_OFFICE_ID",
      "candidateId": "IT_CANDIDATE_ID"
    }
  ]
}
# Expected: 500 Error - "You cannot vote for positions in other departments"
```

### Test Case 3: Valid Department Voting
```bash
# Login as CS student
# Vote for CS department position
POST /api/vote/cast
{
  "votes": [
    {
      "officeId": "CS_DEPT_PRESIDENT_OFFICE_ID",
      "candidateId": "CS_CANDIDATE_ID"
    }
  ]
}
# Expected: 200 Success - Vote recorded
```

## Future Enhancements

### Potential Additions

1. **Time-Based Department Access**
   ```typescript
   {
     allowedDepartments: [
       {
         departmentId: "CS_ID",
         startTime: "2024-03-01T08:00:00Z",
         endTime: "2024-03-01T17:00:00Z"
       }
     ]
   }
   ```

2. **Department Quota**
   ```typescript
   {
     departments: [
       {
         id: "CS_ID",
         maxVoters: 500
       }
     ]
   }
   ```

3. **Cross-Department Collaborative Positions**
   ```typescript
   {
     office: {
       title: "Inter-Department Coordinator",
       allowedDepartments: ["CS_ID", "IT_ID"],
       level: "cross-departmental"
     }
   }
   ```

## Migration Guide

If you have existing data without department restrictions:

1. **Update Election Settings**
   ```bash
   npm run seed  # Re-seed with new settings
   ```

2. **Set Allowed Departments**
   ```javascript
   // In MongoDB or via admin panel
   db.electionsettings.updateOne(
     {},
     { 
       $set: { 
         allowedDepartments: [
           ObjectId("CS_DEPT_ID")
         ] 
       } 
     }
   );
   ```

3. **Test Access**
   - Login as students from different departments
   - Verify only allowed departments can access voting

## Summary

The department-based access control ensures:
- ✅ Only eligible students can vote
- ✅ Students cannot vote across departments
- ✅ Flexible configuration per election
- ✅ Multi-layer security validation
- ✅ Clear error messages for users
- ✅ Complete audit trail

This system provides the foundation for complex election scenarios while maintaining security and data integrity.
