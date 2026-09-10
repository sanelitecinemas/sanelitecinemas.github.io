// ============================================================
// Seating Investment Proposal & Cinema Project Costing Engine
// ============================================================

const $ = (id) => document.getElementById(id);

// Number and Currency Formatters
const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const formatInrNumber = (n) => Number(n).toLocaleString('en-IN');
const formatInrCurrency = (n) => '₹' + Number(n).toLocaleString('en-IN');

const shortCurrency = (value) => {
  const abs = Math.abs(value);
  if (abs >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (abs >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
  return currency.format(value);
};

// Default State (matches user uploaded image exactly)
const defaultState = {
  clientName: '[Client Name]',
  projectLocation: '[Project Location]',
  totalScreens: 3,
  datePrepared: '11 July 2026',
  cinemaType: 'premium',
  premiumRate: 3000,
  ultraRate: 3500,
  fitoutRate: 3000,
  carpetArea: 9000,
  rows: [
    { screen: '1', format: 'Push Back & Lounger', seats: 200, rate: 80000 },
    { screen: '2', format: 'Couple Seats', seats: 50, rate: 120000 },
    { screen: '3', format: 'Push Back & Lounger', seats: 0, rate: 0 },
    { screen: '4', format: 'Recliner', seats: 40, rate: 135000 }
  ],
  notes: `* GST is applied at 18% on the seating amount, as per current government norms.
* Rates above are exclusive of civil work, interiors, projection/sound equipment, and statutory approvals.
* Figures are indicative and subject to change until confirmed in the definitive agreement.
* Civil & Interior Fitout includes auditorium acoustics, carpeting, lighting, and HVAC integration.`
};

let state = JSON.parse(JSON.stringify(defaultState));

// Calculation Engine
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

  const fitoutCost = state.carpetArea * state.fitoutRate;
  const grandTotal = fitoutCost + totalSeating;

  return {
    rows: calculatedRows,
    totalSeats,
    totalAmount,
    totalGst,
    totalSeating,
    fitoutCost,
    grandTotal
  };
}

// Render Seating Table Rows
function renderTable() {
  const calc = calculate();
  const tbody = $('seatingTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';

  calc.rows.forEach((row, idx) => {
    const tr = document.createElement('tr');

    const amountDisplay = row.amount > 0 ? formatInrNumber(row.amount) : '—';
    const gstDisplay = row.gst > 0 ? formatInrNumber(row.gst) : '—';
    const totalDisplay = row.total > 0 ? formatInrNumber(row.total) : '—';

    const seatsVal = (row.seats !== undefined && row.seats !== null && row.seats !== '') ? row.seats : '';
    const rateVal = (row.rate !== undefined && row.rate !== null && row.rate !== '') ? row.rate : '';

    tr.innerHTML = `
      <td class="cell-center cell-screen">
        <input type="text" class="row-screen" data-idx="${idx}" value="${row.screen}" placeholder="Screen" />
      </td>
      <td>
        <input type="text" class="row-format" data-idx="${idx}" value="${row.format}" list="formatOptions" placeholder="Seating Format" />
      </td>
      <td class="cell-seats">
        <input type="number" class="row-seats" data-idx="${idx}" min="0" value="${seatsVal}" placeholder="0" />
      </td>
      <td class="cell-rate">
        <input type="number" class="row-rate rate-input-yellow" data-idx="${idx}" min="0" step="1000" value="${rateVal}" placeholder="0" />
      </td>
      <td class="cell-numeric" id="rowAmount_${idx}">${amountDisplay}</td>
      <td class="cell-numeric" id="rowGst_${idx}">${gstDisplay}</td>
      <td class="cell-numeric" id="rowTotal_${idx}" style="font-weight:750;">${totalDisplay}</td>
      <td class="cell-center">
        <button type="button" class="seating-btn-delete" data-idx="${idx}" title="Delete Screen">✕</button>
      </td>
    `;

    tbody.appendChild(tr);
  });

  // Attach Table Input Listeners
  tbody.querySelectorAll('.row-screen').forEach(input => {
    input.addEventListener('input', (e) => {
      const idx = e.target.getAttribute('data-idx');
      state.rows[idx].screen = e.target.value;
    });
  });

  tbody.querySelectorAll('.row-format').forEach(input => {
    input.addEventListener('input', (e) => {
      const idx = e.target.getAttribute('data-idx');
      state.rows[idx].format = e.target.value;
    });
  });

  tbody.querySelectorAll('.row-seats').forEach(input => {
    input.addEventListener('input', (e) => {
      const idx = e.target.getAttribute('data-idx');
      state.rows[idx].seats = Number(e.target.value) || 0;
      updateUI();
    });
  });

  tbody.querySelectorAll('.row-rate').forEach(input => {
    input.addEventListener('input', (e) => {
      const idx = e.target.getAttribute('data-idx');
      state.rows[idx].rate = Number(e.target.value) || 0;
      updateUI();
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
      updateUI();
    });
  });
}

// Update Totals and Displays
function updateUI() {
  const calc = calculate();

  // Update Table Footers
  if ($('totalSeatsCell')) $('totalSeatsCell').textContent = formatInrNumber(calc.totalSeats);
  if ($('totalAmountCell')) $('totalAmountCell').textContent = formatInrNumber(calc.totalAmount);
  if ($('totalGstCell')) $('totalGstCell').textContent = formatInrNumber(calc.totalGst);
  if ($('totalGrandCell')) $('totalGrandCell').textContent = formatInrNumber(calc.totalSeating);

  // Update Individual Row Cells (if already rendered)
  calc.rows.forEach((row, idx) => {
    const aCell = $(`rowAmount_${idx}`);
    const gCell = $(`rowGst_${idx}`);
    const tCell = $(`rowTotal_${idx}`);
    if (aCell) aCell.textContent = row.amount > 0 ? formatInrNumber(row.amount) : '—';
    if (gCell) gCell.textContent = row.gst > 0 ? formatInrNumber(row.gst) : '—';
    if (tCell) tCell.textContent = row.total > 0 ? formatInrNumber(row.total) : '—';
  });

  // Section 1 Fitout Cost Displays
  if ($('dispFitoutCost')) $('dispFitoutCost').textContent = formatInrCurrency(calc.fitoutCost);
  if ($('dispFitoutFormula')) {
    const typeLabel = state.cinemaType === 'ultra' ? 'Ultra Luxurious' : 'Premium';
    $('dispFitoutFormula').textContent = `${formatInrNumber(state.carpetArea)} sq.ft × ₹${formatInrNumber(state.fitoutRate)}/sq.ft (${typeLabel})`;
  }

  // Section 3 Grand Summary Grid
  if ($('summaryFitoutCost')) $('summaryFitoutCost').textContent = shortCurrency(calc.fitoutCost);
  if ($('summaryFitoutDetails')) $('summaryFitoutDetails').textContent = `${formatInrNumber(state.carpetArea)} sq.ft @ ₹${formatInrNumber(state.fitoutRate)}/sq.ft`;

  if ($('summarySeatingBase')) $('summarySeatingBase').textContent = shortCurrency(calc.totalAmount);
  if ($('summarySeatsCount')) $('summarySeatsCount').textContent = `${formatInrNumber(calc.totalSeats)} Total Seats`;

  if ($('summarySeatingGst')) $('summarySeatingGst').textContent = shortCurrency(calc.totalGst);
  if ($('summarySeatingTotal')) $('summarySeatingTotal').textContent = shortCurrency(calc.totalSeating);

  if ($('summaryGrandTotal')) $('summaryGrandTotal').textContent = formatInrCurrency(calc.grandTotal);
  if ($('summaryGrandTotalShort')) $('summaryGrandTotalShort').textContent = `${shortCurrency(calc.grandTotal)} total investment`;

  // Hero Card Displays
  if ($('heroGrandTotal')) $('heroGrandTotal').textContent = shortCurrency(calc.grandTotal);
  if ($('heroFitoutAndSeats')) {
    $('heroFitoutAndSeats').textContent = `Fitout ${shortCurrency(calc.fitoutCost)} + Seating ${shortCurrency(calc.totalSeating)}`;
  }

  // Sync Rate Inputs when not focused
  const ratePrem = $('ratePremiumInput');
  const rateUlt = $('rateUltraInput');
  if (ratePrem && document.activeElement !== ratePrem) {
    ratePrem.value = state.premiumRate || 3000;
  }
  if (rateUlt && document.activeElement !== rateUlt) {
    rateUlt.value = state.ultraRate || 3500;
  }
}

// Add New Screen Row
if ($('btnAddRow')) {
  $('btnAddRow').addEventListener('click', () => {
    const nextScreenNum = (state.rows.length + 1).toString();
    state.rows.push({
      screen: nextScreenNum,
      format: 'Push Back & Lounger',
      seats: 0,
      rate: 80000
    });
    renderTable();
    updateUI();
  });
}

// Cinema Type Card Selection
const cardPremium = $('typeCardPremium');
const cardUltra = $('typeCardUltra');
const ratePremiumInput = $('ratePremiumInput');
const rateUltraInput = $('rateUltraInput');

function setCinemaType(type) {
  if (type === 'ultra') {
    state.cinemaType = 'ultra';
    state.fitoutRate = Number(state.ultraRate) || 3500;
    if (cardUltra) cardUltra.classList.add('active');
    if (cardPremium) cardPremium.classList.remove('active');
  } else {
    state.cinemaType = 'premium';
    state.fitoutRate = Number(state.premiumRate) || 3000;
    if (cardPremium) cardPremium.classList.add('active');
    if (cardUltra) cardUltra.classList.remove('active');
  }
  updateUI();
}

if (cardPremium) cardPremium.addEventListener('click', () => setCinemaType('premium'));
if (cardUltra) cardUltra.addEventListener('click', () => setCinemaType('ultra'));

// Editable Sq.ft Rates for Cinema Types
if (ratePremiumInput) {
  ratePremiumInput.addEventListener('click', (e) => {
    e.stopPropagation();
    if (state.cinemaType !== 'premium') setCinemaType('premium');
  });
  ratePremiumInput.addEventListener('input', (e) => {
    const val = Math.max(0, Number(e.target.value) || 0);
    state.premiumRate = val;
    if (state.cinemaType === 'premium') {
      state.fitoutRate = val;
    }
    updateUI();
  });
}

if (rateUltraInput) {
  rateUltraInput.addEventListener('click', (e) => {
    e.stopPropagation();
    if (state.cinemaType !== 'ultra') setCinemaType('ultra');
  });
  rateUltraInput.addEventListener('input', (e) => {
    const val = Math.max(0, Number(e.target.value) || 0);
    state.ultraRate = val;
    if (state.cinemaType === 'ultra') {
      state.fitoutRate = val;
    }
    updateUI();
  });
}

// Carpet Area Input Listener
if ($('carpetAreaInput')) {
  $('carpetAreaInput').addEventListener('input', (e) => {
    state.carpetArea = Math.max(0, Number(e.target.value) || 0);
    updateUI();
  });
}

// Metadata Inputs Listeners
if ($('clientName')) $('clientName').addEventListener('input', (e) => { state.clientName = e.target.value; });
if ($('projectLocation')) $('projectLocation').addEventListener('input', (e) => { state.projectLocation = e.target.value; });
if ($('totalScreensInput')) $('totalScreensInput').addEventListener('input', (e) => { state.totalScreens = Number(e.target.value) || 0; });
if ($('datePrepared')) $('datePrepared').addEventListener('input', (e) => { state.datePrepared = e.target.value; });

// Notes Textarea
const notesText = $('proposalNotesText');
if (notesText) {
  notesText.value = state.notes;
  notesText.addEventListener('input', (e) => {
    state.notes = e.target.value;
    const notice = $('noteStatusNotice');
    if (notice) {
      notice.textContent = 'Saved to PDF';
      clearTimeout(window._noteTimer);
      window._noteTimer = setTimeout(() => { notice.textContent = ''; }, 1800);
    }
  });
}

if ($('resetNoteBtn')) {
  $('resetNoteBtn').addEventListener('click', () => {
    state.notes = defaultState.notes;
    if (notesText) notesText.value = state.notes;
  });
}

// Reset All Defaults
if ($('resetProposalBtn')) {
  $('resetProposalBtn').addEventListener('click', () => {
    state = JSON.parse(JSON.stringify(defaultState));
    if ($('clientName')) $('clientName').value = state.clientName;
    if ($('projectLocation')) $('projectLocation').value = state.projectLocation;
    if ($('totalScreensInput')) $('totalScreensInput').value = state.totalScreens;
    if ($('datePrepared')) $('datePrepared').value = state.datePrepared;
    if ($('carpetAreaInput')) $('carpetAreaInput').value = state.carpetArea;
    if (ratePremiumInput) ratePremiumInput.value = state.premiumRate;
    if (rateUltraInput) rateUltraInput.value = state.ultraRate;
    if (notesText) notesText.value = state.notes;
    setCinemaType(state.cinemaType);
    renderTable();
    updateUI();
  });
}

// Mobile Drawer & Action Buttons
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
// Professional PDF Export Engine (Matching Uploaded Image)
// ============================================================
function buildSeatingPDFDoc() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const calc = calculate();

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const contentWidth = pageWidth - (margin * 2); // 186mm

  // Colors
  const cNavy = [21, 40, 64];       // #152840
  const cDark = [24, 24, 33];        // #181821
  const cMuted = [113, 113, 126];    // #71717e
  const cLine = [220, 220, 228];     // #dcdce4
  const cGold = [179, 146, 76];      // #b3924c
  const cYellow = [255, 249, 196];   // #fff9c4
  const cAccent = [240, 85, 55];     // #f05537

  // Date & Time formatting
  const now = new Date();
  const genDateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const genTimeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  let curY = 11;

  // 1. Header Banner with Official Sanelite Logo
  const logoData = typeof SANELITE_LOGO !== 'undefined' ? SANELITE_LOGO : (typeof logoDataUri !== 'undefined' ? logoDataUri : null);
  if (logoData) {
    try {
      // Exact aspect ratio of 3320 x 713 (4.656:1) to prevent stretching
      const logoW = 51.2;
      const logoH = 11;
      doc.addImage(logoData, 'PNG', margin, curY, logoW, logoH);
    } catch (e) {
      doc.setFillColor(...cAccent);
      doc.roundedRect(margin, curY, 11, 11, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('times', 'bold');
      doc.setFontSize(17);
      doc.text('S', margin + 3.3, curY + 8);

      doc.setTextColor(...cNavy);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('SANELITE CINEMAS', margin + 14, curY + 8);
    }
  } else {
    doc.setFillColor(...cAccent);
    doc.roundedRect(margin, curY, 11, 11, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('times', 'bold');
    doc.setFontSize(17);
    doc.text('S', margin + 3.3, curY + 8);

    doc.setTextColor(...cNavy);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('SANELITE CINEMAS', margin + 14, curY + 8);
  }

  // Header Subtitle below logo
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...cMuted);
  doc.text('Cinema Franchise Fitout Specification & Seating Investment Proposal', margin, curY + 15);

  // Header Top-Right: Date & Time + Proposal Badge
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...cMuted);
  doc.text(`Generated: ${genDateStr} | ${genTimeStr}`, pageWidth - margin, curY + 4.5, { align: 'right' });

  doc.setFillColor(255, 240, 236);
  doc.setDrawColor(...cAccent);
  doc.roundedRect(pageWidth - margin - 46, curY + 7.5, 46, 5.5, 1, 1, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(216, 50, 20);
  doc.text('SEATING & FITOUT PROPOSAL', pageWidth - margin - 23, curY + 11.3, { align: 'center' });

  // Divider Line
  doc.setDrawColor(...cLine);
  doc.setLineWidth(0.4);
  doc.line(margin, curY + 18, pageWidth - margin, curY + 18);

  curY += 22;

  // 2. Client Metadata Box (2-column key/value matching image)
  const metaBoxHeight = 17;
  doc.setDrawColor(...cLine);
  doc.setFillColor(250, 250, 252);
  doc.roundedRect(margin, curY, contentWidth, metaBoxHeight, 2, 2, 'FD');

  const col1X = margin + 4;
  const col1ValX = margin + 38;
  const col2X = margin + 98;
  const col2ValX = margin + 126;

  // Row 1
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...cNavy);
  doc.text('Client / Franchisee:', col1X, curY + 5.8);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...cDark);
  doc.text(state.clientName || '[Client Name]', col1ValX, curY + 5.8);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...cNavy);
  doc.text('Total Screens:', col2X, curY + 5.8);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...cDark);
  doc.text(`${state.totalScreens || calc.rows.length} Screens`, col2ValX, curY + 5.8);

  // Row 2
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...cNavy);
  doc.text('Project Location:', col1X, curY + 12);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...cDark);
  doc.text(state.projectLocation || '[Project Location]', col1ValX, curY + 12);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...cNavy);
  doc.text('Proposal Date:', col2X, curY + 12);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...cDark);
  doc.text(state.datePrepared || '11 July 2026', col2ValX, curY + 12);

  curY += metaBoxHeight + 5;

  // 3. Section 1: Cinema Type & Fitout Cost Table
  const typeLabel = state.cinemaType === 'ultra' ? 'Ultra Luxurious Cinema' : 'Premium Cinema';
  const typeDesc = state.cinemaType === 'ultra'
    ? 'Gold-Class acoustic treatments, designer finishes, VIP lounge & luxury lighting'
    : 'Standard luxury acoustic panelling, carpet flooring, auditorium lighting & HVAC ducting';

  doc.autoTable({
    startY: curY,
    margin: { left: margin, right: margin },
    tableWidth: contentWidth,
    head: [
      [
        { content: 'Section 1: Cinema Type & Civil Fitout Costing', colSpan: 4, styles: { halign: 'left', fillColor: cNavy, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 } }
      ],
      [
        'Fitout Specification', 'Carpet Area (sq. ft.)', 'Rate per sq. ft. (Rs.)', 'Total Fitout Cost (Rs.)'
      ]
    ],
    body: [
      [
        `${typeLabel}\n${typeDesc}`,
        `${formatInrNumber(state.carpetArea)} sq.ft`,
        `Rs. ${formatInrNumber(state.fitoutRate)}`,
        `Rs. ${formatInrNumber(calc.fitoutCost)}`
      ]
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [32, 54, 82],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      lineWidth: 0.2,
      lineColor: cLine
    },
    bodyStyles: {
      textColor: cDark,
      fontSize: 8,
      cellPadding: 3,
      lineWidth: 0.2,
      lineColor: cLine
    },
    columnStyles: {
      0: { cellWidth: 84 },
      1: { halign: 'center', cellWidth: 32 },
      2: { halign: 'right', cellWidth: 32 },
      3: { halign: 'right', fontStyle: 'bold', textColor: cNavy, cellWidth: 38 }
    }
  });

  curY = doc.lastAutoTable.finalY + 5;

  // 4. Section 2: Screen-by-Screen Seating Table (Exact image format)
  const seatingTableBody = calc.rows.map(row => {
    return [
      row.screen,
      row.format,
      row.seats > 0 ? formatInrNumber(row.seats) : '—',
      row.rate > 0 ? formatInrNumber(row.rate) : '—',
      row.amount > 0 ? formatInrNumber(row.amount) : '—',
      row.gst > 0 ? formatInrNumber(row.gst) : '—',
      row.total > 0 ? formatInrNumber(row.total) : '—'
    ];
  });

  // Grand Total Row
  const seatingTableFoot = [[
    { content: 'Grand Total', colSpan: 2, styles: { halign: 'left', fontStyle: 'bold' } },
    { content: formatInrNumber(calc.totalSeats), styles: { halign: 'right', fontStyle: 'bold' } },
    { content: '', styles: { fillColor: [245, 245, 248] } },
    { content: formatInrNumber(calc.totalAmount), styles: { halign: 'right', fontStyle: 'bold' } },
    { content: formatInrNumber(calc.totalGst), styles: { halign: 'right', fontStyle: 'bold' } },
    { content: formatInrNumber(calc.totalSeating), styles: { halign: 'right', fontStyle: 'bold', textColor: cNavy } }
  ]];

  doc.autoTable({
    startY: curY,
    margin: { left: margin, right: margin },
    tableWidth: contentWidth,
    head: [
      [
        { content: 'Section 2: Screen-by-Screen Seating Investment Proposal (with 18% GST)', colSpan: 7, styles: { halign: 'left', fillColor: cNavy, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 } }
      ],
      [
        'Screen', 'Seating Format', 'No. of Seats', 'Rate per Seat (Rs.)', 'Amount (Rs.)', 'GST @ 18% (Rs.)', 'Total (Rs.)'
      ]
    ],
    body: seatingTableBody,
    foot: seatingTableFoot,
    theme: 'grid',
    headStyles: {
      fillColor: [32, 54, 82],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      lineWidth: 0.2,
      lineColor: [220, 220, 228]
    },
    bodyStyles: {
      textColor: cDark,
      fontSize: 8,
      cellPadding: 2.8,
      lineWidth: 0.2,
      lineColor: cLine
    },
    footStyles: {
      fillColor: [245, 245, 248],
      textColor: cDark,
      fontSize: 8.5,
      lineWidth: 0.3,
      lineColor: cGold
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 18 },
      1: { cellWidth: 46 },
      2: { halign: 'right', cellWidth: 22 },
      3: { halign: 'right', cellWidth: 28, fillColor: cYellow, fontStyle: 'bold', textColor: cDark },
      4: { halign: 'right', cellWidth: 24 },
      5: { halign: 'right', cellWidth: 22 },
      6: { halign: 'right', fontStyle: 'bold', textColor: cNavy, cellWidth: 26 }
    }
  });

  curY = doc.lastAutoTable.finalY + 5;

  // 5. Section 3: Total Cinema Project Costing Summary Card
  const cardH = 26;
  doc.setDrawColor(...cLine);
  doc.setFillColor(248, 249, 252);
  doc.roundedRect(margin, curY, contentWidth, cardH, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...cNavy);
  doc.text('TOTAL CINEMA SETUP PROJECT INVESTMENT', margin + 5, curY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(...cMuted);
  doc.text('Civil & Interior Fitout:', margin + 5, curY + 11.5);
  doc.text('Seating Base Amount:', margin + 5, curY + 16.5);
  doc.text('GST on Seating @ 18%:', margin + 5, curY + 21.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...cDark);
  doc.text(`Rs. ${formatInrNumber(calc.fitoutCost)}   (${shortCurrency(calc.fitoutCost)})`, margin + 44, curY + 11.5);
  doc.text(`Rs. ${formatInrNumber(calc.totalAmount)}   (${shortCurrency(calc.totalAmount)})`, margin + 44, curY + 16.5);
  doc.text(`Rs. ${formatInrNumber(calc.totalGst)}   (${shortCurrency(calc.totalGst)})`, margin + 44, curY + 21.5);

  // Right Side: Grand Total Box Highlight
  const gtW = 68;
  const gtH = 20;
  const gtX = pageWidth - margin - gtW - 3;
  doc.setFillColor(...cNavy);
  doc.roundedRect(gtX, curY + 3, gtW, gtH, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(255, 120, 95);
  doc.text('GRAND TOTAL INVESTMENT', gtX + 5, curY + 8);

  doc.setFontSize(11.5);
  doc.setTextColor(255, 255, 255);
  doc.text(`Rs. ${formatInrNumber(calc.grandTotal)}`, gtX + 5, curY + 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(190, 195, 205);
  doc.text(`Total Project Cost: ${shortCurrency(calc.grandTotal)}`, gtX + 5, curY + 19);

  curY += cardH + 5;

  // 6. Note & Disclosures Box
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...cDark);
  doc.text('Note:', margin, curY);

  curY += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(...cMuted);

  const splitNotes = doc.splitTextToSize(state.notes, contentWidth);
  doc.text(splitNotes, margin, curY);

  // 7. Footer
  const footerY = pageHeight - 8;
  doc.setDrawColor(...cLine);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 2, pageWidth - margin, footerY - 2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(...cMuted);
  doc.text(`Generated via Sanelite Proposal Engine  •  Date: ${genDateStr}  •  Time: ${genTimeStr}`, margin, footerY + 2);
  doc.text('Confidential & Proprietary — For Franchise Assessment Only', pageWidth - margin, footerY + 2, { align: 'right' });

  return doc;
}

function downloadSeatingPDF() {
  const doc = buildSeatingPDFDoc();
  doc.save('sanelite-seating-investment-proposal.pdf');
}

// Attach Export Button Listeners
if ($('exportButton')) {
  $('exportButton').addEventListener('click', () => {
    downloadSeatingPDF();
    showToast('Proposal PDF downloaded');
  });
}

if ($('mobileExportButton')) {
  $('mobileExportButton').addEventListener('click', () => {
    downloadSeatingPDF();
    showToast('Proposal PDF downloaded');
  });
}

// Initial Initialization
renderTable();
updateUI();
