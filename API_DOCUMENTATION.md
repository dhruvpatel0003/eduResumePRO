# EduResume Pro - API Documentation

Complete API reference with request/response examples for all endpoints.

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer {jwtToken}
```

---

## Authentication Endpoints

### 1. Sign Up
**POST** `/auth/signup`

Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "student"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error (400):**
```json
{
  "error": "User already exists with this email"
}
```

---

### 2. Login
**POST** `/auth/login`

Authenticate user and return JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error (401):**
```json
{
  "error": "Invalid email or password"
}
```

---

### 3. Forgot Password
**POST** `/auth/forgot-password`

Request password reset via email.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "message": "Password reset link sent to your email"
}
```

---

### 4. Verify Reset Token
**GET** `/auth/reset-password-verify/:token`

Verify if reset token is valid.

**Response (200):**
```json
{
  "message": "Token is valid",
  "valid": true
}
```

**Error (400):**
```json
{
  "error": "Invalid or expired reset token"
}
```

---

### 5. Reset Password
**POST** `/auth/reset-password/:token`

Reset password using valid token.

**Request Body:**
```json
{
  "password": "newPassword123"
}
```

**Response (200):**
```json
{
  "message": "Password reset successful"
}
```

---

## Resume Service Endpoints

### 1. Create Resume
**POST** `/resumes`

Create a new resume. *(Protected)*

**Request Body:**
```json
{
  "title": "My Professional Resume",
  "personalInfo": {
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "+1-234-567-8900",
    "location": "San Francisco, CA",
    "summary": "Experienced full-stack developer with 5+ years of expertise..."
  },
  "experience": [
    {
      "company": "Tech Corp",
      "position": "Senior Developer",
      "startDate": "2020-01-15",
      "endDate": null,
      "currentlyWorking": true,
      "description": "Led development of 3 major features..."
    }
  ],
  "education": [
    {
      "institution": "Stanford University",
      "degree": "Bachelor of Science",
      "field": "Computer Science",
      "startDate": "2016-09-01",
      "endDate": "2020-05-15",
      "grade": "3.8"
    }
  ],
  "skills": ["JavaScript", "React", "Node.js", "MongoDB"],
  "certifications": [
    {
      "name": "AWS Solutions Architect",
      "issuer": "Amazon",
      "date": "2023-05-20",
      "credentialId": "123456",
      "credentialUrl": "https://example.com/credential"
    }
  ],
  "projects": [
    {
      "name": "E-commerce Platform",
      "description": "Built scalable e-commerce platform...",
      "technologies": ["React", "Node.js", "MongoDB"],
      "link": "https://github.com/example/project",
      "startDate": "2022-01-10",
      "endDate": "2022-06-30"
    }
  ]
}
```

