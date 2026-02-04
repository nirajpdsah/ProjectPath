# Bulk Import Feature - Test Scenarios

## Quick Test (5 minutes)

### Test 1: Create Test Project
1. Go to Dashboard
2. Create new project:
   - Name: "Wing Assembly Test"
   - Method: PERT
   - Time Unit: Days
3. Click to open the project

### Test 2: Bulk Import Aircraft Problem
1. In Project Editor, click "📋 Bulk Import"
2. Copy and paste this data:
```
Activity  a   m   b   Predecessors
A         1   2   3   —
B         2   3   4   —
C         4   5   6   A
D         8   9  10   B
E         2   5   8   C,D
F         4   5   6   B
G         1   2   3   E
```

3. Click "Next: Preview"
4. Verify you see 7 rows with correct data
5. Click "Import Activities"
6. Wait for progress to complete (should show 7/7)

### Expected Results
- All 7 activities imported successfully
- Activities list shows A, B, C, D, E, F, G
- Each with correct durations and predecessors
- No errors displayed

---

## Advanced Tests (15 minutes each)

### Test 3: Tab-Separated Data
**Purpose**: Verify parser handles tab formatting

Data to paste:
```
Activity	Optimistic	Most Likely	Pessimistic	Predecessors
Design	3	4	5	—
Build	5	8	11	Design
Test	2	3	4	Build
Deploy	1	2	3	Test
```

Expected: 4 activities imported with correct values

---

### Test 4: Space-Separated Data
**Purpose**: Verify parser handles variable spacing

Data to paste:
```
A   Plan       1   2    3    —
B   Design     2   3    4    —
C   Develop    4   5    6    A
D   Test       3   5    7    B
```

Expected: 4 activities, mixed spacing handled correctly

---

### Test 5: CPM Format
**Purpose**: Verify single-duration format works

First, create a new CPM project:
1. Go to Dashboard
2. Create: "CPM Test" project, Method: CPM

Then use bulk import with:
```
Activity  Duration  Predecessors
A         2         —
B         3         —
C         5         A
D         7         B
E         4         C,D
```

Expected: 5 activities with single durations, not PERT estimates

---

### Test 6: Preview Editing
**Purpose**: Verify edit functionality

1. Start with same test data from Test 2
2. Paste the data
3. Click "Next: Preview"
4. Click on activity C's "Most Likely" value (5)
5. Change it to 5.5
6. Click "Import Activities"

Expected: Activity C imported with m=5.5

---

### Test 7: Multiple Predecessors
**Purpose**: Verify multiple predecessor handling

Data:
```
A  Plan        1  2  3  —
B  Design      2  3  4  —
C  Review      2  3  4  A,B
D  Build       5  7  9  C
```

Expected: Activity C shows "A,B" as predecessors after import

---

### Test 8: Complex Predecessor Formats
**Purpose**: Verify different separator handling

Data:
```
Activity  a  m  b  Predecessors
A         1  2  3  —
B         2  3  4  A
C         3  4  5  A-B
D         2  3  4  —
```

Expected: Handles both comma and dash separators correctly

---

## Edge Cases & Error Testing

### Test 9: Missing Values
**Purpose**: Check error handling

Try pasting incomplete data:
```
A  Planning  1  2
B  Build     3  4  5
```

Expected: Error message indicating missing fields or column mismatch
Allow user to correct in preview table

---

### Test 10: Very Long Activity Names
**Purpose**: Verify UI handles long text

Data:
```
A  This is a very long activity name that might break the layout but should still work properly  1  2  3  —
B  Another long name for design phase that includes multiple words and takes up space  2  3  4  —
```

Expected: Layout remains usable, names display (possibly wrapped)

---

### Test 11: Special Characters
**Purpose**: Verify special character handling

Data:
```
A  Plan/Design      1  2  3  —
B  Build (Core)     2  3  4  —
C  Review & Test    3  4  5  A,B
```

Expected: Special characters preserved or handled gracefully

---

### Test 12: Whitespace Variations
**Purpose**: Verify robust parsing

Data with extra spaces:
```
A         Plan                1       2       3       —
B           Design            2       3       4       —
C     Build            4       5       6       A
```

Expected: Correctly parsed despite irregular spacing

---

