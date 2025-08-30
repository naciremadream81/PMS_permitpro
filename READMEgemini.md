
# PermitPro Application Setup Guide

This guide provides step-by-step instructions to set up and run the PermitPro application on your local machine. The application consists of a React frontend and a Node.js/Express backend with a PostgreSQL database.

## Prerequisites

Before you begin, ensure you have the following installed on your system:
-   **Node.js** (v14 or later) and **npm**
-   **PostgreSQL** database server

## Project Structure

The project is organized into two main directories:
-   `permitpro-backend/`: Contains the Node.js server, Prisma ORM, and API endpoints.
-   `permitpro-frontend/`: Contains the React single-page application.

## Step 1: Apply Frontend Code Changes

First, replace the contents of your existing frontend entry point with the complete code we just finished.

1.  **Copy the code from `fixed-app.js`** into `permitpro-frontend/src/index.js`. The `fixed-app.js` file contains the entire frontend application, and `index.js` is the main entry point for your React app.

## Step 2: Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd "permitpro-backend"
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a file named `.env` in the `permitpro-backend` directory and add your PostgreSQL database connection string.

    ```
    # File: /Users/seans/codebase/untitled folder/permitpro-backend/.env
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
    ```
    Replace `USER`, `PASSWORD`, `HOST`, `PORT`, and `DATABASE` with your actual PostgreSQL credentials. For a standard local setup, this might look like: `postgresql://postgres:mysecretpassword@localhost:5432/permitpro`.

4.  **Run database migrations:**
    This command will create the necessary tables in your database based on the Prisma schema.
    ```bash
    npx prisma migrate dev --name init
    ```

5.  **Seed the database (Optional):**
    To populate your database with initial sample data, run the seed script.
    ```bash
    npm run seed
    ```
    *(Note: You may need to add `"seed": "node seed.js"` to the `scripts` section of your `permitpro-backend/package.json` if it's not already there.)*

## Step 3: Frontend Setup

1.  **Navigate to the frontend directory in a new terminal:**
    ```bash
    cd "permitpro-frontend"
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

## Step 4: Running the Application

You need to run both the backend and frontend servers simultaneously.

1.  **Start the backend server:**
    In your `permitpro-backend` terminal:
    ```bash
    npm start
    ```
    The backend server should now be running, typically on `http://localhost:3001`.

2.  **Start the frontend development server:**
    In your `permitpro-frontend` terminal:
    ```bash
    npm start
    ```
    This will open the PermitPro application in your web browser, usually at `http://localhost:8080`. The frontend is configured to proxy API requests to the backend server.

You should now be able to use the application by logging in and managing permit packages.

## Default Credentials

After seeding the database, you can log in with the following credentials:

-   **Email:** `admin@permitpro.com`
-   **Password:** `password123`

## How It Works

-   The **React frontend** (`permitpro-frontend`) provides the user interface. It makes API calls to the backend to fetch and manipulate data.
-   The **Node.js backend** (`permitpro-backend`) serves the API. It uses **Prisma** to communicate with the **PostgreSQL** database.
-   When you log in, create packages, or upload documents, the frontend sends requests to the backend, which then updates the database and returns the latest data to the frontend, causing the UI to re-render.

## Developer Experience Enhancements

The following are suggestions for improving the development workflow, based on common industry practices.

### 1. Use a `.env.example` File

It's a security risk to commit the `.env` file to version control. Instead, create a `.env.example` file in the `permitpro-backend` directory and commit that. This serves as a template for developers.
