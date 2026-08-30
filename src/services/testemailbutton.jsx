import { sendEmail } from './services/emailService';
import { useState } from 'react';

export function TestEmailButton() {
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState('');

  const handleTestEmail = async () => {
    setSending(true);
    setStatus('Sending...');

    try {
      const result = await sendEmail(
        'your-personal-email@gmail.com',  // Replace with your email
        'Test Email from Anveshya',
        `<h2>Hello! ✅</h2>
         <p>This is a test email from Anveshya.</p>
         <p>Email setup is working!</p>`
      );

      if (result) {
        setStatus('✅ Email sent! Check your inbox.');
      } else {
        setStatus('❌ Email failed. Check console.');
      }
    } catch (error) {
      setStatus('❌ Error: ' + error.message);
    }

    setSending(false);
  };

  return (
    <div style={{ padding: '20px', margin: '20px', border: '1px solid #7fd9ff' }}>
      <h3>Test Email Button</h3>
      <p>Click to send a test email:</p>
      <button 
        onClick={handleTestEmail}
        disabled={sending}
        style={{
          padding: '10px 20px',
          background: '#7fd9ff',
          color: '#05070d',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
        }}
      >
        {sending ? 'Sending...' : 'Send Test Email'}
      </button>
      {status && <p style={{ marginTop: '10px' }}>{status}</p>}
    </div>
  );
}