# Reports Functionality Setup Guide

## 🎯 What's Been Implemented

### ✅ Report Submission Flow

1. **Authentication Check**: Ensures user is logged in before submitting
2. **Data Validation**: Validates description and location
3. **Supabase Integration**: Saves reports to `reports` table
4. **User ID Tracking**: Associates reports with authenticated users
5. **Error Handling**: Fallback to local storage if database fails

### 🗄️ Database Schema

The reports table includes:

- `id`: Unique UUID for each report
- `user_id`: Clerk user ID (links to authenticated user)
- `title`: Auto-generated from category
- `description`: User-provided description
- `category`: Selected category (Potholes, Streetlights, etc.)
- `location_latitude/longitude`: GPS coordinates
- `address`: Location string
- `photos`: Array of photo URLs
- `audio_uri`: Audio recording URL
- `status`: Report status (submitted, in_progress, etc.)
- `priority`: Priority level
- `timestamps`: Created/updated/resolved dates

## 🚀 Setup Instructions

### 1. **Run Database Setup**

Copy and paste the contents of `SUPABASE_SETUP.sql` into your Supabase SQL Editor and execute it.

### 2. **Test Report Submission**

1. Open the app
2. Login with Google or email/password
3. Go to the Report screen
4. Fill out a report with:
   - Description
   - Location (auto-detected or manual)
   - Category
   - Optional: Photos/audio
5. Tap "Submit Report"

### 3. **Verify in Supabase**

1. Go to Supabase Dashboard
2. Navigate to Table Editor → reports
3. Check if your test report appears

## 🔧 Key Code Changes

### `app/report.tsx`

- Added `useClerkAuth()` hook
- Added authentication check in `submitReport()`
- Added `user_id` to report data
- Enhanced error messages

### `lib/database.ts`

- Enhanced logging for debugging
- Improved error handling

## 🧪 Testing Checklist

- [ ] User authentication required
- [ ] Form validation works
- [ ] Location detection works
- [ ] Manual address entry works
- [ ] Category selection works
- [ ] Photo upload (if implemented)
- [ ] Audio recording (if implemented)
- [ ] Report saves to Supabase
- [ ] Success message shows
- [ ] Form resets after submission
- [ ] Offline fallback to local storage

## 🔍 Debugging

Check the console logs for:

- `🚀 Creating report in Supabase:`
- `✅ Report created successfully:`
- `❌ Error creating report:`

## 📱 User Experience Flow

1. User opens Report screen
2. Location auto-detected (or manual entry)
3. User fills description and selects category
4. User optionally adds photos/audio
5. User taps "Submit Report"
6. Authentication verified
7. Data validated
8. Report saved to Supabase
9. Success message with options to track or submit another

## 🛠️ Next Steps

1. **Photo Upload**: Implement Supabase Storage for photos
2. **Audio Upload**: Implement Supabase Storage for audio
3. **Report Tracking**: Show user's reports in tracking screen
4. **Admin Dashboard**: View and manage all reports
5. **Push Notifications**: Notify users of status updates
