const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// router.post('/prompt', aiController.processPrompt);
router.post('/prompt', (req, res) => aiController.processPrompt(req, res));


module.exports = router;
