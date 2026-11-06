import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatDateTime, formatRupiah } from './format'

export function exportPdfReport({ periodLabel, totals, sales = [], expenses = [] }) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const primaryColor = [27, 77, 62] // #1B4D3E (Coolcash Primary Dark Green)
  const secondaryColor = [45, 95, 78] // #2D5F4E
  const accentAmber = [217, 119, 6] // #D97706
  const textDark = [33, 37, 41]
  const textMuted = [108, 117, 125]
  const borderLight = [226, 232, 240]

  const dateStr = new Date().toISOString().slice(0, 10)
  const nowFormatted = formatDateTime(new Date())

  // --- 1. Top Decorative Brand Bar ---
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, 210, 5, 'F')

  // --- 2. Header Section ---
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(...primaryColor)
  doc.text('COOLCASH', 14, 18)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...textMuted)
  doc.text('Laporan Keuangan & Penjualan Usaha', 14, 24)

  // Header Right Metadata
  doc.setFontSize(9)
  doc.setTextColor(...textDark)
  doc.text(`Periode:`, 140, 16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...primaryColor)
  doc.text(periodLabel, 165, 16)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...textDark)
  doc.text(`Dicetak:`, 140, 22)
  doc.setTextColor(...textMuted)
  doc.text(nowFormatted, 165, 22)

  // Divider
  doc.setDrawColor(...borderLight)
  doc.setLineWidth(0.4)
  doc.line(14, 28, 196, 28)

  // --- 3. Executive Financial Summary Table ---
  const summaryBody = [
    [
      'Total Uang Masuk (Penjualan)',
      formatRupiah(totals.income),
      `${totals.transactions} transaksi penjualan tercatat`,
    ],
    [
      'Total Uang Keluar (Semua Pengeluaran)',
      formatRupiah(totals.outcome),
      'Total belanja stok barang dan beban operasional',
    ],
    [
      '  - Belanja Stok / Kulakan Barang',
      formatRupiah(totals.restockExpense),
      totals.outcome > 0
        ? `${Math.round((totals.restockExpense / totals.outcome) * 100)}% dari total uang keluar`
        : 'Pembelian restock produk',
    ],
    [
      '  - Beban Operasional Lainnya',
      formatRupiah(totals.operationalExpense),
      'Listrik, sewa, gaji karyawan, dan lain-lain',
    ],
    [
      'Sisa Kas Bersih (Net Balance)',
      formatRupiah(totals.net),
      totals.net >= 0 ? 'Surplus Kas' : 'Defisit Kas',
    ],
  ]

  autoTable(doc, {
    startY: 33,
    head: [['Ringkasan Arus Kas', 'Nominal', 'Keterangan']],
    body: summaryBody,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      cellPadding: 3,
    },
    styles: {
      fontSize: 8.5,
      cellPadding: 2.8,
      textColor: textDark,
      lineColor: borderLight,
      lineWidth: 0.1,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 72 },
      1: { halign: 'right', fontStyle: 'bold', cellWidth: 46 },
      2: { fontStyle: 'normal', textColor: textMuted },
    },
    didParseCell: (data) => {
      if (data.section === 'body') {
        // Highlight Kulakan row
        if (data.row.index === 2 && data.column.index === 0) {
          data.cell.styles.textColor = accentAmber
        }
        // Highlight Net row
        if (data.row.index === 4) {
          const isPositive = totals.net >= 0
          data.cell.styles.fillColor = isPositive ? [236, 253, 243] : [254, 242, 242]
          if (data.column.index === 1) {
            data.cell.styles.textColor = isPositive ? [21, 128, 61] : [220, 38, 38]
          }
        }
      }
    },
  })

  // --- 4. Table 1: Rincian Penjualan (Sales) ---
  const salesY = doc.lastAutoTable.finalY + 9

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...primaryColor)
  doc.text(`1. Rincian Transaksi Penjualan (${sales.length} Transaksi)`, 14, salesY)

  const salesRows = sales.map((sale, idx) => [
    String(idx + 1),
    formatDateTime(sale.createdAt),
    sale.customerName || 'Umum',
    (sale.items ?? []).map((it) => `${it.name} x${it.qty}`).join(', ') || '-',
    sale.discount ? formatRupiah(sale.discount) : '-',
    formatRupiah(sale.total),
  ])

  autoTable(doc, {
    startY: salesY + 3,
    head: [['No', 'Waktu', 'Pelanggan', 'Item Pesanan', 'Diskon', 'Total']],
    body: salesRows.length > 0 ? salesRows : [['-', '-', '-', 'Belum ada transaksi penjualan pada periode ini.', '-', '-']],
    foot: salesRows.length > 0
      ? [['', '', '', 'Total Penjualan Bersih', '', formatRupiah(totals.income)]]
      : undefined,
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      cellPadding: 2.5,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 248],
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.4,
      textColor: textDark,
      lineColor: borderLight,
      lineWidth: 0.1,
      valign: 'middle',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 32 },
      2: { cellWidth: 28 },
      3: { cellWidth: 68 },
      4: { halign: 'right', cellWidth: 20 },
      5: { halign: 'right', fontStyle: 'bold', cellWidth: 24 },
    },
    footStyles: {
      fillColor: [236, 253, 243],
      textColor: primaryColor,
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'right',
    },
  })

  // --- 5. Table 2: Rincian Pengeluaran & Kulakan (Expenses) ---
  const expensesY = doc.lastAutoTable.finalY + 9

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...primaryColor)
  doc.text(`2. Rincian Pengeluaran & Kulakan (${expenses.length} Catatan)`, 14, expensesY)

  const expenseRows = expenses.map((exp, idx) => {
    const isRestock = exp.category === 'Stock Purchase' || exp.category === 'Belanja Stok'
    return [
      String(idx + 1),
      formatDateTime(exp.createdAt),
      isRestock ? 'Kulakan / Restock' : exp.category,
      exp.description,
      formatRupiah(exp.amount),
    ]
  })

  autoTable(doc, {
    startY: expensesY + 3,
    head: [['No', 'Waktu', 'Kategori', 'Deskripsi / Keterangan', 'Jumlah']],
    body: expenseRows.length > 0 ? expenseRows : [['-', '-', '-', 'Belum ada catatan pengeluaran pada periode ini.', '-']],
    foot: expenseRows.length > 0
      ? [['', '', '', 'Total Seluruh Pengeluaran', formatRupiah(totals.outcome)]]
      : undefined,
    theme: 'striped',
    headStyles: {
      fillColor: secondaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      cellPadding: 2.5,
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.4,
      textColor: textDark,
      lineColor: borderLight,
      lineWidth: 0.1,
      valign: 'middle',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 34 },
      2: { cellWidth: 38 },
      3: { cellWidth: 72 },
      4: { halign: 'right', fontStyle: 'bold', cellWidth: 28 },
    },
    footStyles: {
      fillColor: [254, 242, 242],
      textColor: [185, 28, 28],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'right',
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 2) {
        if (data.cell.raw === 'Kulakan / Restock') {
          data.cell.styles.textColor = accentAmber
          data.cell.styles.fontStyle = 'bold'
        }
      }
    },
  })

  // --- 6. Footer (Page Numbers on every page) ---
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...textMuted)

    // Footer divider line
    doc.setDrawColor(...borderLight)
    doc.setLineWidth(0.2)
    doc.line(14, 287, 196, 287)

    doc.text('Coolcash Point of Sale & Bookkeeping System', 14, 292)
    doc.text(`Halaman ${i} dari ${pageCount}`, 196, 292, { align: 'right' })
  }

  // Save the PDF file
  const filename = `coolcash-laporan-${dateStr}.pdf`
  doc.save(filename)
}