**Response (201):**
```json
{
  "message": "Resume created successfully",
  "resume": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439010",
    "title": "My Professional Resume",
    "atsScore": 0,
    "isPublished": false,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### 2. Get All User Resumes
**GET** `/resumes`

Retrieve all resumes of the authenticated user. *(Protected)*

**Response (200):**
```json
{
  "resumes": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "My Professional Resume",
      "atsScore": 85,
      "isPublished": true,
      "createdAt": "2024-01-15T10:30:00Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Internship Resume",
      "atsScore": 72,
      "isPublished": false,
      "createdAt": "2024-01-10T14:20:00Z"
    }
  ]
}
```

---

### 3. Get Single Resume
**GET** `/resumes/:id`

Retrieve a specific resume by ID. *(Protected)*

**Response (200):**
```json
{
  "resume": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439010",
    "title": "My Professional Resume",
    "personalInfo": {
      "fullName": "John Doe",
      "email": "john@example.com",
      "phone": "+1-234-567-8900",
      "location": "San Francisco, CA",
      "summary": "Experienced full-stack developer..."
    },
    "experience": [...],
    "education": [...],
    "skills": [...],
    "atsScore": 85,
    "isPublished": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### 4. Update Resume
**PUT** `/resumes/:id`

Update resume details. *(Protected)*

**Request Body:** (Same structure as Create, only include fields to update)

**Response (200):**
```json
{
  "message": "Resume updated successfully",
  "resume": { /* Updated resume object */ }
}
```

---

### 5. Delete Resume
**DELETE** `/resumes/:id`

Delete a resume. *(Protected)*

**Response (200):**
```json
{
  "message": "Resume deleted successfully"
}
```

---

### 6. Publish Resume
**POST** `/resumes/:id/publish`

Publish resume to make it visible for job applications. *(Protected)*

**Response (200):**
```json
{
  "message": "Resume published successfully",
  "resume": {
    "_id": "507f1f77bcf86cd799439011",
    "isPublished": true
  }
}
```

---

## Template Service Endpoints

### 1. Get All Templates
**GET** `/templates`

Retrieve all available templates. *(Public)*

**Query Parameters:**
```
?category=modern&limit=10&skip=0
```

**Response (200):**
```json
{
  "templates": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "name": "Modern Professional",
      "description": "Clean and modern resume template",
      "category": "modern",
      "isPublic": true,
      "thumbnail": "https://cdn.example.com/template1.jpg",
      "createdAt": "2024-01-01T00:00:00Z"
    },
    {
      "_id": "507f1f77bcf86cd799439021",
      "name": "Classic Minimal",
      "description": "Minimalist classic template",
      "category": "minimal",
      "isPublic": true,
      "thumbnail": "https://cdn.example.com/template2.jpg",
      "createdAt": "2024-01-02T00:00:00Z"
    }
  ]
}
```

---

### 2. Get Single Template
**GET** `/templates/:id`

Retrieve a specific template. *(Public)*

**Response (200):**
```json
{
  "template": {
    "_id": "507f1f77bcf86cd799439020",
    "name": "Modern Professional",
    "description": "Clean and modern resume template",
    "sections": [
      { "name": "personalInfo", "fields": ["fullName", "email", "phone", "location"] },
      { "name": "experience", "fields": ["company", "position", "duration", "description"] },
      { "name": "education", "fields": ["institution", "degree", "field", "graduation"] }
    ],
    "styling": {
      "fontFamily": "Roboto",
      "fontSize": 12,
      "colors": {
        "primary": "#2C3E50",
        "secondary": "#3498DB",
        "text": "#333333"
      },
      "layout": "two-column"
    },
    "category": "modern",
    "isPublic": true
  }
}
```

---

### 3. Create Template
**POST** `/templates`

Create a new template. *(Protected)*

**Request Body:**
```json
{
  "name": "Creative Design",
  "description": "Eye-catching creative template",
  "category": "creative",
  "isPublic": true,
  "sections": [
    { "name": "personalInfo", "fields": ["fullName", "email", "phone"] }
  ],
  "styling": {
    "fontFamily": "Poppins",
    "fontSize": 11,
    "colors": {
      "primary": "#FF6B6B",
      "secondary": "#4ECDC4",
      "text": "#2D3436"
    }
  }
}
```

**Response (201):**
```json
{
  "message": "Template created successfully",
  "template": { /* Created template object */ }
}
```

---

### 4. Update Template
**PUT** `/templates/:id`

Update template. *(Protected)*

**Request Body:** (Same as Create, include only fields to update)

**Response (200):**
```json
{
  "message": "Template updated successfully",
  "template": { /* Updated template object */ }
}
```

---

### 5. Delete Template
**DELETE** `/templates/:id`

Delete a template. *(Protected)*

**Response (200):**
```json
{
  "message": "Template deleted successfully"
}
```

---

## Job Opening Endpoints

### 1. Get All Jobs
**GET** `/jobs`

Retrieve all job openings. *(Public)*

**Query Parameters:**
```
?jobType=Full-time&location=San+Francisco&search=developer&limit=20&skip=0
```

**Response (200):**
```json
{
  "jobs": [
    {
      "_id": "507f1f77bcf86cd799439030",
      "title": "Senior Full Stack Developer",
      "company": "Tech Giants Inc",
      "location": "San Francisco, CA",
      "jobType": "Full-time",
      "salaryRange": {
        "min": 120000,
        "max": 180000,
        "currency": "USD"
      },
      "requiredSkills": ["JavaScript", "React", "Node.js", "MongoDB"],
      "status": "open",
      "applicationDeadline": "2024-02-15",
      "postedDate": "2024-01-10T00:00:00Z"
    }
  ],
  "total": 45
}
```

---

### 2. Get Single Job
**GET** `/jobs/:id`

Retrieve job details. *(Public)*

**Response (200):**
```json
{
  "job": {
    "_id": "507f1f77bcf86cd799439030",
    "title": "Senior Full Stack Developer",
    "company": "Tech Giants Inc",
    "description": "We are looking for an experienced full-stack developer...",
    "requirements": [
      "5+ years of experience in full-stack development",
      "Strong proficiency in JavaScript and TypeScript",
      "Experience with React and Node.js"
    ],
    "responsibilities": [
      "Design and develop scalable web applications",
      "Collaborate with product and design teams",
      "Lead code reviews and mentor junior developers"
    ],
    "location": "San Francisco, CA",
    "jobType": "Full-time",
    "salaryRange": {
      "min": 120000,
      "max": 180000,
      "currency": "USD"
    },
    "requiredSkills": ["JavaScript", "React", "Node.js", "MongoDB"],
    "applicationDeadline": "2024-02-15",
    "status": "open"
  }
}
```

---

### 3. Create Job
**POST** `/jobs`

Post a new job opening. *(Protected)*

**Request Body:**
```json
{
  "title": "Junior React Developer",
  "company": "StartUp Co",
  "description": "Looking for a junior React developer...",
  "requirements": ["1+ years React experience", "JavaScript knowledge"],
  "responsibilities": ["Build UI components", "Fix bugs", "Feature development"],
  "location": "Remote",
  "jobType": "Full-time",
  "salaryRange": {
    "min": 60000,
    "max": 80000,
    "currency": "USD"
  },
  "requiredSkills": ["React", "JavaScript", "CSS"],
  "applicationDeadline": "2024-03-01"
}
```

**Response (201):**
```json
{
  "message": "Job opening created successfully",
  "job": { /* Created job object */ }
}
```

---

### 4. Update Job
**PUT** `/jobs/:id`

Update job details. *(Protected)*

**Request Body:** (Same as Create, include only fields to update)

**Response (200):**
```json
{
  "message": "Job updated successfully",
  "job": { /* Updated job object */ }
}
```

---

### 5. Delete Job
**DELETE** `/jobs/:id`

Delete a job opening. *(Protected)*

**Response (200):**
```json
{
  "message": "Job deleted successfully"
}
```

---

## Application Endpoints

### 1. Create Application
**POST** `/applications`

Submit a job application. *(Protected)*

**Request Body:**
```json
{
  "jobOpeningId": "507f1f77bcf86cd799439030",
  "resumeId": "507f1f77bcf86cd799439011",
  "coverLetter": "I am very interested in this position because..."
}
```

**Response (201):**
```json
{
  "message": "Application submitted successfully",
  "application": {
    "_id": "507f1f77bcf86cd799439040",
    "userId": "507f1f77bcf86cd799439010",
    "jobOpeningId": "507f1f77bcf86cd799439030",
    "resumeId": "507f1f77bcf86cd799439011",
    "status": "applied",
    "appliedDate": "2024-01-15T10:30:00Z"
  }
}
```

---

### 2. Get User Applications
**GET** `/applications`

Retrieve all applications by authenticated user. *(Protected)*

**Query Parameters:**
```
?status=applied&limit=10&skip=0
```

**Response (200):**
```json
{
  "applications": [
    {
      "_id": "507f1f77bcf86cd799439040",
      "jobOpeningId": {
        "_id": "507f1f77bcf86cd799439030",
        "title": "Senior Full Stack Developer",
        "company": "Tech Giants Inc"
      },
      "status": "under-review",
      "appliedDate": "2024-01-15T10:30:00Z",
      "score": 85
    }
  ],
  "total": 3
}
```

---

### 3. Get Single Application
**GET** `/applications/:id`

Retrieve specific application details. *(Protected)*

**Response (200):**
```json
{
  "application": {
    "_id": "507f1f77bcf86cd799439040",
    "userId": "507f1f77bcf86cd799439010",
    "jobOpeningId": "507f1f77bcf86cd799439030",
    "resumeId": "507f1f77bcf86cd799439011",
    "status": "under-review",
    "appliedDate": "2024-01-15T10:30:00Z",
    "coverLetter": "I am very interested...",
    "score": 85,
    "feedback": "Your resume looks great!",
    "interviewDate": "2024-02-01T14:00:00Z"
  }
}
```

---

### 4. Update Application Status
**PUT** `/applications/:id/status`

Update application status. *(Protected)*

**Request Body:**
```json
{
  "status": "shortlisted",
  "feedback": "Your profile matches our requirements",
  "interviewDate": "2024-02-01T14:00:00Z"
}
```

**Response (200):**
```json
{
  "message": "Application status updated successfully",
  "application": { /* Updated application object */ }
}
```

---

### 5. Delete Application
**DELETE** `/applications/:id`

Withdraw job application. *(Protected)*

**Response (200):**
```json
{
  "message": "Application deleted successfully"
}
```

---

## Feedback Endpoints

### 1. Create Feedback
**POST** `/feedback`

Create feedback on a resume. *(Protected)*

**Request Body:**
```json
{
  "resumeId": "507f1f77bcf86cd799439011",
  "studentId": "507f1f77bcf86cd799439010",
  "overallRating": 4,
  "comments": "Great resume with good structure and content",
  "suggestions": [
    "Add more quantifiable achievements",
    "Improve formatting for better readability"
  ],
  "strengths": [
    "Clear professional summary",
    "Good use of action verbs"
  ],
  "areasForImprovement": [
    "Add specific metrics/numbers",
    "Improve white space usage"
  ],
  "sections": [
    {
      "sectionName": "experience",
      "rating": 4,
      "comment": "Good work experience section"
    }
  ]
}
```

**Response (201):**
```json
{
  "message": "Feedback created successfully",
  "feedback": {
    "_id": "507f1f77bcf86cd799439050",
    "resumeId": "507f1f77bcf86cd799439011",
    "studentId": "507f1f77bcf86cd799439010",
    "overallRating": 4,
    "status": "submitted",
    "createdAt": "2024-01-15T11:00:00Z"
  }
}
```

---

### 2. Get Feedback for Resume
**GET** `/feedback/resume/:resumeId`

Get all feedback for a specific resume. *(Protected)*

**Response (200):**
```json
{
  "feedback": [
    {
      "_id": "507f1f77bcf86cd799439050",
      "professorId": {
        "_id": "507f1f77bcf86cd799439099",
        "name": "Dr. Jane Smith"
      },
      "overallRating": 4,
      "comments": "Great resume with good structure",
      "createdAt": "2024-01-15T11:00:00Z"
    }
  ]
}
```

---

### 3. Get My Feedback
**GET** `/feedback`

Get all feedback received by authenticated student. *(Protected)*

**Response (200):**
```json
{
  "feedback": [
    {
      "_id": "507f1f77bcf86cd799439050",
      "resumeId": {
        "_id": "507f1f77bcf86cd799439011",
        "title": "My Professional Resume"
      },
      "professorId": {
        "_id": "507f1f77bcf86cd799439099",
        "name": "Dr. Jane Smith"
      },
      "overallRating": 4
    }
  ]
}
```

---

### 4. Update Feedback
**PUT** `/feedback/:id`

Update feedback. *(Protected)*

**Request Body:** (Same as Create, include only fields to update)

**Response (200):**
```json
{
  "message": "Feedback updated successfully",
  "feedback": { /* Updated feedback object */ }
}
```

---

### 5. Delete Feedback
**DELETE** `/feedback/:id`

Delete feedback. *(Protected)*

**Response (200):**
```json
{
  "message": "Feedback deleted successfully"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid request data"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized - token missing or invalid"
}
```

### 403 Forbidden
```json
{
  "error": "You don't have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting
- 100 requests per 15 minutes per IP address
- Authentication endpoints: 5 requests per minute

## CORS Headers
All responses include:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

## Pagination
Most endpoints support pagination:
- `limit`: Number of results (default: 10, max: 100)
- `skip`: Number of results to skip (default: 0)

Example: `GET /jobs?limit=20&skip=40`
