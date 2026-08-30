import { sendEmail } from './services/emailService';

// Test function
export const testEmailSend = async () => {
  await sendEmail(
    'your-personal-email@gmail.com',  // Send to yourself
    'Test Email from Anveshya',
    `<h2>Hello!</h2>
     <p>This is a test email from Anveshya.</p>
     <p>If you see this, email is working! ✅</p>`
  );
};