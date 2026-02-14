# EduResume Pro - Frontend

React application for creating professional resumes with authentication.

## 📋 Project Structure

```
frontend/src/
├── context/
│   └── AuthContext.jsx           # Authentication state management
├── components/
│   └── ProtectedRoute.jsx        # Route protection wrapper
├── pages/
│   ├── Home.jsx                  # Landing page
│   ├── Login.jsx                 # Login page
│   ├── Signup.jsx                # Registration page
│   └── Dashboard.jsx             # User dashboard (protected)
├── services/
│   └── authService.js            # API calls for authentication
├── styles/
│   ├── index.css                 # Global styles
│   ├── auth.css                  # Authentication pages styles
│   └── home.css                  # Home page styles
├── App.jsx                       # Main app with routing
└── index.js                      # React entry point
```

## 🚀 Getting Started

### Prerequisites
- Node.js >= 16.x
- npm or yarn

### Installation

```bash
npm install
```

### Environment Setup

Create `frontend/.env`:

```bash
cp .env.example .env
```

Edit `.env`:

```env
REACT_APP_API_URL=http://localhost:5000
```

### Running the Application

```bash
npm start
```

Application will run on `http://localhost:3000`

## 🔐 Authentication Features

### Pages Available

- **Home** (`/`) - Landing page with sign up / login links
- **Login** (`/login`) - User login
- **Signup** (`/signup`) - User registration with role selection
- **Dashboard** (`/dashboard`) - Protected user dashboard

### Authentication Context (AuthContext.jsx)

Manages global authentication state:
- `user` - Current user info
- `token` - JWT token
- `isAuthenticated` - Boolean authentication status
- `login()` - Set user and token
- `logout()` - Clear auth data

Usage:
```javascript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, token, logout } = useAuth();
  // ...
}
```

### Protected Routes

Protect pages using `ProtectedRoute` component:

```javascript
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

### API Service (authService.js)

REST API integration:
- `signup(name, email, password, role)` - Register user
- `login(email, password)` - Login user
- `forgotPassword(email)` - Request password reset
- `verifyResetToken(token)` - Verify reset token
- `resetPassword(token, newPassword)` - Reset password

Auto-includes JWT token in all requests and handles 401 responses.

## 📝 Adding New Pages

1. Create page in `src/pages/`
2. Add route in `App.jsx`
3. Use `useAuth()` hook if needed for protected content

Example:
```javascript
// pages/Resume.jsx
import { useAuth } from '../context/AuthContext';

export default function Resume() {
  const { user } = useAuth();
  
  return <div>Resume for {user.name}</div>;
}
```

Then add to `App.jsx`:
```javascript
import Resume from './pages/Resume';

<Route 
  path="/resume/:id" 
  element={<ProtectedRoute><Resume /></ProtectedRoute>} 
/>
```

## 🛠️ Development

### Available Scripts

- `npm start` - Run development server
- `npm build` - Build for production
- `npm test` - Run tests

### Technologies

- React 18.x
- React Router v6
- Axios (HTTP client)
- CSS (no framework)

## 🔗 Backend Integration

Frontend communicates with backend at:
- Default: `http://localhost:5000/api`
- Configurable via `REACT_APP_API_URL` environment variable

### API Endpoints Used

- `POST /auth/signup` - Create new account
- `POST /auth/login` - Authenticate user
- `POST /auth/forgot-password` - Request password reset
- `GET /auth/reset-password-verify/:token` - Verify reset token
- `POST /auth/reset-password/:token` - Update password

## 📱 Responsive Design

All pages are mobile-responsive using media queries in CSS files.

## 🚀 Deployment

For production build:

```bash
npm run build
```

Build files will be in `build/` directory ready for deployment.

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GITHUB_CLIENT_ID=your_github_client_id
```

### Development

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

The app will open at [http://localhost:3000](http://localhost:3000)

## 📄 Features

### User Authentication
- Sign up (Student/Professor roles)
- Login
- Password reset
- Profile management

### Resume Building
- Choose from templates
- Edit resume sections:
  - Personal information
  - Education
  - Experience
  - Skills
  - Projects
  - Certifications
- Save drafts
- Download as PDF

### Template Management
- Browse available templates
- Preview templates
- Use templates to create resumes

### GitHub Integration
- Import GitHub projects
- Auto-populate project details
- Link to GitHub repositories

### AI Features
- ATS scoring
- AI-powered resume suggestions
- Project description generation

### Feedback System
- Share resume with professors
- Receive feedback
- Accept/reject feedback
- Update resume based on feedback

## 🔐 Authentication Flow

1. User signs up or logs in
2. JWT token stored in localStorage
3. Token included in API requests via `Authorization` header
4. AuthContext manages global auth state

## 🎨 Styling

Project uses Tailwind CSS for styling.

```jsx
// Example component
<div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
  <h1 className="text-2xl font-bold text-gray-900 mb-4">Title</h1>
  <p className="text-gray-600">Content</p>
</div>
```

## 📡 API Integration

All API calls go through the `services/api.js` module:

```jsx
import { authService, resumeService, templateService } from './services/api';

// Sign up
await authService.signup(fullName, email, password, confirmPassword, role);

// Get resumes
const { resumes } = await resumeService.getResumes();

// Create resume
await resumeService.createResume(title, templateId, personalInfo);
```

## 🐳 Docker

Build and run the frontend in Docker:

```bash
# Build image
docker build -t eduresume-frontend .

# Run container
docker run -p 3000:3000 \
  -e REACT_APP_API_URL=http://backend:5000/api \
  eduresume-frontend
```

## 🧪 Testing

Tests are written using Jest and React Testing Library.

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## 📦 Build

Create production build:

```bash
npm run build
```

Build files will be in the `build/` directory, ready to deploy to static hosting.

## 🌍 Environment Variables

See `.env.example` for complete list.

Key variables:
- `REACT_APP_API_URL`: Backend API URL
- `REACT_APP_GITHUB_CLIENT_ID`: GitHub OAuth client ID
- `REACT_APP_VERSION`: Application version
- `REACT_APP_ENABLE_AI_FEATURES`: Enable AI-powered features

## 📄 License

MIT

## 👨‍💻 Author

EduResume Pro Team
