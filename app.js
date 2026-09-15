const defaults = { seats: 250, weekdayShowsPerDay: 4, weekendShowsPerDay: 5, foodRate: 80, weekdayOccupancy: 25, weekendOccupancy: 45, weekdayRate: 200, weekendRate: 250, investorShare: 25, yoyGrowth: 5, investment: 22500000 };
const ids = Object.keys(defaults);
const $ = (id) => document.getElementById(id);
const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const shortCurrency = (value) => {
  const abs = Math.abs(value);
  if (abs >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (abs >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
  return currency.format(value);
};
const number = (id) => Number($(id) ? $(id).value : 0) || 0;

let isNoteUserModified = false;

function generateDefaultNote(d) {
  const growth = (d && d.yoyGrowth !== undefined) ? d.yoyGrowth : 5;
  return [
    '• Under the FOCO model, the Franchisee shall receive Net Box Office Ticket Revenue and Net Food & Beverage Revenue generated from the Cinema.',
    '• All day-to-day operational expenses (OPEX) of the Cinema shall be borne and paid by the Franchisor.',
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
  const weekdayBookings = totalWeekdaySeats * number('weekdayOccupancy') / 100;
  const weekendBookings = totalWeekendSeats * number('weekendOccupancy') / 100;
  const weekdayRevenue = weekdayBookings * number('weekdayRate');
  const weekendRevenue = weekendBookings * number('weekendRate');
  const ticketIncome = weekdayRevenue + weekendRevenue;
  const gstTicket = ticketIncome * 18 / 118;
  const showTax = totalShows * 25;
  const boxOfficeTax = gstTicket + showTax;
  const netTicket = ticketIncome - boxOfficeTax;

  const foodIncome = (weekdayBookings + weekendBookings) * number('foodRate');
  const foodTax = foodIncome * 5 / 105;
  const netFood = foodIncome - foodTax;
  const netFoodAvailable = netFood;

  const totalIncome = ticketIncome + foodIncome;
  const taxes = boxOfficeTax + foodTax;
  const available = netTicket + netFoodAvailable;
  const investorSharePct = $('investorShare') ? number('investorShare') : 25;
  const monthlyShare = available * investorSharePct / 100;
  const annualShare = monthlyShare * 12;
  const investment = number('investment');
  const depreciation = [investment * .1, investment * .09, investment * .081];

  const yoyGrowth = $('yoyGrowth') ? number('yoyGrowth') : 5;
  const growthMult = 1 + (yoyGrowth / 100);
  const yearlyShare = [annualShare, annualShare * growthMult, annualShare * growthMult * growthMult];
  const cumulative = [];
  yearlyShare.reduce((sum, amount, i) => { const total = sum + amount + depreciation[i]; cumulative.push(total); return total; }, 0);
  return { seats, weekdayShowsPerDay, weekendShowsPerDay, totalWeekdayShows, totalWeekendShows, totalShows, totalWeekdaySeats, totalWeekendSeats, totalMonthlySeats, weekdayBookings, weekendBookings, weekdayRevenue, weekendRevenue, ticketIncome, gstTicket, showTax, boxOfficeTax, netTicket, foodIncome, foodTax, netFood, fnbCostPct: 0, fnbCostAmount: 0, netFoodAvailable, taxes, totalIncome, available, investorSharePct, monthlyShare, annualShare, investment, yoyGrowth, yearlyShare, cumulative };
}
function update() {
  const d = model();
  if ($('weekdayOccupancyValue')) {
    $('weekdayOccupancyValue').value = `${number('weekdayOccupancy')}%`;
    $('weekdayOccupancyValue').textContent = `${number('weekdayOccupancy')}%`;
  }
  if ($('weekendOccupancyValue')) {
    $('weekendOccupancyValue').value = `${number('weekendOccupancy')}%`;
    $('weekendOccupancyValue').textContent = `${number('weekendOccupancy')}%`;
  }
  if ($('investorShareValue')) {
    $('investorShareValue').value = `${d.investorSharePct}%`;
    $('investorShareValue').textContent = `${d.investorSharePct}%`;
  }
  if ($('yoyGrowthValue')) {
    $('yoyGrowthValue').value = `${d.yoyGrowth}%`;
    $('yoyGrowthValue').textContent = `${d.yoyGrowth}%`;
  }
  if ($('growthPill')) {
    $('growthPill').textContent = `${d.yoyGrowth}% annual growth`;
  }
  $('investmentHero').textContent = shortCurrency(d.investment);
  $('monthlyShare').textContent = shortCurrency(d.monthlyShare);
  $('annualShareNote').textContent = `${shortCurrency(d.annualShare)} annually`;
  $('totalIncome').textContent = shortCurrency(d.totalIncome);
  if ($('yearOneYield')) $('yearOneYield').textContent = d.investment ? `${(d.annualShare / d.investment * 100).toFixed(1)}%` : '—';
  if ($('yearOneValue')) $('yearOneValue').textContent = `${shortCurrency(d.annualShare)} before depreciation`;
  $('threeYearReturn').textContent = shortCurrency(d.cumulative[2]);
  $('threeYearPercent').textContent = d.investment ? `${(d.cumulative[2] / d.investment * 100).toFixed(1)}% of initial investment` : '—';
  $('grossRevenue').textContent = shortCurrency(d.totalIncome);
  $('ticketRevenue').textContent = shortCurrency(d.ticketIncome);
  $('foodRevenue').textContent = shortCurrency(d.foodIncome);
  if ($('boxOfficeTaxDisplay')) $('boxOfficeTaxDisplay').textContent = `-${shortCurrency(d.boxOfficeTax)}`;
  if ($('fnbTaxDisplay')) $('fnbTaxDisplay').textContent = `-${shortCurrency(d.foodTax)}`;
  $('taxRevenue').textContent = `-${shortCurrency(d.taxes)}`;
  $('availableForSharing').textContent = shortCurrency(d.available);
  const totalForDonut = d.totalIncome || 1;
  const ticketEnd = d.ticketIncome / totalForDonut * 100;
  const foodEnd = ticketEnd + d.foodIncome / totalForDonut * 100;
  $('revenueDonut').style.background = `conic-gradient(var(--purple) 0 ${ticketEnd}%, var(--teal) ${ticketEnd}% ${foodEnd}%, #e9eaf0 ${foodEnd}% 100%)`;
  $('weekdayShows').textContent = d.totalWeekdayShows;
  $('weekendShows').textContent = d.totalWeekendShows;
  if ($('weekdayTotalSeats')) $('weekdayTotalSeats').textContent = d.totalWeekdaySeats.toLocaleString('en-IN');
  if ($('weekendTotalSeats')) $('weekendTotalSeats').textContent = d.totalWeekendSeats.toLocaleString('en-IN');
  if ($('showsSourceNote')) {
    $('showsSourceNote').textContent = `18 weekdays × ${d.weekdayShowsPerDay} shows (${d.totalWeekdaySeats.toLocaleString('en-IN')} seats) · 12 weekend days × ${d.weekendShowsPerDay} shows (${d.totalWeekendSeats.toLocaleString('en-IN')} seats)`;
  }
  $('weekdayBookings').textContent = Math.round(d.weekdayBookings).toLocaleString('en-IN');
  $('weekendBookings').textContent = Math.round(d.weekendBookings).toLocaleString('en-IN');
  $('weekdayRevenue').textContent = shortCurrency(d.weekdayRevenue);
  $('weekendRevenue').textContent = shortCurrency(d.weekendRevenue);
  const max = Math.max(...d.cumulative, 1);
  [['barOne', 'barOneValue', 0], ['barTwo', 'barTwoValue', 1], ['barThree', 'barThreeValue', 2]].forEach(([bar, value, i]) => { $(bar).style.height = `${Math.max(8, d.cumulative[i] / max * 142)}px`; $(value).textContent = shortCurrency(d.cumulative[i]); });
  const payback = d.annualShare ? d.investment / d.annualShare : 0;
  $('payback').textContent = payback ? `Payback in ${payback.toFixed(1)} years` : 'Payback unavailable';

  // FOCO Disclosures Note (Sync with defaults if user hasn't typed custom notes)
  if ($('focoNotesText') && !isNoteUserModified) {
    $('focoNotesText').value = generateDefaultNote(d);
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
  const contentWidth = pageWidth - (margin * 2);

  const cDark = [24, 24, 33];
  const cAccent = [240, 85, 55];
  const cAccentDark = [201, 61, 37];
  const cMuted = [113, 113, 126];
  const cCardBg = [247, 247, 250];
  const cCardBorder = [228, 228, 235];
  const cHighlightBg = [255, 244, 241];
  const cHighlightBorder = [255, 217, 208];

  const pdfCurrency = (val) => {
    const abs = Math.abs(val);
    if (abs >= 10000000) return `Rs. ${(val / 10000000).toFixed(2)} Cr`;
    if (abs >= 100000) return `Rs. ${(val / 100000).toFixed(2)} L`;
    return `Rs. ${Math.round(val).toLocaleString('en-IN')}`;
  };

  const pdfCurrencyWithStar = (val) => {
    const abs = Math.abs(val);
    if (abs >= 10000000) return `Rs. ${(val / 10000000).toFixed(2)}* Cr`;
    if (abs >= 100000) return `Rs. ${(val / 100000).toFixed(2)}* L`;
    return `Rs. ${Math.round(val).toLocaleString('en-IN')}*`;
  };

  // Header Banner
  if (typeof SANELITE_LOGO !== 'undefined') {
    // Exact aspect ratio of 3320 x 713 (4.656:1) to prevent any stretching
    const logoW = 51.2;
    const logoH = 11;
    doc.addImage(SANELITE_LOGO, 'PNG', margin, 11, logoW, logoH);
  } else {
    doc.setFillColor(...cAccent);
    doc.roundedRect(margin, 12, 11, 11, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('times', 'bold');
    doc.setFontSize(17);
    doc.text('S', margin + 3.3, 20);

    doc.setTextColor(...cDark);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('Sanelite Cinemas', margin + 14, 20);
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...cMuted);
  doc.text('Cinema Franchise Investment & ROI Executive Summary', margin, 26.5);

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  doc.setFontSize(8);
  doc.setTextColor(...cMuted);
  doc.text(`Generated: ${dateStr}`, pageWidth - margin, 17, { align: 'right' });

  doc.setFillColor(255, 240, 236);
  doc.setDrawColor(...cHighlightBorder);
  doc.roundedRect(pageWidth - margin - 37, 20, 37, 5.5, 1, 1, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...cAccentDark);
  doc.text('FRANCHISE INTELLIGENCE', pageWidth - margin - 18.5, 24, { align: 'center' });

  doc.setDrawColor(220, 220, 228);
  doc.setLineWidth(0.3);
  doc.line(margin, 28, pageWidth - margin, 28);

  // 3 Top KPI Cards (Height 22mm, spacious and aligned)
  const cardY = 31;
  const cardH = 22;
  const gap = 4;
  const cardW = (contentWidth - (gap * 2)) / 3; // 58mm each

  const cards = [
    {
      title: 'MONTHLY FRANCHISE SHARE',
      val: pdfCurrencyWithStar(d.monthlyShare),
      sub: `${pdfCurrency(d.annualShare)} annually`,
      highlight: true
    },
    {
      title: 'INITIAL INVESTMENT',
      val: pdfCurrencyWithStar(d.investment),
      sub: `Base setup (${d.seats} seats)`,
      highlight: false
    },
    {
      title: '3-YEAR CUMULATIVE RETURN',
      val: pdfCurrencyWithStar(d.cumulative[2]),
      sub: d.investment ? `${(d.cumulative[2] / d.investment * 100).toFixed(1)}% of capital` : '—',
      highlight: false
    }
  ];

  cards.forEach((card, idx) => {
    const x = margin + (idx * (cardW + gap));
    if (card.highlight) {
      doc.setFillColor(...cHighlightBg);
      doc.setDrawColor(...cHighlightBorder);
    } else {
      doc.setFillColor(...cCardBg);
      doc.setDrawColor(...cCardBorder);
    }
    doc.setLineWidth(0.3);
    doc.roundedRect(x, cardY, cardW, cardH, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(...(card.highlight ? cAccentDark : cMuted));
    doc.text(card.title, x + 4, cardY + 6.0);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12.2);
    doc.setTextColor(...(card.highlight ? cAccentDark : cDark));
    doc.text(card.val, x + 4, cardY + 13.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.6);
    doc.setTextColor(...cMuted);
    doc.text(card.sub, x + 4, cardY + 18.5);
  });

  // 1. Side-by-side Tables: Assumptions & Monthly Breakdown (11 rows each, zero overlap)
  const tableY = 57;
  const colW = (contentWidth - 6) / 2; // 88mm each

  // Left Table: Assumptions (10 balanced rows matching Right Table)
  doc.autoTable({
    startY: tableY,
    margin: { left: margin },
    tableWidth: colW,
    head: [['OPERATING ASSUMPTIONS', 'VALUE']],
    body: [
      ['Total Seat Capacity', `${d.seats} Seats`],
      ['Shows / Day (Wkday / Wkend)', `${d.weekdayShowsPerDay} / ${d.weekendShowsPerDay} Shows`],
      ['Occupancy (Wkday / Wkend)', `${number('weekdayOccupancy')}% / ${number('weekendOccupancy')}%`],
      ['Ticket Price (Wkday / Wkend)', `Rs. ${number('weekdayRate')} / Rs. ${number('weekendRate')}`],
      ['F&B Spend / Booking', `Rs. ${number('foodRate')}`],
      ['Initial Setup Investment', pdfCurrency(d.investment)],
      ['Box Office Tax (18% + Show)', `-${pdfCurrency(d.boxOfficeTax)}`],
      ['F&B Tax (5% GST Inclusive)', `-${pdfCurrency(d.foodTax)}`],
      ['Monthly Franchise Share', `${number('investorShare')}%`],
      ['YoY Admissions Growth', `${d.yoyGrowth}% / Year`]
    ],
    theme: 'plain',
    headStyles: {
      fillColor: [36, 36, 48],
      textColor: [255, 255, 255],
      fontSize: 7.4,
      fontStyle: 'bold',
      cellPadding: 1.8
    },
    styles: {
      fontSize: 7.1,
      cellPadding: 1.5,
      minCellHeight: 4.6,
      lineColor: [225, 225, 235],
      lineWidth: 0.2
    },
    columnStyles: {
      0: { textColor: [50, 50, 65] },
      1: { halign: 'right', fontStyle: 'bold', textColor: cDark }
    },
    didParseCell: function(data) {
      if (data.section === 'body') {
        if (data.row.index === 6 || data.row.index === 7) {
          data.cell.styles.textColor = [160, 60, 30];
        }
        if (data.row.index === 8) {
          data.cell.styles.textColor = cAccentDark;
          data.cell.styles.fontStyle = 'bold';
        }
      }
    }
  });
  const leftFinalY = doc.lastAutoTable.finalY;

  // Right Table: Financial Breakdown (10 balanced rows matching Left Table)
  doc.autoTable({
    startY: tableY,
    margin: { left: margin + colW + 6 },
    tableWidth: colW,
    head: [['MONTHLY FINANCIAL BREAKDOWN', 'AMOUNT']],
    body: [
      ['Box Office Revenue (Gross)', pdfCurrency(d.ticketIncome)],
      ['Food & Beverage (F&B) Revenue', pdfCurrency(d.foodIncome)],
      ['Gross Total Monthly Income', pdfCurrency(d.totalIncome)],
      ['Less: Box Office Tax (18% + Show)', `-${pdfCurrency(d.boxOfficeTax)}`],
      ['Less: F&B Tax (5% GST Inclusive)', `-${pdfCurrency(d.foodTax)}`],
      ['Total Statutory Taxes Deducted', `-${pdfCurrency(d.taxes)}`],
      ['Net Distributable Income', pdfCurrency(d.available)],
      ['Monthly Franchise Share (' + d.investorSharePct + '%)', pdfCurrency(d.monthlyShare)],
      ['Annual Franchise Share', pdfCurrency(d.annualShare)],
      ['Estimated Payback Horizon', d.annualShare ? `${(d.investment / d.annualShare).toFixed(1)} Years` : '—']
    ],
    theme: 'plain',
    headStyles: {
      fillColor: [36, 36, 48],
      textColor: [255, 255, 255],
      fontSize: 7.4,
      fontStyle: 'bold',
      cellPadding: 1.8
    },
    styles: {
      fontSize: 7.1,
      cellPadding: 1.5,
      minCellHeight: 4.6,
      lineColor: [225, 225, 235],
      lineWidth: 0.2
    },
    columnStyles: {
      0: { textColor: [50, 50, 65] },
      1: { halign: 'right', fontStyle: 'bold', textColor: cDark }
    },
    didParseCell: function(data) {
      if (data.section === 'body') {
        if (data.row.index === 2 || data.row.index === 5) {
          data.cell.styles.fillColor = [245, 245, 250];
          data.cell.styles.fontStyle = 'bold';
        }
        if (data.row.index === 3 || data.row.index === 4) {
          data.cell.styles.textColor = [160, 60, 30];
        }
        if (data.row.index === 5) {
          data.cell.styles.textColor = [160, 60, 30];
        }
        if (data.row.index === 6 || data.row.index === 7) {
          data.cell.styles.fillColor = cHighlightBg;
          data.cell.styles.textColor = cAccentDark;
          data.cell.styles.fontStyle = 'bold';
        }
      }
    }
  });
  const rightFinalY = doc.lastAutoTable.finalY;

  // 2. Full-Width Ticketing Capacity & Footfall Table (Clean spacing)
  const capY = Math.max(leftFinalY, rightFinalY) + 4.5;

  doc.autoTable({
    startY: capY,
    margin: { left: margin },
    tableWidth: contentWidth,
    head: [['PERIOD', 'SHOWS/DAY', 'DAYS', 'TOTAL SEATS', 'OCCUPANCY', 'BOOKINGS', 'TICKET RATE', 'TICKET REVENUE']],
    body: [
      ['Mon–Thu (Weekdays)', `${d.weekdayShowsPerDay}`, '18', d.totalWeekdaySeats.toLocaleString('en-IN'), `${number('weekdayOccupancy')}%`, Math.round(d.weekdayBookings).toLocaleString('en-IN'), `Rs. ${number('weekdayRate')}`, pdfCurrency(d.weekdayRevenue)],
      ['Fri–Sun (Weekends)', `${d.weekendShowsPerDay}`, '12', d.totalWeekendSeats.toLocaleString('en-IN'), `${number('weekendOccupancy')}%`, Math.round(d.weekendBookings).toLocaleString('en-IN'), `Rs. ${number('weekendRate')}`, pdfCurrency(d.weekendRevenue)],
      ['Total Monthly Capacity', `${d.totalShows} Shows`, '30', d.totalMonthlySeats.toLocaleString('en-IN'), '—', Math.round(d.weekdayBookings + d.weekendBookings).toLocaleString('en-IN'), '—', pdfCurrency(d.ticketIncome)]
    ],
    theme: 'plain',
    headStyles: {
      fillColor: [48, 48, 62],
      textColor: [255, 255, 255],
      fontSize: 7.2,
      fontStyle: 'bold',
      cellPadding: 1.8
    },
    styles: {
      fontSize: 7.1,
      cellPadding: 1.5,
      minCellHeight: 4.6,
      lineColor: [225, 225, 235],
      lineWidth: 0.2
    },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: [50, 50, 65] },
      1: { halign: 'center' },
      2: { halign: 'center' },
      3: { halign: 'right' },
      4: { halign: 'center' },
      5: { halign: 'right', fontStyle: 'bold' },
      6: { halign: 'right' },
      7: { halign: 'right', fontStyle: 'bold', textColor: cDark }
    },
    didParseCell: function(data) {
      if (data.section === 'body' && data.row.index === 2) {
        data.cell.styles.fillColor = [245, 245, 250];
        data.cell.styles.fontStyle = 'bold';
      }
    }
  });
  const capFinalY = doc.lastAutoTable.finalY;

  // 3. Three-Year Trajectory Table (Clean spacing)
  const trajY = capFinalY + 4.5;
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
    startY: trajY,
    margin: { left: margin },
    tableWidth: contentWidth,
    head: [['TIMELINE', `FRANCHISE SHARE (${d.yoyGrowth}% GROWTH)`, 'DEPRECIATION (10%)', 'YEARLY TOTAL', 'CUMULATIVE RETURN']],
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
      fontSize: 7.1,
      cellPadding: 1.5,
      minCellHeight: 4.6,
      lineColor: [225, 225, 235],
      lineWidth: 0.2
    },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: [50, 50, 65], cellWidth: 48 },
      1: { halign: 'right', textColor: cDark },
      2: { halign: 'right', textColor: cMuted },
      3: { halign: 'right', fontStyle: 'bold', textColor: cDark },
      4: { halign: 'right', fontStyle: 'bold', textColor: cAccentDark }
    },
    alternateRowStyles: {
      fillColor: [249, 249, 252]
    }
  });
  const trajFinalY = doc.lastAutoTable.finalY;

  // 4. Payback summary banner
  const bannerY = trajFinalY + 3.5;
  const bannerH = 7.5;
  doc.setFillColor(243, 240, 255);
  doc.setDrawColor(223, 216, 250);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, bannerY, contentWidth, bannerH, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(85, 52, 196);
  doc.text('Capital Recovery Timeline:', margin + 4, bannerY + 5);

  const paybackYears = d.annualShare ? (d.investment / d.annualShare).toFixed(1) : '—';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(`Estimated Full Payback in ${paybackYears} Years (at current assumptions)`, pageWidth - margin - 4, bannerY + 5, { align: 'right' });

  // 5. FOCO Operating & Financial Disclosures Box (Editable)
  const noteY = bannerY + bannerH + 3.5;
  const rawNote = ($('focoNotesText') && $('focoNotesText').value.trim())
    ? $('focoNotesText').value.trim()
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
  doc.text('* FOCO OPERATING & FINANCIAL MODEL DISCLOSURES & NOTES:', margin + 3.5, noteY + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.3);
  doc.setTextColor(30, 41, 59);

  let currentLineY = noteY + 8.4;
  for (let i = 0; i < allWrappedLines.length; i++) {
    if (currentLineY + 1.8 > noteY + noteH) break;
    doc.text(allWrappedLines[i], margin + 3.5, currentLineY);
    currentLineY += lineHeight;
  }

  // Footer (Crisp bottom position)
  doc.setDrawColor(225, 225, 232);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 2.5, pageWidth - margin, footerY - 2.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(...cMuted);
  doc.text('Generated via Sanelite Cinemas Franchise Intelligence Engine (FOCO Model)', margin, footerY);
  doc.text('Page 1 of 1 · Confidential & Proprietary — For Franchise Partner Assessment Only', pageWidth - margin, footerY, { align: 'right' });

  doc.save('sanelite-cinemas-roi-summary.pdf');
}

ids.forEach((id) => $(id).addEventListener('input', update));

// Editable FOCO Disclosures Note Listeners
if ($('focoNotesText')) {
  $('focoNotesText').addEventListener('input', () => {
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
    if ($('focoNotesText')) $('focoNotesText').value = generateDefaultNote(d);
    if ($('noteStatusNotice')) {
      $('noteStatusNotice').textContent = 'Default note restored';
      setTimeout(() => { if ($('noteStatusNotice')) $('noteStatusNotice').textContent = ''; }, 2200);
    }
  });
}

$('resetButton').addEventListener('click', () => {
  ids.forEach((id) => { $(id).value = defaults[id]; });
  isNoteUserModified = false;
  if ($('noteStatusNotice')) $('noteStatusNotice').textContent = '';
  update();
});
$('exportButton').addEventListener('click', () => {
  downloadPDF();
  $('toast').textContent = 'PDF downloaded';
  $('toast').classList.add('show');
  setTimeout(() => $('toast').classList.remove('show'), 2400);
});
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
      toast.textContent = 'PDF downloaded';
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

