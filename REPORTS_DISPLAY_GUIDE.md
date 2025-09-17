# 📊 Reports Display & Fetching Guide

## 🎯 **Where Reports Are Fetched and Displayed**

Your civic app fetches and displays reports in **4 main screens**:

### 1. **📱 Dashboard Screen** (`app/dashboard.tsx`)

**What it shows:** Statistics overview

```typescript
const reportStats = await DatabaseService.getReportStats();
// Shows: Total, Resolved, Pending, In Progress counts
```

**Features:**

- ✅ Real-time statistics from database
- ✅ Quick stats cards showing report counts by status
- ✅ Navigation to other report screens

### 2. **📋 My Complaints** (`app/my-complaints.tsx`)

**What it shows:** Current user's reports only

```typescript
const userReports = await DatabaseService.getUserReports(user.id);
// Shows: Only reports created by the logged-in user
```

**Features:**

- ✅ User-specific reports filtered by `user_id`
- ✅ Status badges (submitted, in_progress, resolved)
- ✅ Category icons and timestamps
- ✅ Tap to view details

### 3. **📍 Nearby Issues** (`app/nearby-issues.tsx`)

**What it shows:** Reports from nearby locations

```typescript
const nearbyReports = await DatabaseService.getNearbyReports(lat, lng, radius);
// Shows: Reports within specified radius of user location
```

**Features:**

- ✅ Location-based filtering
- ✅ Distance calculation
- ✅ All users' reports in the area
- ✅ Map and list view options

### 4. **📊 Tracking Screen** (`app/tracking.tsx`)

**What it shows:** User's reports with detailed tracking

```typescript
const userReports = await DatabaseService.getUserReports(user.id);
// Shows: User's reports with status progression
```

**Features:**

- ✅ Timeline view of report status changes
- ✅ Progress indicators
- ✅ Status history tracking

## 🔧 **Database Service Methods**

### **`DatabaseService.createReport(data)`**

- **Purpose:** Save new reports to database
- **Used in:** `report.tsx` when submitting
- **Returns:** Created report or null

### **`DatabaseService.getUserReports(userId)`**

- **Purpose:** Get reports for specific user
- **Used in:** `my-complaints.tsx`, `tracking.tsx`
- **Returns:** Array of user's reports

### **`DatabaseService.getNearbyReports(lat, lng, radius)`**

- **Purpose:** Get reports near location
- **Used in:** `nearby-issues.tsx`
- **Returns:** Array of nearby reports with distance

### **`DatabaseService.getReportStats()`**

- **Purpose:** Get aggregated statistics
- **Used in:** `dashboard.tsx`
- **Returns:** Stats object with counts

## 📱 **User Experience Flow**

### **Viewing Personal Reports:**

1. User goes to "My Complaints"
2. App fetches reports where `user_id = current_user.id`
3. Displays reports in a list with status badges
4. User can tap to see details or track progress

### **Viewing Community Reports:**

1. User goes to "Nearby Issues"
2. App gets user's location
3. App fetches reports within radius using PostGIS function
4. Displays reports from all users in the area
5. Shows distance from user's location

### **Dashboard Overview:**

1. User opens dashboard
2. App fetches statistics from all reports
3. Shows quick counts and navigation options
4. Real-time data from Supabase

## 🚀 **Recent Updates Made**

### ✅ **Authentication Integration:**

- Added `useClerkAuth()` to `my-complaints.tsx`
- Now fetches only authenticated user's reports
- Added proper user ID filtering

### ✅ **Enhanced Database Queries:**

- Added PostGIS function for nearby reports
- Improved error handling and logging
- Added fallback to local storage

### ✅ **Real-time Data:**

- All screens now fetch fresh data from Supabase
- Statistics calculated from live database
- Proper loading states and error handling

## 🧪 **Testing the Report Display**

### **Test My Complaints:**

1. Submit a report (you already did this!)
2. Go to "My Complaints" screen
3. Should see your submitted report
4. Check console logs for fetch confirmation

### **Test Dashboard Stats:**

1. Open Dashboard
2. Should show updated counts including your report
3. "Total" should be at least 1

### **Test Nearby Issues:**

1. Go to "Nearby Issues"
2. Should show reports in your area
3. Include your report if location enabled

## 📊 **Database Query Examples**

```sql
-- Get user's reports
SELECT * FROM reports WHERE user_id = 'user_123' ORDER BY created_at DESC;

-- Get report statistics
SELECT
  COUNT(*) as total,
  COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved,
  COUNT(CASE WHEN status = 'submitted' THEN 1 END) as pending
FROM reports;

-- Get nearby reports (using PostGIS function)
SELECT * FROM get_nearby_reports(40.7128, -74.0060, 5);
```

## 🎯 **Next Steps**

1. **✅ Test Report Display:** Check all 4 screens show your submitted report
2. **📷 Photo Integration:** Add photo storage and display
3. **🔔 Status Updates:** Add admin interface to update report status
4. **📈 Advanced Analytics:** Add charts and trends
5. **🗺️ Map Integration:** Show reports on interactive map

Your reports are now being saved and displayed across all the relevant screens in your civic app! 🎉
