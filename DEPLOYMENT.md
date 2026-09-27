# Deployment Guide: 100% Free All-In-One Hosting on Render

This project is configured to build and run as a **single unified container**:
- The **React Frontend** is automatically built and bundled into the **.NET Backend's `wwwroot`**.
- The .NET backend serves the entire website, handles client-side routing, and exposes `/api/...` endpoints from **one single URL**.
- Zero CORS problems, zero separate deployments.

---

## Step 1: Create your Free MongoDB Atlas Database (Takes 2 mins)

1. Sign up at [mongodb.com/atlas](https://www.mongodb.com/atlas) (100% Free).
2. Create an **M0 Free Shared Cluster**.
3. Under **Security → Database Access**:
   - Create a user (e.g., `studio_admin` with a password you remember).
4. Under **Security → Network Access**:
   - Click **Add IP Address** → Choose **Allow Access from Anywhere (`0.0.0.0/0`)** → Save.
5. Under **Clusters**:
   - Click **Connect** → Choose **Drivers** (C#/.NET).
   - Copy your connection string, which looks like:
     ```text
     mongodb+srv://studio_admin:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
     ```

---

## Step 2: Push your Code to GitHub

1. Open your terminal in the project folder and make sure your changes are committed:
   ```bash
   git add .
   git commit -m "Configure all-in-one free cloud hosting"
   git push origin main
   ```

---

## Step 3: 1-Click Free Deploy on Render.com

1. Sign up / Log in to [render.com](https://render.com/) with your GitHub account.
2. In your Render Dashboard, click **New +** → **Blueprint** (or **Web Service**).
   - **If choosing Blueprint**:
     - Connect your GitHub repository. Render will automatically read `render.yaml`!
     - In the prompt for `MongoDB__ConnectionString`, paste your MongoDB Atlas connection string from Step 1 (replace `<password>` with your real password).
     - Click **Apply**.
   - **If choosing Web Service (Manual)**:
     - Connect repository.
     - **Environment**: `Docker`
     - **Dockerfile Path**: `./Dockerfile`
     - **Plan**: `Free`
     - Add Environment Variable:
       - `MongoDB__ConnectionString` = your MongoDB Atlas URI
       - `MongoDB__DatabaseName` = `StudioDB`
3. Click **Deploy**.

---

## Step 4: Access your Live App!

Render will build both the frontend and backend and give you a live URL:
`https://studio-management-system-xxxx.onrender.com`

- **Frontend Website**: `https://your-app.onrender.com/`
- **Default Admin Account**:
  - Email: `admin@studio.com`
  - Password: `admin123`
- **API Endpoints**: `https://your-app.onrender.com/api/...`
