import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export interface ReportConfig {
  title: string
  type: 'Inventory' | 'Sales' | 'Purchases'
  dateRange?: string
  data: any[]
  summary: {
    totalRecords: number
    totalQuantity: number
    totalAmount?: number
  }
}

export function generatePDFReport(config: ReportConfig) {
  // Create an A4 PDF in landscape for wide tables
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  })

  // Colors: Professional Blue and Dark Gray
  const primaryBlue = [30, 64, 100] as [number, number, number]
  const darkGray = [60, 60, 60] as [number, number, number]
  const lightGray = [245, 245, 245] as [number, number, number]
  
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // --- Watermark ---
  doc.setTextColor(230, 230, 230)
  doc.setFontSize(60)
  doc.setFont("helvetica", "bold")
  // Save graphics state
  doc.saveGraphicsState()
  doc.setGState(new (doc.GState as any)({ opacity: 0.1 }))
  // Rotate and place watermark
  doc.text("MANDI LEDGER", pageWidth / 2, pageHeight / 2, {
    angle: 45,
    align: 'center',
  })
  doc.restoreGraphicsState()

  // --- Header ---
  doc.setTextColor(...darkGray)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(22)
  doc.text("RICE STORE MANAGEMENT", 14, 22)
  
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text("123 Mandi Market Road, Tiruppur, TN", 14, 28)
  doc.text("Phone: +91 98765 43210 | Email: admin@mandi.local", 14, 33)
  doc.text("GSTIN: 33AAAAA0000A1Z5", 14, 38)

  // Report Title (Right aligned)
  doc.setTextColor(...primaryBlue)
  doc.setFontSize(20)
  doc.setFont("helvetica", "bold")
  doc.text(config.title.toUpperCase(), pageWidth - 14, 25, { align: 'right' })
  
  doc.setTextColor(...darkGray)
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  const generatedAt = new Date().toLocaleString()
  doc.text(`Generated: ${generatedAt}`, pageWidth - 14, 32, { align: 'right' })
  if (config.dateRange) {
    doc.text(`Period: ${config.dateRange}`, pageWidth - 14, 37, { align: 'right' })
  }

  // Draw a horizontal line separator
  doc.setDrawColor(...primaryBlue)
  doc.setLineWidth(0.5)
  doc.line(14, 42, pageWidth - 14, 42)

  // --- Summary Section ---
  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.text("Report Summary", 14, 52)
  
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  
  // Summary boxes
  const boxY = 56
  const boxHeight = 15
  const boxWidth = 60
  
  // Box 1: Records
  doc.setFillColor(...lightGray)
  doc.rect(14, boxY, boxWidth, boxHeight, 'F')
  doc.setFont("helvetica", "bold")
  doc.text("Total Records:", 18, boxY + 6)
  doc.setFont("helvetica", "normal")
  doc.text(config.summary.totalRecords.toString(), 18, boxY + 12)

  // Box 2: Quantity
  doc.setFillColor(...lightGray)
  doc.rect(14 + boxWidth + 5, boxY, boxWidth, boxHeight, 'F')
  doc.setFont("helvetica", "bold")
  doc.text("Total Quantity:", 14 + boxWidth + 5 + 4, boxY + 6)
  doc.setFont("helvetica", "normal")
  const qtyUnit = config.type === 'Inventory' ? 'kg' : 'Bags'
  doc.text(`${config.summary.totalQuantity.toLocaleString()} ${qtyUnit}`, 14 + boxWidth + 5 + 4, boxY + 12)

  // Box 3: Amount (if applicable)
  if (config.summary.totalAmount !== undefined) {
    doc.setFillColor(...lightGray)
    doc.rect(14 + (boxWidth * 2) + 10, boxY, boxWidth, boxHeight, 'F')
    doc.setFont("helvetica", "bold")
    doc.text("Total Amount:", 14 + (boxWidth * 2) + 10 + 4, boxY + 6)
    doc.setFont("helvetica", "normal")
    doc.text(`Rs. ${config.summary.totalAmount.toLocaleString()}`, 14 + (boxWidth * 2) + 10 + 4, boxY + 12)
  }

  // --- Table ---
  let head: string[][] = []
  let body: any[][] = []

  if (config.type === 'Inventory') {
    head = [['S.No', 'Variety Name', 'Warehouse', 'Threshold', 'Quantity (kg)', 'Est. Value']]
    body = config.data.map((item, index) => [
      (index + 1).toString(),
      item.varietyName,
      item.warehouseName || 'Main',
      item.threshold.toString(),
      item.quantity.toLocaleString(),
      `Rs. ${(item.quantity * item.price).toLocaleString()}`
    ])
  } else if (config.type === 'Purchases') {
    head = [['S.No', 'Date', 'Entry No', 'Supplier', 'Variety', 'Qty (Bags)', 'Rate/Bag', 'Rate/kg', 'Total', 'Status']]
    body = config.data.map((item, index) => [
      (index + 1).toString(),
      new Date(item.purchaseDate).toLocaleDateString(),
      item.entryNo,
      item.supplier?.name || 'N/A',
      item.items[0]?.variety?.name || 'N/A',
      `${item.items[0]?.quantity.toLocaleString()} Bags (${item.items[0]?.kgPerBag ?? 26}kg)`,
      `Rs. ${item.items[0]?.rate.toFixed(2)}`,
      `Rs. ${((item.items[0]?.rate ?? 0) / (item.items[0]?.kgPerBag ?? 26)).toFixed(2)}`,
      `Rs. ${item.totalAmount.toLocaleString()}`,
      item.paymentStatus === 'PENDING' ? 'UNPAID' : item.paymentStatus
    ])
  } else if (config.type === 'Sales') {
    head = [['S.No', 'Date', 'Invoice No', 'Customer', 'Variety', 'Qty (Bags)', 'Total', 'Paid', 'Balance', 'Method', 'Status']]
    body = config.data.map((item, index) => {
      const paid = item.amountPaid ?? 0
      const balance = item.totalAmount - paid
      return [
        (index + 1).toString(),
        new Date(item.saleDate).toLocaleDateString(),
        item.invoiceNo,
        item.customer?.name || 'N/A',
        item.items[0]?.variety?.name || 'N/A',
        item.items[0]?.quantity?.toLocaleString() || '0',
        `Rs. ${item.totalAmount.toLocaleString()}`,
        `Rs. ${paid.toLocaleString()}`,
        `Rs. ${balance.toLocaleString()}`,
        item.paymentMethod || '—',
        item.paymentStatus === 'PENDING' ? 'UNPAID' : item.paymentStatus
      ]
    })
  }

  autoTable(doc, {
    startY: 80,
    head: head,
    body: body,
    theme: 'grid',
    headStyles: {
      fillColor: primaryBlue,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      lineWidth: 0.1,
      lineColor: [200, 200, 200]
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: 4,
      lineWidth: 0.1,
      lineColor: [220, 220, 220]
    },
    margin: { top: 80, bottom: 20 },
    didDrawPage: function (data) {
      // --- Footer ---
      const pageCount = (doc as any).getNumberOfPages()
      const currentPage = data.pageNumber
      
      // Final Footer Text
      doc.setFont("helvetica", "normal")
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      
      if (currentPage === pageCount) {
        doc.setFont("helvetica", "bold")
        doc.text("COMPUTER VERIFIED DOCUMENT", 14, pageHeight - 14)
        doc.setFont("helvetica", "normal")
      }

      doc.text("Generated by Rice Store Management System | Confidential Business Document", 14, pageHeight - 8)
      doc.text(`Page ${currentPage}`, pageWidth - 14, pageHeight - 8, { align: 'right' })
    }
  })

  // Trigger download
  const filename = `${config.title.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(filename)
}
