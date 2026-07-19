# EcoPack AI - Deployment Guide

This guide helps you deploy the EcoPack AI Express server and web dashboard to the cloud. A live, accessible deployment is a **mandatory requirement** for the hackathon submission.

---

## Option 1: Deploying to Render (Recommended & Easiest)

Render is free and handles Node.js Express servers out of the box.

### Step 1: Create a GitHub Repository
1. Initialize a Git repository locally, commit all files, and push them to a **public** GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: EcoPack AI"
   # Create a repo on github.com and link it:
   git remote add origin <your-github-repo-url>
   git branch -M main
   git push -u origin main
   ```

### Step 2: Set up a Render Web Service
1. Sign in to [Render](https://render.com) using your GitHub account.
2. Click **New** (top right) and select **Web Service**.
3. Select your `ecopack-ai` repository.
4. Configure the Web Service settings:
   - **Name**: `ecopack-ai` (or any custom name)
   - **Region**: Select the region closest to you
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Select **Free**

### Step 3: Add your Gemini API Key (Optional but Recommended)
1. In the Render creation screen, click **Advanced** or navigate to the **Environment** tab of your service after creation.
2. Add a new Environment Variable:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: `your_actual_google_gemini_api_key_here`
3. Click **Create Web Service** (or Save changes).
4. Once deployed, Render will provide a public URL (e.g., `https://ecopack-ai.onrender.com`).

---

## Option 2: Deploying to Railway

Railway is fast, provides automatic TLS, and supports simple Node configurations.

### Step 1: Push to GitHub
Ensure all code is committed and pushed to your public GitHub repo (see Step 1 of Render above).

### Step 2: Initialize Railway Project
1. Log in to [Railway.app](https://railway.app) using your GitHub account.
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Select your repository.
4. Click **Deploy Now**.

### Step 3: Add Variables & Domain
1. Select the newly created service card in your Railway dashboard.
2. Go to the **Variables** tab and click **New Variable**:
   - Name: `GEMINI_API_KEY`
   - Value: `your_actual_google_gemini_api_key_here`
3. Go to the **Settings** tab, scroll down to the **Environment** section, and click **Generate Domain** to get a public URL.

---

## 4. Verification Check

Once your live URL is active, check the following in a browser:
1. Ensure the landing page loads and the global carbon ticker starts counting.
2. The badge in the top right header should say:
   - **Active Gemini AI** (if your `GEMINI_API_KEY` was successfully configured).
   - **Simulated AI Mode** (if you opted to run the mock fallback without a key).
3. Test a preset audit and run a sizing calculation to verify that network calls succeed.
