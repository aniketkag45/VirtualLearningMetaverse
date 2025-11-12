# System Architecture Diagram

## Component Description

This document describes the system architecture of the Virtual Learning Metaverse platform.

---

## Architecture Layers

### 1. **Presentation Layer (Frontend)**

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERFACE LAYER                      │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Index   │  │  Login   │  │Dashboard │  │ Courses  │  │
│  │   Page   │  │   Page   │  │   Page   │  │   Page   │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          3D Virtual Classroom (A-Frame)              │  │
│  │  • 3D Scene Rendering  • Avatar System               │  │
│  │  • Interactive Controls • Real-time Updates          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓↑
┌─────────────────────────────────────────────────────────────┐
│                   PRESENTATION LOGIC                         │
│                                                              │
│  ┌────────────────────┐        ┌────────────────────┐      │
│  │  Bootstrap 5.3.0   │        │  Font Awesome 6.4  │      │
│  │  • Grid System     │        │  • Icon Library    │      │
│  │  • Components      │        │  • Visual Elements │      │
│  └────────────────────┘        └────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### 2. **Application Layer (Business Logic)**

```
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                         │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              JavaScript Functions (script.js)         │  │
│  │                                                        │  │
│  │  ┌─────────────────┐    ┌─────────────────┐         │  │
│  │  │  Authentication │    │  Course         │         │  │
│  │  │  • Login        │    │  Management     │         │  │
│  │  │  • Register     │    │  • Search       │         │  │
│  │  │  • Logout       │    │  • Filter       │         │  │
│  │  │  • Session Mgmt │    │  • Enrollment   │         │  │
│  │  └─────────────────┘    └─────────────────┘         │  │
│  │                                                        │  │
│  │  ┌─────────────────┐    ┌─────────────────┐         │  │
│  │  │  Classroom      │    │  Dashboard      │         │  │
│  │  │  • View Control │    │  • User Data    │         │  │
│  │  │  • Interactions │    │  • Progress     │         │  │
│  │  │  • Tools        │    │  • Analytics    │         │  │
│  │  └─────────────────┘    └─────────────────┘         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 3. **Data Layer (Storage)**

```
┌─────────────────────────────────────────────────────────────┐
│                       DATA LAYER                             │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              SessionStorage (Client-Side)             │  │
│  │                                                        │  │
│  │  • userData         : User profile information        │  │
│  │  • enrolledCourses  : List of enrolled courses        │  │
│  │  • currentClass     : Active classroom session        │  │
│  │  • preferences      : User settings                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Future Backend Integration (Prepared)         │  │
│  │                                                        │  │
│  │  REST API Endpoints:                                  │  │
│  │  • POST   /api/auth/login                            │  │
│  │  • POST   /api/auth/register                         │  │
│  │  • GET    /api/courses                               │  │
│  │  • POST   /api/courses/enroll                        │  │
│  │  • GET    /api/user/dashboard                        │  │
│  │  • WebSocket: Real-time classroom updates            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 4. **External Services Layer**

```
┌─────────────────────────────────────────────────────────────┐
│                  EXTERNAL SERVICES LAYER                     │
│                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐ │
│  │  Bootstrap CDN │  │  A-Frame CDN   │  │ Font Awesome │ │
│  │  v5.3.0        │  │  v1.4.2        │  │  v6.4.0      │ │
│  └────────────────┘  └────────────────┘  └──────────────┘ │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Future External Integrations                │  │
│  │  • Video Conferencing APIs (Zoom, WebRTC)            │  │
│  │  • Cloud Storage (AWS S3, Azure Blob)                │  │
│  │  • AI/ML Services (OpenAI, TensorFlow)               │  │
│  │  • Payment Gateway (Stripe, Razorpay)                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

### User Authentication Flow

```
User → Login Page → Enter Credentials → Validate → SessionStorage → Dashboard
                                         ↓
                                      [Failed]
                                         ↓
                                   Error Message
