/**
 * Secure Serverless API Endpoint: /api/chat
 *
 * This function acts as a secure proxy between the browser and the Gemini API.
 * The GEMINI_API_KEY is stored as a server-side environment variable only —
 * it is NEVER exposed to the browser client.
 *
 * Deployment: Vercel Serverless Function (automatically detected in /api folder)
 * Compatible with: Vercel, Netlify Functions (with adaptation), Cloudflare Workers
 */

export default async function handler(req, res) {
  // Security: Allow only POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Security: Basic CORS — restrict to your domain in production
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const { question, context } = req.body || {};

  if (!question || typeof question !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid question field.' });
  }

  // Security: Rate limiting — basic per-invocation (Vercel handles function throttling)
  // For production-grade rate limiting, integrate Upstash Redis or similar.

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Fall back to a pre-defined local answer set when no API key is configured
    return res.status(200).json({ 
      answer: 'Addisu Yirdaw Deresse is a Computer Science & Business Administration student, AI Developer, and Student Leader from Ethiopia. He built EduAudio (accessibility education), MyHealthID (digital health), and Club Connect (campus services). Contact him at addisulal@gmail.com.'
    });
  }

  // Build a contextual system prompt using portfolio data
  const systemPrompt = `You are a professional AI Career Assistant for Addisu Yirdaw Deresse's portfolio website.

About Addisu:
- Computer Science & Business Administration double-degree student in Ethiopia
- AI & Mobile App Developer (React Native, Expo, Python, TypeScript)
- Student Leader at Debre Berhan University Student Union
- Creator of: EduAudio (accessibility-first educational mobile app), MyHealthID (secure digital health platform), Club Connect (university campus platform), MyDorm Care (dormitory management app)
- Email: addisulal@gmail.com
- GitHub: https://github.com/addisuyirdaw
- LinkedIn: https://linkedin.com/in/addisuyirdaw2025

Answer questions concisely and professionally. Recommend relevant projects when asked. If asked for contact details, provide them. If asked for the resume, direct visitors to the Resume Builder section.`;

  try {
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\nVisitor question: ${question}` }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 300,
          }
        })
      }
    );

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API returned ${geminiResponse.status}`);
    }

    const data = await geminiResponse.json();
    const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'I could not generate a response. Please try again.';

    return res.status(200).json({ answer });
  } catch (error) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ 
      answer: 'I am having trouble connecting to my AI brain right now. Please contact Addisu directly at addisulal@gmail.com!' 
    });
  }
}
