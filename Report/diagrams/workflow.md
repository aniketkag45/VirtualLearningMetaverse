# User Workflow Diagram

## Overview
This document describes the complete user journey through the Virtual Learning Metaverse platform.

---

## Main User Flow

```
                    ┌─────────────────────┐
                    │   Landing Page      │
                    │   (index.html)      │
                    │                     │
                    │  • Hero Section     │
                    │  • Features         │
                    │  • Statistics       │
                    │  • Problem/Solution │
                    └──────────┬──────────┘
                               ↓
                    [Click "Get Started" or "Login"]
                               ↓
                    ┌─────────────────────┐
                    │   Login Page        │
                    │   (login.html)      │
                    └──────────┬──────────┘
                               ↓
                ┌──────────────┴──────────────┐
                ↓                             ↓
    ┌─────────────────────┐       ┌─────────────────────┐
    │  New User?          │       │  Existing User?     │
    │  Register Account   │       │  Login with         │
    │                     │       │  Credentials        │
    └──────────┬──────────┘       └──────────┬──────────┘
               ↓                              ↓
               └──────────────┬───────────────┘
                              ↓
                   [Authentication Success]
                              ↓
                    ┌─────────────────────┐
                    │  Student Dashboard  │
                    │  (dashboard.html)   │
                    │                     │
                    │  • Profile          │
                    │  • Statistics       │
                    │  • Enrolled Courses │
                    │  • Schedule         │
                    │  • Achievements     │
                    └──────────┬──────────┘
                               ↓
                ┌──────────────┴──────────────┐
                ↓                             ↓
    ┌─────────────────────┐       ┌─────────────────────┐
    │  Browse Courses?    │       │  Join Scheduled     │
    │  Go to Courses Page │       │  Class?             │
    └──────────┬──────────┘       └──────────┬──────────┘
               ↓                              ↓
    ┌─────────────────────┐       ┌─────────────────────┐
    │  Courses Page       │       │  Virtual Classroom  │
    │  (courses.html)     │       │  (classroom.html)   │
    │                     │       │                     │
    │  • Search Courses   │       │  • 3D Environment   │
    │  • Filter Options   │       │  • Interactive      │
    │  • View Details     │       │  • Tools Panel      │
    │  • Enroll           │       │  • Whiteboard       │
    └──────────┬──────────┘       └──────────┬──────────┘
               ↓                              ↓
       [Enroll in Course]              [Participate in Class]
               ↓                              ↓
               └──────────────┬───────────────┘
                              ↓
                    [Course Completion]
                              ↓
                    ┌─────────────────────┐
                    │  Updated Dashboard  │
                    │                     │
                    │  • Progress Updated │
                    │  • Certificates     │
                    │  • New Achievements │
                    └─────────────────────┘
```

---

## Detailed Flow Scenarios

### 1. New User Registration Flow

```
Start
  ↓
Landing Page → Click "Get Started" / "Sign Up"
  ↓
Login Page → Click "Register Now"
  ↓
Registration Modal Opens
  ↓
Fill Registration Form:
  • First Name
  • Last Name
  • Email
  • Phone Number
  • User Type (Student/Teacher/Admin)
  • Enrollment Number (if Student)
  • Password
  • Confirm Password
  • Accept Terms & Conditions
  ↓
Click "Register"
  ↓
Validation Check
  ↓
┌─────────────────┴─────────────────┐
↓                                   ↓
[Valid]                        [Invalid]
↓                                   ↓
Store in SessionStorage        Show Error Message
↓                                   ↓
Redirect to Dashboard          Return to Form
  ↓
Success Message
  ↓
End
```

### 2. Existing User Login Flow

```
Start
  ↓
Login Page
  ↓
Select User Type (Student/Teacher/Admin)
  ↓
Enter Email/Enrollment Number
  ↓
Enter Password
  ↓
Click "Sign In"
  ↓
Validation
  ↓
┌─────────────────┴─────────────────┐
↓                                   ↓
[Valid Credentials]           [Invalid Credentials]
↓                                   ↓
SessionStorage Update          Show Error Message
↓                                   ↓
Redirect to Dashboard          Return to Login Form
  ↓
Load User Data
  ↓
Display Personalized Content
  ↓
End
```

