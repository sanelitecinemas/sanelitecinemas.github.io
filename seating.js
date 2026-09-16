/**
 * Sanelite Cinemas — MoU / Term Sheet & Seating Proposal Engine
 * Real-time synchronization:
 * - Changes in Proposal Header & Section 1 (sq.ft / cinema type / client name / location)
 *   automatically sync into the attached full official MoU Term Sheet below!
 * - Real-time editable Scope of Work (18 items), Force Majeure, and commercial terms.
 * - Exports the official balanced Designer MoU Term Sheet PDF.
 */

// ============================================================
// Default 18 Scope of Work Clauses
// ============================================================
const defaultScopeOfWork = [
  "Completion of all civil works as per final approved Cinema Drawings. (Walls and foyer tiles as per Cinema Requirement)",
  "Construction of fully equipped Ladies' & Gents' Washrooms as per Cinema design. Detailed drawing will be shared once agreement is signed.",
  "Basic tiles into cinema screen as per design.",
  "Entry and Exit glass doors as per Cinema design and as per Building/Mall standard along with safety rollers ( in case required).",
  "Complete flooring of best quality tiles or as per cinema 3D design.",
  "Provision of Server Room/Electrical room, F&B Counter Walls, and other internal partitions as per layout.",
  "Material lift to be provided for unloading of material at Cinema level.",
  "Providing Cinema Branding Space including Entry signage (Lollipop), Ground floor branding, and Terrace signage and movie hording space with fabrication as per standard cinema requirement.",
  "Box office at ground floor and cinema floor as per Design.",
  "Provision for VSAT/ISP installation with NOC from other tenants if required.",
  "Issuance of NOC for Cinema from Owner and other stakeholders",
  "Obtaining statutory permissions and NOC from all the department and get Cinema License before opening of Cinema.",
  "Provide DG set back up and stabilizer as per Cinema requirement.",
  "AC outdoor units and utility space at suitable area or on terrace along with AC AHU/indoor/outdoor unit cabin and fabrication for ducting.",
  "Dedicated lift is required for cinema floor if not then priority to be given to cinema viewers.",
  "Property owner shall complete fire fighting system, sprinkler drops, alarms and smoke detectors along with panel and fire NOC for Cinema.",
  "Documents required for ownership proof and due diligence BU Permission, Property Card, Fire NOCs, Floor & Parking Plan, 7/12 & 8-A Extracts, NA Order, and Ownership Proof.",
  "10 kW (3-phase) power and water supply during fit-out."
];

// Default Force Majeure Text
const defaultForceMajeureText = `Neither party shall be held liable for any failure or delay in the performance of its obligations under this Agreement if such failure or delay is caused by events beyond the reasonable control of the affected party. These events include, but are not limited to:
• Acts of God (such as floods, Covid like situations, lock down, earthquakes, storms, or other natural disasters)
• Accidents
• Riots or civil disturbances
• War or armed conflict
• Acts of terrorism
• Epidemics or pandemics
• Quarantine restrictions
• Governmental actions, omissions, or changes in laws or regulations
• National or regional strikes or labour disputes
• Fire or explosions
• Shortages or unavailability of essential materials, resources, or energy

In addition, if the cinema operations are disturbed, restricted, or stopped due to any negligence, default, omission, or failure on the part of the Property Owner, including any issue relating to the property or essential services under the Owner's responsibility, the Cinema Operator shall not be liable to pay or share any revenue for that month.

The affected party shall notify the other party in writing as soon as reasonably practicable, providing details of the event and the expected duration of the delay. The performance of the affected obligations shall be suspended during the period of the Force Majeure event and shall resume as soon as reasonably possible once the event subsides.`;

