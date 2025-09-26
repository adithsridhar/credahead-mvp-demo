# Module Implementation - Setup Guide

## Overview
This implementation adds module functionality to organize lessons into 8-10 modules across the 200 lessons.

## Database Structure

### 1. New `modules` Table
- `id` (primary key, auto-increment)
- `module_id` (string, unique - format: M001, M002, etc.)
- `name` (module name)
- `created_at`, `updated_at` (timestamps)

### 2. Updated `lessons` Table  
- Added `module_id` column (references modules.module_id)

## Implementation Steps

### Step 1: Run SQL Setup
Execute the SQL commands in `modules-setup.sql` in your Supabase SQL editor:
```sql
-- This will create the modules table and add module_id column to lessons
```

### Step 2: Upload Module Data
1. **Modules CSV**: Use `modules-template.csv` format
   - Column headers: `module_id,name`  
   - Example: `M001,Financial Basics`

2. **Lesson Assignments CSV**: Use `lesson-module-assignments-template.csv` format
   - Column headers: `lesson_id,module_id`
   - Example: `L001,M001`

### Step 3: Upload to Supabase
1. Go to Supabase Dashboard → Table Editor
2. **Upload Modules**: 
   - Select `modules` table
   - Import your modules CSV
3. **Update Lesson Assignments**:
   - Create a CSV with `lesson_id,module_id` mappings
   - Use SQL UPDATE statements or bulk update via CSV

### Step 4: Verify Implementation
- Admin dashboard now shows both "Lessons by Module" and "Lessons by Level"
- Modules section uses green blocks, Levels section uses orange blocks
- User Data section remains unchanged

## Admin Dashboard Changes
✅ Added "Lessons by Module" section (green blocks)  
✅ Kept "Lessons by Level" section (orange blocks)  
✅ Adjusted layout: User Data (6 cols), Modules (3 cols), Levels (3 cols)  
✅ API updated to fetch modules data  
✅ TypeScript interfaces updated  

## Next Steps (After Module Data Upload)
1. Upload your module data using the CSV templates
2. Update lessons with module assignments  
3. Verify admin dashboard displays correct module breakdown
4. Optional: Add foreign key constraint (commented in SQL file)

## Files Created/Modified
- `database/modules-setup.sql` - Database schema setup
- `database/modules-template.csv` - Module data template  
- `database/lesson-module-assignments-template.csv` - Assignment template
- `src/lib/supabase.ts` - Added Module interface, updated Lesson interface
- `src/app/api/admin/stats/route.ts` - Added modules data fetching
- `src/app/admin/page.tsx` - Updated dashboard layout for both modules and levels

## CSV Upload Instructions
1. Replace template data with your actual modules and assignments
2. Upload modules CSV to `modules` table in Supabase
3. Use UPDATE queries or CSV import to assign module_id to lessons
4. Refresh admin dashboard to see module breakdown