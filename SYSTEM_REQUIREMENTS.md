# EduResume Pro - System & Dependencies Information

Complete information about system requirements, dependencies, and versions.

## System Requirements

### Minimum Requirements
- **OS**: Windows 10+, macOS 10.12+, or Linux (Ubuntu 18.04+)
- **RAM**: 2GB minimum (4GB recommended)
- **Disk Space**: 1GB available
- **Internet**: Required for MongoDB Atlas cloud connection

### Recommended Requirements
- **OS**: Windows 11, macOS 12+, or Ubuntu 20.04+
- **RAM**: 8GB+
- **Disk Space**: 2GB+
- **Internet**: Stable high-speed connection

## Node.js & npm Versions

### Supported Versions
- **Node.js**: v14.0.0 or higher (v18+ recommended)
- **npm**: v6.0.0 or higher (v8+ recommended)

### Check Your Version
```bash
node --version   # Should show v14.0.0 or higher
npm --version    # Should show v6.0.0 or higher
```

### Installation
Download from: https://nodejs.org/

---

## Backend Dependencies

### Core Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| express | 4.18.2 | Web server framework |
| mongoose | 8.19.0 | MongoDB object modeling |
| jsonwebtoken | 9.0.2 | JWT token generation & verification |
| bcryptjs | 3.0.2 | Password hashing & encryption |
| dotenv | 17.2.3 | Environment variable management |
| cors | 2.8.5 | Cross-origin request handling |

### Additional Middleware

| Package | Version | Purpose |
|---------|---------|---------|
| body-parser | 1.20.2 | Request body parsing |

### Development Dependencies (Optional)

| Package | Version | Purpose |
|---------|---------|---------|
| jest | 29.5.0 | Testing framework |
| nodemon | 3.0.1 | Auto-restart on file changes |
| supertest | 6.3.3 | HTTP testing |

### Installation
```bash
cd backend
npm install
```

### package.json
```json
{
  "name": "eduresume-backend",
  "version": "1.0.0",
  "description": "Backend for EduResume Pro",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "test": "jest"
  },
  "dependencies": {
    "bcryptjs": "^3.0.2",
    "body-parser": "^1.20.2",
    "cors": "^2.8.5",
    "dotenv": "^17.2.3",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.19.0"
  },
  "devDependencies": {
    "jest": "^29.5.0",
    "nodemon": "^3.0.1",
    "supertest": "^6.3.3"
  }
}
```

---

## Frontend Dependencies

### Core Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | 18.2.0 | User interface library |
| react-dom | 18.2.0 | React rendering engine |
| react-router-dom | 6.x | Client-side routing |
| axios | 1.6.2 | HTTP client for API calls |

### Installation
```bash
cd frontend
npm install
```

### package.json
```json
{
  "name": "eduresume-frontend",
  "version": "1.0.0",
  "description": "Frontend for EduResume Pro",
  "private": true,
  "dependencies": {
    "axios": "^1.6.2",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.0.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
```

---

## MongoDB Requirements

### MongoDB Atlas
- **Cloud-Based**: No local installation needed
- **Free Tier**: Available with limitations
- **Collections**: 6 total (users, resumes, templates, jobopenings, applications, feedbacks)
- **Storage**: Free tier provides 512MB storage

### Connection Details
- **Host**: eduresumepro-cluster-0.ivrzzsc.mongodb.net
- **Username**: dhruvpatel150203_db_user
- **Database**: eduresume
- **Connection String**: 
  ```
  mongodb+srv://dhruvpatel150203_db_user:Fi3x45oFddyus3sb@eduresumepro-cluster-0.ivrzzsc.mongodb.net/eduresume
  ```

### Configuration
```env
MONGO_URI=mongodb+srv://dhruvpatel150203_db_user:Fi3x45oFddyus3sb@eduresumepro-cluster-0.ivrzzsc.mongodb.net/eduresume
```

---

## Browser Compatibility

### Supported Browsers
- **Chrome**: 90+ ✅
- **Firefox**: 88+ ✅
- **Safari**: 14+ ✅
- **Edge**: 90+ ✅
- **Opera**: 76+ ✅

### Not Supported
- ❌ Internet Explorer (all versions)
- ❌ Mobile browsers below their respective minimum versions

### Development Browser Features Used
- ES6+ JavaScript (Promise, async/await, arrow functions)
- CSS Grid & Flexbox
- Fetch API / XMLHttpRequest
- LocalStorage API
- Context API (React 16.3+)

---

## VSCode Recommended Extensions

For development in Visual Studio Code, install these extensions:

```
Name: ES7+ React/Redux/React-Native snippets
ID: dsznajder.es7-react-js-snippets

Name: Prettier - Code formatter
ID: esbenp.prettier-vscode

Name: ESLint
ID: dbaeumer.vscode-eslint

Name: MongoDB for VS Code
ID: mongodb.mongodb-vscode

Name: Thunder Client / REST Client
ID: thunderclient.thunder-client or humao.rest-client

Name: Postman
ID: postmanlabs.postman-for-vscode
```

---

## Environment Variables Reference

### Backend (.env)
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://dhruvpatel150203_db_user:Fi3x45oFddyus3sb@eduresumepro-cluster-0.ivrzzsc.mongodb.net/eduresume

