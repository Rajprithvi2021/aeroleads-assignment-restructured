const express = require('express');
const router = express.Router();

// const dialerRoutes = require('./routes/dialer');
const dialerRoutes = require('./dialer');
const blogRoutes = require('./blog');
const aiRoutes = require('./ai');
// const blogRoutes = require('./routes/blog');
// const aiRoutes = require('./routes/ai');

// Mount under /api preserving original handlers
router.use('/dialer', dialerRoutes);
router.use('/blog', blogRoutes);
router.use('/ai', aiRoutes);

module.exports = router;

// --- Normalized endpoints for React frontend ---
const dialerController = require('../controllers/dialerController');
const blogController = require('../controllers/blogController');
const aiController = require('../controllers/aiController');

// Dialer
router.get('/dialer/logs', (req,res)=> dialerController.getCallLogs(req,res));
router.post('/dialer/upload', (req,res)=> dialerController.uploadNumbers(req,res));
router.post('/dialer/start', (req,res)=> dialerController.startCalling(req,res));

// Blog
router.get('/blog', async (req,res)=> {
  // normalize to pure array
  try{
    const original = await new Promise((resolve,reject)=>{
      const mockRes = {
        json: resolve,
        status: (code)=>({ json: (obj)=> reject({code, obj}) })
      };
      blogController.listBlogs(req, mockRes);
    });
    // Try extracting rows if wrapped
    const rows = Array.isArray(original) ? original
      : original?.data?.rows || original?.rows || original?.data || [];
    res.json(rows);
  } catch(e){
    res.status(e.code||500).json(e.obj||{success:false,message:'Failed'});
  }
});

router.post('/blog/generate', (req,res)=> blogController.bulkGenerateBlogs(req,res));

// AI
router.post('/ai/prompt', (req,res)=> aiController.processPrompt(req,res));
