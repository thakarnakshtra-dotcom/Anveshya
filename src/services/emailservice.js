import nodemailer from 'nodemailer';

// Create email transporter
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  auth: {
    user: 'thakarnakshtra@gmail.com',        // Replace with your Brevo email
    pass: 'xsmtpsib-f2fd7232ccfdd35aadfeDcJHrrHSgvFpsYxqb6g97uaQTd2kE31rPUeDZTeDsjVq-XathgNZim7EhGlTp',     // Replace with your SMTP key from Step 2
  },
});

// Function to send email
export const sendEmail = async (to, subject, html) => {
  try {
    console.log('Sending email to:', to);
    
    const result = await transporter.sendMail({
      from: 'hello@anveshya.com',
      to: to,
      subject: subject,
      html: html,
    });
    
    console.log('✅ Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('❌ Email failed:', error.message);
    return null;
  }
};