require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3000;

// Set up middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configure multer for memory storage of uploaded files
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Initialize Gemini API if key is available
let genAI = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  console.log('Gemini API initialized with GEMINI_API_KEY.');
} else {
  console.log('No GEMINI_API_KEY found. Running in MOCK Mode.');
}

// API status endpoint for the frontend
app.get('/api/status', (req, res) => {
  res.json({
    apiActive: !!genAI,
    mode: genAI ? "Active Gemini AI" : "Simulated/Mock AI"
  });
});

// Preset Mock Responses for various common packaging options
const MOCK_AUDITS = [
  {
    itemName: "Standard Bubble Mailer",
    ecoScore: 35,
    summary: "A plastic bubble mailer made of low-density polyethylene (LDPE). Very low biodegradability and extremely difficult to recycle due to fused plastic-paper components.",
    materialsDetected: [
      {
        name: "Outer Poly Mailer",
        type: "LDPE Plastic #4",
        weightEst: "18g",
        recyclability: "Hard",
        description: "Thin plastic shell. Requires specialized drop-off locations; cannot go in standard curbside recycling."
      },
      {
        name: "Inner Bubble Lining",
        type: "LDPE Plastic #4",
        weightEst: "22g",
        recyclability: "Hard",
        description: "Air-bubble plastic film fused to the outer mailer, preventing standard municipal paper/plastic separation."
      }
    ],
    alternatives: [
      {
        name: "Recycled Kraft Paper Honeycomb Mailer",
        ecoScoreDiff: 50,
        costDiff: "+$0.04/unit",
        weightDiff: "+8g",
        carbonSavings: "45% reduction in production carbon footprint",
        supplierInfo: "EcoEnclose, Sustainable Packaging Co."
      },
      {
        name: "Compostable Cornstarch-based Poly Mailer",
        ecoScoreDiff: 45,
        costDiff: "+$0.02/unit",
        weightDiff: "-4g",
        carbonSavings: "Home-compostable (TUV certified). Lowers shipping emissions due to lighter weight.",
        supplierInfo: "Hero Packaging, Better Packaging Co."
      }
    ],
    disposalInstructions: [
      {
        step: 1,
        title: "Remove Shipping Label",
        instruction: "Peel off the shipping label. Most labels contain plastic coatings and acrylic adhesives that contaminate recycling."
      },
      {
        step: 2,
        title: "Separate Fused Layers (If Possible)",
        instruction: "If paper is attached, cut it away from the plastic lining before disposing."
      },
      {
        step: 3,
        title: "Store for Plastic Film Drop-off",
        instruction: "Do not put this mailer in your curbside bin. Store it with other shopping bags and take it to a local supermarket recycling kiosk that accepts soft plastic wraps."
      }
    ],
    carbonSavedEstKg: 0.18
  },
  {
    itemName: "Oversized Cardboard Box with Air Pillows",
    ecoScore: 55,
    summary: "Corrugated cardboard box with plastic air-fill packaging. While the box is highly recyclable, the volume utilization is extremely low, and the plastic pillows add landfill waste.",
    materialsDetected: [
      {
        name: "Corrugated Cardboard Box",
        type: "Kraft Paperboard",
        weightEst: "180g",
        recyclability: "Easy",
        description: "Highly recyclable and biodegradable. However, it is oversized for the current product contents, wasting material."
      },
      {
        name: "Plastic Air Pillows",
        type: "HDPE Plastic #2 Film",
        weightEst: "12g",
        recyclability: "Hard",
        description: "Low weight but high volume. Curbside programs reject film plastics; must be recycled at specialty drop-off spots."
      },
      {
        name: "Plastic Packaging Tape",
        type: "BOPP Plastic Film",
        weightEst: "5g",
        recyclability: "Unrecyclable",
        description: "Standard plastic packaging tape. Prevents clean cardboard pulping and contaminates cardboard waste streams."
      }
    ],
    alternatives: [
      {
        name: "Right-Sized Custom Box with Shredded Kraft Paper",
        ecoScoreDiff: 35,
        costDiff: "-$0.05/unit (saves material & DIM weight)",
        weightDiff: "-30g",
        carbonSavings: "Saves 20% in transport emissions (less volume) and 100% curbside recyclable.",
        supplierInfo: "Packlane, Uline Custom Sizing."
      },
      {
        name: "Water-Activated Paper Tape",
        ecoScoreDiff: 15,
        costDiff: "Similar cost (per meter)",
        weightDiff: "Similar",
        carbonSavings: "Bio-based adhesive. Can be recycled directly along with the cardboard box without peeling.",
        supplierInfo: "Ecovia, EcoEnclose."
      }
    ],
    disposalInstructions: [
      {
        step: 1,
        title: "Deflate Air Pillows",
        instruction: "Puncture the air pillows to release the air and reduce their volume by 99%."
      },
      {
        step: 2,
        title: "Remove Plastic Tape",
        instruction: "Peel or cut the plastic tape off the box. Throw tape in general waste to keep cardboard clean."
      },
      {
        step: 3,
        title: "Flatten & Recycle Cardboard",
        instruction: "Flatten the box to conserve space and place it in your standard curbside paper recycling bin."
      },
      {
        step: 4,
        title: "Recycle Film",
        instruction: "Take the deflated air pillows to a local grocery store soft plastic recycling bin."
      }
    ],
    carbonSavedEstKg: 0.35
  },
  {
    itemName: "Poly Mailer with Styrofoam Peanuts",
    ecoScore: 20,
    summary: "Single-use plastic mailer stuffed with Expanded Polystyrene (Styrofoam) peanuts. Extremely high environmental hazard; peanuts fragment easily and styrofoam is virtually never recycled.",
    materialsDetected: [
      {
        name: "Standard Poly Mailer",
        type: "Co-extruded LDPE",
        weightEst: "15g",
        recyclability: "Hard",
        description: "Hard to recycle curbside. Usually ends up in landfills."
      },
      {
        name: "Styrofoam Packing Peanuts",
        type: "Expanded Polystyrene (EPS)",
        weightEst: "25g",
        recyclability: "Impossible",
        description: "Extremely toxic to wildlife. Breaks into microplastics. Non-biodegradable and rejected by nearly all recycling centers."
      }
    ],
    alternatives: [
      {
        name: "Compostable Mailer + Starch Peanuts",
        ecoScoreDiff: 75,
        costDiff: "+$0.06/unit",
        weightDiff: "+5g",
        carbonSavings: "100% biodegradable. Starch packing peanuts dissolve in water and leave zero toxic residue.",
        supplierInfo: "Bio-Trash Bags & Packing Co."
      },
      {
        name: "Recycled Kraft Padded Mailer (Paper-shred fill)",
        ecoScoreDiff: 70,
        costDiff: "+$0.03/unit",
        weightDiff: "+12g",
        carbonSavings: "Dual-layer paper padding. Fully recyclable curbside. Eliminates all loose fill plastics.",
        supplierInfo: "MailLite Eco, EcoBox."
      }
    ],
    disposalInstructions: [
      {
        step: 1,
        title: "Separate Peanuts",
        instruction: "Pour out all packing peanuts. Do not let them blow away, as they harm local ecosystems."
      },
      {
        step: 2,
        title: "Dispose of Peanuts",
        instruction: "Dispose of styrofoam peanuts in general waste (trash). They cannot be recycled."
      },
      {
        step: 3,
        title: "Supermarket Soft Plastics Drop-off",
        instruction: "Take the outer plastic poly mailer to a grocery store bag collection bin."
      }
    ],
    carbonSavedEstKg: 0.52
  }
];

