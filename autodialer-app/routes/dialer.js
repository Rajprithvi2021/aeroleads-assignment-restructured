const express = require('express');
const router = express.Router();
const dialerController = require('../controllers/dialerController');
const twilioService = require('../services/twilioService');

// ==================== ROUTES ====================

// Upload numbers
router.post('/upload', dialerController.uploadNumbers);

// Start calling multiple numbers
router.post('/call', dialerController.startCalling);

// Make a single call
router.post('/call-single', dialerController.makeSingleCall);

// Get call logs
router.get('/logs', dialerController.getCallLogs);

// Twilio status/update webhook
router.post('/webhook', dialerController.twilioWebhook);

// =================================================
// TwiML response (for normal & AI voice) + IVR gather
// =================================================
router.all('/twiml', async (req, res) => {
  try {
    const { message, ai } = req.query;
    console.log('📞 /twiml request received =>', { message, ai });

    // Generate dynamic TwiML (with or without AI)
    const twiml = await twilioService.generateTwiML(message, ai === 'true');

    res.type('text/xml');
    res.send(twiml);
  } catch (error) {
    console.error('❌ Error in /twiml route:', error);
    res.type('text/xml').send(`
      <Response>
        <Say>Sorry, an internal error occurred. Please try again later.</Say>
        <Hangup/>
      </Response>
    `);
  }
});

// =================================================
// Handle DTMF key presses (Twilio Gather -> Press 1)
// =================================================
router.post('/dtmf', (req, res) => {
  console.log('🎧 DTMF webhook received:', req.body);
  const digit = req.body.Digits;

  if (digit === '1') {
    res.type('text/xml').send(`
      <Response>
        <Say>Action completed successfully. Goodbye!</Say>
        <Hangup/>
      </Response>
    `);
  } else {
    res.type('text/xml').send(`
      <Response>
        <Say>Invalid input. Please try again next time.</Say>
        <Redirect>/api/dialer/twiml</Redirect>
      </Response>
    `);
  }
});

module.exports = router;
