const defaults = {
  seats: 250,
  investment: 22500000,
  weekdayShowsPerDay: 4,
  weekendShowsPerDay: 5,
  weekdayOccupancy: 25,
  weekendOccupancy: 45,
  weekdayRate: 200,
  weekendRate: 250,
  investorShare: 45,
  foodRate: 80,
  fnbCost: 25,
  investorFnbShare: 80,
  electricityCost: 150000,
  salaryCost: 120000,
  miscCost: 50000,
  yoyGrowth: 5
};

const ids = Object.keys(defaults);
const $ = (id) => document.getElementById(id);
const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const shortCurrency = (value) => {
  const abs = Math.abs(value);
  if (abs >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (abs >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
  return currency.format(value);
};
const pdfCurrency = (val) => {
  const abs = Math.abs(val);
  if (abs >= 10000000) return `Rs. ${(val / 10000000).toFixed(2)} Cr`;
  if (abs >= 100000) return `Rs. ${(val / 100000).toFixed(2)} L`;
  return `Rs. ${Math.round(val).toLocaleString('en-IN')}`;
};
const number = (id) => Number($(id) ? $(id).value : 0) || 0;

let isNoteUserModified = false;

function generateDefaultNote(d) {
  const growth = (d && d.yoyGrowth !== undefined) ? d.yoyGrowth : 5;
  return [
    '• Under the FOFO model, the Franchisee shall receive Net Box Office Ticket Revenue and Net Food & Beverage Revenue generated from the Cinema.',
    '• All day-to-day operational expenses (OPEX) of the Cinema shall be borne and paid by the Franchisee.',
    '• The Franchisor shall provide the weekly movie content, programming and show scheduling for the Cinema.',
    '• The Franchisor shall bear all charges payable towards movie producers/distributors, movie content and applicable screen charges.',
    `• For financial projections, the Cinema shall be considered to achieve ${growth}% year-on-year growth in admissions during Year 2 and Year 3.`,
    '• For financial and tax modelling purposes, the Cinema assets shall be considered to depreciate at 10% per annum on a reducing-balance basis, subject to applicable tax laws.',
    '• The above growth and depreciation assumptions are for financial projection purposes only and shall not be construed as a guarantee of revenue, admissions, profitability or tax benefits by the Franchisor.'
  ].join('\n');
}

function model() {
  const seats = number('seats');
  const weekdayShowsPerDay = number('weekdayShowsPerDay') || 4;
  const weekendShowsPerDay = number('weekendShowsPerDay') || 5;
  const totalWeekdayShows = weekdayShowsPerDay * 18;
  const totalWeekendShows = weekendShowsPerDay * 12;
  const totalShows = totalWeekdayShows + totalWeekendShows;
  const totalWeekdaySeats = seats * totalWeekdayShows;
  const totalWeekendSeats = seats * totalWeekendShows;
  const totalMonthlySeats = totalWeekdaySeats + totalWeekendSeats;

  const weekdayOccupancy = number('weekdayOccupancy');
  const weekendOccupancy = number('weekendOccupancy');
  const weekdayBookings = totalWeekdaySeats * weekdayOccupancy / 100;
  const weekendBookings = totalWeekendSeats * weekendOccupancy / 100;
  const totalBookings = weekdayBookings + weekendBookings;

  const weekdayRate = number('weekdayRate');
  const weekendRate = number('weekendRate');
  const weekdayRevenue = weekdayBookings * weekdayRate;
  const weekendRevenue = weekendBookings * weekendRate;
  const ticketIncome = weekdayRevenue + weekendRevenue;

  // 1. Box Office Taxes & Net Revenue
  const gstTicket = ticketIncome * 18 / 118;
  const showTax = totalShows * 25;
  const boxOfficeTax = gstTicket + showTax;
  const netTicket = ticketIncome - boxOfficeTax;

  // Box Office FOFO Split: Investor Share (Default: 45%)
  const investorSharePct = number('investorShare') || 45;
  const companySharePct = 100 - investorSharePct;
  const investorBoxOfficeShare = netTicket * (investorSharePct / 100);
  const companyBoxOfficeShare = netTicket * (companySharePct / 100);
  const annualInvestorBoxOffice = investorBoxOfficeShare * 12;
  const annualCompanyBoxOffice = companyBoxOfficeShare * 12;

  // 2. F&B Taxes & Net Revenue
  const foodRate = number('foodRate');
  const foodIncome = totalBookings * foodRate;
  const foodTax = foodIncome * 5 / 105;
  const netFood = foodIncome - foodTax;

  // F&B Cost (Default: 25% COGS)
  const fnbCostPct = $('fnbCost') ? number('fnbCost') : 25;
  const fnbCostAmount = netFood * (fnbCostPct / 100);
  const netFoodAvailable = Math.max(0, netFood - fnbCostAmount);

  // F&B FOFO Split on Net Margin: Investor Share (Default: 80%)
  const investorFnbSharePct = number('investorFnbShare') || 80;
  const companyFnbSharePct = 100 - investorFnbSharePct;
  const investorFnbMonthlyShare = netFoodAvailable * (investorFnbSharePct / 100);
  const companyFnbMonthlyShare = netFoodAvailable * (companyFnbSharePct / 100);
  const annualInvestorFnb = investorFnbMonthlyShare * 12;
  const annualCompanyFnb = companyFnbMonthlyShare * 12;

  // 3. Operational Expenses (Deducted from Investor Share)
  const electricityCost = number('electricityCost');
  const salaryCost = number('salaryCost');
  const miscCost = number('miscCost');
  const totalExpenses = electricityCost + salaryCost + miscCost;

  // Investor Totals: Gross & Net after OPEX
  const totalInvestorMonthly = investorBoxOfficeShare + investorFnbMonthlyShare; // Gross
  const investorNetMonthly = Math.max(0, totalInvestorMonthly - totalExpenses); // Net take-home
  const totalAnnualInvestorNet = investorNetMonthly * 12;

  // Franchise Company Totals (OPEX not deducted from company)
  const totalCompanyMonthly = companyBoxOfficeShare + companyFnbMonthlyShare;
  const totalAnnualCompany = totalCompanyMonthly * 12;

  // Overall Totals
  const totalIncome = ticketIncome + foodIncome;
  const totalTaxes = gstTicket + showTax + foodTax;
  const totalNetAvailable = netTicket + netFoodAvailable;

  const investment = number('investment');
  const yieldPct = investment ? (totalAnnualInvestorNet / investment) * 100 : 0;
  const paybackYears = totalAnnualInvestorNet ? investment / totalAnnualInvestorNet : 0;

  const depreciation = [investment * 0.1, investment * 0.09, investment * 0.081];
  const yoyGrowth = $('yoyGrowth') ? number('yoyGrowth') : 5;
  const growthMult = 1 + (yoyGrowth / 100);
  const yearlyShare = [totalAnnualInvestorNet, totalAnnualInvestorNet * growthMult, totalAnnualInvestorNet * growthMult * growthMult];
  const cumulative = [];
  yearlyShare.reduce((sum, amount, i) => {
    const total = sum + amount + depreciation[i];
    cumulative.push(total);
    return total;
  }, 0);

  return {
    seats,
    weekdayShowsPerDay,
    weekendShowsPerDay,
    totalWeekdayShows,
    totalWeekendShows,
    totalShows,
    totalWeekdaySeats,
    totalWeekendSeats,
    totalMonthlySeats,
    weekdayOccupancy,
    weekendOccupancy,
    weekdayBookings,
    weekendBookings,
    totalBookings,
    weekdayRate,
    weekendRate,
    weekdayRevenue,
    weekendRevenue,
    ticketIncome,
    gstTicket,
    showTax,
    boxOfficeTax,
    netTicket,
    foodRate,
    foodIncome,
    foodTax,
    netFood,
    fnbCostPct,
    fnbCostAmount,
    netFoodAvailable,
    yoyGrowth,
    investorSharePct,
    companySharePct,
    investorBoxOfficeShare,
    companyBoxOfficeShare,
    annualInvestorBoxOffice,
    annualCompanyBoxOffice,
    investorFnbSharePct,
    companyFnbSharePct,
    investorFnbMonthlyShare,
    companyFnbMonthlyShare,
    annualInvestorFnb,
    annualCompanyFnb,
    electricityCost,
    salaryCost,
    miscCost,
    totalExpenses,
    totalIncome,
    totalTaxes,
    totalNetAvailable,
    totalInvestorMonthly,
    investorNetMonthly,
    totalAnnualInvestorNet,
    totalCompanyMonthly,
    totalAnnualCompany,
    yieldPct,
    paybackYears,
    investment,
    yearlyShare,
    cumulative
  };
}

function update() {
  const d = model();

  // Slider Labels
  if ($('weekdayOccupancyValue')) {
    $('weekdayOccupancyValue').value = `${d.weekdayOccupancy}%`;
    $('weekdayOccupancyValue').textContent = `${d.weekdayOccupancy}%`;
  }
  if ($('weekendOccupancyValue')) {
    $('weekendOccupancyValue').value = `${d.weekendOccupancy}%`;
    $('weekendOccupancyValue').textContent = `${d.weekendOccupancy}%`;
  }
  if ($('investorShareValue')) {
    $('investorShareValue').value = `${d.investorSharePct}%`;
    $('investorShareValue').textContent = `${d.investorSharePct}%`;
  }
  if ($('investorFnbShareValue')) {
    $('investorFnbShareValue').value = `${d.investorFnbSharePct}%`;
    $('investorFnbShareValue').textContent = `${d.investorFnbSharePct}%`;
  }
  if ($('fnbCostValue')) {
    $('fnbCostValue').value = `${d.fnbCostPct}%`;
    $('fnbCostValue').textContent = `${d.fnbCostPct}%`;
  }
  if ($('yoyGrowthValue')) {
    $('yoyGrowthValue').value = `${d.yoyGrowth}%`;
    $('yoyGrowthValue').textContent = `${d.yoyGrowth}%`;
  }
  if ($('fofoGrowthPill')) {
    $('fofoGrowthPill').textContent = `${d.yoyGrowth}% annual growth`;
  }

  // Hero Card
  if ($('investmentHero')) $('investmentHero').textContent = shortCurrency(d.investment);

  // Top Distinct Banners: Investor Box Office & Investor F&B
  if ($('monthlyInvestorShare')) $('monthlyInvestorShare').textContent = shortCurrency(d.investorBoxOfficeShare);
  if ($('annualInvestorShareNote')) $('annualInvestorShareNote').textContent = `${shortCurrency(d.annualInvestorBoxOffice)} annually`;

  if ($('monthlyInvestorFnbShare')) $('monthlyInvestorFnbShare').textContent = shortCurrency(d.investorFnbMonthlyShare);
  if ($('annualInvestorFnbNote')) $('annualInvestorFnbNote').textContent = `${shortCurrency(d.annualInvestorFnb)} annually`;

  // Monthly Revenue Panel: Gross & Net available
  if ($('grossRevenue')) $('grossRevenue').textContent = shortCurrency(d.totalIncome);
  if ($('ticketRevenue')) $('ticketRevenue').textContent = shortCurrency(d.ticketIncome);
  if ($('foodRevenue')) $('foodRevenue').textContent = shortCurrency(d.foodIncome);
  if ($('boxOfficeTaxDisplay')) $('boxOfficeTaxDisplay').textContent = `-${shortCurrency(d.boxOfficeTax)}`;
  if ($('fnbTaxDisplay')) $('fnbTaxDisplay').textContent = `-${shortCurrency(d.foodTax)}`;
  if ($('fnbCostDisplay')) $('fnbCostDisplay').textContent = `-${shortCurrency(d.fnbCostAmount)}`;
  if ($('taxRevenue')) $('taxRevenue').textContent = `-${shortCurrency(d.totalTaxes)}`;
  if ($('availableForSharing')) $('availableForSharing').textContent = shortCurrency(d.totalNetAvailable);

  if ($('boxOfficeSplitDisplay')) {
    $('boxOfficeSplitDisplay').textContent = `${shortCurrency(d.investorBoxOfficeShare)} (${d.investorSharePct}%)`;
  }
  if ($('fnbSplitDisplay')) {
    $('fnbSplitDisplay').textContent = `${shortCurrency(d.investorFnbMonthlyShare)} (${d.investorFnbSharePct}%)`;
  }

  // Expenses Breakdown in Revenue Panel
  if ($('dispElectricity')) $('dispElectricity').textContent = shortCurrency(d.electricityCost);
  if ($('dispSalary')) $('dispSalary').textContent = shortCurrency(d.salaryCost);
  if ($('dispMisc')) $('dispMisc').textContent = shortCurrency(d.miscCost);
  if ($('dispTotalExpenses')) $('dispTotalExpenses').textContent = `-${shortCurrency(d.totalExpenses)}`;
  if ($('dispInvestorNetMonthly')) $('dispInvestorNetMonthly').textContent = shortCurrency(d.investorNetMonthly);
  if ($('dispExpenseSubNote')) {
    $('dispExpenseSubNote').textContent = `Gross ${shortCurrency(d.totalInvestorMonthly)} − Expenses ${shortCurrency(d.totalExpenses)}`;
  }

  // Revenue Donut Chart
  if ($('revenueDonut')) {
    const total = d.totalIncome || 1;
    const ticketEnd = (d.ticketIncome / total) * 100;
    const foodEnd = ticketEnd + (d.foodIncome / total) * 100;
    $('revenueDonut').style.background = `conic-gradient(var(--purple) 0 ${ticketEnd}%, var(--teal) ${ticketEnd}% ${foodEnd}%, #e9eaf0 ${foodEnd}% 100%)`;
  }

  // Capacity & Show Table
  if ($('weekdayShows')) $('weekdayShows').textContent = d.totalWeekdayShows;
  if ($('weekendShows')) $('weekendShows').textContent = d.totalWeekendShows;
  if ($('weekdayTotalSeats')) $('weekdayTotalSeats').textContent = d.totalWeekdaySeats.toLocaleString('en-IN');
  if ($('weekendTotalSeats')) $('weekendTotalSeats').textContent = d.totalWeekendSeats.toLocaleString('en-IN');
  if ($('showsSourceNote')) {
    $('showsSourceNote').textContent = `18 weekdays × ${d.weekdayShowsPerDay} shows (${d.totalWeekdaySeats.toLocaleString('en-IN')} seats) · 12 weekend days × ${d.weekendShowsPerDay} shows (${d.totalWeekendSeats.toLocaleString('en-IN')} seats)`;
  }
  if ($('weekdayBookings')) $('weekdayBookings').textContent = Math.round(d.weekdayBookings).toLocaleString('en-IN');
  if ($('weekendBookings')) $('weekendBookings').textContent = Math.round(d.weekendBookings).toLocaleString('en-IN');
  if ($('weekdayRevenue')) $('weekdayRevenue').textContent = shortCurrency(d.weekdayRevenue);
  if ($('weekendRevenue')) $('weekendRevenue').textContent = shortCurrency(d.weekendRevenue);

  // ROI Trajectory Bar Chart (Based on Investor Net Take-Home)
  const max = Math.max(...d.cumulative, 1);
  [['barOne', 'barOneValue', 0], ['barTwo', 'barTwoValue', 1], ['barThree', 'barThreeValue', 2]].forEach(([bar, valEl, i]) => {
    if ($(bar)) $(bar).style.height = `${Math.max(8, (d.cumulative[i] / max) * 142)}px`;
    if ($(valEl)) $(valEl).textContent = shortCurrency(d.cumulative[i]);
  });

  // Payback caption
  if ($('payback')) $('payback').textContent = d.paybackYears ? `Net payback in ${d.paybackYears.toFixed(1)} years` : 'Payback unavailable';

  // FOFO Disclosures Note (Sync with defaults if user hasn't typed custom notes)
  if ($('fofoNotesText') && !isNoteUserModified) {
    $('fofoNotesText').value = generateDefaultNote(d);
  }
}

function downloadPDF() {
  const d = model();
  if (!window.jspdf || !window.jspdf.jsPDF) {
    console.error('jsPDF library is not loaded');
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - (margin * 2); // 182mm

  const cDark = [17, 24, 39]; // High-contrast rich charcoal/black
  const cAccent = [234, 88, 12];
  const cAccentDark = [194, 65, 12];
  const cCompany = [30, 58, 138];
  const cFnb = [21, 128, 61];
  const cFnbDark = [20, 83, 45];
  const cMuted = [75, 85, 99]; // Sharp slate-600 (not washed out)
  const cHighlightBg = [255, 244, 241];
  const cHighlightBorder = [254, 215, 170];
  const cCardBg = [247, 247, 250];
  const cCardBorder = [228, 228, 235];

  const pdfCurrencyWithStar = (val) => {
    const abs = Math.abs(val);
    if (abs >= 10000000) return `Rs. ${(val / 10000000).toFixed(2)}* Cr`;
    if (abs >= 100000) return `Rs. ${(val / 100000).toFixed(2)}* L`;
    return `Rs. ${Math.round(val).toLocaleString('en-IN')}*`;
  };

  // 1. Header Banner
  if (typeof SANELITE_LOGO !== 'undefined') {
    const logoW = 48;
    const logoH = 10.3;
    doc.addImage(SANELITE_LOGO, 'PNG', margin, 11, logoW, logoH);
  } else {
    doc.setFillColor(...cAccent);
    doc.roundedRect(margin, 11, 10, 10, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('times', 'bold');
    doc.setFontSize(15);
    doc.text('S', margin + 3, 18);

    doc.setTextColor(...cDark);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Sanelite Cinemas', margin + 13, 18.5);
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...cMuted);
  doc.text('FOFO Model — Franchise Investment, Franchisee Revenue Share & OPEX Summary', margin, 25.5);

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  doc.setFontSize(7.8);
  doc.setTextColor(...cMuted);
  doc.text(`Generated: ${dateStr}`, pageWidth - margin, 15, { align: 'right' });

  doc.setFillColor(255, 240, 236);
  doc.setDrawColor(...cHighlightBorder);
  doc.roundedRect(pageWidth - margin - 44, 18, 44, 5.8, 1, 1, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(...cAccentDark);
  doc.text('FOFO FRANCHISE MODEL', pageWidth - margin - 22, 22, { align: 'center' });

  doc.setDrawColor(220, 220, 228);
  doc.setLineWidth(0.3);
  doc.line(margin, 28, pageWidth - margin, 28);

  // 2. Top 2 Franchisee KPI Cards (Height 23mm, exactly 2 boxes, perfectly aligned with tables below)
  const cardY = 31.5;
  const cardH = 23;
  const cardW = (contentWidth - 6) / 2; // 88mm each (matches table columns below)
  const card1X = margin;
  const card2X = margin + cardW + 6;

  // Box 1: FRANCHISE SHARE (BOX OFFICE & F&B)
  doc.setFillColor(255, 246, 240);
  doc.setDrawColor(254, 215, 170);
  doc.setLineWidth(0.3);
  doc.roundedRect(card1X, cardY, cardW, cardH, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(194, 65, 12);
  doc.text('FRANCHISE SHARE (BOX OFFICE & F&B)', card1X + 4.5, cardY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.2);
  doc.setTextColor(...cMuted);
  doc.text('Dual Revenue Streams', card1X + cardW - 4.5, cardY + 5.5, { align: 'right' });

  // Subtle vertical divider inside Card 1
  doc.setDrawColor(254, 215, 170);
  doc.setLineWidth(0.25);
  doc.line(card1X + 44, cardY + 8, card1X + 44, cardY + cardH - 2.5);

  // Left Column inside Box 1: Box Office Share
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(194, 65, 12);
  doc.text(`BOX OFFICE (${d.investorSharePct}%)`, card1X + 4.5, cardY + 10.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(194, 65, 12);
  doc.text(pdfCurrencyWithStar(d.investorBoxOfficeShare), card1X + 4.5, cardY + 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.3);
  doc.setTextColor(...cMuted);
  doc.text(`${pdfCurrency(d.annualInvestorBoxOffice)} annually`, card1X + 4.5, cardY + 20.2);

  // Right Column inside Box 1: F&B Concessions Share
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(20, 83, 45);
  doc.text(`F&B SHARE (${d.investorFnbSharePct}%)`, card1X + 48, cardY + 10.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(20, 83, 45);
  doc.text(pdfCurrencyWithStar(d.investorFnbMonthlyShare), card1X + 48, cardY + 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.3);
  doc.setTextColor(...cMuted);
  doc.text(`${pdfCurrency(d.annualInvestorFnb)} annually`, card1X + 48, cardY + 20.2);

  // Box 2: FRANCHISE TOTAL SHARE (Last Box, Net Profit Removed)
  doc.setFillColor(245, 243, 255);
  doc.setDrawColor(221, 214, 254);
  doc.setLineWidth(0.3);
  doc.roundedRect(card2X, cardY, cardW, cardH, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(109, 40, 217);
  doc.text('FRANCHISE TOTAL SHARE', card2X + 5, cardY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.3);
  doc.setTextColor(124, 58, 237);
  doc.text('Monthly & Annual Combined Total', card2X + cardW - 5, cardY + 5.5, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13.5);
  doc.setTextColor(91, 33, 182);
  doc.text(`${pdfCurrencyWithStar(d.totalInvestorMonthly)} / month`, card2X + 5, cardY + 14.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(...cMuted);
  doc.text(`${pdfCurrency(d.totalInvestorMonthly * 12)} Annual Total Franchise Share (BO + F&B Combined)`, card2X + 5, cardY + 20.2);

  // 3. Side-by-Side Balanced Tables (13 rows each, zero overlap)
  const tableY = 58;
  const colW = (contentWidth - 6) / 2; // 88mm each

  // Left Table: Operating Assumptions & Statutory Taxes (13 rows)
  doc.autoTable({
    startY: tableY,
    margin: { left: margin },
    tableWidth: colW,
    head: [['OPERATING ASSUMPTIONS', 'VALUE']],
    body: [
      ['Total Seat Capacity', `${d.seats} Seats`],
      ['Shows / Day (Wkday / Wkend)', `${d.weekdayShowsPerDay} / ${d.weekendShowsPerDay} Shows`],
      ['Occupancy (Wkday / Wkend)', `${d.weekdayOccupancy}% / ${d.weekendOccupancy}%`],
      ['Ticket Price (Wkday / Wkend)', `Rs. ${d.weekdayRate} / Rs. ${d.weekendRate}`],
      ['F&B Spend / Booking', `Rs. ${d.foodRate}`],
      ['F&B Cost (COGS)', `${d.fnbCostPct}% (${pdfCurrency(d.fnbCostAmount)})`],
      ['Initial Franchise Capital', pdfCurrency(d.investment)],
      ['Box Office Tax (18% + Show)', `-${pdfCurrency(d.boxOfficeTax)}`],
      ['F&B Tax (5% GST Inclusive)', `-${pdfCurrency(d.foodTax)}`],
      ['Total Statutory Taxes Deducted', `-${pdfCurrency(d.totalTaxes)}`],
      ['Franchisee Box Office Share', `${d.investorSharePct}%`],
      ['Franchisee F&B Revenue Share', `${d.investorFnbSharePct}%`],
      ['YoY Admissions Growth', `${d.yoyGrowth}% / Year`]
    ],
    theme: 'plain',
    headStyles: {
      fillColor: [36, 36, 48],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      cellPadding: 1.8
    },
    styles: {
      fontSize: 7.1,
      cellPadding: 1.5,
      lineColor: [225, 225, 235],
      lineWidth: 0.2,
      minCellHeight: 4.6
    },
    columnStyles: {
      0: { textColor: [30, 41, 59], cellWidth: 54 },
      1: { halign: 'right', fontStyle: 'bold', textColor: cDark, cellWidth: 34 }
    },
    didParseCell: function(data) {
      if (data.section === 'body') {
        if (data.row.index === 7 || data.row.index === 8) {
          data.cell.styles.textColor = [160, 60, 30];
        }
        if (data.row.index === 9) {
          data.cell.styles.textColor = cAccentDark;
          data.cell.styles.fontStyle = 'bold';
        }
        if (data.row.index === 5) {
          data.cell.styles.textColor = [180, 83, 9];
        }
      }
    }
  });
  const leftFinalY = doc.lastAutoTable.finalY;

  // Right Table: Monthly Franchisee Revenue & OPEX Sharing (13 rows, perfectly aligned)
  doc.autoTable({
    startY: tableY,
    margin: { left: margin + colW + 6 },
    tableWidth: colW,
    head: [['MONTHLY FRANCHISEE REVENUE & OPEX', 'AMOUNT']],
    body: [
      ['Gross Box Office Revenue', pdfCurrency(d.ticketIncome)],
      ['  - Less: Box Office Tax (18% + Show)', `-${pdfCurrency(d.boxOfficeTax)}`],
      ['Net Box Office Share (' + d.investorSharePct + '%)', pdfCurrency(d.investorBoxOfficeShare)],
      ['Gross F&B Concessions Revenue', pdfCurrency(d.foodIncome)],
      ['  - Less: F&B Tax (5% GST Inclusive)', `-${pdfCurrency(d.foodTax)}`],
      ['  - Less: F&B Cost (COGS ' + d.fnbCostPct + '%)', `-${pdfCurrency(d.fnbCostAmount)}`],
      ['Net F&B Share (' + d.investorFnbSharePct + '%)', pdfCurrency(d.investorFnbMonthlyShare)],
      ['Franchisee Gross Monthly Share', pdfCurrency(d.totalInvestorMonthly)],
      ['Less: Electricity OPEX', `-${pdfCurrency(d.electricityCost)}`],
      ['Less: Staff Salary OPEX', `-${pdfCurrency(d.salaryCost)}`],
      ['Less: Misc & Sundry OPEX', `-${pdfCurrency(d.miscCost)}`],
      ['Total Monthly OPEX Deductions', `-${pdfCurrency(d.totalExpenses)}`],
      ['Franchisee Net Monthly Take-Home', pdfCurrency(d.investorNetMonthly)]
    ],
    theme: 'plain',
    headStyles: {
      fillColor: [36, 36, 48],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      cellPadding: 1.8
    },
    styles: {
      fontSize: 7.1,
      cellPadding: 1.5,
      lineColor: [225, 225, 235],
      lineWidth: 0.2,
      minCellHeight: 4.6
    },
    columnStyles: {
      0: { textColor: [30, 41, 59], cellWidth: 54 },
      1: { halign: 'right', fontStyle: 'bold', textColor: cDark, cellWidth: 34 }
    },
    didParseCell: function(data) {
      if (data.section === 'body') {
        if (data.row.index === 0 || data.row.index === 3) {
          data.cell.styles.fillColor = [245, 245, 250];
          data.cell.styles.fontStyle = 'bold';
        }
        if (data.row.index === 1 || data.row.index === 4) {
          data.cell.styles.textColor = [160, 60, 30];
        }
        if (data.row.index === 2) {
          data.cell.styles.textColor = cAccentDark;
          data.cell.styles.fontStyle = 'bold';
        }
        if (data.row.index === 5) {
          data.cell.styles.textColor = cFnbDark;
          data.cell.styles.fontStyle = 'bold';
        }
        if (data.row.index === 6) {
          data.cell.styles.fontStyle = 'bold';
        }
        if (data.row.index >= 7 && data.row.index <= 9) {
          data.cell.styles.textColor = [120, 50, 50];
        }
        if (data.row.index === 10) {
          data.cell.styles.textColor = cAccentDark;
          data.cell.styles.fontStyle = 'bold';
        }
        if (data.row.index === 11) {
          data.cell.styles.fillColor = [240, 253, 244];
          data.cell.styles.textColor = [22, 101, 52];
          data.cell.styles.fontStyle = 'bold';
        }
        if (data.row.index === 12) {
          data.cell.styles.fillColor = [232, 249, 237];
          data.cell.styles.textColor = [18, 90, 46];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    }
  });
  const rightFinalY = doc.lastAutoTable.finalY;

  // 4. Capacity Table
  const capStartY = Math.max(leftFinalY, rightFinalY) + 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.0);
  doc.setTextColor(...cDark);
  doc.text('THEATRE CAPACITY & TICKET SALES METRICS', margin, capStartY);

  doc.autoTable({
    startY: capStartY + 2,
    margin: { left: margin },
    tableWidth: contentWidth,
    head: [['PERIOD', 'SHOWS', 'DAYS', 'CAPACITY', 'OCCUPANCY', 'BOOKINGS', 'AVG. RATE', 'TICKET REVENUE']],
    body: [
      ['Mon–Thu (Weekdays)', `${d.weekdayShowsPerDay}/day`, '18', d.totalWeekdaySeats.toLocaleString('en-IN'), `${d.weekdayOccupancy}%`, Math.round(d.weekdayBookings).toLocaleString('en-IN'), `Rs. ${d.weekdayRate}`, pdfCurrency(d.weekdayRevenue)],
      ['Fri–Sun (Weekends)', `${d.weekendShowsPerDay}/day`, '12', d.totalWeekendSeats.toLocaleString('en-IN'), `${d.weekendOccupancy}%`, Math.round(d.weekendBookings).toLocaleString('en-IN'), `Rs. ${d.weekendRate}`, pdfCurrency(d.weekendRevenue)],
      ['Total Monthly Capacity', `${d.totalShows} shows`, '30', d.totalMonthlySeats.toLocaleString('en-IN'), '—', Math.round(d.totalBookings).toLocaleString('en-IN'), '—', pdfCurrency(d.ticketIncome)]
    ],
    theme: 'plain',
    headStyles: {
      fillColor: [48, 48, 62],
      textColor: [255, 255, 255],
      fontSize: 7.0,
      fontStyle: 'bold',
      cellPadding: 1.8
    },
    styles: {
      fontSize: 7.4,
      cellPadding: 1.9,
      lineColor: [225, 225, 235],
      lineWidth: 0.2,
      minCellHeight: 5.2
    },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: [30, 41, 59], cellWidth: 38 },
      1: { halign: 'center', cellWidth: 15 },
      2: { halign: 'center', cellWidth: 13 },
      3: { halign: 'right', cellWidth: 23 },
      4: { halign: 'center', cellWidth: 24 },
      5: { halign: 'right', cellWidth: 22, fontStyle: 'bold' },
      6: { halign: 'right', cellWidth: 20 },
      7: { halign: 'right', fontStyle: 'bold', textColor: cDark, cellWidth: 27 }
    },
    didParseCell: function(data) {
      if (data.section === 'body' && data.row.index === 2) {
        data.cell.styles.fillColor = [245, 245, 250];
        data.cell.styles.fontStyle = 'bold';
      }
    }
  });
  const capFinalY = doc.lastAutoTable.finalY;

  // 5. Three-Year Trajectory Table
  const trajStartY = capFinalY + 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.0);
  doc.setTextColor(...cDark);
  doc.text('3-YEAR NET RETURN & CAPITAL RECOVERY TRAJECTORY (POST-OPEX)', margin, trajStartY);

  const depreciation = [d.investment * 0.1, d.investment * 0.09, d.investment * 0.081];
  const trajRows = [
    [
      'Year 1 (Base Year)',
      pdfCurrency(d.yearlyShare[0]),
      pdfCurrency(depreciation[0]),
      pdfCurrency(d.yearlyShare[0] + depreciation[0]),
      pdfCurrency(d.cumulative[0])
    ],
    [
      `Year 2 (+${d.yoyGrowth}% Annual Growth)`,
      pdfCurrency(d.yearlyShare[1]),
      pdfCurrency(depreciation[1]),
      pdfCurrency(d.yearlyShare[1] + depreciation[1]),
      pdfCurrency(d.cumulative[1])
    ],
    [
      `Year 3 (+${d.yoyGrowth}% Annual Growth)`,
      pdfCurrency(d.yearlyShare[2]),
      pdfCurrency(depreciation[2]),
      pdfCurrency(d.yearlyShare[2] + depreciation[2]),
      pdfCurrency(d.cumulative[2])
    ]
  ];

  doc.autoTable({
    startY: trajStartY + 2,
    margin: { left: margin },
    tableWidth: contentWidth,
    head: [['TIMELINE', `FRANCHISEE NET SHARE (+${d.yoyGrowth}% YOY)`, 'DEPRECIATION (10%)', 'YEARLY TOTAL', 'CUMULATIVE RETURN']],
    body: trajRows,
    theme: 'plain',
    headStyles: {
      fillColor: cDark,
      textColor: [255, 255, 255],
      fontSize: 7.2,
      fontStyle: 'bold',
      cellPadding: 1.8
    },
    styles: {
      fontSize: 7.4,
      cellPadding: 1.9,
      lineColor: [225, 225, 235],
      lineWidth: 0.2,
      minCellHeight: 5.2
    },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: [30, 41, 59], cellWidth: 42 },
      1: { halign: 'right', textColor: cDark, cellWidth: 36 },
      2: { halign: 'right', textColor: cMuted, cellWidth: 32 },
      3: { halign: 'right', fontStyle: 'bold', textColor: cDark, cellWidth: 34 },
      4: { halign: 'right', fontStyle: 'bold', textColor: [20, 83, 45], cellWidth: 38 }
    },
    alternateRowStyles: {
      fillColor: [249, 249, 252]
    }
  });
  const trajFinalY = doc.lastAutoTable.finalY;

  // 6. Payback Recovery Banner
  const paybackY = trajFinalY + 4;
  const paybackH = 8.5;
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, paybackY, contentWidth, paybackH, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.setTextColor(20, 83, 45);
  doc.text('Net Capital Recovery Timeline (Post-OPEX):', margin + 4, paybackY + 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(22, 101, 52);
  doc.text(`Calculated on Franchisee Net Take-Home after deducting ${pdfCurrency(d.totalExpenses)} monthly operating expenses`, margin + 4, paybackY + 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.8);
  doc.setTextColor(20, 83, 45);
  doc.text(`Estimated Net Payback: ${d.paybackYears.toFixed(1)} Years`, pageWidth - margin - 4, paybackY + 5.5, { align: 'right' });

  // 7. Executive 3 Franchisee Highlights Cards
  const hiY = paybackY + paybackH + 4.5;
  const hiH = 19;
  const hiGap = 4;
  const hiW = (contentWidth - (hiGap * 2)) / 3; // 58mm each

  const highlights = [
    {
      title: 'FRANCHISEE MONTHLY NET RETURN',
      val: `${pdfCurrency(d.investorNetMonthly)} / Mo`,
      sub: `After ${pdfCurrency(d.totalExpenses)} OPEX (${pdfCurrency(d.totalAnnualInvestorNet)} / Yr)`,
      bg: [240, 253, 244],
      border: [187, 247, 208],
      color: [20, 83, 45]
    },
    {
      title: 'TOTAL INVESTMENT',
      val: pdfCurrency(d.investment),
      sub: `Base project capital (${d.seats} seats setup)`,
      bg: [242, 246, 255],
      border: [210, 222, 255],
      color: cCompany
    },
    {
      title: '3-YEAR CUMULATIVE RECOVERY',
      val: pdfCurrency(d.cumulative[2]),
      sub: `Capital recovery on ${pdfCurrency(d.investment)} investment`,
      bg: [254, 248, 240],
      border: [251, 219, 187],
      color: [180, 83, 9]
    }
  ];

  highlights.forEach((h, idx) => {
    const hx = margin + (idx * (hiW + hiGap));
    doc.setFillColor(...h.bg);
    doc.setDrawColor(...h.border);
    doc.setLineWidth(0.3);
    doc.roundedRect(hx, hiY, hiW, hiH, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.0);
    doc.setTextColor(...h.color);
    doc.text(h.title, hx + 3.2, hiY + 4.8);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11.2);
    doc.text(h.val, hx + 3.2, hiY + 11.8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(...cMuted);
    doc.text(h.sub, hx + 3.2, hiY + 16.2);
  });

  // 8. FOFO Operating & Financial Disclosures Box (Editable)
  const noteY = hiY + hiH + 4.5;
  const rawNote = ($('fofoNotesText') && $('fofoNotesText').value.trim())
    ? $('fofoNotesText').value.trim()
    : generateDefaultNote(d);

  const inputLines = rawNote.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.3);

  let allWrappedLines = [];
  inputLines.forEach(line => {
    const cleanLine = line.replace(/₹/g, 'Rs. ');
    const wrapped = doc.splitTextToSize(cleanLine, contentWidth - 7);
    allWrappedLines.push(...wrapped);
  });

  const lineHeight = 3.4;
  const titleHeight = 5.2;
  const paddingY = 3.5;
  const calculatedH = titleHeight + (allWrappedLines.length * lineHeight) + paddingY;
  const footerY = pageHeight - 6.5;
  const footerLimit = footerY - 4.5;
  const maxAllowedH = Math.max(18, footerLimit - noteY);
  const noteH = Math.min(Math.max(calculatedH, 18), maxAllowedH);

  doc.setFillColor(254, 250, 245);
  doc.setDrawColor(245, 222, 195);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, noteY, contentWidth, noteH, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.4);
  doc.setTextColor(194, 65, 12);
  doc.text('* FOFO OPERATING & FINANCIAL MODEL DISCLOSURES & NOTES:', margin + 3.5, noteY + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.3);
  doc.setTextColor(30, 41, 59);

  let currentLineY = noteY + 8.4;
  for (let i = 0; i < allWrappedLines.length; i++) {
    if (currentLineY + 1.8 > noteY + noteH) break;
    doc.text(allWrappedLines[i], margin + 3.5, currentLineY);
    currentLineY += lineHeight;
  }

  // 9. Footer (Crisp bottom position)
  doc.setDrawColor(225, 225, 232);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 2.5, pageWidth - margin, footerY - 2.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.0);
  doc.setTextColor(...cMuted);
  doc.text('Generated via Sanelite Cinemas Franchise Intelligence Engine (FOFO Model)', margin, footerY);
  doc.text('Page 1 of 1 · Confidential & Proprietary — For Franchise Partner Assessment Only', pageWidth - margin, footerY, { align: 'right' });

  doc.save('sanelite-cinemas-fofo-model-summary.pdf');
}

// Event Listeners for Operating Inputs
ids.forEach((id) => {
  const el = $(id);
  if (el) el.addEventListener('input', update);
});

// Investor Revenue Share Sliders
if ($('investorShare')) {
  $('investorShare').addEventListener('input', update);
}
if ($('investorFnbShare')) {
  $('investorFnbShare').addEventListener('input', update);
}

// Editable FOFO Disclosures Note Listeners
if ($('fofoNotesText')) {
  $('fofoNotesText').addEventListener('input', () => {
    isNoteUserModified = true;
    if ($('noteStatusNotice')) {
      $('noteStatusNotice').textContent = 'Customized for PDF';
    }
  });
}

if ($('resetNoteBtn')) {
  $('resetNoteBtn').addEventListener('click', () => {
    isNoteUserModified = false;
    const d = model();
    if ($('fofoNotesText')) $('fofoNotesText').value = generateDefaultNote(d);
    if ($('noteStatusNotice')) {
      $('noteStatusNotice').textContent = 'Default note restored';
      setTimeout(() => { if ($('noteStatusNotice')) $('noteStatusNotice').textContent = ''; }, 2200);
    }
  });
}

if ($('resetButton')) {
  $('resetButton').addEventListener('click', () => {
    ids.forEach((id) => {
      const el = $(id);
      if (el) el.value = defaults[id];
    });
    isNoteUserModified = false;
    if ($('noteStatusNotice')) $('noteStatusNotice').textContent = '';
    update();
  });
}

if ($('exportButton')) {
  $('exportButton').addEventListener('click', () => {
    downloadPDF();
    const toast = $('toast');
    if (toast) {
      toast.textContent = 'FOFO PDF downloaded';
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2400);
    }
  });
}

if ($('logoutButton')) {
  $('logoutButton').addEventListener('click', () => {
    sessionStorage.removeItem('sanelite_auth');
    sessionStorage.removeItem('sanelite_user');
    window.location.replace('login.html');
  });
}

// Mobile Drawer & Mobile Actions Listeners
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

if ($('mobileExportButton')) {
  $('mobileExportButton').addEventListener('click', () => {
    downloadPDF();
    const toast = $('toast');
    if (toast) {
      toast.textContent = 'FOFO PDF downloaded';
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2400);
    }
  });
}

if ($('mobileLogoutButton')) {
  $('mobileLogoutButton').addEventListener('click', () => {
    sessionStorage.removeItem('sanelite_auth');
    sessionStorage.removeItem('sanelite_user');
    window.location.replace('login.html');
  });
}

// Slider Stepper Buttons (- and + icons)
function initRangeSteppers() {
  document.querySelectorAll('.stepper-btn').forEach((btn) => {
    const targetId = btn.getAttribute('data-target');
    const isIncrement = btn.classList.contains('stepper-btn-plus');
    const input = $(targetId);
    if (!input) return;

    let stepInterval = null;
    let stepTimeout = null;
    let holdActive = false;

    const doStep = () => {
      const min = input.min !== '' ? Number(input.min) : 0;
      const max = input.max !== '' ? Number(input.max) : 100;
      const step = Number(input.step) || 1;
      let val = Number(input.value) || 0;
      if (isIncrement) {
        val = Math.min(max, val + step);
      } else {
        val = Math.max(min, val - step);
      }
      if (val !== Number(input.value)) {
        input.value = val;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    };

    btn.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      holdActive = false;
      clearTimeout(stepTimeout);
      clearInterval(stepInterval);
      stepTimeout = setTimeout(() => {
        holdActive = true;
        stepInterval = setInterval(doStep, 70);
      }, 350);
    });

    const stopHold = () => {
      clearTimeout(stepTimeout);
      clearInterval(stepInterval);
    };

    btn.addEventListener('mouseup', stopHold);
    btn.addEventListener('mouseleave', stopHold);

    btn.addEventListener('touchstart', () => {
      holdActive = false;
      clearTimeout(stepTimeout);
      clearInterval(stepInterval);
      stepTimeout = setTimeout(() => {
        holdActive = true;
        stepInterval = setInterval(doStep, 70);
      }, 350);
    }, { passive: true });

    btn.addEventListener('touchend', stopHold);
    btn.addEventListener('touchcancel', stopHold);

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (holdActive) {
        holdActive = false;
        return;
      }
      doStep();
    });
  });
}

initRangeSteppers();
update();
