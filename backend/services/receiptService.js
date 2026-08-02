// backend/services/receiptService.js - Simple receipt generator

const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// ✅ Ensure receipts directory exists
const receiptsDir = path.join(__dirname, '../uploads/receipts');
if (!fs.existsSync(receiptsDir)) {
  fs.mkdirSync(receiptsDir, { recursive: true });
}

/**
 * Generate a PDF receipt for a confirmed payment
 */
const generateReceipt = async (payment, student, schoolInfo, confirmedBy) => {
  try {
    const filename = `receipt-${payment.receiptNumber || payment._id}.pdf`;
    const filePath = path.join(receiptsDir, filename);
    const url = `/uploads/receipts/${filename}`;

    // ✅ Create PDF
    const doc = new PDFDocument({ margin: 50 });
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    // ✅ Header
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .text(schoolInfo.name, { align: 'center' })
      .fontSize(12)
      .font('Helvetica')
      .text(schoolInfo.address, { align: 'center' })
      .text(`Phone: ${schoolInfo.phone}`, { align: 'center' })
      .moveDown(1);

    // ✅ Receipt Title
    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('PAYMENT RECEIPT', { align: 'center' })
      .moveDown(0.5);

    // ✅ Receipt Number
    doc
      .fontSize(10)
      .font('Helvetica')
      .text(`Receipt No: ${payment.receiptNumber || 'N/A'}`, { align: 'right' })
      .text(`Date: ${new Date(payment.confirmedAt || Date.now()).toLocaleDateString()}`, { align: 'right' })
      .moveDown(1);

    // ✅ Divider
    doc
      .strokeColor('#cccccc')
      .lineWidth(1)
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke()
      .moveDown(1);

    // ✅ Payment Details
    const startY = doc.y;
    const col1X = 50;
    const col2X = 300;

    doc
      .fontSize(11)
      .font('Helvetica-Bold');

    // Student Info
    doc
      .text('Student Name:', col1X, startY)
      .text('Student Class:', col1X, startY + 25)
      .text('Fee Name:', col1X, startY + 50)
      .text('Amount Paid:', col1X, startY + 75)
      .text('Payment Method:', col1X, startY + 100)
      .text('Reference:', col1X, startY + 125)
      .text('Status:', col1X, startY + 150);

    doc
      .font('Helvetica')
      .text(student?.name || 'N/A', col2X, startY)
      .text(student?.class || 'N/A', col2X, startY + 25)
      .text(payment.studentFeeId?.feeName || 'N/A', col2X, startY + 50)
      .text(`ETB ${payment.amount || 0}`, col2X, startY + 75)
      .text(payment.bankName || 'N/A', col2X, startY + 100)
      .text(payment.referenceNumber || 'N/A', col2X, startY + 125)
      .text('CONFIRMED', col2X, startY + 150);

    // ✅ Status badge
    doc
      .fillColor('#22c55e')
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('✅ PAID', { align: 'center' })
      .fillColor('#000000');

    // ✅ Footer
    doc.moveDown(2);
    doc
      .strokeColor('#cccccc')
      .lineWidth(1)
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke()
      .moveDown(1);

    doc
      .fontSize(10)
      .font('Helvetica')
      .text(`Confirmed by: ${confirmedBy?.name || 'Finance Officer'}`, { align: 'center' })
      .text('This is a computer-generated receipt.', { align: 'center' })
      .text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });

    // ✅ Finalize PDF
    doc.end();

    // ✅ Wait for file to be written
    await new Promise((resolve) => {
      writeStream.on('finish', resolve);
    });

    console.log(`✅ Receipt generated: ${filename}`);
    return { url, filePath, filename };

  } catch (error) {
    console.error('❌ Error generating receipt:', error);
    throw error;
  }
};

module.exports = { generateReceipt };