```

### Course Enrollment Flow

```
User → Courses Page → Search/Filter → View Course Details → Enroll
                                                               ↓
                                                    SessionStorage Update
                                                               ↓
                                                      Confirmation Message
                                                               ↓
                                                    Update Dashboard
```

### Virtual Classroom Flow

```
User → Dashboard → Join Class Button → classroom.html
                                            ↓
                                    Load 3D Scene (A-Frame)
                                            ↓
                                    Render Classroom Environment
                                            ↓
                              ┌─────────────┴─────────────┐
                              ↓                           ↓
                    Interactive Tools            View Controls
                    • Raise Hand                 • Front View
                    • Mic/Video                  • Side View
                    • Chat                       • Top View
                    • Screen Share               • Fullscreen
```

---

## Technology Stack Details

### Frontend Technologies
- **HTML5**: Semantic markup, accessibility features
- **CSS3**: Flexbox, Grid, animations, responsive design
- **JavaScript ES6+**: Modern syntax, arrow functions, async/await
- **Bootstrap 5.3.0**: Grid system, components, utilities
- **A-Frame 1.4.2**: WebVR framework, entity-component system
- **Font Awesome 6.4.0**: 2000+ icons

### Storage
- **SessionStorage**: Temporary client-side storage
- **Future: Database** (MongoDB/PostgreSQL)

### APIs (Prepared for Integration)
- RESTful API architecture
- JSON data exchange
- JWT authentication tokens
- WebSocket for real-time updates

---

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                           │
│                                                              │
│  Layer 1: Input Validation                                  │
│  • Form validation (client-side)                            │
│  • Email format checking                                    │
│  • Password strength validation                             │
│                                                              │
│  Layer 2: Session Management                                │
│  • SessionStorage for temporary data                        │
│  • Auto-logout on browser close                             │
│  • Protected route checking                                 │
│                                                              │
│  Layer 3: Future Backend Security                           │
│  • JWT token authentication                                 │
│  • Password hashing (bcrypt)                                │
│  • HTTPS encryption                                         │
│  • Rate limiting                                            │
│  • SQL injection prevention                                 │
│  • XSS protection                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Scalability Considerations

### Horizontal Scaling (Future)
- Load balancers for traffic distribution
- Multiple server instances
- Database replication
- CDN for static assets

### Vertical Scaling (Future)
- Increased server resources
- Database optimization
- Caching mechanisms (Redis)
- Query optimization

---

## Deployment Architecture (Future)

```
┌─────────────────────────────────────────────────────────────┐
│                    PRODUCTION DEPLOYMENT                     │
│                                                              │
│  Users → DNS → Load Balancer → Web Servers (N instances)   │
│                                        ↓                     │
│                                  Application Servers        │
│                                        ↓                     │
│                              ┌─────────┴─────────┐          │
│                              ↓                   ↓          │
│                        Database Server    Cache Server      │
│                        (PostgreSQL)         (Redis)         │
│                                                              │
│  Monitoring: Application Insights, New Relic                │
│  Backup: Automated daily backups                            │
│  CI/CD: GitHub Actions, Jenkins                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Interaction Matrix

| Component | Interacts With | Purpose |
|-----------|---------------|---------|
| index.html | login.html, courses.html | Navigation, user acquisition |
| login.html | script.js, SessionStorage, dashboard.html | Authentication |
| dashboard.html | SessionStorage, courses.html, classroom.html | User hub |
| courses.html | script.js, SessionStorage, classroom.html | Course discovery |
| classroom.html | A-Frame, script.js, SessionStorage | 3D learning |
| script.js | All HTML pages, SessionStorage | Business logic |
| style.css | All HTML pages | Visual styling |

---

This architecture supports:
✅ Modularity and maintainability
✅ Easy backend integration
✅ Scalability for future growth
✅ Security best practices
✅ Performance optimization
✅ Cross-browser compatibility