# JWT
JWT_SECRET=your_secret_key_here_change_in_production
JWT_EXPIRE=7d

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SENDER_EMAIL=noreply@eduresume.com
```

### Frontend (.env)
```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

---

## Port Configuration

| Service | Port | Environment | Status |
|---------|------|-------------|--------|
| Backend API | 5000 | Development | ✅ HTTP |
| Frontend | 3000 | Development | ✅ HTTP |
| MongoDB Atlas | 27017+ | Cloud | ✅ Encrypted |
| Production API | 80/443 | Production | 🔒 HTTPS |

---

## Performance Specifications

### Backend Performance
- **Response Time**: < 500ms for most endpoints
- **Concurrent Users**: 100+ simultaneous connections
- **Database Queries**: Optimized with indexes
- **Memory Usage**: ~50MB base process

### Frontend Performance
- **Bundle Size**: ~200KB (gzipped)
- **Initial Load**: < 3 seconds on 4G
- **Page Load Metrics**:
  - First Contentful Paint (FCP): < 2s
  - Largest Contentful Paint (LCP): < 3s
  - Cumulative Layout Shift (CLS): < 0.1

---

## Security Requirements

### Authentication
- JWT tokens with HS256 signing
- Passwords hashed with bcryptjs (10 salt rounds)
- Token expiration: 7 days

### HTTPS/SSL
- Required for production
- Self-signed certificates for development (optional)

### CORS
- Enabled for all origins in development
- Update in production to specific domains only

### Environment Secrets
- Never commit `.env` file to version control
- Keep JWT_SECRET private
- Rotate secrets regularly in production

---

## Testing Requirements

### Unit Testing
- Framework: Jest
- Command: `npm test`
- Coverage: Aim for 80%+ coverage

### Integration Testing
- Tool: Postman / Insomnia
- Endpoints: Test all 30+ API endpoints
- Authentication: Verify protected endpoints

### End-to-End Testing
- Browser: Chrome Dev Tools
- Flow: Sign up → Create resume → Apply job → View feedback

---

## Deployment Requirements

### Backend Deployment (Node.js Hosting)
- **Platforms**: Heroku, AWS, DigitalOcean, Railway
- **Node Version**: 14+
- **Memory**: 512MB minimum

### Frontend Deployment (Static Hosting)
- **Platforms**: Vercel, Netlify, AWS S3, GitHub Pages
- **Build Command**: `npm run build`
- **Build Output**: `build/` folder

### Database Deployment (Already Configured)
- **MongoDB Atlas**: Already hosted in cloud
- **No additional setup needed**

---

## Development Tools Checklist

### Required
- ✅ Node.js v14+
- ✅ npm v6+
- ✅ Text Editor (VSCode recommended)
- ✅ Git (optional)

### Recommended
- ✅ Postman (API testing)
- ✅ MongoDB Compass (database GUI)
- ✅ VSCode Extensions (see above)
- ✅ Chrome DevTools (browser debugging)

### Optional
- 🔲 Docker (containerization)
- 🔲 GitHub (version control)
- 🔲 CI/CD Pipeline (automation)
- 🔲 PM2 (process management)

---

## Troubleshooting by Error

### "node: command not found"
- Node.js not installed
- **Solution**: Download from https://nodejs.org/

### "Cannot find module 'express'"
- Dependencies not installed
- **Solution**: Run `npm install`

### "MongoDB connection failed"
- Network access not allowed
- **Solution**: Add IP to MongoDB Atlas whitelist

### "Port 5000 already in use"
- Another process using port 5000
- **Solution**: Kill process or change PORT in .env

### "npm ERR! code ERESOLVE"
- Dependency conflict
- **Solution**: Run `npm install --legacy-peer-deps`

---

## Update & Upgrade Guide

### Update Node.js
```bash
# Windows: Download from nodejs.org
# macOS: brew install node
# Linux: apt-get update && apt-get install nodejs
node --version  # Verify
```

### Update Dependencies
```bash
# Backend
cd backend
npm update

# Frontend
cd frontend
npm update
```

### Check for Outdated Packages
```bash
npm outdated
```

### Update Specific Package
```bash
npm install package-name@latest
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Jan 2024 | Initial release |

---

## Support & Resources

- **Node.js Docs**: https://nodejs.org/docs/
- **npm Docs**: https://docs.npmjs.com/
- **Express Docs**: https://expressjs.com/
- **React Docs**: https://react.dev/
- **MongoDB Docs**: https://docs.mongodb.com/
- **Mongoose Docs**: https://mongoosejs.com/

---

## FAQ

**Q: Can I use different Node version?**  
A: Yes, 14+ is supported. 18+ recommended for new projects.

**Q: Do I need MongoDB locally?**  
A: No, MongoDB Atlas cloud is already configured.

**Q: Can I change the ports?**  
A: Yes, modify PORT in backend/.env and add --port flag to npm start for frontend.

**Q: Is the MongoDB connection string secure?**  
A: This is a demo connection. Change credentials in production.

**Q: What if I exceed MongoDB storage?**  
A: Upgrade to paid tier or delete old data.

**Q: Can I use the same API for mobile apps?**  
A: Yes, REST API works with any client that can make HTTP requests.

---

**Last Updated**: January 2024  
**Status**: Complete & Ready for Development