// ============================================================
// Date Formatting Helpers (Current Date Default & Date Picker)
// ============================================================
function getTodayIso() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateFromIso(isoStr) {
  if (!isoStr) return '';
  const parts = isoStr.split('-');
  if (parts.length !== 3) return isoStr;
  const year = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${day} ${months[monthIdx] || ''} ${year}`;
}

function getIsoFromFormatted(formattedStr) {
  if (!formattedStr) return getTodayIso();
  const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  const parts = formattedStr.trim().split(/\s+/);
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const monthName = parts[1].toLowerCase();
    const monthIdx = months.indexOf(monthName);
    const year = parts[2];
    if (monthIdx !== -1) {
      const month = String(monthIdx + 1).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }
  const d = new Date(formattedStr);
  if (!isNaN(d.getTime())) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return getTodayIso();
}

function getTodayFormatted() {
  return formatDateFromIso(getTodayIso());
}

// Default State (Front-end Inputs + Attached Document Preview Defaults)
const defaultState = {
  // Proposal Header (Client & Project Info)
  clientName: 'Mr. Rajesh Patel',
  projectLocation: 'Survey No. 124/2, Near Shell Petrol Pump, Science City Main Road, Sola, Ahmedabad',
  totalScreens: 3,
  datePrepared: getTodayFormatted(),

  // Section 1: Cinema Type & Fitout Costing
  cinemaType: 'premium',
  fitoutRatePremium: 3000,
  fitoutRateUltra: 3500,
  fitoutRate: 3000,
  carpetArea: 9000,

  // Attached Document: 1. Property Owner / Franchisee Details (Blank by default)
  ownerName: '',
  ownerCompany: '',
  ownerAddress: '',
  ownerPan: '',
  ownerGst: '',

  // 2. Franchisor Details
  franchisorName: 'Sanelite Cinemas llp',
  franchisorPan: 'AEWFS5463H',
  franchisorAddress: '3rd floor, The Obelisk, Opp. Shell Petrol Pump, Science City Road, Sola, Ahmedabad-380060',
  franchisorGst: '24AEWFS5463H1ZF',

  // 3. Property Details
  purposeOfUse: 'Miniplex / Multiplex / Cinema / Entertainment',
  propertyAddress: 'Survey No. 124/2, Near Shell Petrol Pump, Science City Main Road, Sola, Ahmedabad',
  frontage: '65 ft wide clear main-road frontage',
  buildingType: 'Commercial Building / Mall',
  propertyStatus: 'Ready to use',

  // 4. Agreement & Transaction Type
  fitoutPeriod: '100 days',
  lockinPeriod: '9 Years',
  totalTenure: '9 Years + 9 Years',

  // 5. Scope of Work (Array)
  scopeOfWork: [...defaultScopeOfWork],

  // 6. Electrical Load
  electricalLoad: '50 kW',

  // 7. Financials
  feePerScreen: '2.5 lacs/Screen + GST',
  screenCount: 3,
  totalFranchiseeFees: '₹7.5 Lacs + GST',
  capexAmount: '₹2,70,00,000 + GST',
  tokenAmount: '15 lacs.',
  revenueSharePct: 25,

  // 8. Other Terms
  forceMajeureText: defaultForceMajeureText,
  camCharges: 'Included in the Revenue share.',
  municipalTax: 'To be paid by Property Owner/Franchisor.',
  registrationCharges: 'To be borne equally by both parties',
  disputeResolution: 'Arbitrator from both parties; Location – Ahmedabad',
  legalJurisdiction: 'Ahmedabad Courts',
  additionalTerms: '',

  // 9. Signatures
  sigOwnerName: '',
  sigOwnerDate: getTodayFormatted(),
  sigFranchisorName: 'Sanelite Cinemas LLP (Authorized Signatory)',
  sigFranchisorDate: getTodayFormatted(),
  sigOwnerImg: null,       // { dataUrl, name, width, height, aspect, format }
  sigFranchisorImg: null  // { dataUrl, name, width, height, aspect, format }
};

let state = { ...defaultState, scopeOfWork: [...defaultState.scopeOfWork] };

const $ = (id) => document.getElementById(id);

// Number & Currency Formatters
const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const formatInrNumber = (n) => Number(n).toLocaleString('en-IN');
const formatInrCurrency = (n) => '₹' + Number(n).toLocaleString('en-IN');

const shortCurrency = (value) => {
  const abs = Math.abs(value);
  if (abs >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (abs >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
  return currency.format(value);
};

// Number to Words Converter
function numberToWords(num) {
  const n = parseInt(num, 10);
  if (isNaN(n)) return '';
  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if (n === 100) return 'One Hundred';
  if (n < 20) return ones[n] || '';
  const ten = Math.floor(n / 10);
  const rem = n % 10;
  return tens[ten] + (rem > 0 ? ' ' + ones[rem] : '');
}

// Fitout Calculation
function calculateFitout() {
  const area = Math.max(0, Number(state.carpetArea) || 0);
  const rate = Math.max(0, Number(state.fitoutRate) || 0);
  const fitoutCost = area * rate;
  return { area, rate, fitoutCost };
}

// Synchronize Section 1 data to Attached Document
function syncSection1ToDocument() {
  const { area, rate, fitoutCost } = calculateFitout();
  const typeLabel = state.cinemaType === 'ultra' ? 'Ultra Luxurious' : 'Premium';

  // 1. Update Section 1 UI Displays
  const dispFitout = $('dispFitoutCost');
  if (dispFitout) dispFitout.textContent = formatInrCurrency(fitoutCost);

  const dispFormula = $('dispFitoutFormula');
  if (dispFormula) {
    dispFormula.textContent = `${formatInrNumber(area)} sq.ft × ₹${formatInrNumber(rate)}/sq.ft (${typeLabel})`;
  }

  // 2. Update Hero Metrics
  const heroTotal = $('heroGrandTotal');
  if (heroTotal) heroTotal.textContent = shortCurrency(fitoutCost);

  const heroStats = $('heroFitoutAndSeats');
  if (heroStats) {
    heroStats.textContent = `${formatInrNumber(area)} sq.ft × ₹${formatInrNumber(rate)}/sq.ft (${typeLabel})`;
  }

  // 3. SYNCHRONIZE SQFT & FITOUT INTO ATTACHED DOCUMENT PREVIEW
  // Carpet Area in Section 3
  const docCarpet = $('carpetArea');
  if (docCarpet) {
    docCarpet.value = `${formatInrNumber(area)} sq.ft`;
  }

  // Capex in Section 7.2
  const docCapex = $('capexAmount');
  if (docCapex) {
    docCapex.value = `${formatInrCurrency(fitoutCost)} + GST`;
    state.capexAmount = docCapex.value;
  }

  // Screens in Section 7.1
  const docScreens = $('screenCount');
  if (docScreens) {
    docScreens.value = state.totalScreens;
  }

  const docTotalFees = $('totalFranchiseeFees');
  if (docTotalFees) {
    const feeStr = `₹${(state.totalScreens * 2.5).toFixed(1)} Lacs + GST`;
    docTotalFees.value = feeStr;
    state.totalFranchiseeFees = feeStr;
  }
}

// Render Interactive Scope of Work List
function renderScopeOfWork() {
  const container = $('scopeOfWorkContainer');
  if (!container) return;

  container.innerHTML = '';

  state.scopeOfWork.forEach((item, index) => {
    const itemEl = document.createElement('div');
    itemEl.className = 'mou-scope-row mou-scope-item';

    const numStr = (index + 1) < 10 ? '0' + (index + 1) : '' + (index + 1);

    itemEl.innerHTML = `
      <span class="mou-scope-num">${numStr}</span>
      <textarea class="mou-scope-input" data-index="${index}" rows="2">${item}</textarea>
      <button type="button" class="mou-scope-del-btn mou-scope-del" data-index="${index}" title="Remove this clause" aria-label="Remove clause">✕</button>
    `;

    container.appendChild(itemEl);
  });

  // Attach input listeners
  container.querySelectorAll('.mou-scope-input').forEach(textarea => {
    textarea.addEventListener('input', (e) => {
      const idx = Number(e.target.getAttribute('data-index'));
      state.scopeOfWork[idx] = e.target.value;
    });
  });

  // Attach delete listeners
  container.querySelectorAll('.mou-scope-del').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = Number(e.currentTarget.getAttribute('data-index'));
      if (state.scopeOfWork.length <= 1) {
        alert('At least one scope item is required.');
        return;
      }
      state.scopeOfWork.splice(idx, 1);
      renderScopeOfWork();
    });
  });
}

// Update Signature UI preview & filename display
function updateSignatureUI(type) {
  const isOwner = type === 'owner';
  const sigData = isOwner ? state.sigOwnerImg : state.sigFranchisorImg;
  const placeholder = $(isOwner ? 'sigOwnerPlaceholder' : 'sigFranchisorPlaceholder');
  const previewWrap = $(isOwner ? 'sigOwnerPreviewWrap' : 'sigFranchisorPreviewWrap');
  const previewImg = $(isOwner ? 'sigOwnerPreviewImg' : 'sigFranchisorPreviewImg');
  const fileNameEl = $(isOwner ? 'sigOwnerFileName' : 'sigFranchisorFileName');
  const fileInput = $(isOwner ? 'sigOwnerFile' : 'sigFranchisorFile');

  if (sigData && sigData.dataUrl) {
    if (placeholder) placeholder.style.display = 'none';
    if (previewWrap) previewWrap.style.display = 'flex';
    if (previewImg) previewImg.src = sigData.dataUrl;
    if (fileNameEl) fileNameEl.textContent = sigData.name || 'signature.png';
  } else {
    if (placeholder) placeholder.style.display = 'flex';
    if (previewWrap) previewWrap.style.display = 'none';
    if (previewImg) previewImg.src = '';
    if (fileNameEl) fileNameEl.textContent = '';
    if (fileInput) fileInput.value = '';
  }
}

// Handle signature image file selection from PC
function handleSignatureFile(file, type) {
  if (!file) return;
  if (!file.type || !file.type.startsWith('image/')) {
    alert('Please select a valid image file (PNG, JPG, etc.) for the signature.');
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    const tempImg = new Image();
    tempImg.onload = () => {
      const imgInfo = {
        dataUrl,
        name: file.name,
        width: tempImg.naturalWidth || 200,
        height: tempImg.naturalHeight || 80,
        aspect: (tempImg.naturalWidth && tempImg.naturalHeight) ? (tempImg.naturalWidth / tempImg.naturalHeight) : 2.5,
        format: file.type.includes('jpeg') || file.type.includes('jpg') ? 'JPEG' : 'PNG'
      };
      if (type === 'owner') {
        state.sigOwnerImg = imgInfo;
      } else {
        state.sigFranchisorImg = imgInfo;
      }
      updateSignatureUI(type);
      showToast(`${type === 'owner' ? 'Owner' : 'Franchisor'} signature added: ${file.name}`);
    };
    tempImg.src = dataUrl;
  };
  reader.readAsDataURL(file);
}

// Synchronize all inputs from state
function syncAllInputsFromState() {
  // Proposal Header
  if ($('clientName')) $('clientName').value = state.clientName;
  if ($('projectLocation')) $('projectLocation').value = state.projectLocation;
  if ($('totalScreensInput')) $('totalScreensInput').value = state.totalScreens;
  if ($('datePrepared')) $('datePrepared').value = state.datePrepared;
  if ($('mouDatePicker')) $('mouDatePicker').value = getIsoFromFormatted(state.datePrepared);
  if ($('dispDateFormatted')) $('dispDateFormatted').textContent = state.datePrepared || getTodayFormatted();

  // Section 1
  if ($('carpetAreaInput')) $('carpetAreaInput').value = state.carpetArea;
  if ($('ratePremiumInput')) $('ratePremiumInput').value = state.fitoutRatePremium;
  if ($('rateUltraInput')) $('rateUltraInput').value = state.fitoutRateUltra;

  const cardPremium = $('typeCardPremium');
  const cardUltra = $('typeCardUltra');
  if (state.cinemaType === 'ultra') {
    if (cardUltra) cardUltra.classList.add('active');
    if (cardPremium) cardPremium.classList.remove('active');
    state.fitoutRate = state.fitoutRateUltra;
  } else {
    if (cardPremium) cardPremium.classList.add('active');
    if (cardUltra) cardUltra.classList.remove('active');
    state.fitoutRate = state.fitoutRatePremium;
  }

  // Document Fields
  const docFields = [
    'purposeOfUse',
    'ownerName', 'ownerCompany', 'ownerAddress', 'ownerPan', 'ownerGst',
    'propertyAddress', 'frontage', 'buildingType', 'propertyStatus',
    'fitoutPeriod', 'lockinPeriod', 'totalTenure', 'electricalLoad',
    'feePerScreen', 'tokenAmount', 'revenueSharePct',
    'camCharges', 'municipalTax', 'registrationCharges',
    'disputeResolution', 'legalJurisdiction', 'additionalTerms',
    'sigOwnerName', 'sigOwnerDate', 'sigFranchisorName', 'sigFranchisorDate'
  ];

  docFields.forEach(f => {
    const el = $(f);
    if (el && state[f] !== undefined) {
      el.value = state[f];
    }
  });

  if ($('forceMajeureText')) $('forceMajeureText').value = state.forceMajeureText;

  // Revenue words
  const words = numberToWords(state.revenueSharePct);
  if ($('dispRevenueWords')) $('dispRevenueWords').textContent = words || 'Twenty Five';

  renderScopeOfWork();
  syncSection1ToDocument();
  updateSignatureUI('owner');
  updateSignatureUI('franchisor');
}

// Read All Inputs into State
function updateStateFromInputs() {
  // Proposal Header
  if ($('clientName')) state.clientName = $('clientName').value.trim();
  if ($('projectLocation')) state.projectLocation = $('projectLocation').value.trim();
  if ($('totalScreensInput')) state.totalScreens = Number($('totalScreensInput').value) || 3;
  if ($('mouDatePicker') && $('mouDatePicker').value) {
    state.datePrepared = formatDateFromIso($('mouDatePicker').value);
  } else if ($('datePrepared')) {
    state.datePrepared = $('datePrepared').value.trim();
  }

  // Section 1
  if ($('carpetAreaInput')) state.carpetArea = Math.max(0, Number($('carpetAreaInput').value) || 0);
  if ($('ratePremiumInput')) state.fitoutRatePremium = Math.max(0, Number($('ratePremiumInput').value) || 3000);
  if ($('rateUltraInput')) state.fitoutRateUltra = Math.max(0, Number($('rateUltraInput').value) || 3500);

  state.fitoutRate = state.cinemaType === 'ultra' ? state.fitoutRateUltra : state.fitoutRatePremium;

  // Attached Document
  const docFields = [
    'purposeOfUse',
    'ownerName', 'ownerCompany', 'ownerAddress', 'ownerPan', 'ownerGst',
    'propertyAddress', 'frontage', 'buildingType', 'propertyStatus',
    'fitoutPeriod', 'lockinPeriod', 'totalTenure', 'electricalLoad',
    'feePerScreen', 'screenCount', 'totalFranchiseeFees', 'capexAmount',
    'tokenAmount', 'revenueSharePct',
    'camCharges', 'municipalTax', 'registrationCharges',
    'disputeResolution', 'legalJurisdiction', 'additionalTerms',
    'sigOwnerName', 'sigOwnerDate', 'sigFranchisorName', 'sigFranchisorDate'
  ];

  docFields.forEach(f => {
    const el = $(f);
    if (el) state[f] = el.value.trim();
  });

  if ($('forceMajeureText')) state.forceMajeureText = $('forceMajeureText').value.trim();
}

function showToast(msg) {
  const toast = $('toast');
  if (toast) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2800);
  }
}

// ============================================================
// PDF Export Engine (Executive Designer 3-Page Sanelite Term Sheet)
// All pages fully filled (zero half-filled pages), subtitle placed
// directly beneath the logo, structured tables, and dual signatures.
// ============================================================
function downloadPDF() {
  updateStateFromInputs();

  if (!window.jspdf || !window.jspdf.jsPDF) {
    console.error('jsPDF library is not loaded');
    alert('PDF Generation error: jsPDF library is missing.');
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 14;
  const contentWidth = pageWidth - (margin * 2); // 182mm

  // Executive Designer Corporate Palette (Matching Sanelite Cinemas Logo)
  const cDark = [24, 24, 34];           // Deep Cinematic Charcoal text
  const cMuted = [110, 110, 125];       // Clean Muted Text
  const cAccent = [232, 80, 50];        // Logo Vibrant Coral
  const cAccentDark = [195, 52, 26];    // Deep Coral highlight
  const cNavy = [20, 38, 60];           // Deep Brand Navy
  const cGold = [185, 140, 65];         // Cinema Warm Gold Accent
  const cLine = [225, 225, 235];        // Clean Borders
  const cCardBg = [252, 252, 254];      // Soft Card Fill
  const cCardBorder = [228, 228, 238];  // Soft Card Border
  const cHighlightBg = [255, 244, 241]; // Warm Coral Highlight Fill
  const cHighlightBorder = [250, 195, 185]; // Coral Highlight Border
  const cTableHead = [28, 28, 40];      // Deep Charcoal Table Head
  const cTableHeadNavy = [20, 38, 60];  // Deep Navy Table Head
  const cTableLine = [225, 225, 235];

  const pdfCurrencyWithStar = (val) => {
    const abs = Math.abs(val);
    if (abs >= 10000000) return `Rs. ${(val / 10000000).toFixed(2)}* Cr`;
    if (abs >= 100000) return `Rs. ${(val / 100000).toFixed(2)}* L`;
    return `Rs. ${Math.round(val).toLocaleString('en-IN')}*`;
  };

  // Dynamic values
  const fitoutCalc = calculateFitout();
  const typeLabel = state.cinemaType === 'ultra' ? 'Ultra Luxurious Cinema' : 'Premium Cinema';
  const effectiveOwner = state.ownerName || state.clientName || '–';
  const effectiveOwnerAddress = state.ownerAddress || state.projectLocation || '–';
  const effectiveLocation = state.propertyAddress || state.projectLocation || 'Survey No. 124/2, Near Shell Petrol Pump, Science City Main Road, Sola, Ahmedabad';
  const effectiveDate = state.datePrepared || getTodayFormatted();
  const cleanTotalFees = (state.totalFranchiseeFees || `Rs. ${(state.totalScreens * 2.5).toFixed(1)} Lacs + GST`).replace(/₹/g, 'Rs. ');
  const cleanCapex = (state.capexAmount || `Rs. ${formatInrNumber(fitoutCalc.fitoutCost)} + GST (${typeLabel})`).replace(/₹/g, 'Rs. ');
  const corporateAddress = '3rd floor, The Obelisk, Opp. Shell Petrol Pump, Science City Road, Sola, Ahmedabad-380060';

  // Footer: Address ONLY on left, Page X of Y on right (Phone and Email removed from footer as requested!)
  function drawPageFooter(pageNum, totalPages) {
    const footY = pageHeight - 11;

    // Dual Coral & Neutral accent line
    doc.setDrawColor(...cAccent);
    doc.setLineWidth(0.4);
    doc.line(margin, footY - 2.8, margin + 28, footY - 2.8);

    doc.setDrawColor(...cLine);
    doc.setLineWidth(0.25);
    doc.line(margin + 30, footY - 2.8, pageWidth - margin, footY - 2.8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(...cMuted);
    doc.text(corporateAddress, margin, footY + 2.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...cDark);
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin, footY + 2.5, { align: 'right' });
  }

  // Running Header for Pages 2 and 3
  function drawPageRunningHeader(pageNum, sectionTag) {
    if (typeof SANELITE_LOGO !== 'undefined') {
      const logoW = 38;
      const logoH = 8.16;
      doc.addImage(SANELITE_LOGO, 'PNG', margin, 8, logoW, logoH, undefined, 'FAST');
    } else {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...cDark);
      doc.text('SANELITE CINEMAS', margin, 14);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...cNavy);
    doc.text('Sanelite Cinemas LLP • Commercial MoU Term Sheet', margin, 20);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(...cAccent);
    doc.text(sectionTag, pageWidth - margin, 20, { align: 'right' });

    doc.setDrawColor(...cAccent);
    doc.setLineWidth(0.3);
    doc.line(margin, 22.5, margin + 24, 22.5);

    doc.setDrawColor(...cLine);
    doc.setLineWidth(0.2);
    doc.line(margin + 26, 22.5, pageWidth - margin, 22.5);
  }

  // ============================================================
  // PAGE 1: Brand Header, Parties, Specifications, Tenure, Power, Financials, Revenue Share & Preamble
  // ============================================================
  if (typeof SANELITE_LOGO !== 'undefined') {
    const logoW = 48;
    const logoH = 10.3;
    doc.addImage(SANELITE_LOGO, 'PNG', margin, 9, logoW, logoH, undefined, 'FAST');
  } else {
    doc.setFillColor(...cAccent);
    doc.roundedRect(margin, 9, 10, 10, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('times', 'bold');
    doc.setFontSize(16);
    doc.text('S', margin + 3.0, 16.5);

    doc.setTextColor(...cDark);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    doc.text('Sanelite Cinemas', margin + 13, 16.5);
  }

  // Left Side: Brand Subtitle ONLY (Address removed from top as requested!)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.4);
  doc.setTextColor(...cNavy);
  doc.text('Sanelite Cinemas LLP • Commercial MoU Term Sheet', margin, 23.5);

  // Right Side Corner: Phone Number, E-mail, Date, Badge
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.setTextColor(...cDark);
  doc.text('+91 94276 47819', pageWidth - margin, 11.5, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(...cMuted);
  doc.text('info@sanelitecinemas.com', pageWidth - margin, 15.5, { align: 'right' });

  doc.setFontSize(6.8);
  doc.text(`Date: ${effectiveDate}`, pageWidth - margin, 19.5, { align: 'right' });

  const badgeText = 'COMMERCIAL MoU FRAMEWORK';
  const badgeW = doc.getTextWidth(badgeText) + 6;
  doc.setFillColor(...cHighlightBg);
  doc.setDrawColor(...cHighlightBorder);
  doc.setLineWidth(0.2);
  doc.roundedRect(pageWidth - margin - badgeW, 22.0, badgeW, 5.2, 1, 1, 'FD');
  doc.setTextColor(...cAccentDark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text(badgeText, pageWidth - margin - (badgeW / 2), 25.6, { align: 'center' });

  // Header Divider Line (Dual Coral + Neutral matching Logo)
  doc.setDrawColor(...cAccent);
  doc.setLineWidth(0.35);
  doc.line(margin, 27.5, margin + 35, 27.5);

  doc.setDrawColor(...cLine);
  doc.setLineWidth(0.25);
  doc.line(margin + 37, 27.5, pageWidth - margin, 27.5);

  // Side-by-Side Tables: Parties to Agreement (Starts directly below header divider line)
  const partiesY = 30.5;
  const halfColW = (contentWidth - 4) / 2;
  doc.autoTable({
    startY: partiesY,
    margin: { left: margin },
    tableWidth: halfColW,
    head: [['1. PROPERTY OWNER / FRANCHISEE', 'DETAILS']],
    body: [
      ['Name of Entity', effectiveOwner],
      ['Company / Firm', state.ownerCompany || '–'],
      ['Postal Address', effectiveOwnerAddress],
      ['PAN & GSTIN', `${state.ownerPan || '–'} / ${state.ownerGst || '–'}`]
    ],
    theme: 'plain',
    headStyles: { fillColor: cTableHead, textColor: [255, 255, 255], fontSize: 6.8, fontStyle: 'bold', cellPadding: 1.6 },
    styles: { fontSize: 6.4, cellPadding: 1.5, minCellHeight: 4.6, lineColor: cTableLine, lineWidth: 0.2 },
    columnStyles: { 0: { fontStyle: 'bold', textColor: [50, 50, 65], cellWidth: 26 }, 1: { textColor: cDark } }
  });

  doc.autoTable({
    startY: partiesY,
    margin: { left: margin + halfColW + 4 },
    tableWidth: halfColW,
    head: [['2. FRANCHISOR / CINEMA OPERATOR', 'DETAILS']],
    body: [
      ['Company Name', 'Sanelite Cinemas LLP'],
      ['Corporate Office', corporateAddress],
      ['Corporate Contact', '+91 94276 47819 | info@sanelitecinemas.com'],
      ['PAN & GSTIN', 'AEWFS5463H / 24AEWFS5463H1ZF']
    ],
    theme: 'plain',
    headStyles: { fillColor: cTableHeadNavy, textColor: [255, 255, 255], fontSize: 6.8, fontStyle: 'bold', cellPadding: 1.6 },
    styles: { fontSize: 6.4, cellPadding: 1.5, minCellHeight: 4.6, lineColor: cTableLine, lineWidth: 0.2 },
    columnStyles: { 0: { fontStyle: 'bold', textColor: [50, 50, 65], cellWidth: 26 }, 1: { textColor: cDark } }
  });

  // Section 3: Property Specs
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 2.8,
    margin: { left: margin },
    tableWidth: contentWidth,
    head: [['3. PROPERTY SPECIFICATIONS & CURRENT HANDOVER STATUS', 'SITE PARAMETERS']],
    body: [
      ['Commercial Purpose of Use', state.purposeOfUse || 'Miniplex / Multiplex / Cinema / Entertainment'],
      ['Carpet Area Allocated', `${state.carpetArea || '9,000 sq.ft'} (Demarcated cinema hall & foyer footprint)`],
      ['Premises Location & Floor', effectiveLocation],
      ['Road Frontage & Access', state.frontage || '65 ft wide clear main-road frontage with dedicated cinema viewer access'],
      ['Handover Status & Schedule', `${state.propertyStatus || 'Ready to use'} — Bare shell ready for fit-out within 30 days`]
    ],
    theme: 'plain',
    headStyles: { fillColor: cTableHead, textColor: [255, 255, 255], fontSize: 6.8, fontStyle: 'bold', cellPadding: 1.6 },
    styles: { fontSize: 6.4, cellPadding: 1.5, minCellHeight: 4.6, lineColor: cTableLine, lineWidth: 0.2 },
    columnStyles: { 0: { fontStyle: 'bold', textColor: [50, 50, 65], cellWidth: 50 }, 1: { textColor: cDark } }
  });

  // Section 4: Tenure
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 2.8,
    margin: { left: margin },
    tableWidth: contentWidth,
    head: [['4. TRANSACTION TYPE & TENURE TERMS', 'COMMERCIAL SPECIFICATIONS']],
    body: [
      ['Fit-Out Construction Period', `${state.fitoutPeriod || '100 days'} from bare-shell site handover & sanction clearances`],
      ['Mandatory Lock-in Period', `${state.lockinPeriod || '9 Years'} (Both parties bound without premature unilateral exit)`],
      ['Total Commercial Lease Tenure', `${state.totalTenure || '9 Years + 9 Years'} (Renewable with mutually agreed escalation terms)`]
    ],
    theme: 'plain',
    headStyles: { fillColor: cTableHead, textColor: [255, 255, 255], fontSize: 6.8, fontStyle: 'bold', cellPadding: 1.6 },
    styles: { fontSize: 6.4, cellPadding: 1.5, minCellHeight: 4.6, lineColor: cTableLine, lineWidth: 0.2 },
    columnStyles: { 0: { fontStyle: 'bold', textColor: [50, 50, 65], cellWidth: 50 }, 1: { textColor: cDark } }
  });

  // Section 5: Electrical Load (on Page 1)
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 2.8,
    margin: { left: margin },
    tableWidth: contentWidth,
    head: [['5. ELECTRICAL POWER & SUBSTATION ALLOCATION', 'SPECIFICATION DETAILS']],
    body: [
      ['Connected Dedicated Power Load', `${state.electricalLoad || '50 kW'} sanctioned load provided to cinema electrical room`],
      ['Substation & Metering Setup', 'Separate digital energy meter & LT panel provided at Property Owner capex'],
      ['100% Full Operational DG Backup', 'DG power supply with automatic changeover switch for uninterrupted projection']
    ],
    theme: 'plain',
    headStyles: { fillColor: cTableHead, textColor: [255, 255, 255], fontSize: 6.8, fontStyle: 'bold', cellPadding: 1.6 },
    styles: { fontSize: 6.4, cellPadding: 1.5, minCellHeight: 4.6, lineColor: cTableLine, lineWidth: 0.2 },
    columnStyles: { 0: { fontStyle: 'bold', textColor: [50, 50, 65], cellWidth: 50 }, 1: { textColor: cDark } }
  });

  // Section 6: Financial Consideration (7.1 & 7.2 on Page 1)
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 2.8,
    margin: { left: margin },
    tableWidth: contentWidth,
    head: [['6. FINANCIAL CONSIDERATION & INVESTMENT SUMMARY', 'COMMERCIAL TERMS']],
    body: [
      ['6.1 Franchisee Fee per Screen', `${state.feePerScreen || 'Rs. 2.50 Lacs / Screen'} + applicable GST`],
      ['Total Franchisee Onboarding Fees', cleanTotalFees],
      ['6.2 Total Fitout Capex Cost', cleanCapex],
      ['Initial Token Advance Payment', `${state.tokenAmount || 'Rs. 15 Lacs'} (Payable upon formal execution of this MoU)`],
      ['Balance Fitout Capex Disbursement', 'As per stage-wise construction milestones detailed in agreed Payment Annexure']
    ],
    theme: 'plain',
    headStyles: { fillColor: cTableHead, textColor: [255, 255, 255], fontSize: 6.8, fontStyle: 'bold', cellPadding: 1.6 },
    styles: { fontSize: 6.4, cellPadding: 1.5, minCellHeight: 4.6, lineColor: cTableLine, lineWidth: 0.2 },
    columnStyles: { 0: { fontStyle: 'bold', textColor: [50, 50, 65], cellWidth: 50 }, 1: { textColor: cDark } },
    didParseCell: function(data) {
      if (data.section === 'body' && (data.row.index === 1 || data.row.index === 2)) {
        data.cell.styles.fillColor = cHighlightBg;
        data.cell.styles.textColor = cAccentDark;
        data.cell.styles.fontStyle = 'bold';
      }
    }
  });

  // Section 7: Commercial Revenue Share Framework (Moved to Page 1 to use blank space!)
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 2.8,
    margin: { left: margin },
    tableWidth: contentWidth,
    head: [['7. COMMERCIAL REVENUE SHARE FRAMEWORK', 'SHARE RATIO & AUDIT SPECIFICATION']],
    body: [
      ['Revenue Share Percentage', `${state.revenueSharePct || 25}% of monthly consolidated Net Sales (Box Office + F&B)`],
      ['Settlement & Payment Cycle', 'Monthly payout disbursed within 7 business days following month-end close'],
      ['Applicable Revenue Streams', 'Consolidated Net Box Office Ticket Sales + Net F&B (Food & Beverage) Revenues']
    ],
    theme: 'plain',
    headStyles: { fillColor: cTableHeadNavy, textColor: [255, 255, 255], fontSize: 6.8, fontStyle: 'bold', cellPadding: 1.6 },
    styles: { fontSize: 6.4, cellPadding: 1.5, minCellHeight: 4.6, lineColor: cTableLine, lineWidth: 0.2 },
    columnStyles: { 0: { fontStyle: 'bold', textColor: [50, 50, 65], cellWidth: 50 }, 1: { textColor: cDark } },
    didParseCell: function(data) {
      if (data.section === 'body' && data.row.index === 0) {
        data.cell.styles.fillColor = cHighlightBg;
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.textColor = cAccentDark;
      }
    }
  });

  // Net Sales Definition Callout Box
  const netSalesY = doc.lastAutoTable.finalY + 2.8;
  const netSalesH = 15.5;
  doc.setFillColor(...cCardBg);
  doc.setDrawColor(...cCardBorder);
  doc.setLineWidth(0.25);
  doc.roundedRect(margin, netSalesY, contentWidth, netSalesH, 1.5, 1.5, 'FD');

  // Coral left accent stripe
  doc.setFillColor(...cAccent);
  doc.roundedRect(margin, netSalesY, 2.5, netSalesH, 0.8, 0.8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.7);
  doc.setTextColor(...cNavy);
  doc.text('DEFINITION OF AUDITED "NET SALES":', margin + 5, netSalesY + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.1);
  doc.setTextColor(...cDark);
  const netSalesText = '"Net Sales" means total revenue generated from the sale of cinema admission tickets (Box Office) and total sales of food and beverages (F&B Concessions) at the premises, after deducting applicable Goods and Services Tax (GST) and official government entertainment levies. Revenue share is disbursed monthly to Property Owner\'s nominated bank account.';
  const splitNet = doc.splitTextToSize(netSalesText, contentWidth - 9);
  doc.text(splitNet, margin + 5, netSalesY + 8.5);

  // Commercial Preamble Callout Box
  const preambleY = netSalesY + netSalesH + 2.8;
  const preambleH = 17.5;
  doc.setFillColor(...cCardBg);
  doc.setDrawColor(...cCardBorder);
  doc.setLineWidth(0.25);
  doc.roundedRect(margin, preambleY, contentWidth, preambleH, 1.5, 1.5, 'FD');

  // Gold left accent stripe
  doc.setFillColor(...cGold);
  doc.roundedRect(margin, preambleY, 2.5, preambleH, 0.8, 0.8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.7);
  doc.setTextColor(...cNavy);
  doc.text('COMMERCIAL PREAMBLE & STATEMENT OF INTENT:', margin + 5, preambleY + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.1);
  doc.setTextColor(...cDark);
  const preambleText = 'This Memorandum of Understanding (MoU) establishes the primary mutually agreed terms and commercial framework between Property Owner ("Franchisee") and Sanelite Cinemas LLP ("Franchisor") for establishing, outfitting, licensing, and managing a modern commercial multiplex theater at the above scheduled premises. Both Parties agree to execute definitive long-term lease and operating agreements based on the terms established herein.';
  const splitPreamble = doc.splitTextToSize(preambleText, contentWidth - 9);
  doc.text(splitPreamble, margin + 5, preambleY + 8.5);

  // ============================================================
  // PAGE 2: Scope of Work (18 items), Statutory Governance, Force Majeure & Default Protocol
  // ============================================================
  doc.addPage();
  drawPageRunningHeader(2, 'SECTION 8 & 9: SCOPE OF WORK, STATUTORY GOVERNANCE & PROTOCOLS');

  const scopeItems = (state.scopeOfWork && state.scopeOfWork.length > 0) ? state.scopeOfWork : defaultScopeOfWork;
  const scopeRows = scopeItems.map((item, idx) => {
    const num = (idx + 1) < 10 ? '0' + (idx + 1) : '' + (idx + 1);
    return [num, item];
  });

  doc.autoTable({
    startY: 25.5,
    margin: { left: margin },
    tableWidth: contentWidth,
    head: [['#', '8. SCOPE OF WORK BY PROPERTY OWNER / FRANCHISEE (CIVIL, MEP & SITE HANDOVER)']],
    body: scopeRows,
    theme: 'plain',
    headStyles: { fillColor: cTableHeadNavy, textColor: [255, 255, 255], fontSize: 6.8, fontStyle: 'bold', cellPadding: 1.3 },
    styles: { fontSize: 6.0, cellPadding: 1.15, minCellHeight: 4.0, lineColor: cTableLine, lineWidth: 0.18 },
    columnStyles: { 0: { fontStyle: 'bold', textColor: cAccent, cellWidth: 8, halign: 'center' }, 1: { textColor: cDark, cellWidth: contentWidth - 8 } },
    alternateRowStyles: { fillColor: [252, 253, 255] }
  });

  // Section 9: Statutory Taxes & Legal Governance Table
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 2.8,
    margin: { left: margin },
    tableWidth: contentWidth,
    head: [['9. STATUTORY TAXES, COMPLIANCE & LEGAL GOVERNANCE', 'CONTRACTUAL OBLIGATIONS & JURISDICTION']],
    body: [
      ['Common Area Maintenance (CAM)', state.camCharges || 'Included in the Revenue share; no separate monthly maintenance billable to Operator'],
      ['Municipal & Property Taxes', state.municipalTax || 'Payable by Property Owner directly to local municipal corporation / nagarpalika'],
      ['Lease Deed Registration Charges', state.registrationCharges || 'To be borne equally (50:50) by both parties at the time of definitive lease registration'],
      ['Building Structure & Equipment Insurance', 'Property Owner covers building structure; Franchisor covers cinema projection & sound equipment'],
      ['Licensing & Statutory Approvals (BU/NOC)', 'Property Owner provides BU permission, Fire NOC, ownership proofs & title chain clearances'],
      ['Dispute Resolution & Arbitration', state.disputeResolution || 'Arbitration in Ahmedabad by mutually appointed sole arbitrator under Arbitration Act'],
      ['Legal Jurisdiction & Governing Law', state.legalJurisdiction || 'Courts at Ahmedabad, Gujarat shall have exclusive jurisdiction over this agreement']
    ],
    theme: 'plain',
    headStyles: { fillColor: cTableHead, textColor: [255, 255, 255], fontSize: 6.8, fontStyle: 'bold', cellPadding: 1.5 },
    styles: { fontSize: 6.2, cellPadding: 1.35, minCellHeight: 4.4, lineColor: cTableLine, lineWidth: 0.18 },
    columnStyles: { 0: { fontStyle: 'bold', textColor: [50, 50, 65], cellWidth: 54 }, 1: { textColor: cDark } }
  });

  // Section 10: Force Majeure 2-Column Table
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 2.8,
    margin: { left: margin },
    tableWidth: contentWidth,
    head: [['10. FORCE MAJEURE & SUSPENSION PROTOCOL (COLUMN A)', '10. FORCE MAJEURE & SUSPENSION PROTOCOL (COLUMN B)']],
    body: [
      ['• Acts of God (floods, earthquakes, severe storms, natural calamities)', '• Quarantine, localized lockdown, or administrative restrictions'],
      ['• Pandemics, epidemics, or Covid-like public health crises', '• Governmental orders, statutory acts, or legislative prohibitions'],
      ['• Accidents, structural emergencies, or major infrastructural failure', '• National or regional strikes, civil unrest, or widespread labor disputes'],
      ['• War, armed invasion, acts of foreign enemies, military hostilities', '• Critical shortage or complete grid cutoff of energy, fuel, or water']
    ],
    theme: 'plain',
    headStyles: { fillColor: cTableHead, textColor: [255, 255, 255], fontSize: 6.8, fontStyle: 'bold', cellPadding: 1.5 },
    styles: { fontSize: 6.2, cellPadding: 1.35, minCellHeight: 4.4, lineColor: cTableLine, lineWidth: 0.18 },
    columnStyles: { 0: { textColor: cDark, cellWidth: contentWidth / 2 }, 1: { textColor: cDark, cellWidth: contentWidth / 2 } }
  });

  // Operations Interruption Box at bottom of Page 2
  const intY = doc.lastAutoTable.finalY + 2.8;
  const intH = 16.5;
  doc.setFillColor(255, 246, 244);
  doc.setDrawColor(...cHighlightBorder);
  doc.setLineWidth(0.25);
  doc.roundedRect(margin, intY, contentWidth, intH, 1.5, 1.5, 'FD');

  doc.setFillColor(...cAccentDark);
  doc.roundedRect(margin, intY, 2.5, intH, 0.8, 0.8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.7);
  doc.setTextColor(...cAccentDark);
  doc.text('OPERATIONS INTERRUPTION & PROPERTY OWNER DEFAULT PROTOCOL:', margin + 5, intY + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.1);
  doc.setTextColor(...cDark);
  const intText = 'If cinema operations are disturbed, restricted, or stopped due to any negligence, default, omission, or structural/utility failure on the part of the Property Owner (including power outage, lift failure, water stoppage, or lack of statutory building approvals), the Cinema Operator shall not be liable to pay or share any revenue for that affected period.';
  const splitInt = doc.splitTextToSize(intText, contentWidth - 9);
  doc.text(splitInt, margin + 5, intY + 8.5);

  // ============================================================
  // PAGE 3: Operational Undertakings, Commercial Covenants, Dual Signatures & Formal Witnesses
  // ============================================================
  doc.addPage();
  drawPageRunningHeader(3, 'SECTION 11 & 12: COVENANTS, DUAL EXECUTION & ATTESTATION');

  // Section 11: Operational Undertakings & Site Access Covenants
  doc.autoTable({
    startY: 25.5,
    margin: { left: margin },
    tableWidth: contentWidth,
    head: [['11. OPERATIONAL UNDERTAKINGS & SITE ACCESS COVENANTS', 'OPERATIONAL STATUS']],
    body: [
      ['Facade Signage & Branding Rights', 'Zero license cost display rights on building facade, terrace and roadside totem'],
      ['Vertical Transport & Cinema Lifts', 'Dedicated elevator or priority patron movement ensured during peak cinema hours'],
      ['Fit-Out Utilities Provision', '10 kW (3-phase) uninterrupted temporary electricity & water during civil fit-out'],
      ['Terrace Chiller & Antenna Space', 'Demarcated terrace floor area provided for HVAC outdoor chillers & satellite uplink']
    ],
    theme: 'plain',
    headStyles: { fillColor: cTableHeadNavy, textColor: [255, 255, 255], fontSize: 7.0, fontStyle: 'bold', cellPadding: 1.8 },
    styles: { fontSize: 6.6, cellPadding: 1.7, minCellHeight: 4.8, lineColor: cTableLine, lineWidth: 0.2 },
    columnStyles: { 0: { fontStyle: 'bold', textColor: [50, 50, 65], cellWidth: 54 }, 1: { textColor: cDark } }
  });

  // Section 12: Definitive Execution & Commercial Covenants
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 3.2,
    margin: { left: margin },
    tableWidth: contentWidth,
    head: [['12. DEFINITIVE LEASE EXECUTION & BINDING COMMERCIAL COVENANTS', 'LEGAL SPECIFICATION']],
    body: [
      ['Definitive Agreement Execution', 'Formal long-term registered lease deed to be executed within 45 days of site handover'],
      ['Commercial Exclusivity Covenant', 'Owner covenants not to lease any part of premises to competing cinema brand during tenure'],
      ['Cinema Brand Standards & Ops', 'Franchisor ensures premium projection, sound quality, cleanliness & customer hospitality'],
      ['Commercial Confidentiality', 'Both parties agree to treat all financial ratios, fees, and commercial terms as strictly confidential']
    ],
    theme: 'plain',
    headStyles: { fillColor: cTableHead, textColor: [255, 255, 255], fontSize: 7.0, fontStyle: 'bold', cellPadding: 1.8 },
    styles: { fontSize: 6.6, cellPadding: 1.7, minCellHeight: 4.8, lineColor: cTableLine, lineWidth: 0.2 },
    columnStyles: { 0: { fontStyle: 'bold', textColor: [50, 50, 65], cellWidth: 54 }, 1: { textColor: cDark } }
  });

  // Dual Signatures Block
  const sigBoxesY = doc.lastAutoTable.finalY + 4.5;
  const sigBoxW = (contentWidth - 6) / 2;
  const sigBoxH = 55;

  // Box 1: Property Owner
  doc.setFillColor(...cCardBg);
  doc.setDrawColor(...cCardBorder);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, sigBoxesY, sigBoxW, sigBoxH, 1.5, 1.5, 'FD');

  doc.setFillColor(...cTableHead);
  doc.roundedRect(margin, sigBoxesY, sigBoxW, 7.5, 1.5, 1.5, 'F');
  doc.rect(margin, sigBoxesY + 5.5, sigBoxW, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.0);
  doc.setTextColor(255, 255, 255);
  doc.text('FOR PROPERTY OWNER / FRANCHISEE', margin + 4, sigBoxesY + 5.2);

  // If owner signature image is attached, embed it
  if (state.sigOwnerImg && state.sigOwnerImg.dataUrl) {
    try {
      const maxW = 50;
      const maxH = 15;
      const aspect = state.sigOwnerImg.aspect || (state.sigOwnerImg.width / state.sigOwnerImg.height) || 2.5;
      let drawW = maxW;
      let drawH = drawW / aspect;
      if (drawH > maxH) {
        drawH = maxH;
        drawW = drawH * aspect;
      }
      const drawX = margin + ((sigBoxW - drawW) / 2);
      const drawY = sigBoxesY + 9 + ((16 - drawH) / 2);
      const fmt = state.sigOwnerImg.format || 'PNG';
      doc.addImage(state.sigOwnerImg.dataUrl, fmt, drawX, drawY, drawW, drawH, undefined, 'FAST');
    } catch (sigErr) {
      console.warn('Could not add owner signature to PDF:', sigErr);
    }
  }

  doc.setDrawColor(200, 205, 215);
  doc.setLineWidth(0.25);
  doc.line(margin + 5, sigBoxesY + 25, margin + sigBoxW - 5, sigBoxesY + 25);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.0);
  doc.setTextColor(...cMuted);
  doc.text('Authorized Signatory & Official Stamp', margin + (sigBoxW / 2), sigBoxesY + 28.5, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(...cNavy);
  doc.text('Name: ', margin + 5, sigBoxesY + 36.0);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...cDark);
  doc.text(effectiveOwner, margin + 17, sigBoxesY + 36.0);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...cNavy);
  doc.text('Title: ', margin + 5, sigBoxesY + 42.0);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...cDark);
  doc.text('Property Owner / Authorized Signatory', margin + 17, sigBoxesY + 42.0);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...cNavy);
  doc.text('Date: ', margin + 5, sigBoxesY + 48.0);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...cDark);
  doc.text(effectiveDate, margin + 17, sigBoxesY + 48.0);

  // Box 2: Franchisor
  const c2SigX = margin + sigBoxW + 6;
  doc.setFillColor(...cCardBg);
  doc.setDrawColor(...cCardBorder);
  doc.setLineWidth(0.3);
  doc.roundedRect(c2SigX, sigBoxesY, sigBoxW, sigBoxH, 1.5, 1.5, 'FD');

  doc.setFillColor(...cTableHeadNavy);
  doc.roundedRect(c2SigX, sigBoxesY, sigBoxW, 7.5, 1.5, 1.5, 'F');
  doc.rect(c2SigX, sigBoxesY + 5.5, sigBoxW, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.0);
  doc.setTextColor(255, 255, 255);
  doc.text('FOR SANELITE CINEMAS LLP (FRANCHISOR)', c2SigX + 4, sigBoxesY + 5.2);

  // If franchisor signature image is attached, embed it
  if (state.sigFranchisorImg && state.sigFranchisorImg.dataUrl) {
    try {
      const maxW = 50;
      const maxH = 15;
      const aspect = state.sigFranchisorImg.aspect || (state.sigFranchisorImg.width / state.sigFranchisorImg.height) || 2.5;
      let drawW = maxW;
      let drawH = drawW / aspect;
      if (drawH > maxH) {
        drawH = maxH;
        drawW = drawH * aspect;
      }
      const drawX = c2SigX + ((sigBoxW - drawW) / 2);
      const drawY = sigBoxesY + 9 + ((16 - drawH) / 2);
      const fmt = state.sigFranchisorImg.format || 'PNG';
      doc.addImage(state.sigFranchisorImg.dataUrl, fmt, drawX, drawY, drawW, drawH, undefined, 'FAST');
    } catch (sigErr) {
      console.warn('Could not add franchisor signature to PDF:', sigErr);
    }
  }

  doc.setDrawColor(200, 205, 215);
  doc.setLineWidth(0.25);
  doc.line(c2SigX + 5, sigBoxesY + 25, c2SigX + sigBoxW - 5, sigBoxesY + 25);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.0);
  doc.setTextColor(...cMuted);
  doc.text('Authorized Signatory & Corporate Stamp', c2SigX + (sigBoxW / 2), sigBoxesY + 28.5, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(...cNavy);
  doc.text('Name: ', c2SigX + 5, sigBoxesY + 36.0);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...cDark);
  doc.text(state.sigFranchisorName || 'Sanelite Cinemas LLP', c2SigX + 17, sigBoxesY + 36.0);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...cNavy);
  doc.text('Title: ', c2SigX + 5, sigBoxesY + 42.0);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...cDark);
  doc.text('Designated Partner / Authorized Signatory', c2SigX + 17, sigBoxesY + 42.0);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...cNavy);
  doc.text('Date: ', c2SigX + 5, sigBoxesY + 48.0);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...cDark);
  doc.text(effectiveDate, c2SigX + 17, sigBoxesY + 48.0);

  // Dual Witness Box
  const witY = sigBoxesY + sigBoxH + 3.8;
  const witH = 28;
  doc.setFillColor(...cCardBg);
  doc.setDrawColor(...cCardBorder);
  doc.roundedRect(margin, witY, contentWidth, witH, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(...cNavy);
  doc.text('IN THE PRESENCE OF FORMAL WITNESSES (DUAL ATTESTATION):', margin + 4, witY + 5.0);

  const witColW = (contentWidth - 8) / 2;
  // Witness 1
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.3);
  doc.setTextColor(...cDark);
  doc.text('1. Witness for Property Owner / Franchisee:', margin + 4, witY + 10.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Name: _______________________  Signature: _______________________', margin + 4, witY + 16.5);
  doc.text('Address: _____________________________________________________', margin + 4, witY + 22.5);

  // Witness 2
  const wit2X = margin + witColW + 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.3);
  doc.setTextColor(...cDark);
  doc.text('2. Witness for Sanelite Cinemas LLP:', wit2X, witY + 10.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Name: _______________________  Signature: _______________________', wit2X, witY + 16.5);
  doc.text('Address: _____________________________________________________', wit2X, witY + 22.5);

  // Two-pass dynamic page footer numbering across all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawPageFooter(i, totalPages);
  }

  // Save the PDF
  const sanitizedClient = (effectiveOwner || 'Client').replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  doc.save(`sanelite-cinemas-mou-${sanitizedClient}.pdf`);
  showToast('Official MoU Term Sheet PDF Downloaded!');
}

// ============================================================
// Initialization & Real-Time Sync Event Listeners
// ============================================================
function init() {
  syncAllInputsFromState();

  // 1. Proposal Header Listeners (Live Sync to Document)
  if ($('clientName')) {
    $('clientName').addEventListener('input', (e) => {
      state.clientName = e.target.value.trim();
      state.ownerName = state.clientName;
      state.sigOwnerName = state.clientName;

      // Sync into document fields
      if ($('ownerName')) $('ownerName').value = state.clientName;
      if ($('sigOwnerName')) $('sigOwnerName').value = state.clientName;
    });
  }

  if ($('projectLocation')) {
    $('projectLocation').addEventListener('input', (e) => {
      state.projectLocation = e.target.value.trim();
      state.propertyAddress = state.projectLocation;
      state.ownerAddress = state.projectLocation;

      // Sync into document fields
      if ($('propertyAddress')) $('propertyAddress').value = state.projectLocation;
      if ($('ownerAddress')) $('ownerAddress').value = state.projectLocation;
    });
  }

  if ($('totalScreensInput')) {
    $('totalScreensInput').addEventListener('input', (e) => {
      state.totalScreens = Number(e.target.value) || 3;
      state.screenCount = state.totalScreens;
      syncSection1ToDocument();
    });
  }

  if ($('datePrepared')) {
    $('datePrepared').addEventListener('input', (e) => {
      state.datePrepared = e.target.value.trim();
      state.sigOwnerDate = state.datePrepared;
      state.sigFranchisorDate = state.datePrepared;

      // Sync into document signature dates
      if ($('sigOwnerDate')) $('sigOwnerDate').value = state.datePrepared;
      if ($('sigFranchisorDate')) $('sigFranchisorDate').value = state.datePrepared;
      if ($('dispDateFormatted')) $('dispDateFormatted').textContent = state.datePrepared;
      if ($('mouDatePicker')) $('mouDatePicker').value = getIsoFromFormatted(state.datePrepared);
    });
  }

  if ($('mouDatePicker')) {
    $('mouDatePicker').addEventListener('change', (e) => {
      const val = e.target.value;
      if (!val) return;
      const formatted = formatDateFromIso(val);
      state.datePrepared = formatted;
      state.sigOwnerDate = formatted;
      state.sigFranchisorDate = formatted;

      if ($('dispDateFormatted')) $('dispDateFormatted').textContent = formatted;
      if ($('sigOwnerDate')) $('sigOwnerDate').value = formatted;
      if ($('sigFranchisorDate')) $('sigFranchisorDate').value = formatted;
      if ($('datePrepared')) $('datePrepared').value = formatted;
      showToast(`MoU Date updated: ${formatted}`);
    });
  }

  if ($('todayDateBtn')) {
    $('todayDateBtn').addEventListener('click', () => {
      const todayIso = getTodayIso();
      if ($('mouDatePicker')) $('mouDatePicker').value = todayIso;
      const formatted = getTodayFormatted();
      state.datePrepared = formatted;
      state.sigOwnerDate = formatted;
      state.sigFranchisorDate = formatted;

      if ($('dispDateFormatted')) $('dispDateFormatted').textContent = formatted;
      if ($('sigOwnerDate')) $('sigOwnerDate').value = formatted;
      if ($('sigFranchisorDate')) $('sigFranchisorDate').value = formatted;
      if ($('datePrepared')) $('datePrepared').value = formatted;
      showToast(`MoU Date set to Today: ${formatted}`);
    });
  }

  // 2. Section 1: Cinema Type & Carpet Area Listeners (Live Sync to Document)
  const cardPremium = $('typeCardPremium');
  const cardUltra = $('typeCardUltra');

  function setCinemaType(type) {
    state.cinemaType = type;
    if (type === 'ultra') {
      state.fitoutRate = state.fitoutRateUltra;
      if (cardUltra) cardUltra.classList.add('active');
      if (cardPremium) cardPremium.classList.remove('active');
    } else {
      state.fitoutRate = state.fitoutRatePremium;
      if (cardPremium) cardPremium.classList.add('active');
      if (cardUltra) cardUltra.classList.remove('active');
    }
    syncSection1ToDocument();
  }

  if (cardPremium) {
    cardPremium.addEventListener('click', (e) => {
      if (e.target.tagName !== 'INPUT') setCinemaType('premium');
    });
  }

  if (cardUltra) {
    cardUltra.addEventListener('click', (e) => {
      if (e.target.tagName !== 'INPUT') setCinemaType('ultra');
    });
  }

  if ($('ratePremiumInput')) {
    $('ratePremiumInput').addEventListener('input', (e) => {
      state.fitoutRatePremium = Math.max(0, Number(e.target.value) || 3000);
      if (state.cinemaType === 'premium') {
        state.fitoutRate = state.fitoutRatePremium;
        syncSection1ToDocument();
      }
    });
  }

  if ($('rateUltraInput')) {
    $('rateUltraInput').addEventListener('input', (e) => {
      state.fitoutRateUltra = Math.max(0, Number(e.target.value) || 3500);
      if (state.cinemaType === 'ultra') {
        state.fitoutRate = state.fitoutRateUltra;
        syncSection1ToDocument();
      }
    });
  }

  if ($('carpetAreaInput')) {
    $('carpetAreaInput').addEventListener('input', (e) => {
      state.carpetArea = Math.max(0, Number(e.target.value) || 0);
      syncSection1ToDocument();
    });
  }

  // 3. Document Fields Listeners (User directly editing within document preview)
  const docFields = [
    'ownerCompany', 'ownerAddress', 'ownerPan', 'ownerGst',
    'frontage', 'buildingType', 'propertyStatus',
    'fitoutPeriod', 'lockinPeriod', 'totalTenure', 'electricalLoad',
    'feePerScreen', 'tokenAmount', 'camCharges', 'municipalTax',
    'registrationCharges', 'disputeResolution', 'legalJurisdiction',
    'additionalTerms', 'sigOwnerDate', 'sigFranchisorName', 'sigFranchisorDate'
  ];

  docFields.forEach(f => {
    const el = $(f);
    if (el) {
      el.addEventListener('input', (e) => {
        state[f] = e.target.value.trim();
      });
    }
  });

  if ($('ownerName')) {
    $('ownerName').addEventListener('input', (e) => {
      state.ownerName = e.target.value.trim();
      state.clientName = state.ownerName;
      state.sigOwnerName = state.ownerName;
      if ($('clientName')) $('clientName').value = state.ownerName;
      if ($('sigOwnerName')) $('sigOwnerName').value = state.ownerName;
    });
  }

  if ($('propertyAddress')) {
    $('propertyAddress').addEventListener('input', (e) => {
      state.propertyAddress = e.target.value.trim();
      state.projectLocation = state.propertyAddress;
      if ($('projectLocation')) $('projectLocation').value = state.propertyAddress;
    });
  }

  if ($('carpetArea')) {
    $('carpetArea').addEventListener('input', (e) => {
      state.carpetAreaDocText = e.target.value.trim();
      const rawNum = parseFloat(e.target.value.replace(/,/g, ''));
      if (!isNaN(rawNum) && rawNum > 0) {
        state.carpetArea = rawNum;
        if ($('carpetAreaInput')) $('carpetAreaInput').value = rawNum;
        const { area, rate, fitoutCost } = calculateFitout();
        const typeLabel = state.cinemaType === 'ultra' ? 'Ultra Luxurious' : 'Premium';
        if ($('dispFitoutCost')) $('dispFitoutCost').textContent = formatInrCurrency(fitoutCost);
        if ($('dispFitoutFormula')) $('dispFitoutFormula').textContent = `${formatInrNumber(area)} sq.ft × ₹${formatInrNumber(rate)}/sq.ft (${typeLabel})`;
        if ($('heroGrandTotal')) $('heroGrandTotal').textContent = shortCurrency(fitoutCost);
        if ($('heroFitoutAndSeats')) $('heroFitoutAndSeats').textContent = `${formatInrNumber(area)} sq.ft × ₹${formatInrNumber(rate)}/sq.ft (${typeLabel})`;
        if ($('capexAmount')) {
          $('capexAmount').value = `${formatInrCurrency(fitoutCost)} + GST`;
          state.capexAmount = $('capexAmount').value;
        }
      }
    });
  }

  if ($('purposeOfUse')) {
    $('purposeOfUse').addEventListener('input', (e) => {
      state.purposeOfUse = e.target.value.trim();
    });
  }

  if ($('capexAmount')) {
    $('capexAmount').addEventListener('input', (e) => {
      state.capexAmount = e.target.value.trim();
    });
  }

  if ($('sigOwnerName')) {
    $('sigOwnerName').addEventListener('input', (e) => {
      state.sigOwnerName = e.target.value.trim();
      state.clientName = state.sigOwnerName;
      state.ownerName = state.sigOwnerName;
      if ($('clientName')) $('clientName').value = state.sigOwnerName;
      if ($('ownerName')) $('ownerName').value = state.sigOwnerName;
    });
  }

  if ($('revenueSharePct')) {
    $('revenueSharePct').addEventListener('input', (e) => {
      state.revenueSharePct = Number(e.target.value) || 25;
      const words = numberToWords(state.revenueSharePct);
      if ($('dispRevenueWords')) $('dispRevenueWords').textContent = words || 'Twenty Five';
    });
  }

  if ($('forceMajeureText')) {
    $('forceMajeureText').addEventListener('input', (e) => {
      state.forceMajeureText = e.target.value;
    });
  }

  // Scope of Work Buttons
  const addScopeBtn = $('addScopeBtn');
  if (addScopeBtn) {
    addScopeBtn.addEventListener('click', () => {
      state.scopeOfWork.push('New custom scope specification as agreed.');
      renderScopeOfWork();
    });
  }

  const resetScopeBtn = $('resetScopeBtn');
  if (resetScopeBtn) {
    resetScopeBtn.addEventListener('click', () => {
      state.scopeOfWork = [...defaultScopeOfWork];
      renderScopeOfWork();
      showToast('Scope of work reset to official 18 points');
    });
  }

  const resetFmBtn = $('resetFmBtn');
  if (resetFmBtn) {
    resetFmBtn.addEventListener('click', () => {
      state.forceMajeureText = defaultForceMajeureText;
      if ($('forceMajeureText')) $('forceMajeureText').value = defaultForceMajeureText;
      showToast('Force Majeure reset to default clauses');
    });
  }

  // Export Buttons
  const exportBtn = $('exportButton');
  if (exportBtn) exportBtn.addEventListener('click', downloadPDF);

  const mainExportBtn = $('mainExportButton');
  if (mainExportBtn) mainExportBtn.addEventListener('click', downloadPDF);

  const mobileExportBtn = $('mobileExportButton');
  if (mobileExportBtn) mobileExportBtn.addEventListener('click', downloadPDF);

  // Signature Upload Event Listeners (Owner & Franchisor)
  const setupSignatureBox = (type) => {
    const isOwner = type === 'owner';
    const box = $(isOwner ? 'sigOwnerBox' : 'sigFranchisorBox');
    const fileInput = $(isOwner ? 'sigOwnerFile' : 'sigFranchisorFile');
    const changeBtn = $(isOwner ? 'sigOwnerChangeBtn' : 'sigFranchisorChangeBtn');
    const removeBtn = $(isOwner ? 'sigOwnerRemoveBtn' : 'sigFranchisorRemoveBtn');

    if (box && fileInput) {
      box.addEventListener('click', () => {
        const currentSig = isOwner ? state.sigOwnerImg : state.sigFranchisorImg;
        if (!currentSig) fileInput.click();
      });

      box.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const currentSig = isOwner ? state.sigOwnerImg : state.sigFranchisorImg;
          if (!currentSig) fileInput.click();
        }
      });
    }

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          handleSignatureFile(e.target.files[0], type);
        }
      });
    }

    if (changeBtn && fileInput) {
      changeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
      });
    }

    if (removeBtn) {
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isOwner) {
          state.sigOwnerImg = null;
        } else {
          state.sigFranchisorImg = null;
        }
        updateSignatureUI(type);
        showToast(`${isOwner ? 'Owner' : 'Franchisor'} signature removed`);
      });
    }
  };

  setupSignatureBox('owner');
  setupSignatureBox('franchisor');

  // Reset Handlers
  const handleReset = () => {
    const today = getTodayFormatted();
    defaultState.datePrepared = today;
    defaultState.sigOwnerDate = today;
    defaultState.sigFranchisorDate = today;
    state = { ...defaultState, scopeOfWork: [...defaultState.scopeOfWork], sigOwnerImg: null, sigFranchisorImg: null };
    syncAllInputsFromState();
    showToast('All fields reset to defaults');
  };

  const resetBtn = $('resetProposalBtn');
  if (resetBtn) resetBtn.addEventListener('click', handleReset);

  const secResetBtn = $('secondaryResetBtn');
  if (secResetBtn) secResetBtn.addEventListener('click', handleReset);

  // Mobile Drawer Handlers
  const mobileMenuBtn = $('mobileMenuBtn');
  const mobileDrawer = $('mobileDrawer');
  const drawerBackdrop = $('drawerBackdrop');
  const closeDrawerBtn = $('closeDrawerBtn');

  if (mobileMenuBtn && mobileDrawer && drawerBackdrop) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileDrawer.classList.add('open');
      drawerBackdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  }

  const closeDrawer = () => {
    if (mobileDrawer) mobileDrawer.classList.remove('open');
    if (drawerBackdrop) drawerBackdrop.classList.remove('open');
    document.body.style.overflow = '';
  };

  if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', closeDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);

  // Logout Handlers
  const handleLogout = () => {
    sessionStorage.removeItem('sanelite_auth');
    sessionStorage.removeItem('sanelite_user');
    window.location.replace('login.html');
  };

  const logoutBtn = $('logoutButton');
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

  const mobileLogoutBtn = $('mobileLogoutButton');
  if (mobileLogoutBtn) mobileLogoutBtn.addEventListener('click', handleLogout);
}

document.addEventListener('DOMContentLoaded', init);

