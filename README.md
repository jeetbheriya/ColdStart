# ColdStart

ColdStart is a full-stack application designed to connect professionals, enable project collaboration, and facilitate job searching. This README provides a comprehensive guide to understanding, installing, and using ColdStart.

##Live Link : `https://coldstart-frontend-shna.onrender.com`

## API Endpoints

The backend API provides the following endpoints:

### Authentication (`/api/auth`)
*   `POST /api/auth/register`: Register a new user.
*   `POST /api/auth/login`: Log in a user, returning a JWT token.

### User Management (`/api/users`)
*   `GET /api/users/profile`: Get the authenticated user's profile. (Requires authentication)
*   `PUT /api/users/profile`: Update the authenticated user's profile. (Requires authentication)
*   `GET /api/users/search/:query`: Search for users by a query string. (Requires authentication)

### Job Listings (`/api/jobs`)
*   `GET /api/jobs`: Retrieve all job listings.
*   `POST /api/jobs`: Create a new job listing. (Requires authentication)
*   `DELETE /api/jobs/:id`: Delete a job listing by ID. (Requires authentication and ownership)
*   `PUT /api/jobs/:id`: Update a job listing by ID. (Requires authentication and ownership)

### Post Management (`/api/posts`)
*   `GET /api/posts`: Retrieve all posts (public feed).
*   `POST /api/posts`: Create a new post, optionally with an image. (Requires authentication, supports `multipart/form-data`)
*   `DELETE /api/posts/:id`: Delete a post by ID. (Requires authentication and ownership)
*   `PUT /api/posts/:id`: Update a post by ID, optionally with an image. (Requires authentication and ownership, supports `multipart/form-data`)
*   `PUT /api/posts/:id/like`: Toggle like status on a post. (Requires authentication)
*   `POST /api/posts/:id/comment`: Add a comment to a post. (Requires authentication)

### Job Applications (`/api/applications`)
*   `POST /api/applications/apply/:jobId`: Apply to a specific job, including resume upload. (Requires authentication, supports `multipart/form-data`)
*   `GET /api/applications/company`: Retrieve applicants for jobs posted by the authenticated company. (Requires authentication and company role)

### Network Connections (`/api/connections`)
*   `POST /api/connections/request/:userId`: Send a connection request to another user. (Requires authentication)
*   `PUT /api/connections/respond/:connectionId`: Accept or reject a pending connection request. (Requires authentication)
*   `GET /api/connections/pending`: Retrieve all pending connection requests for the authenticated user. (Requires authentication)
*   `GET /api/connections/network`: Retrieve the list of users in the authenticated user's network. (Requires authentication)

### Chat Messaging (`/api/chat`)
*   `POST /api/chat`: Send a new message to a user. (Requires authentication)
*   `GET /api/chat/:receiverId`: Retrieve the chat history with a specific user. (Requires authentication)
*   `PUT /api/chat/read/:senderId`: Mark messages from a specific sender as read. (Requires authentication)

## Getting Started

Follow these instructions to set up and run ColdStart on your local machine.

### Prerequisites

Make sure you have the following installed:
*   Node.js (LTS version recommended)
*   npm or Yarn
*   MongoDB Atlas account or a local MongoDB instance
*   Cloudinary account

### Backend Setup (Server)

1.  Navigate to the `server` directory:
    ```bash
    cd server
    ```
2.  Install backend dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `server` directory and add the following environment variables:
    ```
    PORT=8080
    DB_URL=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret_key
    CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET=your_cloudinary_api_secret
    ```
    *   `PORT`: The port the server will run on.
    *   `DB_URL`: Your MongoDB connection string (e.g., from MongoDB Atlas).
    *   `JWT_SECRET`: A strong, random string for JWT token encryption.
    *   `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name.
    *   `CLOUDINARY_API_KEY`: Your Cloudinary API Key.
    *   `CLOUDINARY_API_SECRET`: Your Cloudinary API Secret.

4.  Start the backend server:
    ```bash
    node app
    ```
    The server will run on the specified `PORT` (default: 8080).

### Frontend Setup (Client)

1.  Navigate to the `client/coldstart` directory:
    ```bash
    cd ../client/coldstart
    ```
2.  Install frontend dependencies:
    ```bash
    npm install
    ```
3.  Start the frontend development server:
    ```bash
    npm run dev
    ```
    The client application will typically open in your browser at `http://localhost:5173`.

## Usage

Once both the backend and frontend servers are running:

1.  Open your web browser and go to `http://localhost:5173`.
2.  Register a new account or log in if you already have one.
3.  Explore the application: connect with other professionals, post jobs, apply for jobs, and engage in real-time chat.
