// services/emailService.js
/*
const nodemailer = require('nodemailer');

// Configure email transporter
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});


const sendPasswordResetEmail = async (to, name, resetToken, frontendUrl) => {
  const resetLink = `${frontendUrl}/reset-password/${resetToken}`;

  const mailOptions = {
    from: `"School Portal" <${process.env.SMTP_USER}>`,
    to,
    subject: '🔑 Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h1 style="color: #2563eb; text-align: center;">🏫 School Portal</h1>
        <h2 style="color: #1e293b;">Password Reset Request</h2>
        <p style="color: #475569;">Hello <strong>${name}</strong>,</p>
        <p style="color: #475569;">
          We received a request to reset your password. Click the button below to create a new password:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #475569; font-size: 14px;">
          This link will expire in <strong>1 hour</strong>.
        </p>
        <p style="color: #475569; font-size: 14px;">
          If you didn't request this, please ignore this email. Your password will remain unchanged.
        </p>
        <hr style="border: 1px solid #e0e0e0; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">
          School Portal — Secure Password Management
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Password reset email sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return { success: false, error: error.message };
  }
};


const sendPasswordChangedEmail = async (to, name) => {
  const mailOptions = {
    from: `"School Portal" <${process.env.SMTP_USER}>`,
    to,
    subject: '✅ Password Changed Successfully',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h1 style="color: #2563eb; text-align: center;">🏫 School Portal</h1>
        <h2 style="color: #1e293b;">Password Changed Successfully</h2>
        <p style="color: #475569;">Hello <strong>${name}</strong>,</p>
        <p style="color: #475569;">
          Your password has been changed successfully.
        </p>
        <p style="color: #475569; font-size: 14px;">
          If you did not make this change, please contact the school administration immediately.
        </p>
        <hr style="border: 1px solid #e0e0e0; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">
          School Portal — Secure Password Management
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Password changed confirmation sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending confirmation email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
};
*/