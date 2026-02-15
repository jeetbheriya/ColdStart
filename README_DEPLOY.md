# ColdStart MERN Project Deployment Guide

This guide provides step-by-step instructions for deploying the ColdStart MERN application. The backend will be deployed on Render, and the frontend can be deployed on either Netlify or Render.

## 1. Backend Deployment (Render)

Render is used to host the Node.js backend.

### Create a New Web Service

1.  **Log in to Render:** Go to [https://render.com/](https://render.com/) and log in to your dashboard.
2.  **New Web Service:** Click on "New" -> "Web Service".
3.  **Connect Repository:** Connect your GitHub account and select the repository containing the ColdStart project.
4.  **Configuration:**
    *   **Root Directory:** Set this to `server`. Render needs to know where your `package.json` for the backend is located.
    *   **Name:** Choose a unique name for your service (e.g., `coldstart-backend`).
    *   **Region:** Select a region close to your users.
    *   **Runtime:** Node.js (Render usually auto-detects this).
    *   **Build Command:** `npm install`
    *   **Start Command:** `node app.js` (This command starts your Express.js server).
    *   **Instance Type:** Choose an appropriate instance type (e.g., "Free" for testing, "Starter" for production).
5.  **Create Web Service:** Click "Create Web Service".

## 2. Environment Variables (Render Dashboard for Backend)

After creating your web service, you need to add environment variables.

1.  **Go to your Web Service:** Navigate to your newly created backend web service in the Render dashboard.
2.  **Environment:** Go to the "Environment" section.
3.  **Add Environment Variables:** Add the following critical variables:
    *   `PORT`: `8080` (or any other port your application uses, but 8080 is common for Express.js).
    *   `MONGO_URI`: Your MongoDB connection string (e.g., from MongoDB Atlas).
    *   `JWT_SECRET`: A strong, random secret key for JSON Web Token authentication.
    *   `NODE_ENV`: `production`

## 3. Frontend Deployment (Netlify / Render)

The frontend is a Vite/React application located in `client/coldstart`.

### Option A: Deploying to Netlify

Netlify is an excellent choice for static site hosting.

1.  **Log in to Netlify:** Go to [https://www.netlify.com/](https://www.netlify.com/) and log in.
2.  **New Site from Git:** Click "Add new site" -> "Import an existing project" -> "Deploy with GitHub" (or your Git provider).
3.  **Connect Repository:** Select the repository containing the ColdStart project.
4.  **Site Settings:**
    *   **Owner:** Your GitHub username/organization.
    *   **Repository:** Your ColdStart repository.
    *   **Base directory:** `client/coldstart` (This tells Netlify where your frontend project lives).
    *   **Build Command:** `npm run build`
    *   **Publish directory:** `dist` (This is where Vite outputs the compiled frontend assets).
5.  **Deploy Site:** Click "Deploy site".

### Option B: Deploying to Render (as a Static Site)

You can also host your frontend as a static site on Render.

1.  **Log in to Render:** Go to [https://render.com/](https://render.com/) and log in.
2.  **New Static Site:** Click on "New" -> "Static Site".
3.  **Connect Repository:** Connect your GitHub account and select the repository.
4.  **Configuration:**
    *   **Root Directory:** Set this to `client/coldstart`.
    *   **Name:** Choose a unique name (e.g., `coldstart-frontend`).
    *   **Region:** Select a region.
    *   **Build Command:** `npm install && npm run build` (Install dependencies and then build).
    *   **Publish Directory:** `dist`
5.  **Create Static Site:** Click "Create Static Site".

## 4. Networking and CORS Configuration

For your frontend and backend to communicate in production, you need to configure them correctly.

### Frontend: Update `VITE_API_URL`

Your frontend needs to know the URL of your deployed backend.

1.  **Get Backend URL:** After your Render backend service is deployed, you will get a public URL (e.g., `https://your-coldstart-backend.onrender.com`).
2.  **Update `.env` (or Render/Netlify Environment Variables):**
    *   In your frontend project (`client/coldstart`), create or update a `.env.production` file (or set environment variables directly in Netlify/Render dashboard for the frontend service).
    *   Add the following variable, replacing with your actual backend URL:
        ```
        VITE_API_URL=https://your-coldstart-backend.onrender.com
        ```
    *   **Important:** If using a `.env.production` file, ensure it's not committed to Git if it contains sensitive information, or use environment variables provided by your hosting platform. For Vite, variables prefixed with `VITE_` are exposed to your client-side code.
3.  **Re-deploy Frontend:** After updating `VITE_API_URL`, trigger a new deployment for your frontend service.

### Backend: Update `allowedOrigins` (server/app.js)

Your backend needs to allow requests from your deployed frontend.

1.  **Get Frontend URL:** After your frontend service is deployed (Netlify or Render), you will get a public URL (e.g., `https://your-coldstart-frontend.netlify.app` or `https://your-coldstart-frontend.onrender.com`).
2.  **Modify `server/app.js`:**
    *   Locate the `server/app.js` file in your backend project.
    *   Find the `cors` configuration, typically where `allowedOrigins` is defined.
    *   Add your deployed frontend URL to the `allowedOrigins` array.
        ```javascript
        const allowedOrigins = [
            'http://localhost:3000', // For local development
            'http://localhost:5173', // For local Vite development
            'https://your-coldstart-frontend.netlify.app', // Your Netlify URL
            'https://your-coldstart-frontend.onrender.com', // Your Render frontend URL
            'https://your-coldstart-backend.onrender.com' // Your Render backend URL (if making self-requests)
        ];

        app.use(cors({
            origin: function (origin, callback) {
                // allow requests with no origin (like mobile apps or curl requests)
                if (!origin) return callback(null, true);
                if (allowedOrigins.indexOf(origin) === -1) {
                    var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
                    return callback(new Error(msg), false);
                }
                return callback(null, true);
            },
            credentials: true, // Allow cookies and authentication headers
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization']
        }));
        ```
        **Note:** Ensure you replace `https://your-coldstart-frontend.netlify.app` and `https://your-coldstart-frontend.onrender.com` with your actual deployed frontend URLs.
3.  **Commit and Deploy Backend:** Commit this change to your `server/app.js` file and push it to your GitHub repository. Render will automatically detect the change and trigger a new backend deployment.

---

This completes the deployment guide. Ensure all URLs and environment variables are correctly set based on your specific deployments.