// POST /api/audit
// Accepts image upload and runs visual audit
app.post('/api/audit', upload.single('image'), async (req, res) => {
  try {
    // 1. Check if an image was uploaded
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded." });
    }

    // Determine if we should run Gemini API or fallback to mock
    let auditData = null;
    if (genAI) {
      try {
        console.log('Running visual audit with Gemini API...');
        // Initialize Gemini multimodal model
        const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

        // Convert buffer to generative part
        const imagePart = {
          inlineData: {
            data: req.file.buffer.toString("base64"),
            mimeType: req.file.mimetype
          }
        };

        const systemPrompt = `
You are an expert e-commerce packaging sustainability auditor.
Analyze the uploaded image of e-commerce packaging. Identify the components present (e.g. bubble wrap, plastic mailers, cardboard boxes, tape, packing peanuts, paper stuffing).
Evaluate the environmental impact and calculate an Eco-Score from 0 to 100 (where 100 is fully compostable/recycled and 0 is toxic/unrecyclable materials like Styrofoam).
Suggest eco-friendly, cost-effective bio-based alternatives for each material found.
Provide step-by-step disposal/recycling instructions for the end-consumer who receives this package.
Estimate the kilograms of CO2 equivalent saved per package if the merchant switches to your recommended alternatives.

You MUST respond ONLY with a valid JSON object matching the following structure:
{
  "itemName": "Descriptive name of the identified packaging",
  "ecoScore": 45,
  "summary": "Brief 1-2 sentence description of the packaging's environmental profile",
  "materialsDetected": [
    {
      "name": "Cardboard Box",
      "type": "Paper",
      "weightEst": "150g",
      "recyclability": "Easy",
      "description": "Corrugated board container."
    }
  ],
  "alternatives": [
    {
      "name": "Honeycomb Kraft Paper Wrap",
      "ecoScoreDiff": 35,
      "costDiff": "+$0.01/unit",
      "weightDiff": "Similar",
      "carbonSavings": "Approx 60% lower carbon footprint in production",
      "supplierInfo": "Available from sustainable paper distributors."
    }
  ],
  "disposalInstructions": [
    {
      "step": 1,
      "title": "Peel Tape",
      "instruction": "Peel plastic packaging tape from the box and discard in general waste."
    }
  ],
  "carbonSavedEstKg": 0.35
}
`;

        const result = await model.generateContent([
          systemPrompt,
          imagePart
        ]);

        const response = await result.response;
        let text = response.text().trim();
        
        // Clean up text if LLM wrapped it in markdown code block
        if (text.startsWith("```json")) {
          text = text.substring(7);
        }
        if (text.endsWith("```")) {
          text = text.substring(0, text.length - 3);
        }
        text = text.trim();

        auditData = JSON.parse(text);
      } catch (geminiErr) {
        console.error("Gemini API visual audit failed:", geminiErr);
        console.log("Falling back to simulated (MOCK) response mode...");
      }
    }

    if (auditData) {
      return res.json(auditData);
    }

    // 2. Mock mode fallback or fail fallback
    // Select a mock response based on filename keywords, else random
    const fileName = (req.file.originalname || "").toLowerCase();
    let selectedMock = MOCK_AUDITS[0]; // Default: bubble mailer

    if (fileName.includes("box") || fileName.includes("carton") || fileName.includes("cardboard") || fileName.includes("package")) {
      selectedMock = MOCK_AUDITS[1]; // Cardboard box
    } else if (fileName.includes("peanut") || fileName.includes("foam") || fileName.includes("white")) {
      selectedMock = MOCK_AUDITS[2]; // Styrofoam
    } else {
      // Pick random
      const randIndex = Math.floor(Math.random() * MOCK_AUDITS.length);
      selectedMock = MOCK_AUDITS[randIndex];
    }

    // Simulate network latency (800ms) for realistic UX
    setTimeout(() => {
      res.json(selectedMock);
    }, 850);

  } catch (error) {
    console.error("Error during audit endpoint:", error);
    res.status(500).json({ error: "Failed to process image audit. " + error.message });
  }
});

