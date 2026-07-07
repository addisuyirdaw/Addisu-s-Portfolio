import type { Profile } from '../entities';

export const EmailService = {
  /**
   * Dispatches a notification email using the owner's CMS settings.
   */
  async sendNotification(profile: Profile, data: { sender_name: string; sender_email: string; subject: string; message_text: string }) {
    const config = profile.email_config;
    if (!config || !config.provider) {
      console.warn('Email notification skipped: No active provider configured in CMS settings.');
      return;
    }

    const { provider, apiKey, serviceId, templateId, publicKey, toEmail } = config;
    const recipient = toEmail || profile.email;

    try {
      if (provider === 'resend' && apiKey) {
        // Send using Resend API proxy or direct fetch
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          mode: 'cors',
          body: JSON.stringify({
            from: 'Portfolio Inbox <onboarding@resend.dev>',
            to: recipient,
            subject: `Portfolio: ${data.subject || 'New Contact Message'}`,
            html: `
              <h3>New Message from Portfolio Website</h3>
              <p><strong>Name:</strong> ${data.sender_name}</p>
              <p><strong>Email:</strong> ${data.sender_email}</p>
              <p><strong>Subject:</strong> ${data.subject || 'None'}</p>
              <p><strong>Message:</strong></p>
              <p style="padding: 10px; background: #f3f4f6; border-radius: 6px;">${data.message_text}</p>
            `
          })
        });
        if (!res.ok) console.error('Resend dispatch failed:', await res.text());
      } 
      
      else if (provider === 'emailjs' && serviceId && templateId && publicKey) {
        // Send using EmailJS direct REST API
        const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            service_id: serviceId,
            template_id: templateId,
            user_id: publicKey,
            template_params: {
              from_name: data.sender_name,
              from_email: data.sender_email,
              subject: data.subject || 'Portfolio Query',
              message: data.message_text,
              to_email: recipient
            }
          })
        });
        if (!res.ok) console.error('EmailJS dispatch failed:', await res.text());
      }
    } catch (err) {
      console.error('Failed to dispatch notification email:', err);
    }
  },

  /**
   * Dispatches an outgoing email reply to the client.
   */
  async sendReply(profile: Profile, clientEmail: string, clientName: string, replySubject: string, replyText: string) {
    const config = profile.email_config;
    if (!config || !config.provider) {
      console.warn('Outgoing email reply skipped: No active provider configured in CMS settings.');
      return;
    }

    const { provider, apiKey, serviceId, templateId, publicKey } = config;

    try {
      if (provider === 'resend' && apiKey) {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          mode: 'cors',
          body: JSON.stringify({
            from: `Addisu Yirdaw <onboarding@resend.dev>`,
            to: clientEmail,
            subject: replySubject,
            html: `
              <p>Hi ${clientName},</p>
              <p>${replyText.replace(/\n/g, '<br/>')}</p>
              <br/>
              <hr/>
              <p style="font-size: 0.85rem; color: #6b7280;">
                Addisu Yirdaw Deresse &bull; Computer Science & Business Administration<br/>
                Sent from my Career Management Platform Dashboard
              </p>
            `
          })
        });
        if (!res.ok) console.error('Resend reply failed:', await res.text());
      } 
      
      else if (provider === 'emailjs' && serviceId && templateId && publicKey) {
        const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            service_id: serviceId,
            template_id: templateId,
            user_id: publicKey,
            template_params: {
              from_name: 'Addisu Yirdaw Deresse',
              from_email: profile.email,
              subject: replySubject,
              message: replyText,
              to_email: clientEmail,
              to_name: clientName
            }
          })
        });
        if (!res.ok) console.error('EmailJS reply failed:', await res.text());
      }
    } catch (err) {
      console.error('Failed to dispatch reply email:', err);
    }
  }
};
export default EmailService;
