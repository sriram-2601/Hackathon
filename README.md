# EcoPack AI 🌿
### AI-Driven E-Commerce Packaging Auditor, Volumetric Optimizer, and Circular Disposal Planner

EcoPack AI is a closed-loop B2B2C solution designed for clean & green technology in the e-commerce supply chain. It empowers merchants to audit packaging configurations using Gemini AI, optimize box dimensions to reduce transport volumes and emissions, and generate custom QR codes that guide end-consumers through error-free material sorting and recycling.

---

## 🚀 Live Demo & Repository Link

* **Live Interactive Web App**: [https://hackathon-plum-three.vercel.app](https://hackathon-plum-three.vercel.app)
* **GitHub Repository**: [https://github.com/sriram-2601/Hackathon](https://github.com/sriram-2601/Hackathon)

---

## 🛠️ Core Features

1. **AI Visual Packaging Auditor**: Powered by **Google Gemini 3.5 Flash**, merchants can upload a picture of their packed shipment. The AI identifies the packaging components (bubble wrap, packing peanuts, tape, etc.), assesses an **Eco-Score (0-100)**, and details cost-effective bio-based alternatives.
2. **Volumetric Sizing & Carbon Optimizer**: Computes the exact volume utilization of packaging boxes against the internal products. Recommends optimal container configurations to prevent shipping empty space, calculates cardboard material savings, and translates these into estimated transport-based CO2 equivalent savings.
3. **Dynamic Customer Disposal QR Code Generator**: Generates custom QR codes linking to an interactive step-by-step mobile-responsive guide, showing consumers how to properly sort, recycle, or compost every part of the package they received.

---

## 📂 Project Architecture

```
├── public/                 # Static Frontend Assets
│   ├── app.js             # Core App logic (Charts, UI, API Handlers)
│   ├── index.html         # Merchant Dashboard UI
│   ├── guide.html         # Customer Mobile Disposal Guide
│   └── styles.css         # Glassmorphic Space-Telemetry HUD Styling
├── server.js               # Express API backend & Gemini Integration
├── vercel.json             # Vercel Deployment configuration
├── package.json            # Node.js dependencies & scripts
└── DEPLOYMENT.md           # Live deployment instructions
```

---

## 💻 Local Setup & Development

Follow these steps to run the application locally:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/sriram-2601/Hackathon.git
   cd Hackathon
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Set up environment variables**:
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   GEMINI_API_KEY=your_actual_google_gemini_api_key
   ```
4. **Run the server**:
   * For production-like execution:
     ```bash
     npm start
     ```
   * For hot-reloaded development:
     ```bash
     npm run dev
     ```
5. Open your browser and navigate to `http://localhost:3000`.

---

## 🌩️ Live Deployment

The app is set up for serverless execution on **Vercel** or container deployments on **Render** / **Railway**.

### Vercel Deployment
To deploy this project to your own Vercel scope:
```bash
npm install -g vercel
vercel login
vercel --prod
```
Ensure you add `GEMINI_API_KEY` under the Environment Variables section in your Vercel Dashboard for live Gemini API visual auditing.

---

## ⚙️ How to Add the Live URL to the GitHub Repository Page (Right Side Top)

To display the live link at the top-right corner of your GitHub repository under the **About** section (standard place for live URLs):

1. Go to your GitHub repository homepage: [https://github.com/sriram-2601/Hackathon](https://github.com/sriram-2601/Hackathon).
2. On the right-hand sidebar, find the **About** section.
3. Click the **⚙️ gear icon** (Edit repository metadata) next to "About".
4. In the **Website** field, enter your live URL:
   `https://hackathon-plum-three.vercel.app`
5. Check the box for **Use your GitHub Pages website** if applicable, or keep it unchecked and just use the custom Vercel link.
6. Click **Save changes**.

Once saved, the live link will be visible to anyone visiting your repository at the very top-right, under the repository description!