// POST /api/optimize-box
// Computes volume efficiency, sizing advice, and carbon footprint reduction
app.post('/api/optimize-box', (req, res) => {
  try {
    const { 
      productLength, productWidth, productHeight, 
      boxLength, boxWidth, boxHeight 
    } = req.body;

    // Convert inputs to floats
    const pl = parseFloat(productLength);
    const pw = parseFloat(productWidth);
    const ph = parseFloat(productHeight);
    
    const bl = parseFloat(boxLength);
    const bw = parseFloat(boxWidth);
    const bh = parseFloat(boxHeight);

    // Validate inputs
    if (isNaN(pl) || isNaN(pw) || isNaN(ph) || isNaN(bl) || isNaN(bw) || isNaN(bh)) {
      return res.status(400).json({ error: "All dimensions must be valid numbers." });
    }

    if (pl <= 0 || pw <= 0 || ph <= 0 || bl <= 0 || bw <= 0 || bh <= 0) {
      return res.status(400).json({ error: "Dimensions must be greater than zero." });
    }

    // Verify product fits in the box
    // To keep it simple, we sort dimensions to see if it physically fits in any orientation
    const prodDims = [pl, pw, ph].sort((a, b) => a - b);
    const boxDims = [bl, bw, bh].sort((a, b) => a - b);

    if (prodDims[0] > boxDims[0] || prodDims[1] > boxDims[1] || prodDims[2] > boxDims[2]) {
      return res.status(400).json({ 
        error: "Invalid input: Product dimensions exceed the box dimensions. The product cannot fit inside this box." 
      });
    }

    // Calculations
    const productVolume = pl * pw * ph;
    const boxVolume = bl * bw * bh;
    const volumeUtilization = (productVolume / boxVolume) * 100;
    const emptyVolume = boxVolume - productVolume;

    // Recommendation logic:
    // Suggest a box that fits the product with a standard 1.5 cm (or 0.6 inch) clearance on each side for padding
    const clearance = 0.5; // clearance margin in inches or cm
    const recLength = Math.ceil(pl + clearance * 2);
    const recWidth = Math.ceil(pw + clearance * 2);
    const recHeight = Math.ceil(ph + clearance * 2);

    const recBoxVolume = recLength * recWidth * recHeight;
    const recVolumeUtilization = (productVolume / recBoxVolume) * 100;
    const volumeSaved = boxVolume - recBoxVolume;
    const volumeSavedPct = (volumeSaved / boxVolume) * 100;

    // Carbon and materials savings estimates (rules of thumb)
    // Cardboard weight is approx 0.08 grams per cubic cm, or simple proportional weight reduction
    const currentBoxSurfaceArea = 2 * (bl * bw + bw * bh + bh * bl);
    const recBoxSurfaceArea = 2 * (recLength * recWidth + recWidth * recHeight + recHeight * recLength);
    const surfaceAreaSavedPct = ((currentBoxSurfaceArea - recBoxSurfaceArea) / currentBoxSurfaceArea) * 100;
    
    // Grams of cardboard saved (estimating standard cardboard weight based on surface area)
    // Standard double-wall corrugated cardboard is approx 600g/m^2 (0.06g/cm^2)
    // Let's assume input is in centimeters. If they use inches, we estimate similarly or let the units flow.
    const cardboardSavedGrams = Math.max(0, Math.round((currentBoxSurfaceArea - recBoxSurfaceArea) * 0.06));
    
    // Carbon calculation: 1kg of cardboard creates approx 0.94kg CO2 in manufacturing
    const co2SavedCardboardKg = (cardboardSavedGrams / 1000) * 0.94;
    
    // Transport volume carbon savings: 1% volume reduction corresponds to approx 0.05kg CO2 saved in transport over 100 shipments
    const co2SavedTransportKg = Math.max(0, (volumeSaved / 1000) * 0.15); // simulated metric

    const totalCo2SavedKg = co2SavedCardboardKg + co2SavedTransportKg;

    return res.json({
      productVolume: Math.round(productVolume * 10) / 10,
      boxVolume: Math.round(boxVolume * 10) / 10,
      volumeUtilization: Math.round(volumeUtilization * 10) / 10,
      emptyVolume: Math.round(emptyVolume * 10) / 10,
      clearanceMargin: clearance,
      recommendedBox: {
        length: recLength,
        width: recWidth,
        height: recHeight,
        volume: recBoxVolume,
        volumeUtilization: Math.round(recVolumeUtilization * 10) / 10,
      },
      savings: {
        volumeSaved: Math.round(volumeSaved * 10) / 10,
        volumeSavedPercent: Math.round(volumeSavedPct * 10) / 10,
        surfaceAreaSavedPercent: Math.round(surfaceAreaSavedPct * 10) / 10,
        cardboardSavedGrams: cardboardSavedGrams,
        co2SavedKg: Math.round(totalCo2SavedKg * 100) / 100
      }
    });

  } catch (error) {
    console.error("Error in box optimizer endpoint:", error);
    res.status(500).json({ error: "Failed to run sizing optimizer. " + error.message });
  }
});

app.listen(PORT, () => {
  console.log(`EcoPack AI Server is running on http://localhost:${PORT}`);
});
