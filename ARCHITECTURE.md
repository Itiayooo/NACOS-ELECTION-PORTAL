# NACOS Voting System - Architecture Overview

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      NACOS VOTING SYSTEM                     │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────┐         ┌──────────────────────┐
│   FRONTEND (React)   │         │  BACKEND (Node.js)   │
│                      │         │                      │
│  ┌────────────────┐  │         │  ┌────────────────┐  │
│  │  User Pages    │  │         │  │   REST API     │  │
│  │  - Login       │  │◄───────►│  │   - Auth       │  │
│  │  - Register    │  │  HTTP   │  │   - Voting     │  │
│  │  - Voting      │  │  /HTTPS │  │   - Admin      │  │
│  │  - Receipt     │  │         │  └────────────────┘  │
│  └────────────────┘  │         │                      │
│                      │         │  ┌────────────────┐  │
│  ┌────────────────┐  │         │  │  Controllers   │  │
│  │  Admin Panel   │  │         │  │  - Auth        │  │
│  │  - Dashboard   │  │         │  │  - Vote        │  │
│  │  - Departments │  │         │  │  - Admin       │  │
│  │  - Offices     │  │         │  └────────────────┘  │
│  │  - Candidates  │  │         │                      │
│  │  - Results     │  │         │  ┌────────────────┐  │
│  │  - Settings    │  │         │  │  Middleware    │  │
│  └────────────────┘  │         │  │  - JWT Auth    │  │
│                      │         │  │  - Admin Check │  │
│  ┌────────────────┐  │         │  └────────────────┘  │
│  │  State Mgmt    │  │         │                      │
│  │  - Zustand     │  │         └──────────┬───────────┘
│  └────────────────┘  │                    │
│                      │                    │
│  ┌────────────────┐  │                    ▼
│  │  UI/UX         │  │         ┌──────────────────────┐
│  │  - Tailwind    │  │         │   DATABASE (Mongo)   │
│  │  - Framer      │  │         │                      │
│  └────────────────┘  │         │  ┌────────────────┐  │
│                      │         │  │  Collections   │  │
└──────────────────────┘         │  │  - users       │  │
                                 │  │  - departments │  │
┌──────────────────────┐         │  │  - offices     │  │
│  EXTERNAL SERVICES   │         │  │  - candidates  │  │
│                      │         │  │  - votes       │  │
│  ┌────────────────┐  │         │  │  - settings    │  │
│  │  Cloudinary    │  │◄────────┤  └────────────────┘  │
│  │  (Images)      │  │         │                      │
│  └────────────────┘  │         └──────────────────────┘
└──────────────────────┘
```

## 📊 Data Flow

### Student Voting Flow
```
1. Student Registration
   Frontend → Backend API → MongoDB (create user)
                         → Return JWT token
   
2. Student Login
   Frontend → Backend API → Verify credentials
                         → Return JWT token + user data
   
3. View Voting Page
   Frontend → Backend API (with JWT) → Fetch offices & candidates
                                     → Return voting data
   
4. Cast Vote
   Frontend → Backend API (with JWT) → Validate votes
                                     → Create vote records
                                     → Mark user as voted
                                     → Return receipt
   
5. View Receipt
   Frontend → Display receipt → Option to download/print
```

### Admin Management Flow
```
1. Admin Login
   Frontend → Backend API → Verify admin credentials
                         → Return JWT token
   
2. Manage Departments/Offices
   Admin Panel → Backend API (with admin JWT) → CRUD operations
                                              → Update MongoDB
   
3. Add Candidates
   Admin Panel → Upload photo → Cloudinary → Get URL
              → Backend API → Save candidate with photo URL
   
4. View Results
   Admin Panel → Backend API → Aggregate votes by office
                            → Return results
   
5. Control Election
   Admin Panel → Backend API → Update election settings
                            → Enable/disable voting
