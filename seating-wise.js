/**
 * Sanelite Cinemas — Screen-Wise Seating Proposal & MoU Term Sheet Engine
 * Real-time synchronization:
 * - Dynamic Screen-by-Screen Seating Table (Screens, Formats, Seats, Rate/seat with 18% GST)
 * - Automatically synchronizes into the attached full official MoU Term Sheet:
 *   - Section 3: Seating Capacity across Screens
 *   - Section 7.1: Screen Count & Franchisee Fees (₹2.5L/screen + GST)
 *   - Section 7.2: Capex (Total Screen Seating Capex incl. GST)
 * - Real-time editable Scope of Work (18 items), Force Majeure, and commercial terms.
 * - Interactive Agreement Date Picker with dynamic current date default.
 * - Dual digital signature upload from PC with live preview.
 * - Exports the official balanced 3-page Designer MoU Term Sheet PDF with Seating Schedule.
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

// Default State (Front-end Seating Table Inputs + Attached Document Preview Defaults)
const defaultState = {
  // Proposal Header (Client & Project Info)
  clientName: '',
  projectLocation: '',
  datePrepared: getTodayFormatted(),

  // Section 1: Screen-by-Screen Seating Table
  rows: [
    { screen: '1', format: 'Push Back & Lounger', seats: 200, rate: 80000 },
    { screen: '2', format: 'Couple Seats', seats: 50, rate: 120000 },
    { screen: '3', format: 'Push Back & Lounger', seats: 0, rate: 0 },
    { screen: '4', format: 'Recliner', seats: 40, rate: 135000 }
  ],

  // Attached Document: 1. Property Owner / Franchisee Details (Blank by default)
  ownerName: '',
  ownerCompany: '',
  ownerAddress: '',
  ownerPan: '',
  ownerGst: '',

  // 2. Franchisor Details
  franchisorName: 'Sanelite Cinemas LLP',
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
  sigFranchisorImg: null   // { dataUrl, name, width, height, aspect, format }
};

let state = JSON.parse(JSON.stringify(defaultState));

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

// Seating Calculation Engine
function calculate() {
  let totalSeats = 0;
  let totalAmount = 0;
  let totalGst = 0;
  let totalSeating = 0;

  const calculatedRows = state.rows.map(row => {
    const seats = Number(row.seats) || 0;
    const rate = Number(row.rate) || 0;
    const amount = seats * rate;
    const gst = Math.round(amount * 0.18);
    const total = amount + gst;

    totalSeats += seats;
    totalAmount += amount;
    totalGst += gst;
    totalSeating += total;

    return { ...row, seats, rate, amount, gst, total };
  });

  return {
    rows: calculatedRows,
    totalScreens: state.rows.length,
    totalSeats,
    totalAmount,
    totalGst,
    totalSeating
  };
}

// Synchronize Seating Calculation to Attached Document & Hero Card
function syncSeatingToDocument() {
  const calc = calculate();

  // 1. Update Table Footers (matching screenshot: blank seats cell, bold amounts)
  if ($('totalSeatsCell')) $('totalSeatsCell').textContent = '';
  if ($('totalAmountCell')) $('totalAmountCell').textContent = formatInrNumber(calc.totalAmount);
  if ($('totalGstCell')) $('totalGstCell').textContent = formatInrNumber(calc.totalGst);
  if ($('totalGrandCell')) $('totalGrandCell').textContent = formatInrNumber(calc.totalSeating);

  // 2. Update Hero Investment Card
  if ($('heroGrandTotal')) $('heroGrandTotal').textContent = shortCurrency(calc.totalSeating);
  if ($('heroFitoutAndSeats')) {
    $('heroFitoutAndSeats').textContent = `${formatInrNumber(calc.totalSeats)} Total Seats across ${calc.totalScreens} Screen${calc.totalScreens > 1 ? 's' : ''} (incl. 18% GST)`;
  }

  // 3. SYNCHRONIZE INTO ATTACHED DOCUMENT PREVIEW
  // Section 3: Auditorium & Seating Capacity
  const docSeatingCap = $('seatingCapacity');
  if (docSeatingCap) {
    docSeatingCap.value = `${formatInrNumber(calc.totalSeats)} Seats across ${calc.totalScreens} Screen${calc.totalScreens > 1 ? 's' : ''}`;
  }

  // Section 7.1: Screen Count & Franchisee Fees
  const docScreens = $('screenCount');
  if (docScreens) {
    docScreens.value = calc.totalScreens;
  }

  const docTotalFees = $('totalFranchiseeFees');
  if (docTotalFees) {
    const feeStr = `₹${(calc.totalScreens * 2.5).toFixed(1)} Lacs + GST`;
    docTotalFees.value = feeStr;
    state.totalFranchiseeFees = feeStr;
  }

  // Section 7.2: Capex (Screen Seating & Civil Capex)
  const docCapex = $('capexAmount');
  if (docCapex) {
    const capexStr = `${formatInrCurrency(calc.totalSeating)} + GST`;
    docCapex.value = capexStr;
    state.capexAmount = capexStr;
  }
}

// Render Screen-Wise Seating Table Rows
function renderTable() {
  const calc = calculate();
  const tbody = $('seatingTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';

  calc.rows.forEach((row, idx) => {
    const tr = document.createElement('tr');

    const seatsDisplay = row.seats > 0 ? formatInrNumber(row.seats) : '-';
    const rateDisplay = row.rate > 0 ? formatInrNumber(row.rate) : '';
    const amountDisplay = row.amount > 0 ? formatInrNumber(row.amount) : '-';
    const gstDisplay = row.gst > 0 ? formatInrNumber(row.gst) : '-';
    const totalDisplay = row.total > 0 ? formatInrNumber(row.total) : '-';

    const seatsAlign = row.seats > 0 ? 'right' : 'center';
    const amtAlign = row.amount > 0 ? 'right' : 'center';
    const gstAlign = row.gst > 0 ? 'right' : 'center';
    const totAlign = row.total > 0 ? 'right' : 'center';

    tr.innerHTML = `
      <td class="cell-center">
        <input type="text" class="row-screen" data-idx="${idx}" value="${row.screen}" style="text-align:center; font-weight:700; width:100%;" />
      </td>
      <td style="text-align:left;">
        <input type="text" class="row-format" data-idx="${idx}" value="${row.format}" list="formatOptions" style="text-align:left; width:100%; font-weight:550;" />
      </td>
      <td>
        <input type="text" inputmode="numeric" class="row-seats" data-idx="${idx}" value="${seatsDisplay}" placeholder="-" style="text-align:${seatsAlign}; font-weight:600; width:100%;" />
      </td>
      <td>
        <input type="text" inputmode="numeric" class="row-rate rate-input-yellow" data-idx="${idx}" value="${rateDisplay}" placeholder="" style="text-align:right; width:100%;" />
      </td>
      <td class="cell-numeric" id="rowAmount_${idx}" style="text-align:${amtAlign};">${amountDisplay}</td>
      <td class="cell-numeric" id="rowGst_${idx}" style="text-align:${gstAlign};">${gstDisplay}</td>
      <td class="cell-numeric" id="rowTotal_${idx}" style="font-weight:750; color: #152840; text-align:${totAlign};">${totalDisplay}</td>
      <td class="cell-center">
        <button type="button" class="seating-btn-delete" data-idx="${idx}" title="Delete Screen" aria-label="Delete Screen">✕</button>
      </td>
    `;

    tbody.appendChild(tr);
  });

  // Attach Table Input Listeners
  tbody.querySelectorAll('.row-screen').forEach(input => {
    input.addEventListener('input', (e) => {
      const idx = Number(e.target.getAttribute('data-idx'));
      state.rows[idx].screen = e.target.value;
    });
  });

  tbody.querySelectorAll('.row-format').forEach(input => {
    input.addEventListener('input', (e) => {
      const idx = Number(e.target.getAttribute('data-idx'));
      state.rows[idx].format = e.target.value;
    });
  });

  tbody.querySelectorAll('.row-seats').forEach(input => {
    input.addEventListener('focus', (e) => {
      if (e.target.value === '-') {
        e.target.value = '';
      } else {
        e.target.select();
      }
    });
    input.addEventListener('input', (e) => {
      const idx = Number(e.target.getAttribute('data-idx'));
      const raw = e.target.value.replace(/[^0-9]/g, '');
      state.rows[idx].seats = raw ? Number(raw) : 0;
      updateRowCalculation(idx);
      syncSeatingToDocument();
    });
    input.addEventListener('blur', (e) => {
      const idx = Number(e.target.getAttribute('data-idx'));
      const seats = state.rows[idx].seats;
      if (seats > 0) {
        e.target.value = formatInrNumber(seats);
        e.target.style.textAlign = 'right';
      } else {
        e.target.value = '-';
        e.target.style.textAlign = 'center';
      }
    });
  });

  tbody.querySelectorAll('.row-rate').forEach(input => {
    input.addEventListener('focus', (e) => {
      const raw = e.target.value.replace(/,/g, '');
      e.target.value = raw;
      e.target.select();
    });
    input.addEventListener('input', (e) => {
      const idx = Number(e.target.getAttribute('data-idx'));
      const raw = e.target.value.replace(/[^0-9]/g, '');
      state.rows[idx].rate = raw ? Number(raw) : 0;
      updateRowCalculation(idx);
      syncSeatingToDocument();
    });
    input.addEventListener('blur', (e) => {
      const idx = Number(e.target.getAttribute('data-idx'));
      const rate = state.rows[idx].rate;
      if (rate > 0) {
        e.target.value = formatInrNumber(rate);
      } else {
        e.target.value = '';
      }
    });
  });

  tbody.querySelectorAll('.seating-btn-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = Number(e.currentTarget.getAttribute('data-idx'));
      if (state.rows.length <= 1) {
        alert('At least one screen row is required.');
        return;
      }
      state.rows.splice(idx, 1);
      renderTable();
      syncSeatingToDocument();
    });
  });

  syncSeatingToDocument();
}

function updateRowCalculation(idx) {
  const row = state.rows[idx];
  const seats = Number(row.seats) || 0;
  const rate = Number(row.rate) || 0;
  const amount = seats * rate;
  const gst = Math.round(amount * 0.18);
  const total = amount + gst;

  const amtEl = $(`rowAmount_${idx}`);
  const gstEl = $(`rowGst_${idx}`);
  const totEl = $(`rowTotal_${idx}`);

  if (amtEl) {
    amtEl.textContent = amount > 0 ? formatInrNumber(amount) : '-';
    amtEl.style.textAlign = amount > 0 ? 'right' : 'center';
  }
  if (gstEl) {
    gstEl.textContent = gst > 0 ? formatInrNumber(gst) : '-';
    gstEl.style.textAlign = gst > 0 ? 'right' : 'center';
  }
  if (totEl) {
    totEl.textContent = total > 0 ? formatInrNumber(total) : '-';
    totEl.style.textAlign = total > 0 ? 'right' : 'center';
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
  if ($('mouDatePicker')) $('mouDatePicker').value = getIsoFromFormatted(state.datePrepared);
  if ($('dispDateFormatted')) $('dispDateFormatted').textContent = state.datePrepared || getTodayFormatted();

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

  renderTable();
  renderScopeOfWork();
  updateSignatureUI('owner');
  updateSignatureUI('franchisor');
}

// Read All Inputs into State
function updateStateFromInputs() {
  // Proposal Header
  if ($('clientName')) state.clientName = $('clientName').value.trim();
  if ($('projectLocation')) state.projectLocation = $('projectLocation').value.trim();
  if ($('mouDatePicker') && $('mouDatePicker').value) {
    state.datePrepared = formatDateFromIso($('mouDatePicker').value);
  }

  // Attached Document
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
// Featuring Screen-by-Screen Seating Table Schedule on Page 3
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

  // Executive Designer Corporate Palette
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

  // Dynamic calculation values
  const calc = calculate();
  const effectiveOwner = state.ownerName || state.clientName || '–';
  const effectiveOwnerAddress = state.ownerAddress || state.projectLocation || '–';
  const effectiveLocation = state.propertyAddress || state.projectLocation || 'Survey No. 124/2, Near Shell Petrol Pump, Science City Main Road, Sola, Ahmedabad';
  const effectiveDate = state.datePrepared || getTodayFormatted();
  const cleanTotalFees = `Rs. ${(calc.totalScreens * 2.5).toFixed(1)} Lacs + GST`;
  const cleanCapex = `Rs. ${formatInrNumber(calc.totalSeating)} (incl. 18% GST)`;
  const corporateAddress = '3rd floor, The Obelisk, Opp. Shell Petrol Pump, Science City Road, Sola, Ahmedabad-380060';

  // Footer: Address ONLY on left, Page X of Y on right
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

  // Left Side: Brand Subtitle
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.4);
  doc.setTextColor(...cNavy);
  doc.text('Sanelite Cinemas LLP • Commercial MoU Term Sheet (Seating Wise)', margin, 23.5);

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

  // Header Divider Line
  doc.setDrawColor(...cAccent);
  doc.setLineWidth(0.35);
  doc.line(margin, 27.5, margin + 35, 27.5);

  doc.setDrawColor(...cLine);
  doc.setLineWidth(0.25);
  doc.line(margin + 37, 27.5, pageWidth - margin, 27.5);

  // Side-by-Side Tables: Parties to Agreement
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

  // Section 3: Property Specs (Seating Capacity across screens)
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 2.8,
    margin: { left: margin },
    tableWidth: contentWidth,
    head: [['3. PROPERTY SPECIFICATIONS & CURRENT HANDOVER STATUS', 'SITE PARAMETERS']],
    body: [
      ['Commercial Purpose of Use', state.purposeOfUse || 'Miniplex / Multiplex / Cinema / Entertainment'],
      ['Auditorium & Seating Capacity', `${calc.totalSeats} Total Seats across ${calc.totalScreens} Screens (Demarcated Cinema Footprint)`],
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

  // Section 5: Electrical Load
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

  // Section 6: Financial Consideration (Seating Capex & Franchisee Fees)
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 2.8,
    margin: { left: margin },
    tableWidth: contentWidth,
    head: [['6. FINANCIAL CONSIDERATION & INVESTMENT SUMMARY', 'COMMERCIAL TERMS']],
    body: [
      ['6.1 Franchisee Fee per Screen', `${state.feePerScreen || 'Rs. 2.50 Lacs / Screen'} + applicable GST`],
      ['Total Franchisee Onboarding Fees', cleanTotalFees],
      ['6.2 Screen Seating & Civil Capex', cleanCapex],
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

  // Section 7: Commercial Revenue Share Framework
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
  // PAGE 3: Section 11 Seating Table Schedule, Section 12 Covenants, Dual Signatures & Witnesses
  // ============================================================
  doc.addPage();
  drawPageRunningHeader(3, 'SECTION 11 & 12: SEATING SCHEDULE, EXECUTION & ATTESTATION');

  // Section 11: Screen-by-Screen Seating Schedule Table
  const seatingTableBody = calc.rows.map(row => [
    row.screen,
    row.format,
    row.seats > 0 ? formatInrNumber(row.seats) : '—',
    row.rate > 0 ? `Rs. ${formatInrNumber(row.rate)}` : '',
    row.amount > 0 ? `Rs. ${formatInrNumber(row.amount)}` : '—',
    row.gst > 0 ? `Rs. ${formatInrNumber(row.gst)}` : '—',
    row.total > 0 ? `Rs. ${formatInrNumber(row.total)}` : '—'
  ]);

  const seatingTableFoot = [[
    'Grand Total',
    '',
    '',
    '',
    `Rs. ${formatInrNumber(calc.totalAmount)}`,
    `Rs. ${formatInrNumber(calc.totalGst)}`,
    `Rs. ${formatInrNumber(calc.totalSeating)}`
  ]];

  doc.autoTable({
    startY: 25.5,
    margin: { left: margin },
    tableWidth: contentWidth,
    head: [['SCREEN', 'SEATING FORMAT', 'NO. OF SEATS', 'RATE PER SEAT (RS.)', 'AMOUNT (RS.)', 'GST @ 18% (RS.)', 'TOTAL (RS.)']],
    body: seatingTableBody,
    foot: seatingTableFoot,
    theme: 'plain',
    headStyles: { fillColor: cTableHeadNavy, textColor: [255, 255, 255], fontSize: 6.5, fontStyle: 'bold', cellPadding: 1.4, halign: 'right' },
    styles: { fontSize: 6.2, cellPadding: 1.3, minCellHeight: 4.4, lineColor: cTableLine, lineWidth: 0.18, halign: 'right' },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: cDark, halign: 'center', cellWidth: 16 },
      1: { textColor: cDark, halign: 'left', cellWidth: 38 },
      2: { textColor: cDark, cellWidth: 20 },
      3: { textColor: [0, 34, 204], cellWidth: 28 },
      4: { textColor: cDark, cellWidth: 27 },
      5: { textColor: cDark, cellWidth: 25 },
      6: { fontStyle: 'bold', textColor: [20, 20, 20], cellWidth: 28 }
    },
    footStyles: { fillColor: [245, 238, 221], textColor: [20, 20, 20], fontStyle: 'bold', fontSize: 6.6, cellPadding: 1.6, halign: 'right' },
    didParseCell: function(data) {
      if (data.section === 'head' && (data.column.index === 0 || data.column.index === 1)) {
        data.cell.styles.halign = data.column.index === 0 ? 'center' : 'left';
      }
      if (data.section === 'body') {
        if (data.cell.raw === '—' || data.cell.raw === '') {
          data.cell.styles.halign = 'center';
        }
        if (data.column.index === 3) {
          data.cell.styles.fillColor = [255, 255, 200];
          data.cell.styles.textColor = [0, 34, 204];
          data.cell.styles.fontStyle = 'bold';
        }
      }
      if (data.section === 'foot' && data.column.index === 0) {
        data.cell.styles.halign = 'left';
      }
    }
  });

  // Section 12: Definitive Execution & Commercial Covenants
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 2.8,
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
    headStyles: { fillColor: cTableHead, textColor: [255, 255, 255], fontSize: 6.8, fontStyle: 'bold', cellPadding: 1.6 },
    styles: { fontSize: 6.3, cellPadding: 1.4, minCellHeight: 4.4, lineColor: cTableLine, lineWidth: 0.18 },
    columnStyles: { 0: { fontStyle: 'bold', textColor: [50, 50, 65], cellWidth: 54 }, 1: { textColor: cDark } }
  });

  // Dual Signatures Block
  const sigBoxesY = doc.lastAutoTable.finalY + 3.8;
  const sigBoxW = (contentWidth - 6) / 2;
  const sigBoxH = 54;

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
  doc.text('Name: ', margin + 5, sigBoxesY + 35.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...cDark);
  doc.text(effectiveOwner, margin + 17, sigBoxesY + 35.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...cNavy);
  doc.text('Title: ', margin + 5, sigBoxesY + 41.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...cDark);
  doc.text('Property Owner / Authorized Signatory', margin + 17, sigBoxesY + 41.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...cNavy);
  doc.text('Date: ', margin + 5, sigBoxesY + 47.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...cDark);
  doc.text(effectiveDate, margin + 17, sigBoxesY + 47.5);

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
  doc.text('Name: ', c2SigX + 5, sigBoxesY + 35.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...cDark);
  doc.text(state.sigFranchisorName || 'Sanelite Cinemas LLP', c2SigX + 17, sigBoxesY + 35.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...cNavy);
  doc.text('Title: ', c2SigX + 5, sigBoxesY + 41.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...cDark);
  doc.text('Designated Partner / Authorized Signatory', c2SigX + 17, sigBoxesY + 41.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...cNavy);
  doc.text('Date: ', c2SigX + 5, sigBoxesY + 47.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...cDark);
  doc.text(effectiveDate, c2SigX + 17, sigBoxesY + 47.5);

  // Dual Witness Box
  const witY = sigBoxesY + sigBoxH + 3.2;
  const witH = 26;
  doc.setFillColor(...cCardBg);
  doc.setDrawColor(...cCardBorder);
  doc.roundedRect(margin, witY, contentWidth, witH, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(...cNavy);
  doc.text('IN THE PRESENCE OF FORMAL WITNESSES (DUAL ATTESTATION):', margin + 4, witY + 4.8);

  const witColW = (contentWidth - 8) / 2;
  // Witness 1
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.2);
  doc.setTextColor(...cDark);
  doc.text('1. Witness for Property Owner / Franchisee:', margin + 4, witY + 10.0);
  doc.setFont('helvetica', 'normal');
  doc.text('Name: _______________________  Signature: _______________________', margin + 4, witY + 15.5);
  doc.text('Address: _____________________________________________________', margin + 4, witY + 21.0);

  // Witness 2
  const wit2X = margin + witColW + 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.2);
  doc.setTextColor(...cDark);
  doc.text('2. Witness for Sanelite Cinemas LLP:', wit2X, witY + 10.0);
  doc.setFont('helvetica', 'normal');
  doc.text('Name: _______________________  Signature: _______________________', wit2X, witY + 15.5);
  doc.text('Address: _____________________________________________________', wit2X, witY + 21.0);

  // Two-pass dynamic page footer numbering across all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawPageFooter(i, totalPages);
  }

  // Save the PDF
  const sanitizedClient = (effectiveOwner || 'Client').replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  doc.save(`sanelite-cinemas-seating-mou-${sanitizedClient}.pdf`);
  showToast('Official Seating-Wise MoU Term Sheet PDF Downloaded!');
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

      if ($('ownerName')) $('ownerName').value = state.clientName;
      if ($('sigOwnerName')) $('sigOwnerName').value = state.clientName;
    });
  }

  if ($('projectLocation')) {
    $('projectLocation').addEventListener('input', (e) => {
      state.projectLocation = e.target.value.trim();
      state.propertyAddress = state.projectLocation;
      state.ownerAddress = state.projectLocation;

      if ($('propertyAddress')) $('propertyAddress').value = state.projectLocation;
      if ($('ownerAddress')) $('ownerAddress').value = state.projectLocation;
    });
  }

  // Add Screen / Row button
  if ($('btnAddRow')) {
    $('btnAddRow').addEventListener('click', () => {
      const nextNum = state.rows.length + 1;
      state.rows.push({
        screen: `${nextNum}`,
        format: 'Push Back & Lounger',
        seats: 50,
        rate: 80000
      });
      renderTable();
      syncSeatingToDocument();
      showToast(`Added Screen ${nextNum}`);
    });
  }

  // Agreement Date Picker listeners
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
      showToast(`MoU Date set to Today: ${formatted}`);
    });
  }

  // 2. Attached Document Inputs (Live Two-Way Sync)
  const docInputs = [
    'purposeOfUse',
    'ownerName', 'ownerCompany', 'ownerAddress', 'ownerPan', 'ownerGst',
    'propertyAddress', 'frontage', 'buildingType', 'propertyStatus',
    'fitoutPeriod', 'lockinPeriod', 'totalTenure', 'electricalLoad',
    'feePerScreen', 'tokenAmount', 'revenueSharePct',
    'camCharges', 'municipalTax', 'registrationCharges',
    'disputeResolution', 'legalJurisdiction', 'additionalTerms',
    'sigOwnerName', 'sigOwnerDate', 'sigFranchisorName', 'sigFranchisorDate'
  ];

  docInputs.forEach(id => {
    const el = $(id);
    if (!el) return;
    el.addEventListener('input', (e) => {
      state[id] = e.target.value.trim();

      // Mirroring
      if (id === 'ownerName') {
        state.clientName = state.ownerName;
        state.sigOwnerName = state.ownerName;
        if ($('clientName')) $('clientName').value = state.ownerName;
        if ($('sigOwnerName')) $('sigOwnerName').value = state.ownerName;
      }
      if (id === 'propertyAddress') {
        state.projectLocation = state.propertyAddress;
        if ($('projectLocation')) $('projectLocation').value = state.propertyAddress;
      }
      if (id === 'revenueSharePct') {
        const words = numberToWords(Number(e.target.value) || 0);
        if ($('dispRevenueWords')) $('dispRevenueWords').textContent = words;
      }
    });
  });

  if ($('forceMajeureText')) {
    $('forceMajeureText').addEventListener('input', (e) => {
      state.forceMajeureText = e.target.value;
    });
  }

  // Scope of Work Buttons
  if ($('addScopeBtn')) {
    $('addScopeBtn').addEventListener('click', () => {
      const nextNum = state.scopeOfWork.length + 1;
      state.scopeOfWork.push(`Scope item ${nextNum}: Additional cinema infrastructure requirement as per site audit.`);
      renderScopeOfWork();
      showToast(`Added Scope Clause #${nextNum}`);
    });
  }

  if ($('resetScopeBtn')) {
    $('resetScopeBtn').addEventListener('click', () => {
      if (confirm('Reset Scope of Work to default 18 items?')) {
        state.scopeOfWork = [...defaultScopeOfWork];
        renderScopeOfWork();
        showToast('Scope of Work reset to default 18 items');
      }
    });
  }

  if ($('resetFmBtn')) {
    $('resetFmBtn').addEventListener('click', () => {
      if (confirm('Reset Force Majeure clause to default legal text?')) {
        state.forceMajeureText = defaultForceMajeureText;
        if ($('forceMajeureText')) $('forceMajeureText').value = defaultForceMajeureText;
        showToast('Force Majeure text reset to default');
      }
    });
  }

  // 3. Digital Signatures Setup (Click to Upload & File Change)
  const setupSigBox = (type) => {
    const isOwner = type === 'owner';
    const box = $(isOwner ? 'sigOwnerBox' : 'sigFranchisorBox');
    const fileInput = $(isOwner ? 'sigOwnerFile' : 'sigFranchisorFile');
    const changeBtn = $(isOwner ? 'sigOwnerChangeBtn' : 'sigFranchisorChangeBtn');
    const removeBtn = $(isOwner ? 'sigOwnerRemoveBtn' : 'sigFranchisorRemoveBtn');

    if (box && fileInput) {
      box.addEventListener('click', (e) => {
        if (e.target === changeBtn || e.target === removeBtn) return;
        fileInput.click();
      });
      box.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          fileInput.click();
        }
      });
    }

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) handleSignatureFile(file, type);
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

  setupSigBox('owner');
  setupSigBox('franchisor');

  // Reset Proposal Defaults
  const resetHandler = () => {
    if (confirm('Reset all proposal values, seating table, and agreement terms to original defaults?')) {
      state = JSON.parse(JSON.stringify(defaultState));
      state.datePrepared = getTodayFormatted();
      state.sigOwnerDate = state.datePrepared;
      state.sigFranchisorDate = state.datePrepared;
      syncAllInputsFromState();
      showToast('Proposal reset to defaults');
    }
  };

  if ($('resetProposalBtn')) $('resetProposalBtn').addEventListener('click', resetHandler);
  if ($('secondaryResetBtn')) $('secondaryResetBtn').addEventListener('click', resetHandler);

  // PDF Export Buttons
  if ($('exportButton')) $('exportButton').addEventListener('click', downloadPDF);
  if ($('mainExportButton')) $('mainExportButton').addEventListener('click', downloadPDF);
  if ($('mobileExportButton')) $('mobileExportButton').addEventListener('click', downloadPDF);

  // Mobile Drawer Toggle
  const menuBtn = $('mobileMenuBtn');
  const closeBtn = $('closeDrawerBtn');
  const drawer = $('mobileDrawer');
  const backdrop = $('drawerBackdrop');

  const openDrawer = () => {
    if (drawer) drawer.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    if (drawer) drawer.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
    document.body.style.overflow = '';
  };

  if (menuBtn) menuBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (backdrop) backdrop.addEventListener('click', closeDrawer);

  document.querySelectorAll('.drawer-link').forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  // Logout Buttons
  const logoutHandler = () => {
    sessionStorage.removeItem('sanelite_auth');
    window.location.replace('login.html');
  };
  if ($('logoutButton')) $('logoutButton').addEventListener('click', logoutHandler);
  if ($('mobileLogoutButton')) $('mobileLogoutButton').addEventListener('click', logoutHandler);
}

document.addEventListener('DOMContentLoaded', init);
