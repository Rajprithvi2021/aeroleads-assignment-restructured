const twilio = require('twilio');
const twilioService = require('../services/twilioService');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const BASE_URL = process.env.BASE_URL || process.env.APP_URL || 'https://your-ngrok-url.ngrok.io';

// Temporary in-memory call logs (no DB needed)
let callLogs = [];

/**
 * Upload multiple numbers
 */
exports.uploadNumbers = async (req, res) => {
  try {
    const { numbers } = req.body;
    if (!numbers || numbers.length === 0) {
      return res.status(400).json({ success: false, message: 'No phone numbers provided.' });
    }

    const phoneNumbers = Array.isArray(numbers)
      ? numbers
      : numbers.split(/[\n,]+/).map(n => n.trim()).filter(Boolean);

    if (phoneNumbers.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid phone numbers found.' });
    }

    req.app.locals.phoneNumbers = phoneNumbers;

    res.json({
      success: true,
      count: phoneNumbers.length,
      message: `${phoneNumbers.length} phone number(s) uploaded successfully.`
    });
  } catch (error) {
    console.error('❌ Error uploading numbers:', error);
    res.status(500).json({ success: false, message: 'Error uploading numbers.', error: error.message });
  }
};

/**
 * Start calling uploaded numbers
 */
exports.startCalling = async (req, res) => {
  try {
    const { message, ai } = req.body;
    const phoneNumbers = req.app.locals.phoneNumbers || [];

    if (phoneNumbers.length === 0) {
      return res.status(400).json({ success: false, message: 'No phone numbers uploaded yet.' });
    }

    console.log(`📞 Starting calls for ${phoneNumbers.length} number(s)... AI=${ai}`);

    for (const number of phoneNumbers) {
      const twiml = await twilioService.generateTwiML(message, ai === true || ai === 'true');

      const call = await client.calls.create({
        to: number,
        from: process.env.TWILIO_PHONE_NUMBER,
        twiml,
        statusCallback: `${BASE_URL}/api/dialer/webhook`,
        statusCallbackMethod: 'POST',
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed']
      });

      callLogs.push({
        sid: call.sid,
        to: number,
        status: 'initiated',
        ai: ai || false,
        time: new Date().toISOString()
      });

      console.log(`📲 Call started → ${number} (SID: ${call.sid})`);
    }

    res.json({
      success: true,
      message: `Calls initiated successfully for ${phoneNumbers.length} number(s).`,
      total: phoneNumbers.length
    });
  } catch (error) {
    console.error('❌ Error in startCalling:', error);
    res.status(500).json({
      success: false,
      message: 'Error initiating calls.',
      error: error.message
    });
  }
};

/**
 * Make a single call
 */
exports.makeSingleCall = async (req, res) => {
  try {
    const { number, message, ai } = req.body;

    if (!number) {
      return res.status(400).json({ success: false, message: 'Phone number is required.' });
    }

    console.log(`📞 Making single call → ${number}, AI=${ai}`);

    const twiml = await twilioService.generateTwiML(message, ai === true || ai === 'true');

    const call = await client.calls.create({
      to: number,
      from: process.env.TWILIO_PHONE_NUMBER,
      twiml,
      statusCallback: `${BASE_URL}/api/dialer/webhook`,
      statusCallbackMethod: 'POST',
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed']
    });

    callLogs.push({
      sid: call.sid,
      to: number,
      status: 'initiated',
      ai: ai || false,
      time: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Call initiated successfully.',
      sid: call.sid
    });
  } catch (error) {
    console.error('❌ Error making single call:', error);
    res.status(500).json({
      success: false,
      message: 'Error making single call.',
      error: error.message
    });
  }
};

/**
 * Get call logs (in-memory)
 */
exports.getCallLogs = async (req, res) => {
  try {
    res.json({
      success: true,
      total: callLogs.length,
      logs: callLogs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching call logs.',
      error: error.message
    });
  }
};

/**
 * Twilio Webhook (status updates + stats tracking)
 */
exports.twilioWebhook = async (req, res) => {
  try {
    console.log('📞 Twilio webhook received:', req.body);

    const { CallSid, CallStatus } = req.body;

    // Normalize Twilio statuses
    const normalizedStatus = {
      queued: 'queued',
      initiated: 'initiated',
      ringing: 'ringing',
      'in-progress': 'in-progress',
      completed: 'completed',
      busy: 'failed',
      failed: 'failed',
      'no-answer': 'failed',
      canceled: 'failed'
    }[CallStatus] || CallStatus;

    let log = callLogs.find(l => l.sid === CallSid);
    if (log) {
      log.status = normalizedStatus;
      log.updatedAt = new Date().toISOString();
    } else {
      callLogs.push({
        sid: CallSid,
        status: normalizedStatus,
        time: new Date().toISOString()
      });
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('❌ Error in Twilio webhook:', error);
    res.sendStatus(500);
  }
};

/**
 * 📊 Get live call statistics
 */
exports.getStats = async (req, res) => {
  try {
    const total = callLogs.length;
    const completed = callLogs.filter(l => l.status === 'completed').length;
    const failed = callLogs.filter(l => l.status === 'failed').length;
    const success = callLogs.filter(l => ['answered', 'in-progress', 'completed'].includes(l.status)).length;

    res.json({
      success: true,
      total,
      completed,
      failed,
      success
    });
  } catch (error) {
    console.error('❌ Error computing stats:', error);
    res.status(500).json({ success: false, message: 'Error computing stats' });
  }
};
