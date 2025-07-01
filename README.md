# ArchBench

A full-stack application with authentication and MongoDB integration.

## Project Structure

The project is organized into two main directories:

### Frontend

The frontend is a React application built with:
- React 19
- React Router
- Tailwind CSS
- DaisyUI

### Backend

The backend is a Node.js application with:
- Express.js
- MongoDB with Mongoose
- JWT authentication
- Authorization middleware

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd archbench
```

2. Install dependencies for both frontend and backend:
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. Configure environment variables:
   - Create a `.env` file in the `backend` directory based on the `.env.example` template
   - Set your MongoDB connection string and JWT secrets

### Running the Application

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

3. Access the application at `http://localhost:5173`

## Features

- User authentication (register, login, logout)
- Protected routes
- Role-based authorization
- MongoDB integration using Mongoose
- Responsive UI with DaisyUI components

## API Endpoints

### Authentication
- `POST /api/auth/signup`: Register a new user
- `POST /api/auth/login`: Login existing user
- `GET /api/auth/logout`: Logout current user
- `GET /api/auth/me`: Get current user information

## License

This project is licensed under the MIT License - see the LICENSE file for details.