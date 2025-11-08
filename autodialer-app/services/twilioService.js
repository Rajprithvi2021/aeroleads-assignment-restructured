const twilio = require('twilio');
const { client, twilioPhoneNumber } = require('../config/twilio');
require('dotenv').config();

let gemini = null;
let openai = null;

// --- Try to load Gemini and OpenAI APIs ---
try {
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  if (process.env.GEMINI_API_KEY) {
    gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
} catch (err) {
  console.warn('⚠️ Gemini API not installed or missing API key.');
}

try {
  const OpenAI = require('openai');
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
} catch (err) {
  console.warn('⚠️ OpenAI package not installed or missing API key.');
}

class TwilioService {
  /**
   * Make an outbound call
   */
  async makeCall(toNumber, message = null, useAI = false) {
    if (!client) throw new Error('Twilio not configured');
    try {
      const call = await client.calls.create({
        to: toNumber,
        from: twilioPhoneNumber,
        url: this.generateTwiMLUrl(message, useAI),
        statusCallback: `${process.env.APP_URL || process.env.BASE_URL}/api/dialer/webhook`,
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
      });
      console.log('📞 Call initiated:', call.sid, '→', toNumber);
      return call;
    } catch (error) {
      console.error('❌ Call failed:', error);
      throw new Error('Call failed: ' + error.message);
    }
  }

  /**
   * Generate dynamic TwiML URL
   */
  generateTwiMLUrl(message, useAI) {
    const baseUrl = process.env.APP_URL || process.env.BASE_URL || 'http://localhost:3000';
    let url = `${baseUrl}/api/dialer/twiml`;
    const params = [];
    if (message) params.push(`message=${encodeURIComponent(message)}`);
    if (useAI) params.push('ai=true');
    if (params.length) url += '?' + params.join('&');
    return url;
  }

  /**
   * Generate TwiML XML (AI or standard)
   */
  async generateTwiML(message, useAI = false) {
    const BASE_URL = process.env.APP_URL || process.env.BASE_URL || 'http://localhost:3000';
    const text = message || 'Hello, this is an automated call from AeroLeads.';
    let finalMessage = text;

    // --- AI Voice Text Generation Section ---
    if (useAI) {
      try {
        console.log('🤖 Generating AI voice text...');

        // Prefer Gemini API
        if (gemini) {
          try {
            const model =
              gemini.getGenerativeModel({ model: 'gemini-1.5-flash-latest' }) ||
              gemini.getGenerativeModel({ model: 'gemini-1.5-pro-latest' });

            const prompt = `Convert this into a polite, natural, spoken-style voice message for a customer call: "${text}"`;
            const result = await model.generateContent(prompt);
            const aiResponse = result?.response?.text?.() || result?.response?.candidates?.[0]?.content || text;
            if (aiResponse && aiResponse.length > 0) finalMessage = aiResponse;
            console.log('✅ Gemini AI text generated successfully.');
          } catch (err) {
            console.warn('⚠️ Gemini API failed:', err.message);
          }
        }

        // Fallback to OpenAI if Gemini fails or not configured
        if (finalMessage === text && openai) {
          const openaiResp = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'user',
                content: `Rewrite this sentence as a friendly spoken message for a phone call: "${text}"`,
              },
            ],
          });
          finalMessage = openaiResp.choices?.[0]?.message?.content?.trim() || text;
          console.log('✅ OpenAI fallback text generated successfully.');
        }

        if (finalMessage === text) {
          console.warn('⚠️ AI fallback failed, using plain message.');
        }
      } catch (err) {
        console.error('❌ AI generation error:', err.message);
        finalMessage = text;
      }
    }

    // --- Generate TwiML with Gather → /dtmf ---
    const twiml = `
      <Response>
        <Say voice="${useAI ? 'Polly.Kajal' : 'Polly.Matthew'}">${finalMessage}</Say>
        <Pause length="1"/>
        <Say>Press 1 to confirm.</Say>
        <Gather numDigits="1" action="${BASE_URL}/api/dialer/dtmf" method="POST" timeout="5"/>
        <Say>No input received. Goodbye!</Say>
        <Hangup/>
      </Response>
    `;
    return twiml;
  }

  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new TwilioService();
