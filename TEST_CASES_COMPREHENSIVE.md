# Comprehensive Test Cases for Task Tracker Application

## 1. TIMER FEATURE (useTaskTimer Hook)
**Status: ✅ 9/9 IMPLEMENTED & PASSING**

### Happy Path
- ✅ Timer initializes in stopped state (no timer running)
- ✅ Start timer increments seconds correctly
- ✅ Pause preserves elapsed time (doesn't reset)
- ✅ Stop resets elapsed time to zero
- ✅ Total minutes calculated from existing + current time

### Edge Cases
- ✅ Auto-sync triggers every 30 seconds
- ✅ Running timer loads from database with correct elapsed time
- ✅ Display time formats correctly (MM:SS)
- ✅ All functions exported and callable

### Error Cases (TODO)
- ❌ Network failure during start/pause/stop
- ❌ Timer sync fails (retry logic)
- ❌ Multiple timers running simultaneously (race condition)
- ❌ Timer running when task deleted
- ❌ Extremely long timer durations (overflow)
- ❌ Negative time values
- ❌ Invalid task state (null/undefined)

---

## 2. TASK UTILITY FUNCTIONS (src/types/task.ts)

### 2.1 Priority/Flag Conversions
**Functions: `getPriorityFromFlags`, `getFlagsFromPriority`**

#### Happy Path
- ❌ urgent=true, important=true → 'urgent_important'
- ❌ urgent=true, important=false → 'urgent_not_important'
- ❌ urgent=false, important=true → 'not_urgent_important'
- ❌ urgent=false, important=false → 'not_urgent_not_important'
- ❌ Reverse conversion maintains consistency

#### Edge Cases
- ❌ Both flags undefined/null
- ❌ Invalid priority string passed
- ❌ Case sensitivity handling

### 2.2 Date Functions
**Functions: `getTodayDate`, `isTaskOverdue`, `formatDateForDisplay`, `getDaysUntilDue`**

#### Happy Path
- ❌ Today's date in correct format (YYYY-MM-DD)
- ❌ Task with past due_date returns true for overdue
- ❌ Task with future due_date returns false
- ❌ Format date displays correctly (MM/DD/YYYY or locale format)
- ❌ Days until due calculates correctly

#### Edge Cases
- ❌ Task with no due_date (undefined/null)
- ❌ Task due today (edge case - is it overdue?)
- ❌ Invalid date string
- ❌ Leap year dates
- ❌ Date far in future (year 9999)
- ❌ Date far in past (year 1900)
- ❌ Timezone edge cases (midnight crossover)
- ❌ DST transition dates

#### Error Cases
- ❌ Malformed date strings
- ❌ Empty string dates
- ❌ Non-date values passed

### 2.3 Task Sorting
**Functions: `sortTasks`, `sortTasksForMatrix`**

#### Happy Path
- ❌ Tasks sorted by status priority
- ❌ Tasks with same status sorted by due date
- ❌ Overdue tasks appear first
- ❌ Matrix sorting prioritizes overdue/urgent

#### Edge Cases
- ❌ Empty task array
- ❌ All tasks same status
- ❌ All tasks same due date
- ❌ Mixed tasks with/without due dates
- ❌ Large number of tasks (1000+)
- ❌ Tasks with identical properties
- ❌ Tasks with null/undefined values

#### Error Cases
- ❌ Null/undefined task array
- ❌ Array with non-task objects
- ❌ Tasks missing required fields

### 2.4 Time Formatting
**Functions: `formatMinutes`, `formatSeconds`, `getTimeComparisonStatus`**

#### Happy Path
- ❌ 0 minutes → "0m"
- ❌ 45 minutes → "45m"
- ❌ 60 minutes → "1h 0m"
- ❌ 125 minutes → "2h 5m"
- ❌ Seconds format: 90s → "1:30"
- ❌ Time comparison: under estimate, over estimate, on track

#### Edge Cases
- ❌ Negative minutes/seconds
- ❌ Very large values (10000+ minutes)
- ❌ Decimal values (should round)
- ❌ Task with no estimate (comparison)
- ❌ Zero estimate with tracked time

---

## 3. TASK CRUD OPERATIONS (real-data-page.tsx)

### 3.1 Create Task
**Function: `handleAddTask`**

#### Happy Path
- ❌ Create task with all fields
- ❌ Create task with minimal fields (title only)
- ❌ Task appears in correct project
- ❌ Task has correct default values
- ❌ UI updates optimistically

#### Edge Cases
- ❌ Very long title (500 chars)
- ❌ Very long description (5000 chars)
- ❌ Special characters in title/description
- ❌ Emoji in title
- ❌ Multiple tags/links
- ❌ Empty arrays for tags/links
- ❌ Create while another operation in progress

#### Error Cases
- ❌ Empty title (validation)
- ❌ Title too long (>500 chars)
- ❌ Network failure during create
- ❌ Duplicate task detection
- ❌ Invalid project_id
- ❌ Missing required fields
- ❌ Create without authentication

### 3.2 Update Task
**Function: `handleTaskUpdateById`**

#### Happy Path
- ❌ Update single field
- ❌ Update multiple fields at once
- ❌ Optimistic update reflects immediately
- ❌ API sync completes successfully
- ❌ Modal updates if task selected

#### Edge Cases
- ❌ Update same field multiple times rapidly
- ❌ Update while timer running
- ❌ Update to identical values (no-op)
- ❌ Partial field updates
- ❌ Update non-existent task
- ❌ Concurrent updates from multiple users
- ❌ Update during network disruption

#### Error Cases
- ❌ Network failure (rollback optimistic update)
- ❌ Invalid field values
- ❌ Update locked/archived task
- ❌ Permission denied
- ❌ Field validation failures

### 3.3 Delete Task
**Function: `handleDeleteTask`**

#### Happy Path
- ❌ Delete task removes from list
- ❌ Delete updates project counts
- ❌ Confirmation before delete
- ❌ UI updates immediately

#### Edge Cases
- ❌ Delete task with running timer
- ❌ Delete task with attachments/links
- ❌ Delete while modal open
- ❌ Delete last task in project
- ❌ Delete during search/filter
- ❌ Undo delete (if implemented)

#### Error Cases
- ❌ Network failure during delete
- ❌ Delete non-existent task
- ❌ Permission denied
- ❌ Delete task in use elsewhere

### 3.4 Status Changes
**Function: `handleTaskMove` (status board), `handleTaskUpdateById`**

#### Happy Path
- ❌ Move task between statuses
- ❌ Status change via drag & drop
- ❌ Status change via modal
- ❌ Auto-stop timer when marked done
- ❌ Set completed_date when done

#### Edge Cases
- ❌ Move from done back to todo (reset completed_date?)
- ❌ Move to on_hold with running timer
- ❌ Rapid status changes
- ❌ Status change during save
- ❌ Move to same status (no-op)

#### Error Cases
- ❌ Invalid status value
- ❌ Network failure during move
- ❌ Drag & drop interrupted

### 3.5 Priority Changes
**Function: `handleTaskMove` (matrix), `handleTaskUpdateById`**

#### Happy Path
- ❌ Change priority via drag & drop
- ❌ Priority change updates flags (is_urgent, is_important)
- ❌ Task moves to correct quadrant
- ❌ Maintains other task properties

#### Edge Cases
- ❌ Change priority of overdue task
- ❌ Multiple priority changes rapidly
- ❌ Priority change during status change
- ❌ Move to same priority (no-op)

#### Error Cases
- ❌ Invalid priority value
- ❌ Network failure during move
- ❌ Conflicting flag states

---

## 4. DRAG & DROP (EisenhowerMatrix, StatusBoard)

### 4.1 Matrix Drag & Drop
**Component: EisenhowerMatrix**

#### Happy Path
- ❌ Drag task between quadrants
- ❌ Visual feedback during drag
- ❌ Drop updates priority
- ❌ Task appears in new quadrant
- ❌ Count updates

#### Edge Cases
- ❌ Drag to same quadrant (no-op)
- ❌ Drag outside droppable area (cancel)
- ❌ Drag with scroll position
- ❌ Drag on mobile/touch device
- ❌ Drag very long task card
- ❌ Simultaneous drags (should prevent)
- ❌ Drag during search filter

#### Error Cases
- ❌ Network failure after drop
- ❌ Invalid drop target
- ❌ Drop on disabled quadrant
- ❌ Drag interrupted (network loss)

### 4.2 Status Board Drag & Drop
**Component: StatusBoard**

#### Happy Path
- ❌ Drag task between columns
- ❌ Visual feedback during drag
- ❌ Drop updates status
- ❌ Task appears in new column
- ❌ Timer stops when dropped on done

#### Edge Cases
- ❌ Drag to same column (no-op)
- ❌ Drag with running timer
- ❌ Drag outside droppable area
- ❌ Drag with scroll
- ❌ Reordering within same column
- ❌ Drop animation interrupted

---

## 5. TASK MODAL (TaskDetailModal)

### 5.1 View Mode
**Component: TaskDetailModal**

#### Happy Path
- ❌ Display all task fields
- ❌ Format dates correctly
- ❌ Show timer controls
- ❌ Display tags/links
- ❌ Show time tracking info

#### Edge Cases
- ❌ Task with missing optional fields
- ❌ Very long text fields (scroll)
- ❌ Many tags/links (overflow)
- ❌ No estimate set
- ❌ Running timer display updates

#### Error Cases
- ❌ Null task passed
- ❌ Invalid task data
- ❌ Missing required fields

### 5.2 Edit Mode
**Component: TaskDetailModal**

#### Happy Path
- ❌ Edit title inline
- ❌ Edit description
- ❌ Change status dropdown
- ❌ Change priority
- ❌ Edit estimate
- ❌ Add/remove tags
- ❌ Add/remove links
- ❌ Manual time entry
- ❌ Save updates task

#### Edge Cases
- ❌ Edit with running timer
- ❌ Unsaved changes warning
- ❌ Cancel edit reverts changes
- ❌ Edit multiple fields
- ❌ Keyboard navigation
- ❌ Tab between fields

#### Error Cases
- ❌ Validation failures
- ❌ Network error during save
- ❌ Concurrent edit conflicts

### 5.3 Timer Controls (in Modal)
**Component: TaskDetailModal (useTaskTimer)**

#### Happy Path
- ❌ Start timer button visible when stopped
- ❌ Pause button visible when running
- ❌ Resume button after pause
- ❌ Stop button when paused
- ❌ Timer display updates live
- ❌ Progress bar shows estimate progress

#### Edge Cases
- ❌ Start when no estimate set
- ❌ Multiple start/pause rapidly
- ❌ Timer running on task close
- ❌ Open modal with running timer
- ❌ Manual time while timer paused

---

## 6. ADD TASK MODAL (AddTaskModal)

### 6.1 Form Validation
**Component: AddTaskModal**

#### Happy Path
- ❌ Required field: title
- ❌ Optional fields work
- ❌ Priority dropdown
- ❌ Project selection
- ❌ Date picker
- ❌ Estimate hours + minutes

#### Edge Cases
- ❌ Empty form submission (error)
- ❌ Title exactly 500 chars (boundary)
- ❌ Title 501 chars (error)
- ❌ Description 5000 chars (boundary)
- ❌ Description 5001 chars (error)
- ❌ Invalid URL in links
- ❌ URL without protocol (auto-add https)
- ❌ Duplicate tags
- ❌ Empty tag string
- ❌ Special chars in tags
- ❌ Past due date selection
- ❌ Far future date (year 9999)

#### Error Cases
- ❌ Submit without title
- ❌ Submit with invalid data
- ❌ Network failure during submit
- ❌ Close without saving (data loss)

### 6.2 Link/Tag Management
**Component: AddTaskModal**

#### Happy Path
- ❌ Add link
- ❌ Remove link
- ❌ Add tag
- ❌ Remove tag
- ❌ Multiple links/tags

#### Edge Cases
- ❌ Add duplicate link
- ❌ Add invalid URL (show error)
- ❌ Very long URL
- ❌ Very long tag name
- ❌ Many tags (100+)
- ❌ Tag with spaces/special chars
- ❌ Remove while adding

---

## 7. TASK CARD (TaskCard Component)

### 7.1 Display
**Component: TaskCard**

#### Happy Path
- ❌ Render title
- ❌ Render status badge
- ❌ Show description (truncated)
- ❌ Show due date
- ❌ Show owner
- ❌ Show timer badge when running

#### Edge Cases
- ❌ Very long title (truncate)
- ❌ No description
- ❌ No due date
- ❌ Overdue task styling
- ❌ Task with all fields
- ❌ Task with minimal fields
- ❌ Highlight search term

#### Error Cases
- ❌ Null/undefined task
- ❌ Missing required fields

### 7.2 Interaction
**Component: TaskCard**

#### Happy Path
- ❌ Click opens modal
- ❌ Keyboard navigation (Enter/Space)
- ❌ Hover effects

#### Edge Cases
- ❌ Click during drag
- ❌ Double click
- ❌ Right click (context menu?)

---

## 8. SEARCH & FILTER

### 8.1 Search Functionality
**Component: real-data-page.tsx (searchQuery state)**

#### Happy Path
- ❌ Search by title
- ❌ Search by description
- ❌ Search case-insensitive
- ❌ Highlight matched text
- ❌ Clear search

#### Edge Cases
- ❌ Empty search string
- ❌ Special characters in search
- ❌ Regex special chars (escape)
- ❌ Very long search query
- ❌ Search with no matches
- ❌ Search updates live
- ❌ Search across projects

#### Error Cases
- ❌ Invalid regex pattern
- ❌ Search breaks rendering

### 8.2 Project Filter
**Component: real-data-page.tsx (activeProject state)**

#### Happy Path
- ❌ Switch between projects
- ❌ Load tasks for new project
- ❌ Project counts update
- ❌ Remember last selected project

#### Edge Cases
- ❌ Empty project (no tasks)
- ❌ Project with 1000+ tasks
- ❌ Switch during task edit
- ❌ Switch with modal open
- ❌ Invalid project slug

---

## 9. VIEW MODES (Matrix, Table, Calendar, Status)

### 9.1 View Switching
**Component: real-data-page.tsx (viewMode state)**

#### Happy Path
- ❌ Switch to matrix view
- ❌ Switch to table view
- ❌ Switch to calendar view
- ❌ Switch to status board
- ❌ Maintain state across switches

#### Edge Cases
- ❌ Switch with modal open
- ❌ Switch during drag
- ❌ Switch with search active
- ❌ Switch with timer running
- ❌ Large dataset performance

### 9.2 Table View
**Component: TaskTable**

#### Happy Path
- ❌ Display all columns
- ❌ Sort by column
- ❌ Click row opens modal
- ❌ Show status badges
- ❌ Show time tracking

#### Edge Cases
- ❌ Sort ascending/descending
- ❌ Sort by multiple columns
- ❌ Empty table
- ❌ Very wide table (scroll)
- ❌ Many rows (pagination?)
- ❌ Responsive on mobile

### 9.3 Calendar View
**Component: CalendarView**

#### Happy Path
- ❌ Show tasks by due date
- ❌ Navigate months
- ❌ Click date shows tasks
- ❌ Highlight today
- ❌ Highlight overdue

#### Edge Cases
- ❌ Multiple tasks same date
- ❌ No tasks in month
- ❌ Tasks without due date (where to show?)
- ❌ Navigate to future/past
- ❌ Month with 28/29/30/31 days
- ❌ Leap year February

---

## 10. AUTHENTICATION & AUTHORIZATION

### 10.1 Login/Logout
**Component: AuthContext, ProtectedRoute**

#### Happy Path
- ❌ Successful login
- ❌ Redirect to app
- ❌ Logout clears session
- ❌ Redirect to login

#### Edge Cases
- ❌ Remember me checkbox
- ❌ Session expiry
- ❌ Refresh token flow
- ❌ Multiple tabs/windows

#### Error Cases
- ❌ Wrong credentials
- ❌ Network error during auth
- ❌ Email not verified
- ❌ Account locked/disabled

### 10.2 Protected Routes
**Component: ProtectedRoute**

#### Happy Path
- ❌ Authenticated user can access
- ❌ Unauthenticated redirects to login
- ❌ Loading state while checking

#### Edge Cases
- ❌ Direct URL access
- ❌ Bookmark protected route
- ❌ Session expired mid-session

---

## 11. DATA PERSISTENCE & SYNC

### 11.1 Optimistic Updates
**All CRUD operations**

#### Happy Path
- ❌ UI updates immediately
- ❌ API sync in background
- ❌ Success confirmation

#### Edge Cases
- ❌ Multiple rapid updates
- ❌ Update while syncing
- ❌ Offline mode (queue updates)

#### Error Cases
- ❌ Network failure (rollback)
- ❌ Conflict resolution
- ❌ Partial sync failure

### 11.2 Real-time Updates
**Supabase subscriptions (if implemented)**

#### Happy Path
- ❌ Changes from other users appear
- ❌ Task count updates
- ❌ No conflicts

#### Edge Cases
- ❌ Concurrent edits same task
- ❌ Delete while editing
- ❌ Connection interruption

---

## 12. ERROR HANDLING & EDGE CASES

### 12.1 Network Errors
**All API calls**

#### Error Cases
- ❌ No internet connection
- ❌ Timeout
- ❌ 500 server error
- ❌ 401 unauthorized
- ❌ 403 forbidden
- ❌ 404 not found
- ❌ Rate limiting

### 12.2 Data Integrity
**All components**

#### Error Cases
- ❌ Corrupted task data
- ❌ Missing required fields
- ❌ Type mismatches
- ❌ Circular references
- ❌ SQL injection attempts
- ❌ XSS in task content

### 12.3 Performance
**All views**

#### Edge Cases
- ❌ 1000+ tasks
- ❌ 10,000+ tasks
- ❌ Very long text fields
- ❌ Many concurrent users
- ❌ Slow network
- ❌ Low-end device

---

## SUMMARY

**Total Test Cases: ~350+**

**By Category:**
- ✅ Timer Hook: 9/16 (56%)
- ❌ Utility Functions: 0/60 (0%)
- ❌ CRUD Operations: 0/50 (0%)
- ❌ Drag & Drop: 0/30 (0%)
- ❌ Modals: 0/40 (0%)
- ❌ Views: 0/35 (0%)
- ❌ Search/Filter: 0/20 (0%)
- ❌ Auth: 0/15 (0%)
- ❌ Error Handling: 0/50 (0%)
- ❌ Performance: 0/10 (0%)

**Progress: 9/350+ (2.5%)**

**Next Priority (User's Choice):**
1. Utility functions (foundation)
2. CRUD operations (core functionality)
3. Drag & drop (user interaction)
4. Modals (critical UI)
5. Views (less critical)
6. Error handling (robustness)

Ready for approval to implement. Which category should I start with?