```

## 🔒 Security Layers

```
┌─────────────────────────────────────┐
│     Client-Side Validation          │
│     - Form validation               │
│     - Type checking (TypeScript)    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│     Network Layer                   │
│     - HTTPS (in production)         │
│     - JWT in Authorization header   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│     Authentication Middleware       │
│     - Verify JWT token              │
│     - Extract user ID               │
│     - Load user from database       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│     Authorization Middleware        │
│     - Check admin status            │
│     - Verify permissions            │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│     Business Logic Validation       │
│     - Check if already voted        │
│     - Validate vote selections      │
│     - Verify election is active     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│     Database Constraints            │
│     - Unique indexes                │
│     - Required fields               │
│     - Data type validation          │
└─────────────────────────────────────┘
```

## 🗄️ Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  studentId: String (unique),
  email: String (unique),
  password: String (hashed),
  fullName: String,
  department: ObjectId (ref: Department),
  hasVoted: Boolean,
  votedAt: Date,
  isAdmin: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Departments Collection
```javascript
{
  _id: ObjectId,
  name: String,
  shortName: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Offices Collection
```javascript
{
  _id: ObjectId,
  title: String,
  level: String (college | department),
  department: ObjectId (ref: Department, optional),
  isActive: Boolean,
  order: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Candidates Collection
```javascript
{
  _id: ObjectId,
  fullName: String,
  photoUrl: String,
  office: ObjectId (ref: Office),
  level: String (college | department),
  department: ObjectId (ref: Department, optional),
  manifesto: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Votes Collection
```javascript
{
  _id: ObjectId,
  voter: ObjectId (ref: User),
  candidate: ObjectId (ref: Candidate),
  office: ObjectId (ref: Office),
  level: String (college | department),
  department: ObjectId (ref: Department, optional),
  timestamp: Date,
  createdAt: Date,
  updatedAt: Date
}
// Unique index: (voter + office)
```

### Election Settings Collection
```javascript
{
  _id: ObjectId,
  isElectionActive: Boolean,
  startDate: Date,
  endDate: Date,
  allowedDepartments: [ObjectId],
  resultVisibility: String (hidden | live | post-election),
  createdAt: Date,
  updatedAt: Date
}
```

## 🎨 Frontend Component Tree

```
App
├── Login Page
│   └── Login Form
│       ├── Email Input
│       ├── Password Input
│       └── Submit Button
│
├── Register Page
│   └── Registration Form
│       ├── Student ID Input
│       ├── Email Input
│       ├── Full Name Input
│       ├── Department Select
│       ├── Password Inputs
│       └── Submit Button
│
├── Voting Page
│   ├── Header
│   │   ├── User Info
│   │   └── Logout Button
│   │
│   ├── College Section
│   │   └── For each office:
│   │       └── Candidate Cards
│   │           ├── Photo
│   │           ├── Name
│   │           ├── Manifesto
│   │           └── Select Button
│   │
│   ├── Department Section
│   │   └── (same structure)
│   │
│   └── Submit Footer
│       ├── Progress Indicator
│       └── Submit Button
│
├── Vote Receipt
│   ├── Success Message
│   ├── Receipt Details
│   │   └── For each vote:
│   │       ├── Office Name
│   │       ├── Candidate Name
│   │       └── Candidate Photo
│   │
│   └── Actions
│       ├── Download Button
│       └── Exit Button
│
└── Admin Dashboard
    ├── Navigation Tabs
    │
    ├── Overview Tab
    │   ├── Statistics Cards
    │   └── Department Breakdown
    │
    ├── Departments Tab
    │   ├── Add/Edit Form
    │   └── Department Cards
    │
    ├── Offices Tab
    │   ├── Add/Edit Form
    │   └── Office List
    │
    ├── Candidates Tab
    │   ├── Add/Edit Form (with photo upload)
    │   └── Candidate Grid
    │
    ├── Results Tab
    │   └── Results by Office
    │       ├── Office Name
    │       └── Candidates with Vote Counts
    │
    └── Settings Tab
        └── Election Controls
            ├── Activate/Deactivate
            ├── Date Range
            └── Visibility Settings
```

## 🚀 Deployment Recommendations

### Backend
- **Platform**: Railway, Render, Heroku, or DigitalOcean
- **Database**: MongoDB Atlas (free tier available)
- **Images**: Cloudinary (free tier: 25GB storage)
- **Environment**: Production .env with secure secrets

### Frontend
- **Platform**: Vercel, Netlify, or Cloudflare Pages
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment**: Set VITE_API_URL to backend URL

### Domain & SSL
- Custom domain (optional)
- SSL certificate (automatic on Vercel/Netlify)
- CORS configuration for production

## 📈 Performance Optimizations

1. **Database Indexing**
   - User: email, studentId
   - Vote: (voter + office) unique
   - Candidate: office, level

2. **Frontend**
   - Code splitting with React.lazy
   - Image optimization (Cloudinary auto)
   - Memoization where needed

3. **Caching**
   - Static assets cached
   - API responses cached client-side
   - Consider Redis for backend caching

## 🔍 Monitoring & Analytics

Consider adding:
- Error tracking (Sentry)
- Analytics (Google Analytics)
- Logging (Winston/Morgan)
- Health checks endpoint
- Performance monitoring

---

This architecture ensures scalability, security, and maintainability for your NACOS election system!