## Full Integration Tests

### Test 13: Analysis After Bulk Import
1. Bulk import the 7 aircraft activities
2. Click "Analyze Project"
3. Check that critical path is calculated
4. Verify activity durations show correctly
5. Confirm slack times are calculated

Expected: Full analysis works immediately after bulk import

---

### Test 14: Mixed Mode Entry
1. Create a project
2. Bulk import 3 activities (A, B, C)
3. Switch to "📝 Single Entry" mode
4. Add activity D manually
5. Switch back to "📋 Bulk Import"
6. Add activities E, F manually

Expected: All activities appear in the list, analysis includes all

---

### Test 15: Switching Between Projects
1. Create two projects: "Project 1" and "Project 2"
2. In Project 1, bulk import 3 activities
3. Switch to Project 2
4. Bulk import 5 different activities
5. Go back to Project 1

Expected: Each project has its own imported activities, no cross-contamination

---

## Performance Tests

### Test 16: Large Import (50+ Activities)
**Purpose**: Verify performance with many activities

Data: Generate/paste 50+ activities

Expected:
- Parsing completes in < 1 second
- Preview table responsive
- Import progress shows clearly
- All activities imported successfully

---

### Test 17: Rapid Re-import
**Purpose**: Verify state management

1. Bulk import 7 activities
2. Delete all activities
3. Immediately bulk import again
4. Don't wait for refresh between operations

Expected: System handles rapid operations without errors

---

## Browser/Device Tests

### Test 18: Mobile View
**Purpose**: Verify responsive design

On mobile device or browser with narrowed viewport:
1. Open Project Editor
2. Toggle bulk import
3. Paste data
4. Navigate preview table
5. Import activities

Expected: UI remains usable on mobile, data entry works

---

### Test 19: Keyboard Navigation
**Purpose**: Verify keyboard-friendly design

1. Open bulk import
2. Use Tab to move between fields
3. Use Ctrl+A to select all text in textarea
4. Use Enter to advance (when implemented)

Expected: Full keyboard navigation works

---

## Cleanup Test

### Test 20: Full Workflow Start to Finish
1. Dashboard → Create Project → Edit → Bulk Import → Analyze
2. Create: "Complete Test Project"
3. Import all aircraft activities at once
4. Run full analysis
5. Take screenshot of results
6. Delete project

This verifies the complete user journey works end-to-end.

---

## Test Data Summary

### Dataset 1: Aircraft Wing Assembly (7 activities) ✅
```
A  1  2  3  —
B  2  3  4  —
C  4  5  6  A
D  8  9  10  B
E  2  5  8  C,D
F  4  5  6  B
G  1  2  3  E
```
**Use for**: Main feature validation

### Dataset 2: Simple Linear (4 activities)
```
A  1  2  3  —
B  2  3  4  A
C  3  4  5  B
D  2  3  4  C
```
**Use for**: Basic testing

### Dataset 3: Complex Network (6 activities)
```
A  1  2  3  —
B  2  3  4  —
C  2  3  4  —
D  4  5  6  A,B
E  3  5  7  B,C
F  2  3  4  D,E
```
**Use for**: Multiple path testing

---

## Acceptance Criteria

Feature is ready for production when:

✅ All 20 tests pass successfully
✅ No console errors during tests
✅ All data imported correctly
✅ Preview editing works properly
✅ Mobile layout is usable
✅ Error messages are clear
✅ Performance is acceptable
✅ No data corruption or loss

## Known Limitations

1. **No circular dependency detection** (yet)
2. **No duplicate activity detection** (yet)
3. **Cannot import from files directly** (yet) - copy/paste only
4. **Activity names are optional** - uses activity ID if not provided
5. **No import history** - no undo for bulk operations

## Recording Test Results

For each test, record:
- ✅ PASS - Feature works as expected
- ❌ FAIL - Describe issue
- ⚠️ PARTIAL - Describe limitations
- 🔄 RETRY - Try again with different data

Example:
```
Test 2 (Aircraft Import): ✅ PASS
- All 7 activities imported
- Predecessors correct
- Durations accurate
- No errors shown
```

---

**Total Test Coverage**: 20 test scenarios
**Estimated Time**: 1-2 hours for complete testing
**Status**: Ready for QA
