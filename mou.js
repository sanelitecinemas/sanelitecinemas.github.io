/**
 * Sanelite Cinemas â€” MoU / Term Sheet Logic & Executive Designer PDF Export Engine
 * Natural multi-page flow with balanced margins & padding, zero empty half-pages,
 * zero yellow marks, and full real-time editing of Scope of Work & Other Terms.
 */

// ============================================================
// Default 18 Scope of Work Clauses
// ============================================================
const defaultScopeOfWork = [
  "Completion of all civil works as per final approved Cinema Drawings. (Walls and foyer tiles as per Cinema Requirement)",
  "Construction of fully equipped Ladiesâ€™ & Gentsâ€™ Washrooms as per Cinema design. Detailed drawing will be shared once agreement is signed.",
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
â€¢ Acts of God (such as floods, Covid like situations, lock down, earthquakes, storms, or other natural disasters)
â€¢ Accidents
â€¢ Riots or civil disturbances
â€¢ War or armed conflict
â€¢ Acts of terrorism
â€¢ Epidemics or pandemics
â€¢ Quarantine restrictions
â€¢ Governmental actions, omissions, or changes in laws or regulations
â€¢ National or regional strikes or labour disputes
â€¢ Fire or explosions
â€¢ Shortages or unavailability of essential materials, resources, or energy

In addition, if the cinema operations are disturbed, restricted, or stopped due to any negligence, default, omission, or failure on the part of the Property Owner, including any issue relating to the property or essential services under the Ownerâ€™s responsibility, the Cinema Operator shall not be liable to pay or share any revenue for that month.

The affected party shall notify the other party in writing as soon as reasonably practicable, providing details of the event and the expected duration of the delay. The performance of the affected obligations shall be suspended during the period of the Force Majeure event and shall resume as soon as reasonably possible once the event subsides.`;

// ============================================================
// State Definition & Defaults
// ============================================================
const defaultState = {
  // 1. Property Owner / Franchisee Details
  ownerName: 'Mr. Rajesh Patel',
  ownerCompany: 'Patel Real Estate & Holdings Pvt. Ltd.',
  ownerAddress: '402, Highline Corporate Park, Sindhu Bhavan Road, Bodakdev, Ahmedabad - 380054',
  ownerPan: 'ABCDE1234F',
  ownerGst: '24ABCDE1234F1Z5',

  // 3. Property Details
  carpetArea: '9,000 sq.ft',
  propertyAddress: 'Survey No. 124/2, Near Shell Petrol Pump, Science City Main Road, Sola, Ahmedabad',
  frontage: '65 ft wide clear main-road frontage',
  buildingType: 'Commercial Building / Mall',
  propertyStatus: 'Ready to use',

  // 4. Agreement & Transaction Type
  fitoutPeriod: '100 days',
  lockinPeriod: '9 Years',
  totalTenure: '9 Years + 9 Years',

  // 5. Scope of Work by Property Owner/Franchisee (Editable Array)
  scopeOfWork: [...defaultScopeOfWork],

  // 6. Electrical Load
  electricalLoad: '50 kW',

  // 7. Financials
  feePerScreen: '2.5 lacs/Screen + GST',
  screenCount: 3,
  totalFranchiseeFees: 'â‚¹7.5 Lacs + GST',
  capexAmount: 'â‚¹25 Lacs + GST',
  tokenAmount: '15 lacs.',

  // 7.3 Revenue Share
  revenueSharePct: 25,

  // 8. Other Terms (Editable)
  forceMajeureText: defaultForceMajeureText,
  camCharges: 'Included in the Revenue share.',
  municipalTax: 'To be paid by Property Owner/Franchisor.',
  registrationCharges: 'To be borne equally by both parties',
  disputeResolution: 'Arbitrator from both parties; Location â€“ Ahmedabad',
  legalJurisdiction: 'Ahmedabad Courts',
  additionalTerms: '',

  // 9. Signatures
  sigOwnerName: 'Mr. Rajesh Patel',
  sigOwnerDate: '11 September 2026',
  sigFranchisorName: 'Sanelite Cinemas LLP (Authorized Signatory)',
  sigFranchisorDate: '11 September 2026'
};

// Deep copy for runtime state
let state = {
  ...defaultState,
  scopeOfWork: [...defaultScopeOfWork]
};

// Helper selector
const $ = (id) => document.getElementById(id);

// Number to Words Converter (for percentages 1 - 100)
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

// ============================================================
// UI Data Binding & Scope List Rendering
// ============================================================
function syncInputsFromState() {
  const inputMap = {
    ownerName: state.ownerName,
    ownerCompany: state.ownerCompany,
    ownerAddress: state.ownerAddress,
    ownerPan: state.ownerPan,
    ownerGst: state.ownerGst,
    carpetArea: state.carpetArea,
    propertyAddress: state.propertyAddress,
    frontage: state.frontage,
    buildingType: state.buildingType,
    propertyStatus: state.propertyStatus,
    fitoutPeriod: state.fitoutPeriod,
    lockinPeriod: state.lockinPeriod,
    totalTenure: state.totalTenure,
    electricalLoad: state.electricalLoad,
    feePerScreen: state.feePerScreen,
    screenCount: state.screenCount,
    totalFranchiseeFees: state.totalFranchiseeFees,
    capexAmount: state.capexAmount,
    tokenAmount: state.tokenAmount,
    revenueSharePct: state.revenueSharePct,
    forceMajeureText: state.forceMajeureText,
    camCharges: state.camCharges,
    municipalTax: state.municipalTax,
    registrationCharges: state.registrationCharges,
    disputeResolution: state.disputeResolution,
    legalJurisdiction: state.legalJurisdiction,
    additionalTerms: state.additionalTerms,
    sigOwnerName: state.sigOwnerName,
    sigOwnerDate: state.sigOwnerDate,
    sigFranchisorName: state.sigFranchisorName,
    sigFranchisorDate: state.sigFranchisorDate
  };

  Object.entries(inputMap).forEach(([id, val]) => {
    const el = $(id);
    if (el) el.value = val;
  });

  renderScopeOfWorkList();
  updateCalculatedViews();
}

function updateCalculatedViews() {
  // Update Revenue Share in words
  const words = numberToWords(state.revenueSharePct);
  const dispWords = $('dispRevenueWords');
  if (dispWords) dispWords.textContent = words || 'Twenty Five';

  // Update Hero Card Metrics
  const heroRev = $('heroRevShare');
  if (heroRev) heroRev.textContent = `${state.revenueSharePct}% Net Sales`;

  const heroFit = $('heroFitoutStats');
  if (heroFit) heroFit.textContent = `Fitout ${state.fitoutPeriod} â€¢ ${state.lockinPeriod} Lock-in`;
}

// Render dynamic Section 5 Scope of Work items
function renderScopeOfWorkList() {
  const container = $('scopeOfWorkContainer');
  if (!container) return;

  container.innerHTML = '';
  state.scopeOfWork.forEach((itemText, idx) => {
    const row = document.createElement('div');
    row.className = 'mou-scope-row';
    row.innerHTML = `
      <span class="mou-scope-num">${idx + 1}</span>
      <textarea class="mou-scope-input" data-idx="${idx}" rows="2" placeholder="Describe scope of work item...">${escapeHtml(itemText)}</textarea>
      <button type="button" class="mou-scope-del-btn" data-idx="${idx}" title="Remove this item" aria-label="Remove item ${idx + 1}">âœ•</button>
    `;
    container.appendChild(row);
  });

  // Attach textarea listeners
  container.querySelectorAll('.mou-scope-input').forEach(textarea => {
    textarea.addEventListener('input', (e) => {
      const idx = parseInt(e.target.getAttribute('data-idx'), 10);
      state.scopeOfWork[idx] = e.target.value;
    });
  });

  // Attach delete buttons
  container.querySelectorAll('.mou-scope-del-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
      if (state.scopeOfWork.length <= 1) {
        showToast('At least one scope item is required.');
        return;
      }
      state.scopeOfWork.splice(idx, 1);
      renderScopeOfWorkList();
    });
  });
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Attach input listeners
function initInputListeners() {
  const fields = [
    'ownerName', 'ownerCompany', 'ownerAddress', 'ownerPan', 'ownerGst',
    'carpetArea', 'propertyAddress', 'frontage', 'buildingType', 'propertyStatus',
    'fitoutPeriod', 'lockinPeriod', 'totalTenure', 'electricalLoad',
    'feePerScreen', 'screenCount', 'totalFranchiseeFees', 'capexAmount', 'tokenAmount',
    'revenueSharePct', 'forceMajeureText', 'camCharges', 'municipalTax',
    'registrationCharges', 'disputeResolution', 'legalJurisdiction', 'additionalTerms',
    'sigOwnerName', 'sigOwnerDate', 'sigFranchisorName', 'sigFranchisorDate'
  ];

  fields.forEach(id => {
    const el = $(id);
    if (!el) return;

    el.addEventListener('input', (e) => {
      let val = e.target.value;
      if (id === 'revenueSharePct') {
        state[id] = parseInt(val, 10) || 0;
      } else if (id === 'screenCount') {
        state[id] = parseInt(val, 10) || 0;
      } else {
        state[id] = val;
      }
      updateCalculatedViews();
    });
  });

  // Section 5 Add Scope Item
  const addScopeBtn = $('addScopeBtn');
  if (addScopeBtn) {
    addScopeBtn.addEventListener('click', () => {
      state.scopeOfWork.push('');
      renderScopeOfWorkList();
      const inputs = document.querySelectorAll('.mou-scope-input');
      if (inputs.length > 0) {
        inputs[inputs.length - 1].focus();
      }
    });
  }

  // Section 5 Reset Scope to Default
  const resetScopeBtn = $('resetScopeBtn');
  if (resetScopeBtn) {
    resetScopeBtn.addEventListener('click', () => {
      state.scopeOfWork = [...defaultScopeOfWork];
      renderScopeOfWorkList();
      showToast('Scope of Work reset to standard 18 items');
    });
  }

  // Section 8 Reset Force Majeure
  const resetFmBtn = $('resetFmBtn');
  if (resetFmBtn) {
    resetFmBtn.addEventListener('click', () => {
      state.forceMajeureText = defaultForceMajeureText;
      const el = $('forceMajeureText');
      if (el) el.value = defaultForceMajeureText;
      showToast('Force Majeure text reset to default');
    });
  }

  // Global Reset button
  const resetBtn = $('resetMouBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      state = {
        ...defaultState,
        scopeOfWork: [...defaultScopeOfWork]
      };
      syncInputsFromState();
      showToast('All fields reset to defaults');
    });
  }
}

// ============================================================
// Mobile Navigation & Shell Setup
// ============================================================
const mobileMenuBtn = $('mobileMenuBtn');
const mobileDrawer = $('mobileDrawer');
const drawerBackdrop = $('drawerBackdrop');
const closeDrawerBtn = $('closeDrawerBtn');

function openDrawer() {
  if (mobileDrawer) mobileDrawer.classList.add('open');
  if (drawerBackdrop) drawerBackdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDrawer() {
  if (mobileDrawer) mobileDrawer.classList.remove('open');
  if (drawerBackdrop) drawerBackdrop.classList.remove('open');
  document.body.style.overflow = '';
}

if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openDrawer);
if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', closeDrawer);
if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);

document.querySelectorAll('.drawer-link').forEach(link => {
  link.addEventListener('click', closeDrawer);
});

// Logout Handlers
const handleLogout = () => {
  sessionStorage.removeItem('sanelite_auth');
  sessionStorage.removeItem('sanelite_user');
  window.location.replace('login.html');
};

if ($('logoutButton')) $('logoutButton').addEventListener('click', handleLogout);
if ($('mobileLogoutButton')) $('mobileLogoutButton').addEventListener('click', handleLogout);

// Toast Notification
function showToast(msg) {
  const toast = $('toast');
  if (toast) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2400);
  }
}

// ============================================================
/// PDF Export Engine (Executive Designer 3-Page Sanelite Term Sheet)
// All pages fully filled (zero half-filled pages), subtitle placed
// directly beneath the logo, structured tables, and dual signatures.
// ============================================================
function buildMouPDFDoc() {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    console.error('jsPDF library is not loaded');
    return null;
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

  // Executive Designer Corporate Palette (Matching FOCO & FOFO exactly)
  const cDark = [24, 24, 33];          // #181821 Dark text
  const cMuted = [113, 113, 126];      // #71717e Muted text
  const cAccent = [240, 85, 55];       // #f05537 Brand coral
  const cAccentDark = [201, 61, 37];   // #c93d25 Deep coral highlight
  const cNavy = [21, 40, 64];          // #152840 Deep Brand Navy
  const cGold = [185, 148, 80];        // #b99450 Warm Corporate Gold
  const cLine = [220, 220, 228];       // Divider line
  const cCardBg = [250, 250, 252];     // Normal card fill
  const cCardBorder = [228, 228, 235]; // Normal card border
  const cHighlightBg = [255, 244, 241]; // Warm highlight fill
  const cHighlightBorder = [255, 217, 208]; // Warm highlight border
  const cTableHead = [36, 36, 48];     // Charcoal table head
  const cTableHeadNavy = [21, 40, 64]; // Deep navy table head
  const cTableLine = [225, 225, 235];  // Clean table grid line

  // Dynamic values
  const effectiveOwner = state.ownerName || state.sigOwnerName || 'Mr. Rajesh Patel';
  const effectiveOwnerAddress = state.ownerAddress || '402, Highline Corporate Park, Sindhu Bhavan Road, Bodakdev, Ahmedabad - 380054';
  const effectiveLocation = state.propertyAddress || 'Survey No. 124/2, Near Shell Petrol Pump, Science City Main Road, Sola, Ahmedabad';
  const effectiveDate = state.sigOwnerDate || '11 September 2026';
  const cleanTotalFees = (state.totalFranchiseeFees || 'Rs. 7.5 Lacs + GST').replace(/₹/g, 'Rs. ');
  const cleanCapex = (state.capexAmount || 'Rs. 25 Lacs + GST').replace(/₹/g, 'Rs. ');

  // Footer matching FOCO / FOFO with dual Navy + Gold accent line
  function drawPageFooter(pageNum, totalPages) {
    const footY = pageHeight - 11;
    doc.setDrawColor(...cNavy);
    doc.setLineWidth(0.4);
    doc.line(margin, footY - 2.5, pageWidth - margin, footY - 2.5);

    doc.setDrawColor(...cGold);
    doc.setLineWidth(0.2);
    doc.line(margin, footY - 1.7, pageWidth - margin, footY - 1.7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(...cMuted);
    doc.text(
      'The Obelisk, Opp. Shell Petrol Pump, Science City Road, Sola, Ahmedabad-380060. | Ph: +91 94276 47819 | info@sanelitecinemas.com',
      margin,
      footY + 2.5
    );

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...cNavy);
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin, footY + 2.5, { align: 'right' });
  }

  // Running Header for Pages 2 and 3
  function drawPageRunningHeader(pageNum, sectionTag) {
    if (typeof SANELITE_LOGO !== 'undefined') {
      const logoW = 38;
      const logoH = 8.16; // 38 / 4.656 exact aspect
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
    doc.setTextColor(...cAccentDark);
    doc.text(sectionTag, pageWidth - margin, 20, { align: 'right' });

    doc.setDrawColor(...cLine);
    doc.setLineWidth(0.3);
    doc.line(margin, 22.5, pageWidth - margin, 22.5);
  }

  // ============================================================
  // PAGE 1: Brand Header, Executive Summary Cards, Parties, Specs, Tenure, Power & Financials
  // ============================================================
  if (typeof SANELITE_LOGO !== 'undefined') {
    const logoW = 51.2;
    const logoH = 11;
    doc.addImage(SANELITE_LOGO, 'PNG', margin, 10, logoW, logoH, undefined, 'FAST');
  } else {
    doc.setFillColor(...cAccent);
    doc.roundedRect(margin, 10, 11, 11, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('times', 'bold');
    doc.setFontSize(17);
    doc.text('S', margin + 3.3, 18);

    doc.setTextColor(...cDark);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Sanelite Cinemas', margin + 14, 18);
  }

  // Subtitle directly beneath the logo as requested by user
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...cNavy);
  doc.text('Sanelite Cinemas LLP • Commercial MoU Term Sheet', margin, 25);

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(...cMuted);
  doc.text(`Date: ${effectiveDate}`, pageWidth - margin, 14.5, { align: 'right' });

  // Pill badge
  const badgeText = 'COMMERCIAL MoU FRAMEWORK';
  const badgeW = doc.getTextWidth(badgeText) + 6;
  doc.setFillColor(...cHighlightBg);
  doc.setDrawColor(...cHighlightBorder);
  doc.setLineWidth(0.2);
  doc.roundedRect(pageWidth - margin - badgeW, 17.5, badgeW, 5.5, 1, 1, 'FD');
  doc.setTextColor(...cAccentDark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text(badgeText, pageWidth - margin - (badgeW / 2), 21.3, { align: 'center' });

  doc.setDrawColor(...cLine);
  doc.setLineWidth(0.25);
  doc.line(margin, 27.5, pageWidth - margin, 27.5);

  // 3 Top Executive KPI Cards (Matching FOCO/FOFO exactly)
  const cardY = 30;
  const cardH = 18;
  const gap = 3;
  const cardW = (contentWidth - (gap * 2)) / 3;

  const cards = [
    {
      title: 'ESTIMATED FITOUT CAPEX',
      val: cleanCapex.replace(' + GST', '').trim(),
      sub: `${state.carpetArea || '9,000 sq.ft'} • ${state.screenCount || 3} Screens`,
      highlight: true
    },
    {
      title: 'REVENUE SHARE RATIO',
      val: `${state.revenueSharePct || 25}% / Month*`,
      sub: 'Net Sales (Box Office + F&B, excl. GST)',
      highlight: false
    },
    {
      title: 'AGREEMENT TENURE',
      val: `${state.totalTenure || '9 + 9 Years'}*`,
      sub: `Fitout: ${state.fitoutPeriod || '100 days'} | Lock-in: ${state.lockinPeriod || '9 Years'}`,
      highlight: false
    }
  ];

  cards.forEach((card, idx) => {
    const x = margin + (idx * (cardW + gap));
    doc.setFillColor(...(card.highlight ? cHighlightBg : cCardBg));
    doc.setDrawColor(...(card.highlight ? cHighlightBorder : cCardBorder));
    doc.roundedRect(x, cardY, cardW, cardH, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...(card.highlight ? cAccentDark : cNavy));
    doc.text(card.title, x + 3.5, cardY + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...(card.highlight ? cNavy : (idx === 1 ? cAccentDark : cGold)));
    doc.text(card.val, x + 3.5, cardY + 11.0);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.0);
    doc.setTextColor(...cMuted);
    doc.text(card.sub, x + 3.5, cardY + 15.5);
  });

  // Side-by-Side Tables: Parties to Agreement
  const halfColW = (contentWidth - 4) / 2;
  doc.autoTable({
    startY: cardY + cardH + 3.5,
    margin: { left: margin },
    tableWidth: halfColW,
    head: [['1. PROPERTY OWNER / FRANCHISEE', 'DETAILS']],
    body: [
      ['Name of Entity', effectiveOwner],
      ['Company / Firm', state.ownerCompany || 'Patel Real Estate & Holdings Pvt. Ltd.'],
      ['Postal Address', effectiveOwnerAddress],
      ['PAN & GSTIN', `${state.ownerPan || '–'} / ${state.ownerGst || '–'}`]
    ],
    theme: 'plain',
    headStyles: { fillColor: cTableHead, textColor: [255, 255, 255], fontSize: 6.8, fontStyle: 'bold', cellPadding: 1.6 },
    styles: { fontSize: 6.5, cellPadding: 1.6, minCellHeight: 4.8, lineColor: cTableLine, lineWidth: 0.2 },
    columnStyles: { 0: { fontStyle: 'bold', textColor: [50, 50, 65], cellWidth: 26 }, 1: { textColor: cDark } }
  });

  doc.autoTable({
    startY: cardY + cardH + 3.5,
    margin: { left: margin + halfColW + 4 },
    tableWidth: halfColW,
    head: [['2. FRANCHISOR / CINEMA OPERATOR', 'DETAILS']],
    body: [
      ['Company Name', 'Sanelite Cinemas LLP'],
      ['Corporate Office', 'The Obelisk, Sola, Ahmedabad-380060'],
      ['Corporate Contact', '+91 94276 47819 | info@sanelitecinemas.com'],
      ['PAN & GSTIN', 'AEWFS5463H / 24AEWFS5463H1ZF']
    ],
    theme: 'plain',
    headStyles: { fillColor: cTableHeadNavy, textColor: [255, 255, 255], fontSize: 6.8, fontStyle: 'bold', cellPadding: 1.6 },
    styles: { fontSize: 6.5, cellPadding: 1.6, minCellHeight: 4.8, lineColor: cTableLine, lineWidth: 0.2 },
    columnStyles: { 0: { fontStyle: 'bold', textColor: [50, 50, 65], cellWidth: 26 }, 1: { textColor: cDark } }
  });

  // Section 3: Property Specs
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 3.2,
    margin: { left: margin },
    tableWidth: contentWidth,
    head: [['3. PROPERTY SPECIFICATIONS & CURRENT HANDOVER STATUS', 'SITE PARAMETERS']],
    body: [
      ['Carpet Area Allocated', `${state.carpetArea || '9,000 sq.ft'} (Demarcated cinema hall & foyer footprint)`],
      ['Premises Location & Floor', effectiveLocation],
      ['Road Frontage & Access', state.frontage || '65 ft wide clear main-road frontage with dedicated cinema viewer access'],
      ['Handover Status & Schedule', `${state.propertyStatus || 'Ready to use'} — Bare shell ready for fit-out within 30 days`]
    ],
    theme: 'plain',
    headStyles: { fillColor: cTableHead, textColor: [255, 255, 255], fontSize: 6.8, fontStyle: 'bold', cellPadding: 1.6 },
    styles: { fontSize: 6.5, cellPadding: 1.6, minCellHeight: 4.8, lineColor: cTableLine, lineWidth: 0.2 },
    columnStyles: { 0: { fontStyle: 'bold', textColor: [50, 50, 65], cellWidth: 50 }, 1: { textColor: cDark } }
  });

  // Section 4: Tenure
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 3.2,
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
    styles: { fontSize: 6.5, cellPadding: 1.6, minCellHeight: 4.8, lineColor: cTableLine, lineWidth: 0.2 },
    columnStyles: { 0: { fontStyle: 'bold', textColor: [50, 50, 65], cellWidth: 50 }, 1: { textColor: cDark } }
  });

  // Section 5: Electrical Load (on Page 1)
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 3.2,
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
    styles: { fontSize: 6.5, cellPadding: 1.6, minCellHeight: 4.8, lineColor: cTableLine, lineWidth: 0.2 },
    columnStyles: { 0: { fontStyle: 'bold', textColor: [50, 50, 65], cellWidth: 50 }, 1: { textColor: cDark } }
  });

  // Section 6: Financial Consideration (7.1 & 7.2 on Page 1)
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 3.2,
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
    styles: { fontSize: 6.5, cellPadding: 1.6, minCellHeight: 4.8, lineColor: cTableLine, lineWidth: 0.2 },
    columnStyles: { 0: { fontStyle: 'bold', textColor: [50, 50, 65], cellWidth: 50 }, 1: { textColor: cDark } },
    didParseCell: function(data) {
      if (data.section === 'body' && (data.row.index === 1 || data.row.index === 2)) {
        data.cell.styles.fillColor = cHighlightBg;
        data.cell.styles.textColor = cAccentDark;
        data.cell.styles.fontStyle = 'bold';
      }
    }
  });

  // Preamble Callout Box at bottom of Page 1
  const preambleY = doc.lastAutoTable.finalY + 3.5;
  const preambleH = 22;
  doc.setFillColor(...cCardBg);
  doc.setDrawColor(...cCardBorder);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, preambleY, contentWidth, preambleH, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(...cNavy);
  doc.text('COMMERCIAL PREAMBLE & STATEMENT OF INTENT:', margin + 4, preambleY + 5.0);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.2);
  doc.setTextColor(...cDark);
  const preambleText = 'This Memorandum of Understanding (MoU) establishes the primary mutually agreed terms and commercial framework between Property Owner ("Franchisee") and Sanelite Cinemas LLP ("Franchisor") for establishing, outfitting, licensing, and managing a modern commercial multiplex theater at the above scheduled premises. Both Parties agree to execute definitive long-term lease and operating agreements based on the terms established herein.';
  const splitPreamble = doc.splitTextToSize(preambleText, contentWidth - 8);
  doc.text(splitPreamble, margin + 4, preambleY + 9.5);

  // ============================================================
  // PAGE 2: Scope of Work (18 items), Revenue Share, Net Sales, Force Majeure & Default Protocol
  // ============================================================
  doc.addPage();
  drawPageRunningHeader(2, 'SECTION 7: SCOPE OF WORK, REVENUE SHARE & OPERATING CONDITIONS');

  const scopeItems = (state.scopeOfWork && state.scopeOfWork.length > 0) ? state.scopeOfWork : defaultScopeOfWork;
  const scopeRows = scopeItems.map((item, idx) => {
    const num = (idx + 1) < 10 ? '0' + (idx + 1) : '' + (idx + 1);
    return [num, item];
  });

  doc.autoTable({
    startY: 25.5,
    margin: { left: margin },
    tableWidth: contentWidth,
    head: [['#', '7. SCOPE OF WORK BY PROPERTY OWNER / FRANCHISEE']],
    body: scopeRows,
    theme: 'plain',
    headStyles: { fillColor: cTableHeadNavy, textColor: [255, 255, 255], fontSize: 7.0, fontStyle: 'bold', cellPadding: 1.4 },
    styles: { fontSize: 6.5, cellPadding: 1.35, minCellHeight: 4.5, lineColor: cTableLine, lineWidth: 0.2 },
    columnStyles: { 0: { fontStyle: 'bold', textColor: cAccentDark, cellWidth: 8, halign: 'center' }, 1: { textColor: cDark, cellWidth: contentWidth - 8 } },
    alternateRowStyles: { fillColor: [252, 253, 255] }
  });

  // Section 8: Commercial Revenue Share Framework
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 3.2,
    margin: { left: margin },
    tableWidth: contentWidth,
    head: [['8. COMMERCIAL REVENUE SHARE FRAMEWORK', 'SHARE RATIO & AUDIT SPECIFICATION']],
    body: [
      ['Revenue Share Percentage', `${state.revenueSharePct || 25}% of monthly consolidated Net Sales (Box Office + F&B)`],
      ['Cinema Operator Share', `${100 - (state.revenueSharePct || 25)}% of monthly consolidated Net Sales`],
      ['Settlement & Payment Cycle', 'Monthly payout disbursed within 7 business days following month-end close'],
      ['Applicable Revenue Streams', 'Consolidated Net Box Office Ticket Sales + Net F&B (Food & Beverage) Revenues']
    ],
    theme: 'plain',
    headStyles: { fillColor: cTableHead, textColor: [255, 255, 255], fontSize: 7.0, fontStyle: 'bold', cellPadding: 1.6 },
    styles: { fontSize: 6.6, cellPadding: 1.6, minCellHeight: 4.8, lineColor: cTableLine, lineWidth: 0.2 },
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
  const netSalesY = doc.lastAutoTable.finalY + 3.2;
  const netSalesH = 19;
  doc.setFillColor(...cCardBg);
  doc.setDrawColor(...cCardBorder);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, netSalesY, contentWidth, netSalesH, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.0);
  doc.setTextColor(...cNavy);
  doc.text('DEFINITION OF AUDITED "NET SALES":', margin + 4, netSalesY + 5.0);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.4);
  doc.setTextColor(...cDark);
  const netSalesText = '"Net Sales" means total revenue generated from the sale of cinema admission tickets (Box Office) and total sales of food and beverages (F&B Concessions) at the premises, after deducting applicable Goods and Services Tax (GST) and official government entertainment levies. Revenue share is disbursed monthly to Property Owner\'s nominated bank account.';
  const splitNet = doc.splitTextToSize(netSalesText, contentWidth - 8);
  doc.text(splitNet, margin + 4, netSalesY + 9.5);

  // Section 9: Force Majeure 2-Column Table
  doc.autoTable({
    startY: netSalesY + netSalesH + 3.2,
    margin: { left: margin },
    tableWidth: contentWidth,
    head: [['9. FORCE MAJEURE & SUSPENSION PROTOCOL (COLUMN A)', '9. FORCE MAJEURE & SUSPENSION PROTOCOL (COLUMN B)']],
    body: [
      ['• Acts of God (floods, earthquakes, severe storms, natural calamities)', '• Quarantine, localized lockdown, or administrative restrictions'],
      ['• Pandemics, epidemics, or Covid-like public health crises', '• Governmental orders, statutory acts, or legislative prohibitions'],
      ['• Accidents, structural emergencies, or major infrastructural failure', '• National or regional strikes, civil unrest, or widespread labor disputes'],
      ['• War, armed invasion, acts of foreign enemies, military hostilities', '• Critical shortage or complete grid cutoff of energy, fuel, or water']
    ],
    theme: 'plain',
    headStyles: { fillColor: cTableHead, textColor: [255, 255, 255], fontSize: 7.0, fontStyle: 'bold', cellPadding: 1.6 },
    styles: { fontSize: 6.5, cellPadding: 1.5, minCellHeight: 4.6, lineColor: cTableLine, lineWidth: 0.2 },
    columnStyles: { 0: { textColor: cDark, cellWidth: contentWidth / 2 }, 1: { textColor: cDark, cellWidth: contentWidth / 2 } }
  });

  // Operations Interruption Box at bottom of Page 2
  const intY = doc.lastAutoTable.finalY + 3.2;
  const intH = 20;
  doc.setFillColor(255, 246, 244);
  doc.setDrawColor(...cHighlightBorder);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, intY, contentWidth, intH, 1.5, 1.5, 'FD');

  doc.setFillColor(...cAccentDark);
  doc.roundedRect(margin, intY, 3, intH, 0.8, 0.8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.0);
  doc.setTextColor(...cAccentDark);
  doc.text('OPERATIONS INTERRUPTION & PROPERTY OWNER DEFAULT PROTOCOL:', margin + 6, intY + 5.2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.3);
  doc.setTextColor(...cDark);
  const intText = 'If cinema operations are disturbed, restricted, or stopped due to any negligence, default, omission, or structural/utility failure on the part of the Property Owner (including power outage, lift failure, water stoppage, or lack of statutory building approvals), the Cinema Operator shall not be liable to pay or share any revenue for that affected period.';
  const splitInt = doc.splitTextToSize(intText, contentWidth - 10);
  doc.text(splitInt, margin + 6, intY + 9.8);

  // ============================================================
  // PAGE 3: Statutory Governance, Dual Signatures & Formal Witnesses
  // ============================================================
  doc.addPage();
  drawPageRunningHeader(3, 'SECTION 10 & 11: STATUTORY GOVERNANCE & FORMAL DUAL EXECUTION');

  // Section 10: Statutory Taxes & Legal Governance Table (7 Comprehensive Items)
  doc.autoTable({
    startY: 25.5,
    margin: { left: margin },
    tableWidth: contentWidth,
    head: [['10. STATUTORY TAXES, COMPLIANCE & LEGAL GOVERNANCE', 'CONTRACTUAL OBLIGATIONS & JURISDICTION']],
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
    headStyles: { fillColor: cTableHead, textColor: [255, 255, 255], fontSize: 7.2, fontStyle: 'bold', cellPadding: 2.0 },
    styles: { fontSize: 6.8, cellPadding: 2.0, minCellHeight: 5.4, lineColor: cTableLine, lineWidth: 0.2 },
    columnStyles: { 0: { fontStyle: 'bold', textColor: [50, 50, 65], cellWidth: 54 }, 1: { textColor: cDark } }
  });

  // Section 11: Operational Undertakings & Site Access Covenants
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 4.0,
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
    headStyles: { fillColor: cTableHeadNavy, textColor: [255, 255, 255], fontSize: 7.2, fontStyle: 'bold', cellPadding: 2.0 },
    styles: { fontSize: 6.8, cellPadding: 1.9, minCellHeight: 5.2, lineColor: cTableLine, lineWidth: 0.2 },
    columnStyles: { 0: { fontStyle: 'bold', textColor: [50, 50, 65], cellWidth: 54 }, 1: { textColor: cDark } }
  });

  // Dual Signatures Block
  const sigBoxesY = doc.lastAutoTable.finalY + 5.0;
  const sigBoxW = (contentWidth - 6) / 2;
  const sigBoxH = 60;

  // Box 1: Property Owner
  doc.setFillColor(...cCardBg);
  doc.setDrawColor(...cCardBorder);
  doc.setLineWidth(0.35);
  doc.roundedRect(margin, sigBoxesY, sigBoxW, sigBoxH, 1.5, 1.5, 'FD');

  doc.setFillColor(...cTableHead);
  doc.roundedRect(margin, sigBoxesY, sigBoxW, 7.5, 1.5, 1.5, 'F');
  doc.rect(margin, sigBoxesY + 5.5, sigBoxW, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(255, 255, 255);
  doc.text('FOR PROPERTY OWNER / FRANCHISEE', margin + 4, sigBoxesY + 5.2);

  // If owner signature image is attached, embed it
  if (state.sigOwnerImg && state.sigOwnerImg.dataUrl) {
    try {
      const maxW = 50;
      const maxH = 16;
      const aspect = state.sigOwnerImg.aspect || (state.sigOwnerImg.width / state.sigOwnerImg.height) || 2.5;
      let drawW = maxW;
      let drawH = drawW / aspect;
      if (drawH > maxH) {
        drawH = maxH;
        drawW = drawH * aspect;
      }
      const drawX = margin + ((sigBoxW - drawW) / 2);
      const drawY = sigBoxesY + 9 + ((18 - drawH) / 2);
      const fmt = state.sigOwnerImg.format || 'PNG';
      doc.addImage(state.sigOwnerImg.dataUrl, fmt, drawX, drawY, drawW, drawH, undefined, 'FAST');
    } catch (sigErr) {
      console.warn('Could not add owner signature to PDF:', sigErr);
    }
  }

  // Signature placeholder line
  doc.setDrawColor(200, 205, 215);
  doc.setLineWidth(0.3);
  doc.line(margin + 5, sigBoxesY + 28, margin + sigBoxW - 5, sigBoxesY + 28);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.2);
  doc.setTextColor(...cMuted);
  doc.text('Authorized Signatory & Official Stamp', margin + (sigBoxW / 2), sigBoxesY + 32.0, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.0);
  doc.setTextColor(...cNavy);
  doc.text('Name: ', margin + 5, sigBoxesY + 40.0);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...cDark);
  doc.text(effectiveOwner, margin + 17, sigBoxesY + 40.0);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...cNavy);
  doc.text('Title: ', margin + 5, sigBoxesY + 46.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...cDark);
  doc.text('Property Owner / Authorized Signatory', margin + 17, sigBoxesY + 46.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...cNavy);
  doc.text('Date: ', margin + 5, sigBoxesY + 53.0);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...cDark);
  doc.text(effectiveDate, margin + 17, sigBoxesY + 53.0);

  // Box 2: Franchisor
  const c2SigX = margin + sigBoxW + 6;
  doc.setFillColor(...cCardBg);
  doc.setDrawColor(...cCardBorder);
  doc.setLineWidth(0.35);
  doc.roundedRect(c2SigX, sigBoxesY, sigBoxW, sigBoxH, 1.5, 1.5, 'FD');

  doc.setFillColor(...cTableHeadNavy);
  doc.roundedRect(c2SigX, sigBoxesY, sigBoxW, 7.5, 1.5, 1.5, 'F');
  doc.rect(c2SigX, sigBoxesY + 5.5, sigBoxW, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(255, 255, 255);
  doc.text('FOR SANELITE CINEMAS LLP (FRANCHISOR)', c2SigX + 4, sigBoxesY + 5.2);

  // If franchisor signature image is attached, embed it
  if (state.sigFranchisorImg && state.sigFranchisorImg.dataUrl) {
    try {
      const maxW = 50;
      const maxH = 16;
      const aspect = state.sigFranchisorImg.aspect || (state.sigFranchisorImg.width / state.sigFranchisorImg.height) || 2.5;
      let drawW = maxW;
      let drawH = drawW / aspect;
      if (drawH > maxH) {
        drawH = maxH;
        drawW = drawH * aspect;
      }
      const drawX = c2SigX + ((sigBoxW - drawW) / 2);
      const drawY = sigBoxesY + 9 + ((18 - drawH) / 2);
      const fmt = state.sigFranchisorImg.format || 'PNG';
      doc.addImage(state.sigFranchisorImg.dataUrl, fmt, drawX, drawY, drawW, drawH, undefined, 'FAST');
    } catch (sigErr) {
      console.warn('Could not add franchisor signature to PDF:', sigErr);
    }
  }

  doc.setDrawColor(200, 205, 215);
  doc.setLineWidth(0.3);
  doc.line(c2SigX + 5, sigBoxesY + 28, c2SigX + sigBoxW - 5, sigBoxesY + 28);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.2);
  doc.setTextColor(...cMuted);
  doc.text('Authorized Signatory & Official Stamp', c2SigX + (sigBoxW / 2), sigBoxesY + 32.0, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.0);
  doc.setTextColor(...cNavy);
  doc.text('Name: ', c2SigX + 5, sigBoxesY + 40.0);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...cDark);
  doc.text(state.sigFranchisorName || 'Sanelite Cinemas LLP', c2SigX + 17, sigBoxesY + 40.0);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...cNavy);
  doc.text('Title: ', c2SigX + 5, sigBoxesY + 46.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...cDark);
  doc.text('Designated Partner / Authorized Signatory', c2SigX + 17, sigBoxesY + 46.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...cNavy);
  doc.text('Date: ', c2SigX + 5, sigBoxesY + 53.0);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...cDark);
  doc.text(effectiveDate, c2SigX + 17, sigBoxesY + 53.0);

  // Witness Box below signatures to completely fill Page 3
  const witY = sigBoxesY + sigBoxH + 4.5;
  const witH = 30;
  doc.setFillColor(...cCardBg);
  doc.setDrawColor(...cCardBorder);
  doc.roundedRect(margin, witY, contentWidth, witH, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.0);
  doc.setTextColor(...cNavy);
  doc.text('IN THE PRESENCE OF FORMAL WITNESSES (DUAL ATTESTATION):', margin + 4, witY + 5.5);

  const witColW = (contentWidth - 8) / 2;
  // Witness 1
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...cDark);
  doc.text('1. Witness for Property Owner / Franchisee:', margin + 4, witY + 11.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Name: _______________________  Signature: _______________________', margin + 4, witY + 18.0);
  doc.text('Address: _____________________________________________________', margin + 4, witY + 24.0);

  // Witness 2
  const wit2X = margin + witColW + 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...cDark);
  doc.text('2. Witness for Sanelite Cinemas LLP:', wit2X, witY + 11.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Name: _______________________  Signature: _______________________', wit2X, witY + 18.0);
  doc.text('Address: _____________________________________________________', wit2X, witY + 24.0);

  // Two-pass dynamic page footer numbering across all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawPageFooter(i, totalPages);
  }

  return doc;
}

function downloadMouPDF() {
  const doc = buildMouPDFDoc();
  if (!doc) {
    showToast('Failed to generate Designer PDF');
    return;
  }
  doc.save('sanelite-cinemas-mou-termsheet.pdf');
}

// Export button event listeners
if ($('exportButton')) {
  $('exportButton').addEventListener('click', () => {
    downloadMouPDF();
    showToast('Designer MoU PDF downloaded');
  });
}

if ($('mobileExportButton')) {
  $('mobileExportButton').addEventListener('click', () => {
    downloadMouPDF();
    showToast('Designer MoU PDF downloaded');
  });
}

// Expose globals for automated test runners
window.mouState = state;
window.buildMouPDFDoc = buildMouPDFDoc;
window.downloadMouPDF = downloadMouPDF;
window.defaultScopeOfWork = defaultScopeOfWork;

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  syncInputsFromState();
  initInputListeners();
});
