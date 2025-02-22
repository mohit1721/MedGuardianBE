
const nodemailer = require("nodemailer");
require("dotenv").config();
// line-24 -> host: "smtp.ethereal.email",
// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: "gmail", // Use Gmail as the mail service
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address
    pass: process.env.EMAIL_PASS, // App password (not regular password)
  },
});

// Function to send an email
const sendEmail = async (to, subject, text) => {
  try {
    const info = await transporter.sendMail({
      from: `"Medication Reminder" <${process.env.EMAIL_USER}>`, // Sender email
      to, // Receiver email(s)
      subject, // Email subject
      text, // Email text body
      html: `<p>${text}</p>`, // HTML body
    });

    console.log(`📩 Email sent to ${to}: ${info.messageId}`);
  } catch (error) {
    console.error(`❌ Error sending email to ${to}:`, error);
  }
};

module.exports = { sendEmail };
