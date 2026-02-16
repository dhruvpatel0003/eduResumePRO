# EduResume Pro - Database Schema Documentation

Complete MongoDB schema and API documentation for EduResume Pro.

## Database Models & Relationships

### 1. User Model
**Collection: users**

Primary user model for authentication and authorization.

```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: Enum ['student', 'professor', 'admin'] (default: 'student'),
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Relationships:**
- One-to-Many with Resume
- One-to-Many with Application
- One-to-Many with Feedback (as professor)

---

### 2. Resume Model
**Collection: resumes**

Stores resume data for each user.

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required),
  templateId: ObjectId (ref: Template),
  title: String (required),
  personalInfo: {
    fullName: String,
    email: String,
    phone: String,
    location: String,
    summary: String,
    links: [
      {
        platform: String,
        url: String
      }
    ]
  },
  experience: [
    {
      company: String,
      position: String,
      startDate: Date,
      endDate: Date,
      currentlyWorking: Boolean,
      description: String
    }
  ],
  education: [
    {
      institution: String,
      degree: String,
      field: String,
      startDate: Date,
      endDate: Date,
      grade: String
    }
  ],
  skills: [String],
  certifications: [
    {
      name: String,
      issuer: String,
      date: Date,
      credentialId: String,
      credentialUrl: String
    }
  ],
  projects: [
    {
      name: String,
      description: String,
      technologies: [String],
      link: String,
      startDate: Date,
      endDate: Date
    }
  ],
  atsScore: Number (default: 0),
  isPublished: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

**Relationships:**
- Many-to-One with User
- One-to-One with Template (optional)
- One-to-Many with Application
- One-to-Many with Feedback

---

### 3. Template Model
**Collection: templates**

Resume templates that users can choose from.

```javascript
{
  _id: ObjectId,
  name: String (required),
  description: String,
  createdBy: ObjectId (ref: User),
  sections: [
    {
      name: String,
      fields: [String]
    }
  ],
  styling: {
    fontFamily: String (default: 'Arial'),
    fontSize: Number (default: 12),
    colors: {
      primary: String,
      secondary: String,
      text: String
    },
    layout: String
  },
  isPublic: Boolean (default: true),
  category: Enum ['modern', 'classic', 'creative', 'minimal'] (default: 'modern'),
  thumbnail: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Relationships:**
- Many-to-One with User (creator)
- One-to-Many with Resume

---

### 4. JobOpening Model
**Collection: jobopenings**

Job postings available for students.

```javascript
{
  _id: ObjectId,
  title: String (required),
  company: String (required),
  description: String,
  requirements: [String],
  responsibilities: [String],
  location: String,
  jobType: Enum ['Full-time', 'Part-time', 'Contract', 'Internship'] (default: 'Full-time'),
  salaryRange: {
    min: Number,
    max: Number,
    currency: String
  },
  requiredSkills: [String],
  applicationDeadline: Date,
  postedDate: Date (default: now),
  status: Enum ['open', 'closed', 'filled'] (default: 'open'),
  link: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Relationships:**
- One-to-Many with Application

---

### 5. Application Model
**Collection: applications**

Job applications submitted by students.

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required),
  resumeId: ObjectId (ref: Resume, required),
  jobOpeningId: ObjectId (ref: JobOpening, required),
  status: Enum ['applied', 'under-review', 'shortlisted', 'rejected', 'accepted'] (default: 'applied'),
  appliedDate: Date (default: now),
  coverLetter: String,
  score: Number (default: 0),
  feedback: String,
  interviewDate: Date,
  result: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Relationships:**
- Many-to-One with User
- Many-to-One with Resume
- Many-to-One with JobOpening

---

### 6. Feedback Model
**Collection: feedbacks**

Professor feedback on student resumes.

```javascript
{
  _id: ObjectId,
  resumeId: ObjectId (ref: Resume, required),
  studentId: ObjectId (ref: User, required),
  professorId: ObjectId (ref: User, required),
  overallRating: Number (1-5),
  comments: String,
  suggestions: [String],
  strengths: [String],
  areasForImprovement: [String],
  status: Enum ['pending', 'submitted', 'reviewed'] (default: 'pending'),
  sections: [
    {
      sectionName: String,
      rating: Number,
      comment: String
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

**Relationships:**
- Many-to-One with User (student)
- Many-to-One with User (professor)
- Many-to-One with Resume

---

## API Endpoints

### Authentication Routes
```
POST   /api/auth/signup              - Register new user
POST   /api/auth/login               - Login user
POST   /api/auth/forgot-password     - Request password reset
GET    /api/auth/reset-password-verify/:token - Verify reset token
POST   /api/auth/reset-password/:token - Reset password
```

### Resume Routes
```
POST   /api/resumes                  - Create resume (protected)
GET    /api/resumes                  - Get all user resumes (protected)
GET    /api/resumes/:id              - Get single resume (protected)
PUT    /api/resumes/:id              - Update resume (protected)
DELETE /api/resumes/:id              - Delete resume (protected)
POST   /api/resumes/:id/publish      - Publish resume (protected)
```

### Template Routes
```
GET    /api/templates                - Get all templates (public)
GET    /api/templates/:id            - Get single template (public)
POST   /api/templates                - Create template (protected)
PUT    /api/templates/:id            - Update template (protected)
DELETE /api/templates/:id            - Delete template (protected)
```

### Job Opening Routes
```
GET    /api/jobs                     - Get all open jobs (public)
GET    /api/jobs/:id                 - Get single job (public)
POST   /api/jobs                     - Create job (protected)
PUT    /api/jobs/:id                 - Update job (protected)
DELETE /api/jobs/:id                 - Delete job (protected)
```

### Application Routes
```
POST   /api/applications             - Create application (protected)
GET    /api/applications             - Get user applications (protected)
GET    /api/applications/:id         - Get single application (protected)
PUT    /api/applications/:id/status  - Update application status (protected)
DELETE /api/applications/:id         - Delete application (protected)
```

### Feedback Routes
```
POST   /api/feedback                 - Create feedback (protected)
GET    /api/feedback                 - Get all feedback for student (protected)
GET    /api/feedback/resume/:resumeId - Get feedback for resume (protected)
PUT    /api/feedback/:id             - Update feedback (protected)
DELETE /api/feedback/:id             - Delete feedback (protected)
```

---

## Data Relationships Diagram

```
User (1)
├── (1-N) Resume
│   ├── (N-1) Template
│   └── (1-N) Feedback (student)
├── (1-N) Application
│   ├── (N-1) Resume
│   └── (N-1) JobOpening
└── (1-N) Feedback (professor)

JobOpening (1)
└── (1-N) Application

Template
└── (1-N) Resume
```

---

## Frontend Pages & Services

### Pages
- `/` - Home
- `/login` - Login
- `/signup` - Sign up
- `/dashboard` - User dashboard (protected)
- `/resumes` - View all user resumes (protected)
- `/templates` - Browse resume templates (protected)
- `/jobs` - Job listings (protected)
- `/applications` - User job applications (protected)

### Services
- `authService.js` - Authentication API calls
- `resumeService.js` - Resume CRUD operations
- `templateService.js` - Template management
- `jobService.js` - Job listings
- `applicationService.js` - Job applications
- `feedbackService.js` - Feedback management

---

## MongoDB Atlas Setup

**Connection String:**
```
mongodb+srv://dhruvpatel150203_db_user:Fi3x45oFddyus3sb@eduresumepro-cluster-0.ivrzzsc.mongodb.net/eduresume
```

**Collections Created:**
- users
- resumes
- templates
- jobopenings
- applications
- feedbacks

**Indexes (Recommended):**
```javascript
// User indexes
db.users.createIndex({ email: 1 }, { unique: true })

// Resume indexes
db.resumes.createIndex({ userId: 1 })
db.resumes.createIndex({ templateId: 1 })

// Application indexes
db.applications.createIndex({ userId: 1 })
db.applications.createIndex({ jobOpeningId: 1 })

// Feedback indexes
db.feedbacks.createIndex({ resumeId: 1 })
db.feedbacks.createIndex({ studentId: 1 })
db.feedbacks.createIndex({ professorId: 1 })
```

---

## Features Overview

### For Students
✅ User registration and authentication
✅ Create and manage multiple resumes
✅ Choose from professional templates
✅ View ATS scores for resumes
✅ Browse job openings
✅ Apply for jobs with selected resume
✅ Track application status
✅ Receive feedback from professors

### For Professors
✅ User registration and authentication
✅ Upload and manage resume templates
✅ Provide feedback on student resumes
✅ Rate resume sections
✅ Give improvement suggestions

### For Admins
✅ Manage job postings
✅ Monitor applications
✅ User management
✅ Template management
