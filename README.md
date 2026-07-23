# EcoPack AI 🌿
### AI-Driven E-Commerce Packaging Auditor, Volumetric Optimizer, and Circular Disposal Planner

EcoPack AI is an award-winning, closed-loop B2B2C solution designed for clean & green technology in the e-commerce supply chain. Built for the modern web, it empowers merchants to audit packaging configurations using Gemini AI, optimize box dimensions to reduce transport volumes and emissions, and generate custom QR codes that guide end-consumers through error-free material sorting and recycling.

---

## 🚀 Live Demo & Repository Links

* **Live Interactive Web App**: [https://hackathon-plum-three.vercel.app](https://hackathon-plum-three.vercel.app)
* **GitHub Repository**: [https://github.com/sriram-2601/Hackathon](https://github.com/sriram-2601/Hackathon)

---

## 🌌 Project Overview & Vision

Every day, millions of packages are delivered globally, carrying with them layers of single-use plastics, oversized cardboard boxes, plastic adhesive tape, and non-biodegradable void-fill materials (such as plastic bubble wrap and polystyrene packing peanuts).

This creates three critical environmental and operational challenges:
1. **Material Waste & Pollution**: Much of this packaging consists of mixed materials (e.g., paper mailers lined with plastic bubble wrap) that are extremely difficult to separate and recycle. Consequently, millions of tons of packaging waste end up in landfills or pollute oceans annually.
2. **Transportation Inefficiency (Shipping "Air")**: E-commerce packages are frequently oversized relative to the items they contain. Shipping large boxes filled with air wastes cargo space in delivery vehicles, leading to more delivery trucks on the road, higher fuel consumption, and significantly increased Scope 3 greenhouse gas emissions.
3. **The "Disposal Gap" (Consumer Confusion)**: Even when packaging materials are technically recyclable, end-consumers are often confused about how to recycle them. Symbols like plastic resin codes (e.g., Triangle #4 for LDPE) are misunderstood, resulting in either "wishcycling" (contaminating recycling streams with non-recyclable items) or sending recyclable paper/cardboard directly to landfills.

**EcoPack AI** closes this loop by connecting the packaging choices made by the seller to the disposal actions taken by the buyer.

---

## 🛠️ Core Features

1. **AI Visual Packaging Auditor**
   * **Engine**: Powered by **Google Gemini 3.5 Flash** (via the `@google/generative-ai` SDK).
   * **Visual Recognition**: Merchants drag and drop or upload a photo of a packed shipment. Gemini identifies the packaging components (e.g., bubble wrap, cardboard boxes, plastic tape, packing peanuts) and evaluates their environmental footprint.
   * **Circularity Scoring**: Calculates an **Eco-Score (0-100)** indicating overall circularity.
   * **Alternative Suggestions**: Suggests cost-effective, bio-based alternatives (e.g., honeycomb paper wrap, starch-based packing peanuts, water-activated paper tape) along with unit cost differences, weight differentials, and carbon footprint comparisons.

2. **Volumetric Sizing & Carbon Optimizer**
   * **Clearance-Based Optimization**: Computes the exact volume utilization of packaging boxes against internal products.
   * **Sizing Guidance**: Recommends optimal container configurations to prevent shipping empty space (using a customizable clearance margin).
   * **Carbon Metrics**: Calculates physical cardboard material surface area savings and translates these into estimated transport-based and manufacturing-based CO₂ equivalent savings.

3. **Dynamic B2C Disposal QR Code Generator**
   * **Asset Generation**: Automatically generates a custom, downloadable SVG QR code unique to the audited packaging configuration.
   * **Closed-Loop Delivery**: Merchants print this QR code on boxes or include it on digital invoices/receipts.

4. **Interactive Customer Mobile Disposal Guide**
   * **B2C Simulator**: Scans of the QR code direct users to a mobile-responsive interface (`public/guide.html`) with a step-by-step breakdown of how to recycle or compost every single element of the box.
   * **Clear Instructions**: Guides users to peel tape, deflate air pillows, or compost cornstarch peanuts.

5. **Historical Ledger & Analytics Dashboard**
   * **Session Storage**: Automatically logs all audits and optimizations in local storage for quick review.
   * **Global Ticker**: Displays simulated global carbon avoidance tracking in real time.

---

## 📂 Project Architecture

```text
├── public/                 # Static Frontend Assets (HTML5, CSS3, Vanilla JS)
│   ├── app.js             # Core App logic (State management, API integration, SVG box drawing, History)
│   ├── index.html         # Merchant Dashboard UI (Telemetry Space HUD design)
│   ├── guide.html         # Customer Mobile Disposal Guide (B2C Interface)
│   └── styles.css         # Glassmorphic Space-Telemetry HUD Styling & Typography
├── server.js               # Express API backend & Google Gemini Integration
├── vercel.json             # Vercel Serverless Function Deployment Configuration
├── package.json            # Node.js dependencies, metadata, and execution scripts
├── DEPLOYMENT.md           # Cloud deployment instructions (Render, Railway, Vercel)
└── problem_statement.md    # Detailed Hackathon Problem Statement & Project Scope
```

---

## 🧮 Theoretical Formulas & Logic

### 1. Eco-Score Calculation
The Eco-Score is an index from **0 to 100** assigned by Gemini or mock fallbacks to measure the circularity of packaging materials:
* **90 - 100**: 100% home-compostable or easily recycled bio-based materials (e.g. starch peanuts, kraft paper).
* **60 - 89**: Recyclable materials with minor plastic residues (e.g. cardboard with minimal tape).
* **30 - 59**: Mixed materials or plastics requiring specialized drop-off (e.g. bubble wrap, poly mailers).
* **0 - 29**: Toxic, persistent, or unrecyclable materials (e.g. Styrofoam).

### 2. Carbon and Cardboard Savings Formulas
The Volumetric Optimizer calculates savings using physical cardboard surface area and transport volume reduction:
* **Box Surface Area**:
  $$SA = 2 \times (L \times W + W \times H + H \times L)$$
* **Cardboard Weight Savings**:
  $$Weight\ Saved\ (g) = (SA_{current} - SA_{recommended}) \times 0.06\ g/cm^2$$
  *(Assumes standard double-wall corrugated cardboard weighing ~600g/m² or 0.06g/cm²)*
* **Manufacturing CO₂ Saved**:
  $$CO₂_{manufacturing}\ (kg) = \frac{Weight\ Saved\ (g)}{1000} \times 0.94\ kg\ CO₂/kg\ cardboard$$
  *(Based on environmental data showing 1kg of cardboard creates ~0.94kg CO₂ in production)*
* **Transport Volume CO₂ Saved**:
  $$CO₂_{transport}\ (kg) = \frac{Volume\ Saved\ (cm^3)}{1000} \times 0.15\ kg\ CO₂$$
  *(Reflects standard logistics cargo load efficiency improvements)*
* **Total CO₂ Saved**:
  $$CO₂_{total}\ (kg) = CO₂_{manufacturing} + CO₂_{transport}$$

---

## 🔌 API Documentation

### 1. Get Server/API Status
Checks whether the Gemini API key is configured and returns active mode.
* **Endpoint**: `GET /api/status`
* **Response**:
  ```json
  {
    "apiActive": true,
    "mode": "Active Gemini AI"
  }
  ```

### 2. Run Packaging Visual Audit
Uploads a packaging image for Gemini analysis.
* **Endpoint**: `POST /api/audit`
* **Content-Type**: `multipart/form-data`
* **Request Body**:
  * `image`: File (image binary)
* **Response**:
  ```json
  {
    "itemName": "Standard Bubble Mailer",
    "ecoScore": 35,
    "summary": "A plastic bubble mailer made of LDPE. Very low biodegradability and hard to recycle.",
    "materialsDetected": [
      {
        "name": "Outer Poly Mailer",
        "type": "LDPE Plastic #4",
        "weightEst": "18g",
        "recyclability": "Hard",
        "description": "Thin plastic shell requiring specialized drop-off."
      }
    ],
    "alternatives": [
      {
        "name": "Recycled Kraft Paper Honeycomb Mailer",
        "ecoScoreDiff": 50,
        "costDiff": "+$0.04/unit",
        "weightDiff": "+8g",
        "carbonSavings": "45% reduction in production carbon footprint",
        "supplierInfo": "EcoEnclose"
      }
    ],
    "disposalInstructions": [
      {
        "step": 1,
        "title": "Remove Shipping Label",
        "instruction": "Peel off the shipping label before recycling."
      }
    ],
    "carbonSavedEstKg": 0.18
  }
  ```

### 3. Calculate Box Optimization
Calculates dimensional efficiency and savings.
* **Endpoint**: `POST /api/optimize-box`
* **Content-Type**: `application/json`
* **Request Body**:
  ```json
  {
    "productLength": 15,
    "productWidth": 10,
    "productHeight": 5,
    "boxLength": 28,
    "boxWidth": 20,
    "boxHeight": 12
  }
  ```
- **Response**:
  ```json
  {
    "productVolume": 750,
    "boxVolume": 6720,
    "volumeUtilization": 11.2,
    "emptyVolume": 5970,
    "clearanceMargin": 0.5,
    "recommendedBox": {
      "length": 16,
      "width": 11,
      "height": 6,
      "volume": 1056,
      "volumeUtilization": 71.0
    },
    "savings": {
      "volumeSaved": 5664,
      "volumeSavedPercent": 84.3,
      "surfaceAreaSavedPercent": 48.2,
      "cardboardSavedGrams": 65,
      "co2SavedKg": 0.91
    }
  }
  ```

---

## 💻 Local Setup & Development

Follow these steps to run the application locally on your machine:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/sriram-2601/Hackathon.git
   cd Hackathon
   ```

2. **Install node dependencies**:
   ```bash
   npm install
   ```

3. **Set up Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   GEMINI_API_KEY=AIzaSyYourGeminiAPIKeyHere
   ```
   *(Note: If `GEMINI_API_KEY` is omitted, the app will run in **Simulated/Mock Mode** using realistic presets for local testing).*

4. **Run the server**:
   * **For Development (with hot-reload / nodemon)**:
     ```bash
     npm run dev
     ```
   * **For Production Mode**:
     ```bash
     npm start
     ```

5. **Open browser**:
   Navigate to `http://localhost:3000` to view the Space-Telemetry Circular Terminal.

---

## 🌩️ Live Cloud Deployment

This codebase is pre-configured for modern serverless and cloud hosting platforms.

### 1. Vercel (Serverless Functions)
Vercel reads `vercel.json` and spins up the Express server as serverless functions.
```bash
npm install -g vercel
vercel login
vercel --prod
```
*Make sure to configure the `GEMINI_API_KEY` environment variable in the Vercel Project Settings dashboard.*

### 2. Render / Railway (Continuous Delivery)
Render and Railway automatically detect the `package.json` setup:
* **Build Command**: `npm install`
* **Start Command**: `npm start`
* Add the `GEMINI_API_KEY` under the Environment Variables section of the control panel.

---

## ⚙️ How to Add the Live URL to the GitHub Repository Page (Right Side Top)

To display the live link at the top-right corner of your GitHub repository under the **About** section (standard place for live URLs):

1. Go to your GitHub repository homepage: [https://github.com/sriram-2601/Hackathon](https://github.com/sriram-2601/Hackathon).
2. On the right-hand sidebar, find the **About** section.
3. Click the **⚙️ gear icon** (Edit repository metadata) next to "About".
4. In the **Website** field, enter your live URL:
   `https://hackathon-plum-three.vercel.app`
5. Click **Save changes**.

Once saved, the live link will be visible to anyone visiting your repository at the very top-right!

---

## 📄 License

This project is licensed under the MIT License - see the `LICENSE` file for details.

---
Developed for Clean & Green technology hackathons, leveraging Gemini AI to drive circular economy transitions. 🌿
