const defaults = { seats: 210, weekdayShowsPerDay: 2, weekendShowsPerDay: 4, foodRate: 80, weekdayOccupancy: 35, weekendOccupancy: 45, weekdayRate: 200, weekendRate: 250, investorShare: 25, investment: 22500000 };
const ids = Object.keys(defaults);
const $ = (id) => document.getElementById(id);
const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const shortCurrency = (value) => {
  const abs = Math.abs(value);
  if (abs >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (abs >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
  return currency.format(value);
};
const number = (id) => Number($(id).value) || 0;

function model() {
  const seats = number('seats');
  const weekdayShowsPerDay = number('weekdayShowsPerDay') || 2;
  const weekendShowsPerDay = number('weekendShowsPerDay') || 4;
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
  const foodIncome = (weekdayBookings + weekendBookings) * number('foodRate');
  const foodTax = foodIncome * 5 / 105;
  const totalIncome = ticketIncome + foodIncome;
  const taxes = gstTicket + showTax + foodTax;
  const available = totalIncome - taxes;
  const monthlyShare = available * number('investorShare') / 100;
  const annualShare = monthlyShare * 12;
  const investment = number('investment');
  const depreciation = [investment * .1, investment * .09, investment * .081];
  const yearlyShare = [annualShare, annualShare * 1.08, annualShare * 1.08 * 1.08];
  const cumulative = [];
  yearlyShare.reduce((sum, amount, i) => { const total = sum + amount + depreciation[i]; cumulative.push(total); return total; }, 0);
  return { seats, weekdayShowsPerDay, weekendShowsPerDay, totalWeekdayShows, totalWeekendShows, totalShows, totalWeekdaySeats, totalWeekendSeats, totalMonthlySeats, weekdayBookings, weekendBookings, weekdayRevenue, weekendRevenue, ticketIncome, foodIncome, taxes, totalIncome, available, monthlyShare, annualShare, investment, yearlyShare, cumulative };
}
function update() {
  const d = model();
  $('weekdayOccupancyValue').value = `${number('weekdayOccupancy')}%`;
  $('weekendOccupancyValue').value = `${number('weekendOccupancy')}%`;
  $('investorShareValue').value = `${number('investorShare')}%`;
  $('investmentHero').textContent = shortCurrency(d.investment);
  $('monthlyShare').textContent = shortCurrency(d.monthlyShare);
  $('annualShareNote').textContent = `${shortCurrency(d.annualShare)} annually`;
  $('totalIncome').textContent = shortCurrency(d.totalIncome);
  $('yearOneYield').textContent = d.investment ? `${(d.annualShare / d.investment * 100).toFixed(1)}%` : '—';
  $('yearOneValue').textContent = `${shortCurrency(d.annualShare)} before depreciation`;
  $('threeYearReturn').textContent = shortCurrency(d.cumulative[2]);
  $('threeYearPercent').textContent = d.investment ? `${(d.cumulative[2] / d.investment * 100).toFixed(1)}% of initial investment` : '—';
  $('grossRevenue').textContent = shortCurrency(d.totalIncome);
  $('ticketRevenue').textContent = shortCurrency(d.ticketIncome);
  $('foodRevenue').textContent = shortCurrency(d.foodIncome);
  $('taxRevenue').textContent = shortCurrency(d.taxes);
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
  doc.setLineWidth(0.4);
  doc.line(margin, 29.5, pageWidth - margin, 29.5);

  // 4 Top KPI Cards
  const cardY = 33.5;
  const cardH = 23;
  const gap = 3.5;
  const cardW = (contentWidth - (gap * 3)) / 4;

  const cards = [
    {
      title: 'MONTHLY INVESTOR SHARE',
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
      title: 'YEAR 1 CASH YIELD',
      val: d.investment ? `${(d.annualShare / d.investment * 100).toFixed(1)}*%` : '—',
      sub: 'Before depreciation',
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
    doc.setFontSize(6.5);
    doc.setTextColor(...(card.highlight ? cAccentDark : cMuted));
    doc.text(card.title, x + 3.5, cardY + 6.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...(card.highlight ? cAccentDark : cDark));
    doc.text(card.val, x + 3.5, cardY + 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...cMuted);
    doc.text(card.sub, x + 3.5, cardY + 19);
  });

  // 1. Side-by-side Tables: Assumptions & Monthly Breakdown
  const tableY = 56;
  const colW = (contentWidth - 6) / 2;

  // Left Table: Assumptions (Clean 8 balanced rows)
  doc.autoTable({
    startY: tableY,
    margin: { left: margin },
    tableWidth: colW,
    head: [['OPERATING ASSUMPTIONS', 'VALUE']],
    body: [
      ['Total Seat Capacity', `${d.seats} Seats`],
      ['Shows / Day (Mon-Thu / Fri-Sun)', `${d.weekdayShowsPerDay} Shows / ${d.weekendShowsPerDay} Shows`],
      ['Weekday Occupancy (Mon-Thu)', `${number('weekdayOccupancy')}%`],
      ['Weekend Occupancy (Fri-Sun)', `${number('weekendOccupancy')}%`],
      ['Ticket Price (Mon-Thu / Fri-Sun)', `Rs. ${number('weekdayRate')} / Rs. ${number('weekendRate')}`],
      ['F&B Spend / Booking', `Rs. ${number('foodRate')}`],
      ['Investor Profit Share', `${number('investorShare')}%`],
      ['Total Monthly Shows', `${d.totalShows} Shows (${d.totalWeekdayShows} Mon-Thu / ${d.totalWeekendShows} Fri-Sun)`]
    ],
    theme: 'plain',
    headStyles: {
      fillColor: [36, 36, 48],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      cellPadding: 2.5
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2.1,
      lineColor: [235, 235, 240],
      lineWidth: 0.2
    },
    columnStyles: {
      0: { textColor: [60, 60, 72] },
      1: { halign: 'right', fontStyle: 'bold', textColor: cDark }
    }
  });
  const leftFinalY = doc.lastAutoTable.finalY;

  // Right Table: Financial Breakdown (Matching 8 balanced rows)
  doc.autoTable({
    startY: tableY,
    margin: { left: margin + colW + 6 },
    tableWidth: colW,
    head: [['MONTHLY FINANCIAL BREAKDOWN', 'AMOUNT']],
    body: [
      ['Box Office Revenue', pdfCurrency(d.ticketIncome)],
      ['Food & Beverage (F&B) Revenue', pdfCurrency(d.foodIncome)],
      ['Gross Total Monthly Income', pdfCurrency(d.totalIncome)],
      ['Taxes (18% GST, 5% F&B, Show Tax)', `-${pdfCurrency(d.taxes)}`],
      ['Net Distributable Income', pdfCurrency(d.available)],
      ['Monthly Investor Share', pdfCurrency(d.monthlyShare)],
      ['Annual Investor Share', pdfCurrency(d.annualShare)],
      ['Estimated Payback Horizon', d.annualShare ? `${(d.investment / d.annualShare).toFixed(1)} Years` : '—']
    ],
    theme: 'plain',
    headStyles: {
      fillColor: [36, 36, 48],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      cellPadding: 2.5
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2.1,
      lineColor: [235, 235, 240],
      lineWidth: 0.2
    },
    columnStyles: {
      0: { textColor: [60, 60, 72] },
      1: { halign: 'right', fontStyle: 'bold', textColor: cDark }
    },
    didParseCell: function(data) {
      if (data.section === 'body') {
        if (data.row.index === 2 || data.row.index === 4) {
          data.cell.styles.fillColor = [245, 245, 250];
        }
        if (data.row.index === 5 || data.row.index === 6) {
          data.cell.styles.fillColor = cHighlightBg;
          data.cell.styles.textColor = cAccentDark;
        }
      }
    }
  });
  const rightFinalY = doc.lastAutoTable.finalY;

  // 2. Full-Width Ticketing Capacity & Footfall Table
  const capY = Math.max(leftFinalY, rightFinalY) + 5;

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
      fontSize: 7.5,
      fontStyle: 'bold',
      cellPadding: 2.5
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2.2,
      lineColor: [230, 230, 238],
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

  // 3. Three-Year Trajectory Table
  const trajY = capFinalY + 5;
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
      'Year 2 (+8% Annual Growth)',
      pdfCurrency(d.yearlyShare[1]),
      pdfCurrency(depreciation[1]),
      pdfCurrency(d.yearlyShare[1] + depreciation[1]),
      pdfCurrency(d.cumulative[1])
    ],
    [
      'Year 3 (+8% Annual Growth)',
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
    head: [['TIMELINE', 'INVESTOR SHARE (8% GROWTH)', 'DEPRECIATION (10%)', 'YEARLY TOTAL', 'CUMULATIVE RETURN']],
    body: trajRows,
    theme: 'plain',
    headStyles: {
      fillColor: cDark,
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      cellPadding: 2.5
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2.2,
      lineColor: [230, 230, 238],
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
  const finalY2 = trajFinalY + 3.5;
  doc.setFillColor(243, 240, 255);
  doc.setDrawColor(223, 216, 250);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, finalY2, contentWidth, 7.5, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(85, 52, 196);
  doc.text('Capital Recovery Timeline:', margin + 4, finalY2 + 5);

  const paybackYears = d.annualShare ? (d.investment / d.annualShare).toFixed(1) : '—';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(`Estimated Full Payback in ${paybackYears} Years (at current assumptions)`, pageWidth - margin - 4, finalY2 + 5, { align: 'right' });

  // 5. Disclaimer Note Box
  const noteY = finalY2 + 10.5;
  doc.setFillColor(254, 250, 245);
  doc.setDrawColor(245, 222, 195);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, noteY, contentWidth, 13, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(190, 80, 25);
  doc.text('* Note:', margin + 3.5, noteY + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(85, 85, 95);
  const noteLines = [
    'All financial projections, cash yields, and returns shown above are estimates based on standard operating assumptions',
    '(occupancy, ticket pricing, and F&B spends) as per the franchise investment workbook. Actual performance may vary',
    'based on local market conditions, seasonality, government policies, and day-to-day operational efficiencies.'
  ];
  noteLines.forEach((line, lineIdx) => {
    doc.text(line, margin + 14, noteY + 4.5 + (lineIdx * 3.3));
  });

  // Footer
  const footerY = pageHeight - 9;
  doc.setDrawColor(225, 225, 232);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 2.5, pageWidth - margin, footerY - 2.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...cMuted);
  doc.text('Generated via Sanelite Cinemas Franchise Intelligence Engine', margin, footerY);
  doc.text('Confidential & Proprietary — For Investor Assessment Only', pageWidth - margin, footerY, { align: 'right' });

  doc.save('sanelite-cinemas-roi-summary.pdf');
}

ids.forEach((id) => $(id).addEventListener('input', update));
$('resetButton').addEventListener('click', () => { ids.forEach((id) => { $(id).value = defaults[id]; }); update(); });
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
update();

