# CloudShare - File Sharing Web Application

A production-ready full-stack cloud file sharing platform demonstrating authentication, secure REST APIs, credit-based business logic, and scalable deployment architecture.

A full-stack file sharing application with React frontend, Spring Boot backend, MongoDB database, and Clerk authentication.

## 🚀 Features

- **User Authentication**: Secure authentication using Clerk
- **File Upload/Download**: Upload and download files with size limits up to 50MB
- **Public/Private Files**: Toggle file visibility between public and private
- **File Sharing**: Share public files via unique links
- **Credit System**: Track user credits for uploads and downloads
- **Transaction History**: View complete history of uploads, downloads, and subscriptions
- **Subscription Plans**: Free, Pro, and Enterprise plans with different storage limits
- **Responsive Design**: Works on desktop and mobile devices

## 🌐 Live Demo

**Frontend**: https://your-frontend.vercel.app  
**Backend API**: https://your-backend.onrender.com

> Replace with your actual deployment URLs after deploying

## 📁 Project Structure

```
cloudsharewebapp_completed/
├── cloudsharewebapp/          # React Frontend (Vite)
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API services
│   │   ├── utils/            # Utility functions
│   │   └── App.jsx           # Main app component
│   ├── package.json
│   └── vite.config.js
│
└── cloudshareapi/             # Spring Boot Backend
    └── cloudshareapi/
        ├── src/main/java/
        │   └── in/adityakaushik/cloudshareapi/
        │       ├── config/       # Security & CORS config
        │       ├── controller/   # REST controllers
        │       ├── document/     # MongoDB documents
        │       ├── dto/          # Data transfer objects
        │       ├── repository/   # MongoDB repositories
        │       ├── security/     # JWT authentication
        │       └── service/      # Business logic
        ├── src/main/resources/
        │   └── application.properties
        ├── pom.xml
        └── .env
```

## 🏗 Architecture

```
React (Vercel)
      ↓
Spring Boot REST API (Render)
      ↓
MongoDB Atlas (Cloud Database)
```

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite
- **React Router** for navigation
- **Clerk** for authentication
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Hot Toast** for notifications

### Backend
- **Spring Boot 3.x**
- **Spring Security** with JWT
- **MongoDB** for database
- **Clerk JWT** authentication
- **Maven** for dependency management

## 🔒 Security Features

- JWT-based authentication using Clerk
- Secure REST APIs using Spring Security
- Environment variables for sensitive credentials
- CORS configuration for production
- User-specific data isolation
- Protected file access with ownership validation

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Java** 17+
- **Maven** 3.6+
- **MongoDB** 4.4+
- **Clerk Account** (for authentication)

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd cloudsharewebapp_completed
```

### 2. Backend Setup

```bash
cd cloudshareapi/cloudshareapi

# Create .env file (copy from .env.example)
cp .env.example .env

# Edit .env with your credentials
MONGO_URI=mongodb://localhost:27017/cloudshare
CLERK_ISSUER=your_clerk_issuer_url
CLERK_JWKS_URL=your_clerk_jwks_url
CLERK_WEBHOOK_SECRET=your_webhook_secret
PORT=8081

# Install dependencies and run
mvn clean install
mvn spring-boot:run
```

Backend will run on `http://localhost:8081`

### 3. Frontend Setup

```bash
cd cloudsharewebapp

# Install dependencies
npm install

# Create .env file
echo "VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key" > .env

# Run development server
npm run dev
```

Frontend will run on `http://localhost:5173`

### 4. MongoDB Setup

```bash
# Start MongoDB
mongod

# MongoDB will run on mongodb://localhost:27017
```

## 🔐 Environment Variables

### Backend (.env)
```properties
MONGO_URI=mongodb://localhost:27017/cloudshare
CLERK_ISSUER=https://your-clerk-domain.clerk.accounts.dev
CLERK_JWKS_URL=https://your-clerk-domain.clerk.accounts.dev/.well-known/jwks.json
CLERK_WEBHOOK_SECRET=your_webhook_secret_here
PORT=8081
```

### Frontend (.env)
```properties
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
```

## 🚀 Deployment

### Frontend Deployment (Vercel Recommended)
1. Build the project: `npm run build`
2. Deploy the `dist` folder
3. Set environment variable: `VITE_CLERK_PUBLISHABLE_KEY`

### Backend Deployment (Railway/Render Recommended)
1. Set all environment variables from `.env`
2. Use MongoDB Atlas for production database
3. Update `MONGO_URI` to Atlas connection string
4. Deploy using Maven: `mvn clean package`

## 📝 API Endpoints

### Files
- `POST /api/v1.0/files/upload` - Upload files
- `GET /api/v1.0/files/my-files` - Get user's files
- `GET /api/v1.0/files/{id}/download` - Download file
- `DELETE /api/v1.0/files/{id}` - Delete file
- `PATCH /api/v1.0/files/{id}/toggle` - Toggle public/private
- `GET /api/v1.0/files/public/{id}` - Get public file

### Profile
- `POST /api/v1.0/profile/create` - Create profile
- `PUT /api/v1.0/profile/update` - Update profile
- `DELETE /api/v1.0/profile/{clerkId}` - Delete profile

## 🎯 Key Features Explained

### Credit System
- Users start with 499 credits
- Upload: -2 credits per file
- Download: -1 credit per file
- Purchase subscription: +credits based on plan

### Transaction History
- Tracks all uploads, downloads, deletes, and subscriptions
- Stored in localStorage per user
- Real-time updates across components

### File Sharing
- Public files can be shared via unique links
- Private files require authentication
- Toggle visibility anytime

⚠️ **Note**: Currently files are stored locally on the backend server. For production scalability, cloud storage (e.g., AWS S3 or Cloudinary) is recommended.

## 🐛 Troubleshooting

### Backend Issues
- **Port already in use**: Change `PORT` in `.env`
- **MongoDB connection failed**: Ensure MongoDB is running
- **JWT validation failed**: Check Clerk credentials

### Frontend Issues
- **Clerk not loading**: Verify `VITE_CLERK_PUBLISHABLE_KEY`
- **API calls failing**: Check backend is running on port 8081
- **CORS errors**: Verify CORS configuration in backend

## 🚀 Future Improvements

- Move file storage to AWS S3 / Cloudinary for scalability
- Add rate limiting to prevent API abuse
- Implement email notifications for file sharing
- Add real-time file upload progress tracking
- Improve logging & monitoring with tools like ELK Stack
- Add file versioning and restore functionality
- Implement file compression for storage optimization
- Add admin dashboard for user management

## 📄 License

This project is for educational purposes.

## 👨‍💻 Author

Aditya Kaushik

## 🙏 Acknowledgments

- Clerk for authentication
- Spring Boot community
- React community