### 3. Demo Login Flow

```
Start
  ↓
Login Page
  ↓
Click "Demo Login" Button
  ↓
┌─────────┴─────────┐
↓         ↓         ↓
Student  Teacher  Admin
  ↓         ↓         ↓
Auto-fill Credentials
  ↓
SessionStorage Update
  ↓
Instant Redirect to Dashboard
  ↓
Role-Based View
  ↓
End
```

### 4. Course Enrollment Flow

```
Start (from Dashboard or Courses Page)
  ↓
Browse Courses Page
  ↓
┌─────────────────────┴─────────────────────┐
↓                                           ↓
Use Search Bar                        Use Filters
• Type keywords                       • Category
• Real-time results                   • Level
  ↓                                           ↓
  └─────────────────────┬─────────────────────┘
                        ↓
                View Course Details
                        ↓
              Check: Already Enrolled?
                        ↓
        ┌───────────────┴───────────────┐
        ↓                               ↓
    [No]                            [Yes]
        ↓                               ↓
Click "Enroll Now"              Button shows "Enrolled"
        ↓                               ↓
Confirmation Popup                  Can't enroll again
        ↓                               ↓
Click "Confirm"                     End
        ↓
Update SessionStorage
enrolledCourses array
        ↓
Show Success Message
        ↓
Button changes to "Enrolled" (disabled)
        ↓
Dashboard automatically updated
        ↓
End
```

### 5. Virtual Classroom Interaction Flow

```
Start (from Dashboard)
  ↓
View "Upcoming Classes" Section
  ↓
Click "Join Now" Button
  ↓
Navigate to classroom.html
  ↓
A-Frame Scene Loads
  ↓
3D Classroom Environment Renders:
  • Sky, Floor, Walls
  • Teacher Desk & Avatar
  • Student Desks & Avatars
  • Whiteboard with Content
  • Clock & Notice Board
  ↓
┌──────────────────────┴──────────────────────┐
↓                                             ↓
View Controls Available              Tools Panel Available
• Front View                         • Raise Hand
• Side View                          • Microphone Toggle
• Top View                           • Video Toggle
• Teacher View                       • Chat (upcoming)
• Fullscreen Mode                    • Screen Share (upcoming)
  ↓                                             ↓
  └──────────────────────┬──────────────────────┘
                         ↓
            User Interacts with Classroom
                         ↓
            ┌────────────┴────────────┐
            ↓                         ↓
    Continue Learning          Leave Classroom
            ↓                         ↓
    Stay in session           Confirmation Popup
            ↓                         ↓
            │                  Click "Yes, Leave"
            │                         ↓
            │                  Redirect to Dashboard
            │                         ↓
            └─────────────────────────┘
                         ↓
                        End
```

### 6. Dashboard Activity Flow

```
Start (User Logged In)
  ↓
Dashboard Loads
  ↓
Load from SessionStorage:
  • User Data
  • Enrolled Courses
  • Progress Stats
  • Achievements
  ↓
Display Components:
  ├─ Profile Card (Left Sidebar)
  │   • Name
  │   • Enrollment Number
  │   • Quick Stats
  │
  ├─ Statistics Cards (Main Area)
  │   • Learning Hours: 42.5
  │   • Average Score: 85%
  │   • Assignments: 12/15
  │   • Attendance: 92%
  │
  ├─ Enrolled Courses (Main Area)
  │   • Course 1: 65% Progress
  │   • Course 2: 40% Progress
  │   • Course 3: 100% Completed
  │
  ├─ Upcoming Classes Schedule
  │   • Class 1: Join Now button
  │   • Class 2: Starts in X hours
  │   • Class 3: Tomorrow
  │
  └─ Achievements Section
      • Early Bird Badge
      • Assignment Master
      • Perfect Attendance
  ↓
User Actions Available:
  ├─ Click "Browse Courses" → courses.html
  ├─ Click "Join Now" → classroom.html
  ├─ View Course Progress → Details modal
  └─ Click "Logout" → login.html
  ↓
End
```

