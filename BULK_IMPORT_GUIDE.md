# Bulk Import Activities Guide

The bulk import feature allows you to quickly add multiple activities to a project by pasting data from a table or textbook problem.

## How to Use

### 1. Navigate to Project Editor
- Click on a project to open it
- You'll see the "Add Activity" section on the right side with a "📋 Bulk Import" button

### 2. Switch to Bulk Import Mode
- Click the "📋 Bulk Import" button to toggle from single-entry mode
- The form will change to show a text input area

### 3. Prepare Your Data
Format your activity data in one of these ways:

#### Option A: Tab-Separated Values (Recommended)
```
ID      Name                Optimistic  Most Likely  Pessimistic  Predecessors
A       Planning            1           2            3            —
B       Design              2           3            4            —
C       Development         4           5            6            A
D       Testing             8           9            10           B
E       Deployment          2           5            8            C,D
F       Documentation       4           5            6            B
G       Closeout            1           2            3            E
```

#### Option B: Space-Separated Values
```
A Planning 1 2 3 —
B Design 2 3 4 —
C Development 4 5 6 A
D Testing 8 9 10 B
E Deployment 2 5 8 C,D
F Documentation 4 5 6 B
G Closeout 1 2 3 E
```

#### Option C: CPM Format (Single Duration)
```
A Planning 2 —
B Design 3 —
C Development 5 A
D Testing 9 B
E Deployment 5 C,D
F Documentation 5 B
G Closeout 2 E
```

### 4. Paste Your Data
- Copy your activity data from your textbook, spreadsheet, or document
- Paste it into the text area in the bulk import form

### 5. Review the Preview
- Click "Next: Preview" to see how the system parsed your data
- A table will show all extracted activities with:
  - Activity ID
  - Name
  - Time estimates or duration
  - Predecessors
- You can edit any field directly in this preview table before final import

### 6. Make Corrections (if needed)
- Click on any cell in the preview table to edit it
- Fix any values that were parsed incorrectly
- Predecessor format: Use commas to separate multiple predecessors (e.g., "A,B,C")

### 7. Confirm and Import
- Click "Import Activities" to add all activities to your project
- A progress indicator will show as activities are being added
- Once complete, you'll see all new activities in the activities list

## Data Format Notes

### Activity ID
- Required for each activity
- Typically single letters (A, B, C) or alphanumeric codes (A1, A2, B1)

### Activity Name
- Descriptive name for the activity
- Can be blank (system will auto-fill if needed)

### Time Estimates (PERT Projects)
- **Optimistic (a)**: Best-case duration
- **Most Likely (m)**: Most probable duration
- **Pessimistic (b)**: Worst-case duration
- Format: `1 2 3` or `1  2  3` (space or tab separated)

### Duration (CPM Projects)
- Single duration value for the activity
- Format: `5` or `5.5`

### Predecessors
- Activities that must be completed before this one
- Format options:
  - `—` or `-` for no predecessors
  - `A` for single predecessor
  - `A,B` or `A B` for multiple predecessors

## Example: Aircraft Wing Assembly (Textbook Problem)

**Copy and paste this directly:**

```
Activity  a   m   b   Predecessors
A         1   2   3   —
B         2   3   4   —
C         4   5   6   A
D         8   9   10  B
E         2   5   8   C,D
F         4   5   6   B
G         1   2   3   E
```

After import, your project will have 7 activities ready for analysis!

## Troubleshooting

### Activities Not Parsing Correctly?
1. Ensure activities are separated by newlines (one per line)
2. Check that numeric values are in the correct order (a, m, b) or (duration)
3. Verify predecessors use commas or dashes, not other characters

### Missing an Activity in Preview?
- The system skips header rows automatically
- If a row looks like headers (contains "activity", "duration", etc.), it's skipped
- If you need to include that data, remove the header indicator words

### Need to Edit After Import?
- After import, you can delete activities and re-import
- Or use single-entry mode to add missing activities
- Use the Edit project feature to modify existing activities (coming soon)

## Tips for Best Results

1. **Copy from textbooks**: Most textbook problems have nicely formatted tables - just copy and paste!
2. **Clean your data**: Remove extra spaces, formatting, or non-essential columns
3. **Check predecessors**: Make sure predecessor notation is consistent (use commas, not spaces)
4. **Verify the preview**: Always review the preview table before final import
5. **One project at a time**: The bulk import adds to the current project - create a new project if needed

## File Format Support

Currently supports:
- ✅ Tab-separated values (TSV)
- ✅ Space-separated values
- ✅ Mixed separators
- ✅ Dash or em-dash for "no predecessors"

Planned features:
- 📋 CSV file upload
- 📊 Excel/Google Sheets paste
- 📄 PDF table extraction
