# Fix UserDashboard White Screen Issue

## Problem
The UserDashboard shows a white screen after login due to type mismatches in the `downloads` field from the database. The field is `jsonb` and defaults to an empty array `[]`, but the code expects it to be either a number (for countdown) or an Analytics object (for analytics).

## Tasks
- [ ] Update UserDashboard component to properly handle different types in `downloads` field
- [ ] Add type guards for analytics data (handle array, object, or undefined)
- [ ] Add type guards for countdown data (handle number, array, or undefined)
- [ ] Test the fix by running the application

## Files to Edit
- src/pages/user/UserDashboard.tsx

## Expected Outcome
UserDashboard should load properly after login without showing a white screen, with proper defaults for analytics and countdown settings.