### 7. Search and Filter Flow (Courses Page)

```
Start (Courses Page Loaded)
  ↓
All Courses Displayed (Default)
  ↓
User Interaction
  ↓
┌────────────────┴────────────────┐
↓                                 ↓
Search by Keyword           Filter by Category/Level
  ↓                                 ↓
Type in Search Box          Select from Dropdowns
  ↓                                 ↓
JavaScript Function         JavaScript Function
searchCourses()             filterByCategory()
  ↓                                 ↓
Loop through course cards   Loop through course cards
  ↓                                 ↓
Match title/description     Match data attributes
  ↓                                 ↓
└────────────────┬────────────────┘
                 ↓
      Show/Hide Matching Courses
                 ↓
      Display Filtered Results
                 ↓
        ┌────────┴────────┐
        ↓                 ↓
   Courses Found     No Courses
        ↓                 ↓
  Show Course Cards  Show "No results"
        ↓                 ↓
        └────────┬────────┘
                 ↓
                End
```

---

## State Management Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   SessionStorage States                      │
│                                                              │
│  Initial State (No Login):                                  │
│  • userData: null                                           │
│  • enrolledCourses: []                                      │
│  • currentClass: null                                       │
│                                                              │
│  After Login:                                               │
│  • userData: {                                              │
│      name: "Aniket Kag",                                    │
│      enrollmentNumber: "0901AD221007",                      │
│      userType: "student",                                   │
│      loginTime: "2025-11-10T..."                            │
│    }                                                         │
│  • enrolledCourses: []                                      │
│                                                              │
│  After Course Enrollment:                                   │
│  • enrolledCourses: [                                       │
│      "course-001",                                          │
│      "course-005",                                          │
│      "course-012"                                           │
│    ]                                                         │
│                                                              │
│  During Classroom Session:                                  │
│  • currentClass: "class-programming-101"                    │
│                                                              │
│  After Logout:                                              │
│  • All data cleared                                         │
│  • Redirect to login.html                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Error Handling Flow

```
User Action
  ↓
System Processing
  ↓
Error Check
  ↓
┌─────────────────┴─────────────────┐
↓                                   ↓
[Success]                      [Error Detected]
↓                                   ↓
Continue Normal Flow          Identify Error Type
  ↓                                   ↓
  │                    ┌──────────────┴──────────────┐
  │                    ↓                             ↓
  │            Validation Error              System Error
  │                    ↓                             ↓
  │            Show User-Friendly          Log to Console
  │            Error Message                        ↓
  │                    ↓                   Show Generic Error
  │            Highlight Problem Field              ↓
  │                    ↓                   Suggest Retry
  │                    └──────────────┬────────────┘
  │                                   ↓
  │                        User Can Retry/Fix
  │                                   ↓
  └───────────────────────────────────┘
                  ↓
                 End
```

---

## Navigation Map

```
                    index.html (Landing)
                          │
          ┌───────────────┼───────────────┐
          ↓               ↓               ↓
    About Section   Features Section  CTA Buttons
          │               │               │
          └───────────────┴───────────────┘
                          ↓
                    login.html
                          │
          ┌───────────────┴───────────────┐
          ↓                               ↓
    Student Dashboard              Teacher Dashboard
          │                               │
          ├─→ courses.html                ├─→ courses.html
          ├─→ classroom.html              ├─→ classroom.html
          └─→ Profile (upcoming)          └─→ Students List (upcoming)
                          │
                          ↓
                  logout → login.html
```

---

## User Role-Based Flows

### Student Role
1. Login → Dashboard → Browse Courses → Enroll → Join Classes → Track Progress

### Teacher Role (Future)
1. Login → Dashboard → Create Courses → Schedule Classes → Manage Students → Grade Assignments

### Admin Role (Future)
1. Login → Admin Panel → Manage Users → Monitor System → Generate Reports → System Settings

---

This workflow ensures:
✅ Intuitive user journey
✅ Clear decision points
✅ Error handling at every step
✅ Seamless navigation
✅ Role-based access control
✅ Data persistence across sessions
