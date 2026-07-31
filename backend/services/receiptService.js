// services/receiptService.js - PDF Receipt Generation
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Ensure receipts directory exists
const receiptsDir = path.join(__dirname, '../uploads/receipts');
if (!fs.existsSync(receiptsDir)) {
  fs.mkdirSync(receiptsDir, { recursive: true });
}

const generateReceipt = async (payment, student, schoolInfo, confirmedBy) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const filename = `receipt-${payment.receiptNumber}.pdf`;
      const filePath = path.join(receiptsDir, filename);
      
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // ============================================
      // 📌 HEADER
      // ============================================
      doc
        .fontSize(22)
        .font('Helvetica-Bold')
        .text('🏫 ' + (schoolInfo.name || 'School Portal'), { align: 'center' })
        .fontSize(12)
        .font('Helvetica')
        .text(schoolInfo.address || 'Adama, Ethiopia', { align: 'center' })
        .text('Phone: ' + (schoolInfo.phone || 'N/A'), { align: 'center' })
        .moveDown();

      // ============================================
      // 📌 RECEIPT TITLE
      // ============================================
      doc
        .fontSize(18)
        .font('Helvetica-Bold')
        .text('PAYMENT RECEIPT', { align: 'center', underline: true })
        .moveDown(1.5);

      // ============================================
      // 📌 RECEIPT DETAILS
      // ============================================
      const leftCol = 50;
      const rightCol = 300;
      let y = doc.y;

      // Receipt Number
      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('Receipt Number:', leftCol, y)
        .font('Helvetica')
        .text(payment.receiptNumber || 'N/A', rightCol, y);

      y += 22;
      doc
        .font('Helvetica-Bold')
        .text('Student Name:', leftCol, y)
        .font('Helvetica')
        .text(student.name || 'N/A', rightCol, y);

      y += 22;
      doc
        .font('Helvetica-Bold')
        .text('Student Email:', leftCol, y)
        .font('Helvetica')
        .text(student.email || 'N/A', rightCol, y);

      y += 22;
      doc
        .font('Helvetica-Bold')
        .text('Payment Date:', leftCol, y)
        .font('Helvetica')
        .text(new Date(payment.paymentDate).toLocaleDateString(), rightCol, y);

      y += 22;
      doc
        .font('Helvetica-Bold')
        .text('Method:', leftCol, y)
        .font('Helvetica')
        .text('Bank Transfer', rightCol, y);

      y += 22;
      doc
        .font('Helvetica-Bold')
        .text('Bank:', leftCol, y)
        .font('Helvetica')
        .text(payment.bankName || 'N/A', rightCol, y);

      y += 22;
      doc
        .font('Helvetica-Bold')
        .text('Reference Number:', leftCol, y)
        .font('Helvetica')
        .text(payment.referenceNumber || 'N/A', rightCol, y);

      y += 22;
      doc
        .font('Helvetica-Bold')
        .text('Confirmed By:', leftCol, y)
        .font('Helvetica')
        .text(confirmedBy?.name || 'System', rightCol, y);

      y += 30;

      // ============================================
      // 📌 AMOUNT BOX
      // ============================================
      doc
        .rect(50, y, 500, 45)
        .stroke()
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('Amount Paid:', 60, y + 12)
        .fontSize(16)
        .font('Helvetica-Bold')
        .text(payment.amount + ' ETB', 400, y + 12, { align: 'right' });

      y += 75;

      // ============================================
      // 📌 STATUS
      // ============================================
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('Status:', leftCol, y)
        .font('Helvetica')
        .text('✅ CONFIRMED', 120, y, { color: 'green' });

      y += 40;

      // ============================================
      // 📌 FOOTER
      // ============================================
      doc
        .fontSize(10)
        .font('Helvetica')
        .text('This receipt is system-generated and does not require a signature.', {
          align: 'center',
          color: 'gray'
        })
        .moveDown(0.5)
        .text('Thank you for your payment!', { align: 'center', color: 'blue' });

      // ============================================
      // 📌 TIMESTAMP
      // ============================================
      doc
        .fontSize(8)
        .font('Helvetica')
        .text(
          `Generated on: ${new Date().toLocaleString()}`,
          { align: 'right', color: 'gray' }
        );

      doc.end();

      stream.on('finish', () => {
        resolve({ filename, filePath, url: `/uploads/receipts/${filename}` });
      });

      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateReceipt };