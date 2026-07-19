// ECOPACK AI - CLIENT SIDE APPLICATION LOGIC

document.addEventListener('DOMContentLoaded', () => {
  // --- State Variables ---
  let currentFile = null;
  let currentAuditData = null;

  // --- DOM Elements ---
  // Header
  const themeToggleBtn = document.getElementById('theme-toggle');
  const apiStatusBadge = document.getElementById('api-status-badge');
  const globalCarbonTicker = document.getElementById('global-carbon-ticker');

  // Packaging Auditor
  const uploadZone = document.getElementById('upload-zone');
  const fileInput = document.getElementById('file-input');
  const presetChips = document.querySelectorAll('.preset-chip');
  const previewContainer = document.getElementById('preview-container');
  const imagePreview = document.getElementById('image-preview');
  const removeImgBtn = document.getElementById('remove-img-btn');
  const analyzeBtn = document.getElementById('analyze-btn');
  
  const auditLoading = document.getElementById('audit-loading');
  const loadingStatusText = document.getElementById('loading-status-text');
  const auditResults = document.getElementById('audit-results');
  
  // Audit Results Fields
  const resultsEcoScore = document.getElementById('results-eco-score');
  const ecoScoreCircle = document.getElementById('eco-score-circle');
  const resultsItemName = document.getElementById('results-item-name');
  const resultsSummary = document.getElementById('results-summary');
  const resultsMaterials = document.getElementById('results-materials');
  const resultsAlternatives = document.getElementById('results-alternatives');

  // Box Optimizer
  const optimizerForm = document.getElementById('optimizer-form');
  const optimizerResults = document.getElementById('optimizer-results');
  const optOldUtil = document.getElementById('opt-old-util');
  const optNewUtil = document.getElementById('opt-new-util');
  const optMaterialSaved = document.getElementById('opt-material-saved');
  const optCo2Saved = document.getElementById('opt-co2-saved');
  const recDimensionsText = document.getElementById('rec-dimensions-text');
  const recVolumeSavingsPct = document.getElementById('rec-volume-savings-pct');

  // Phone Simulator
  const phoneChecklistContainer = document.getElementById('phone-checklist-container');
  const phoneSuccessCard = document.getElementById('phone-success-card');
  const downloadQrBtn = document.getElementById('download-qr-btn');
  const exportEsgBtn = document.getElementById('export-esg-btn');
  const historySection = document.getElementById('history-section');
  const historyItemsContainer = document.getElementById('history-items-container');
  const optimizerError = document.getElementById('optimizer-error');
  const optimizerErrorText = document.getElementById('optimizer-error-text');

  // Dashboard Metrics
  const dbMetricCo2 = document.getElementById('dashboard-metric-co2');
  const dbMetricPlastic = document.getElementById('dashboard-metric-plastic');
  const dbMetricDiversion = document.getElementById('dashboard-metric-diversion');

  // --- Initial Configuration & Pings ---
  checkApiStatus();
  initTheme();
  startCarbonTicker();
  renderHistoryUI();
  updateGlobalMetrics();
  
  // Set default box values on SVG stage on initial load
  updateBoxSvg({
    product: { length: 15, width: 10, height: 5 },
    currentBox: { length: 28, width: 20, height: 12 },
    recommendedBox: { length: 16, width: 11, height: 6 }
  });

  // --- Event Listeners ---

  // Theme Toggle
  themeToggleBtn.addEventListener('click', toggleTheme);

  // File Upload Drag & Drop
  uploadZone.addEventListener('click', () => fileInput.click());
  
  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleFileSelected(e.target.files[0]);
    }
  });

  ['dragenter', 'dragover'].forEach(eventName => {
    uploadZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      uploadZone.classList.add('dragover');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    uploadZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      uploadZone.classList.remove('dragover');
    }, false);
  });

  uploadZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) {
      handleFileSelected(files[0]);
    }
  });

  // Remove Selected Image
  removeImgBtn.addEventListener('click', () => {
    currentFile = null;
    fileInput.value = '';
    previewContainer.style.display = 'none';
    uploadZone.style.display = 'block';
    resetPresetChips();
  });

  // Presets Clicking
  presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      resetPresetChips();
      chip.classList.add('active');
      
      const presetName = chip.getAttribute('data-preset');
      handlePresetSelected(presetName);
    });
  });

  // Analyze Button (Triggering API)
  analyzeBtn.addEventListener('click', runPackagingAudit);

  // Optimizer Form Submit
  optimizerForm.addEventListener('submit', runSizingOptimization);

  // QR Code Asset Download
  downloadQrBtn.addEventListener('click', () => {
    const svgContent = downloadQrBtn.getAttribute('data-svg');
    if (!svgContent) {
      alert("No dynamic QR code generated yet. Please run an audit or select a preset.");
      return;
    }
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ecopack-disposal-qr-${(currentAuditData && currentAuditData.itemName || 'pkg').toLowerCase().replace(/\s+/g, '-')}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // ESG Corporate Report Export
  exportEsgBtn.addEventListener('click', exportESGReport);

  // --- Business Logic Functions ---

  // Check backend server setup and API key mode
  async function checkApiStatus() {
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      
      apiStatusBadge.className = 'api-badge';
      if (data.apiActive) {
        apiStatusBadge.classList.add('active');
        apiStatusBadge.querySelector('.badge-label').innerText = 'Active Gemini AI';
      } else {
        apiStatusBadge.classList.add('mock');
        apiStatusBadge.querySelector('.badge-label').innerText = 'Simulated AI Mode';
      }
    } catch (err) {
      console.warn("Failed to contact status endpoint. Running local fallback.");
      apiStatusBadge.className = 'api-badge mock';
      apiStatusBadge.querySelector('.badge-label').innerText = 'Local Sandbox Mode';
    }
  }

  // Live carbon ticker animation
  function startCarbonTicker() {
    let currentVal = parseFloat(globalCarbonTicker.innerText.replace(/,/g, ''));
    setInterval(() => {
      // Add random small offset to make the counter tick up in real time
      currentVal += Math.random() * 0.15;
      globalCarbonTicker.innerText = currentVal.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }, 1200);
  }

  // Theme Controller
  function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  }

  // Handle file select
  function handleFileSelected(file) {
    if (!file.type.startsWith('image/')) {
      alert("Please upload a valid image file.");
      return;
    }
    currentFile = file;
    resetPresetChips();

    // Render Preview
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.src = e.target.result;
      uploadZone.style.display = 'none';
      previewContainer.style.display = 'block';
      auditResults.style.display = 'none';
    };
    reader.readAsDataURL(file);
  }

  // Handle Preset Click
  function handlePresetSelected(presetKey) {
    let imageSrc = '';
    let fileName = '';
    
    if (presetKey === 'bubble') {
      imageSrc = 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=400&auto=format&fit=crop'; // Packaging bubble texture
      fileName = 'plastic_bubble_mailer.png';
    } else if (presetKey === 'box') {
      imageSrc = 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?q=80&w=400&auto=format&fit=crop'; // Cardboard box
      fileName = 'oversized_cardboard_box.png';
    } else if (presetKey === 'styrofoam') {
      imageSrc = 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?q=80&w=400&auto=format&fit=crop'; // Scattered foam-like structures
      fileName = 'packing_peanuts.png';
    }

    // Set file mock by constructing a file blob
    fetch(imageSrc)
      .then(res => res.blob())
      .then(blob => {
        currentFile = new File([blob], fileName, { type: 'image/jpeg' });
        imagePreview.src = imageSrc;
        uploadZone.style.display = 'none';
        previewContainer.style.display = 'block';
        auditResults.style.display = 'none';
      })
      .catch(err => {
        console.error("Failed to load preset image buffer, mocking file details locally", err);
        // Fallback file mock
        const blob = new Blob(["mock"], { type: "image/png" });
        currentFile = new File([blob], fileName, { type: "image/png" });
        imagePreview.src = imageSrc;
        uploadZone.style.display = 'none';
        previewContainer.style.display = 'block';
        auditResults.style.display = 'none';
      });
  }

  function resetPresetChips() {
    presetChips.forEach(chip => chip.classList.remove('active'));
  }

  // Send visual packaging audit to server
  async function runPackagingAudit() {
    if (!currentFile) {
      alert("No image selected. Please drop an image or click a preset.");
      return;
    }

    // Switch views to loading state
    previewContainer.style.display = 'none';
    auditLoading.style.display = 'block';
    auditResults.style.display = 'none';
    phoneSuccessCard.style.display = 'none';

    // Status message cycling for engaging UX
    const statusMessages = [
      "Uploading packaging footprint to Gemini API...",
      "Analyzing molecular composition and plastic polymer classes...",
      "Computing raw recyclability scores...",
      "Sourcing industrial biopolymer replacement materials..."
    ];
    let msgIndex = 0;
    const msgInterval = setInterval(() => {
      msgIndex = (msgIndex + 1) % statusMessages.length;
      loadingStatusText.innerText = statusMessages[msgIndex];
    }, 1200);

    const formData = new FormData();
    formData.append('image', currentFile);

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      currentAuditData = data;
      renderAuditResults(data);
      updatePhoneGuide(data);
      generateDynamicQrCode(data);
      saveAuditToHistory(data);

      // Trigger automatic update in sizing fields to match presets if user picked a preset
      syncOptimizerFormWithPreset(currentFile.name);

    } catch (err) {
      console.error(err);
      alert("Audit Failed: " + err.message);
      // Return to upload state
      uploadZone.style.display = 'block';
    } finally {
      clearInterval(msgInterval);
      auditLoading.style.display = 'none';
    }
  }

  // Render the audit data in the results dashboard card
  function renderAuditResults(data) {
    auditResults.style.display = 'block';
    
    // Set Eco Score
    resultsEcoScore.innerText = data.ecoScore;
    resultsItemName.innerText = data.itemName;
    resultsSummary.innerText = data.summary;

    // Set Radial Stroke Dash
    // stroke-dasharray = "X, 100" where X is the score
    ecoScoreCircle.setAttribute('stroke-dasharray', `${data.ecoScore}, 100`);
    
    // Set circle stroke color based on rating
    if (data.ecoScore >= 70) {
      ecoScoreCircle.parentElement.className = "circular-chart green";
    } else if (data.ecoScore >= 45) {
      ecoScoreCircle.parentElement.className = "circular-chart gold"; // will fall to gold styling
    } else {
      ecoScoreCircle.parentElement.className = "circular-chart red";
    }

    // Populate materials list
    resultsMaterials.innerHTML = '';
    data.materialsDetected.forEach(mat => {
      const recyclabilityClass = mat.recyclability.toLowerCase(); // easy, hard, impossible
      
      const matRow = document.createElement('div');
      matRow.className = 'material-item';
      matRow.innerHTML = `
        <div class="mat-left">
          <div class="mat-title-row">
            <strong>${mat.name}</strong>
            <span class="mat-type-badge">${mat.type}</span>
          </div>
          <p class="mat-desc">${mat.description}</p>
        </div>
        <div class="mat-right">
          <span class="mat-weight">${mat.weightEst}</span>
          <span class="mat-status-badge ${recyclabilityClass}">${mat.recyclability}</span>
        </div>
      `;
      resultsMaterials.appendChild(matRow);
    });

    // Populate alternatives recommendation list
    resultsAlternatives.innerHTML = '';
    data.alternatives.forEach(alt => {
      const altCard = document.createElement('div');
      altCard.className = 'alt-item';
      altCard.innerHTML = `
        <div class="alt-left">
          <div class="alt-title-row">
            <strong>${alt.name}</strong>
            <span class="alt-diff-badge">+${alt.ecoScoreDiff} EcoScore</span>
          </div>
          <p class="alt-desc">${alt.carbonSavings}</p>
          <div class="alt-metrics-row">
            <span class="alt-metric">Cost Delta: <strong>${alt.costDiff}</strong></span>
            <span class="alt-metric">Weight Delta: <strong>${alt.weightDiff}</strong></span>
          </div>
        </div>
        <div class="alt-right">
          <button class="text-btn-accent swap-btn" data-supplier="${alt.supplierInfo}">
            <span>Details</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:12px; height:12px;">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>
      `;
      resultsAlternatives.appendChild(altCard);
    });

    // Set up click handlers on swap details buttons
    resultsAlternatives.querySelectorAll('.swap-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const supplier = btn.getAttribute('data-supplier');
        alert(`Supplier Logistics Referral:\n${supplier}`);
      });
    });

    // Scroll down slightly to show results
    auditResults.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Pre-fill optimizer dimensions if presets are clicked to match realistic cases
  function syncOptimizerFormWithPreset(fileName) {
    if (fileName.includes("bubble")) {
      // Bubble mailer: typically standard products fit in smaller flats
      document.getElementById('p-length').value = "20";
      document.getElementById('p-width').value = "14";
      document.getElementById('p-height').value = "1.5";
      
      document.getElementById('b-length').value = "24";
      document.getElementById('b-width').value = "18";
      document.getElementById('b-height').value = "6";
    } else if (fileName.includes("box")) {
      // Oversized box
      document.getElementById('p-length').value = "15";
      document.getElementById('p-width').value = "10";
      document.getElementById('p-height').value = "5";
      
      document.getElementById('b-length').value = "28";
      document.getElementById('b-width').value = "20";
      document.getElementById('b-height').value = "12";
    } else if (fileName.includes("peanut")) {
      // Styrofoam peanuts
      document.getElementById('p-length').value = "12";
      document.getElementById('p-width').value = "12";
      document.getElementById('p-height').value = "8";
      
      document.getElementById('b-length').value = "25";
      document.getElementById('b-width').value = "25";
      document.getElementById('b-height').value = "20";
    }
    // Auto click optimize button
    optimizerForm.dispatchEvent(new Event('submit'));
  }

  // Perform Box Sizing volumetric optimization request
  async function runSizingOptimization(e) {
    if (e) e.preventDefault();

    const payload = {
      productLength: document.getElementById('p-length').value,
      productWidth: document.getElementById('p-width').value,
      productHeight: document.getElementById('p-height').value,
      boxLength: document.getElementById('b-length').value,
      boxWidth: document.getElementById('b-width').value,
      boxHeight: document.getElementById('b-height').value,
    };

    optimizerError.style.display = 'none';

    try {
      const res = await fetch('/api/optimize-box', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorText = await res.text();
        let errMsg = "Sizing calculation failed.";
        try {
          const errObj = JSON.parse(errorText);
          errMsg = errObj.error || errMsg;
        } catch (pe) {
          errMsg = errorText || errMsg;
        }
        throw new Error(errMsg);
      }

      const data = await res.json();
      
      // Update UI Output
      optimizerError.style.display = 'none';
      optimizerResults.style.display = 'block';
      optOldUtil.innerText = `${data.volumeUtilization}%`;
      optNewUtil.innerText = `${data.recommendedBox.volumeUtilization}%`;
      optMaterialSaved.innerText = `${Math.round(data.savings.surfaceAreaSavedPercent)}% less area`;
      optCo2Saved.innerText = `${data.savings.co2SavedKg} kg CO₂e`;
      
      recDimensionsText.innerText = `${data.recommendedBox.length.toFixed(1)} x ${data.recommendedBox.width.toFixed(1)} x ${data.recommendedBox.height.toFixed(1)} cm`;
      recVolumeSavingsPct.innerText = `${Math.round(data.savings.volumeSavedPercent)}%`;

      // Update 3D wireframe SVG
      updateBoxSvg({
        product: { length: payload.productLength, width: payload.productWidth, height: payload.productHeight },
        currentBox: { length: payload.boxLength, width: payload.boxWidth, height: payload.boxHeight },
        recommendedBox: data.recommendedBox
      });

      // Update aggregate metrics values on dashboard
      updateAggregateImpactMetrics(data.savings);

    } catch (err) {
      console.error(err);
      optimizerResults.style.display = 'none';
      optimizerErrorText.innerText = err.message;
      optimizerError.style.display = 'flex';
    }
  }

  // Update SVG polygons for isometric rendering
  function updateBoxSvg({ product, currentBox, recommendedBox }) {
    // 1. Calculate a scale factor to fit all elements in the SVG stage
    const maxVal = Math.max(
      parseFloat(currentBox.length), parseFloat(currentBox.width), parseFloat(currentBox.height),
      parseFloat(product.length), parseFloat(product.width), parseFloat(product.height)
    );
    
    // Scale mapping factor: max physical unit represents 85 pixels screen coordinate
    const scale = 80 / maxVal;

    // Helper: generate polygon points string for isometric cube
    // l: length, w: width, h: height (already scaled)
    function getCubePoints(l, w, h) {
      const p = {
        top: `0,${-h} ${l*0.866},${l*0.5-h} ${(l-w)*0.866},${(l+w)*0.5-h} ${-w*0.866},${w*0.5-h}`,
        left: `${-w*0.866},${w*0.5} ${-w*0.866},${w*0.5-h} ${(l-w)*0.866},${(l+w)*0.5-h} ${(l-w)*0.866},${(l+w)*0.5}`,
        right: `${l*0.866},${l*0.5} ${l*0.866},${l*0.5-h} ${(l-w)*0.866},${(l+w)*0.5-h} ${(l-w)*0.866},${(l+w)*0.5}`
      };
      return p;
    }

    // 2. Compute face strings for the three boxes
    const curP = getCubePoints(
      parseFloat(currentBox.length) * scale, 
      parseFloat(currentBox.width) * scale, 
      parseFloat(currentBox.height) * scale
    );
    
    const recP = getCubePoints(
      parseFloat(recommendedBox.length) * scale, 
      parseFloat(recommendedBox.width) * scale, 
      parseFloat(recommendedBox.height) * scale
    );
    
    const prodP = getCubePoints(
      parseFloat(product.length) * scale, 
      parseFloat(product.width) * scale, 
      parseFloat(product.height) * scale
    );

    // 3. Update DOM SVG polygons
    // Current box (dotted wireframe)
    document.getElementById('svg-cur-top').setAttribute('points', curP.top);
    document.getElementById('svg-cur-left').setAttribute('points', curP.left);
    document.getElementById('svg-cur-right').setAttribute('points', curP.right);

    // Recommended box (semi-transparent green)
    document.getElementById('svg-rec-top').setAttribute('points', recP.top);
    document.getElementById('svg-rec-left').setAttribute('points', recP.left);
    document.getElementById('svg-rec-right').setAttribute('points', recP.right);

    // Product cube (solid indigo)
    document.getElementById('svg-prod-top').setAttribute('points', prodP.top);
    document.getElementById('svg-prod-left').setAttribute('points', prodP.left);
    document.getElementById('svg-prod-right').setAttribute('points', prodP.right);
  }

  // Generate interactive customer disposal guide in smartphone frame
  function updatePhoneGuide(auditData) {
    phoneSuccessCard.style.display = 'none';
    phoneChecklistContainer.style.display = 'flex';
    
    phoneChecklistContainer.innerHTML = '';
    
    if (!auditData.disposalInstructions || auditData.disposalInstructions.length === 0) {
      phoneChecklistContainer.innerHTML = '<p class="section-intro-text">No sorting steps available.</p>';
      return;
    }

    auditData.disposalInstructions.forEach((item, index) => {
      const stepId = `m-step-${index}`;
      const checkRow = document.createElement('div');
      checkRow.className = 'phone-check-item';
      
      checkRow.innerHTML = `
        <input type="checkbox" id="${stepId}" class="phone-checkbox-action">
        <label for="${stepId}">
          <span class="checkbox-custom"></span>
          <div class="step-text">
            <strong>Step ${item.step}: ${item.title}</strong>
            <p>${item.instruction}</p>
          </div>
        </label>
      `;
      phoneChecklistContainer.appendChild(checkRow);
    });

    // Add listeners to checkboxes to track sorting completion
    const checkboxes = phoneChecklistContainer.querySelectorAll('.phone-checkbox-action');
    checkboxes.forEach(cb => {
      cb.addEventListener('change', () => {
        const allChecked = Array.from(checkboxes).every(item => item.checked);
        if (allChecked) {
          triggerDisposalSuccess(auditData.carbonSavedEstKg);
        }
      });
    });
  }

  // Trigger circular success celebration on smartphone
  function triggerDisposalSuccess(carbonSavedVal) {
    // Hide checklist and show green banner
    phoneChecklistContainer.style.display = 'none';
    
    const savingsKg = carbonSavedVal || 0.18;
    phoneSuccessCard.querySelector('p').innerHTML = `You prevented <strong>${savingsKg.toFixed(2)} kg</strong> of carbon emissions and kept packaging materials out of local landfills. Awesome job!`;
    phoneSuccessCard.style.display = 'flex';
  }

  // Add sizing calculation results to the cumulative analytics metrics
  function updateAggregateImpactMetrics(savings) {
    // Animate/simulate changes to the main circular metrics cards
    // 1. CO2 Saved
    let currentCo2Val = parseFloat(dbMetricCo2.innerText);
    let targetCo2Val = currentCo2Val + savings.co2SavedKg;
    animateMetricValue(dbMetricCo2, currentCo2Val, targetCo2Val, 1, ' kg');

    // 2. Plastic Avoided (simulate standard cardboard replacing plastic film elements if applicable)
    let currentPlasticVal = parseInt(dbMetricPlastic.innerText.replace(/,/g, ''));
    let targetPlasticVal = currentPlasticVal + (currentAuditData && currentAuditData.ecoScore < 50 ? 45 : 0);
    animateMetricValue(dbMetricPlastic, currentPlasticVal, targetPlasticVal, 0, ' g');

    // 3. Diversion rate (slightly increment towards max to simulate circular success)
    let currentDivVal = parseFloat(dbMetricDiversion.innerText);
    let targetDivVal = Math.min(99.8, currentDivVal + 0.1);
    animateMetricValue(dbMetricDiversion, currentDivVal, targetDivVal, 1, ' %');
  }

  // Simple number animator utility
  function animateMetricValue(elem, start, end, decimals, suffix) {
    let current = start;
    const duration = 1000; // ms
    const stepTime = 30; // ms
    const stepValue = (end - start) / (duration / stepTime);
    
    const timer = setInterval(() => {
      current += stepValue;
      if ((stepValue >= 0 && current >= end) || (stepValue < 0 && current <= end)) {
        clearInterval(timer);
        current = end;
      }
      
      let formattedVal = current.toFixed(decimals);
      if (decimals === 0) {
        formattedVal = Math.round(current).toLocaleString('en-US');
      }
      elem.innerText = formattedVal;
    }, stepTime);
  }

  // --- Dynamic B2C Disposal QR Code Generator ---
  function generateDynamicQrCode(auditData) {
    if (!auditData) return;
    
    const compactData = {
      itemName: auditData.itemName,
      ecoScore: auditData.ecoScore,
      summary: auditData.summary,
      carbonSavedEstKg: auditData.carbonSavedEstKg,
      disposalInstructions: auditData.disposalInstructions
    };

    try {
      const jsonStr = JSON.stringify(compactData);
      const base64Data = btoa(unescape(encodeURIComponent(jsonStr)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
      
      const guideUrl = `${window.location.origin}/guide.html?data=${base64Data}`;
      
      const qrUrlEl = document.querySelector('.qr-url');
      if (qrUrlEl) {
        qrUrlEl.innerText = `${window.location.host}/guide.html?data=${base64Data.substring(0, 10)}...`;
        qrUrlEl.title = guideUrl;
      }

      const qrContainer = document.getElementById('qr-container');
      if (window.QRCode && qrContainer) {
        QRCode.toString(guideUrl, {
          type: 'svg',
          margin: 1,
          color: {
            dark: '#0b0f19',
            light: '#ffffff'
          }
        }, function (err, svgString) {
          if (err) {
            console.error("QR Code rendering error:", err);
            return;
          }
          qrContainer.innerHTML = svgString;
          downloadQrBtn.setAttribute('data-svg', svgString);
        });
      }
    } catch (err) {
      console.error("Failed to generate dynamic QR link", err);
    }
  }

  // --- Recent Audits History Log (LocalStorage) ---
  function saveAuditToHistory(auditData) {
    if (!auditData) return;
    
    let history = [];
    try {
      history = JSON.parse(localStorage.getItem('ecopack_history')) || [];
    } catch (e) {
      history = [];
    }
    
    // Create new history item
    const timestamp = Date.now();
    const historyItem = {
      id: 'audit_' + timestamp,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      itemName: auditData.itemName,
      ecoScore: auditData.ecoScore,
      summary: auditData.summary,
      materialsDetected: auditData.materialsDetected,
      alternatives: auditData.alternatives,
      disposalInstructions: auditData.disposalInstructions,
      carbonSavedEstKg: auditData.carbonSavedEstKg
    };
    
    history.unshift(historyItem);
    
    // Keep max 10 entries
    if (history.length > 10) {
      history.pop();
    }
    
    localStorage.setItem('ecopack_history', JSON.stringify(history));
    renderHistoryUI();
    updateGlobalMetrics();
  }

  function renderHistoryUI() {
    if (!historyItemsContainer || !historySection) return;
    
    let history = [];
    try {
      history = JSON.parse(localStorage.getItem('ecopack_history')) || [];
    } catch (e) {
      history = [];
    }
    
    if (history.length === 0) {
      historySection.style.display = 'none';
      return;
    }
    
    historySection.style.display = 'block';
    historyItemsContainer.innerHTML = '';
    
    history.forEach(item => {
      let scoreClass = 'red';
      if (item.ecoScore >= 70) scoreClass = 'green';
      else if (item.ecoScore >= 45) scoreClass = 'gold';
      
      const compact = {
        itemName: item.itemName,
        ecoScore: item.ecoScore,
        summary: item.summary,
        carbonSavedEstKg: item.carbonSavedEstKg,
        disposalInstructions: item.disposalInstructions
      };
      
      const base64Data = btoa(unescape(encodeURIComponent(JSON.stringify(compact))))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
      
      const guideUrl = `${window.location.origin}/guide.html?data=${base64Data}`;
      
      const row = document.createElement('div');
      row.className = 'history-item-row';
      row.innerHTML = `
        <div class="hist-left-side">
          <span class="hist-badge ${scoreClass}">${item.ecoScore}</span>
          <div class="hist-info-block">
            <strong>${item.itemName}</strong>
            <span class="hist-date">${item.date}</span>
          </div>
        </div>
        <div class="hist-actions-block">
          <button class="text-btn-accent load-btn" data-id="${item.id}">Load</button>
          <a href="${guideUrl}" target="_blank" class="text-btn-accent guide-link">Open Guide</a>
          <button class="text-btn-danger delete-btn" data-id="${item.id}">Delete</button>
        </div>
      `;
      
      row.querySelector('.load-btn').addEventListener('click', () => {
        loadAuditFromHistory(item.id);
      });
      row.querySelector('.delete-btn').addEventListener('click', () => {
        deleteAuditFromHistory(item.id);
      });
      
      historyItemsContainer.appendChild(row);
    });
  }

  function loadAuditFromHistory(id) {
    let history = [];
    try {
      history = JSON.parse(localStorage.getItem('ecopack_history')) || [];
    } catch (e) {}
    
    const item = history.find(x => x.id === id);
    if (!item) return;
    
    currentAuditData = item;
    renderAuditResults(item);
    updatePhoneGuide(item);
    generateDynamicQrCode(item);
    
    // Sync dimension inputs
    syncOptimizerFormWithPreset(item.itemName);
  }

  function deleteAuditFromHistory(id) {
    let history = [];
    try {
      history = JSON.parse(localStorage.getItem('ecopack_history')) || [];
    } catch (e) {}
    
    history = history.filter(x => x.id !== id);
    localStorage.setItem('ecopack_history', JSON.stringify(history));
    renderHistoryUI();
    updateGlobalMetrics();
  }

  // --- Update Global Impact Metrics ---
  function updateGlobalMetrics() {
    let history = [];
    try {
      history = JSON.parse(localStorage.getItem('ecopack_history')) || [];
    } catch (e) {}
    
    const baseCo2 = 254.8;
    const basePlastic = 18400;
    
    const historyCo2 = history.reduce((sum, item) => sum + (item.carbonSavedEstKg || 0), 0);
    const historyPlastic = history.reduce((sum, item) => (item.ecoScore < 50 ? sum + 45 : sum), 0);
    
    const totalCo2 = baseCo2 + historyCo2;
    const totalPlastic = basePlastic + historyPlastic;
    
    if (dbMetricCo2) dbMetricCo2.innerText = totalCo2.toFixed(1);
    if (dbMetricPlastic) dbMetricPlastic.innerText = Math.round(totalPlastic).toLocaleString('en-US');
  }

  // --- Export Corporate ESG Report ---
  function exportESGReport() {
    let history = [];
    try {
      history = JSON.parse(localStorage.getItem('ecopack_history')) || [];
    } catch (e) {}

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Popup blocker prevented opening the ESG Statement window. Please allow popups for this site.");
      return;
    }
    
    const baseCo2 = 254.8;
    const basePlastic = 18400;
    const historyCo2 = history.reduce((sum, item) => sum + (item.carbonSavedEstKg || 0), 0);
    const historyPlastic = history.reduce((sum, item) => (item.ecoScore < 50 ? sum + 45 : sum), 0);
    
    const totalCo2 = baseCo2 + historyCo2;
    const totalPlastic = basePlastic + historyPlastic;
    const averageEco = history.length > 0 
      ? Math.round(history.reduce((sum, item) => sum + item.ecoScore, 0) / history.length) 
      : 36;

    const reportHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>EcoPack AI - Corporate ESG Sustainability Report</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            color: #1e293b;
            padding: 40px;
            line-height: 1.6;
            background-color: #ffffff;
          }
          .header {
            border-bottom: 2px solid #10b981;
            padding-bottom: 20px;
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .header h1 {
            font-size: 28px;
            margin: 0;
            color: #0f172a;
          }
          .header p {
            margin: 5px 0 0 0;
            color: #64748b;
            font-size: 14px;
          }
          .seal {
            background-color: #ecfdf5;
            color: #047857;
            font-weight: bold;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            border: 1px solid #a7f3d0;
          }
          .summary-cards {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 40px;
          }
          .card {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
          }
          .card .value {
            font-size: 24px;
            font-weight: 800;
            color: #10b981;
            margin-bottom: 5px;
          }
          .card .label {
            font-size: 12px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border-bottom: 1px solid #e2e8f0;
            padding: 12px;
            text-align: left;
          }
          th {
            background-color: #f1f5f9;
            font-weight: bold;
            color: #475569;
          }
          .badge {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: bold;
          }
          .badge.green { background-color: #d1fae5; color: #065f46; }
          .badge.gold { background-color: #fef3c7; color: #92400e; }
          .badge.red { background-color: #fee2e2; color: #991b1b; }
          .footer {
            margin-top: 60px;
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
          }
          .btn-print {
            padding: 8px 16px;
            background-color: #10b981;
            color: white;
            border: none;
            border-radius: 6px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .btn-print:hover {
            background-color: #059669;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>EcoPack AI Corporate ESG Report</h1>
            <p>Generated on ${new Date().toLocaleDateString()} | Circular Packaging Compliance Audit</p>
          </div>
          <div class="seal">Verified Sustainable</div>
        </div>
        
        <div class="summary-cards">
          <div class="card">
            <div class="value">${totalCo2.toFixed(2)} kg</div>
            <div class="label">Total CO₂e Prevented</div>
          </div>
          <div class="card">
            <div class="value">${(totalPlastic / 1000).toFixed(2)} kg</div>
            <div class="label">Single-Use Plastic Diverted</div>
          </div>
          <div class="card">
            <div class="value">${averageEco}/100</div>
            <div class="label">Average Inventory Eco-Score</div>
          </div>
        </div>

        <h2>Packaging Audit Registry</h2>
        <p>Log of evaluated container profiles and circular instructions active in production:</p>
        
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Item Name</th>
              <th>Eco-Score</th>
              <th>Carbon Offset (Est)</th>
              <th>Materials Highlighted</th>
            </tr>
          </thead>
          <tbody>
            ${history.length > 0 ? history.map(item => `
              <tr>
                <td>${item.date}</td>
                <td><strong>${item.itemName}</strong></td>
                <td><span class="badge ${item.ecoScore >= 70 ? 'green' : item.ecoScore >= 45 ? 'gold' : 'red'}">${item.ecoScore}</span></td>
                <td>${item.carbonSavedEstKg.toFixed(2)} kg CO₂e</td>
                <td>${item.materialsDetected.map(m => m.name).join(', ')}</td>
              </tr>
            `).join('') : `
              <tr>
                <td colspan="5" style="text-align: center; color: #94a3b8;">No custom packaging audits registered. Displaying baseline configurations.</td>
              </tr>
            `}
          </tbody>
        </table>

        <div class="footer">
          <p>&copy; 2026 EcoPack AI - Sustainable E-commerce Systems. Verified for compliance under circular sorting standards.</p>
          <p class="no-print" style="margin-top: 20px;"><button class="btn-print" onclick="window.print()">Print PDF Statement</button></p>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(reportHtml);
    printWindow.document.close();
  }
});
