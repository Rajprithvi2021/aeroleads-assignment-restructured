const twilioService = require('../services/twilioService');
const contentGenerator = require('../services/contentGenerator');
const { Call, Blog } = require('../models');

class AIController {
  async processPrompt(req, res) {
    try {
      const prompt = req.body.prompt;
      if (!prompt) return res.status(400).json({ success: false, message: 'Prompt required' });
      const intent = this.parseIntent(prompt);
      let result;
      switch (intent.action) {
        case 'call':
          result = await this.handleCall(intent);
          break;
        case 'blog':
          result = await this.handleBlog(intent);
          break;
        case 'stats':
          result = await this.handleStats();
          break;
        default:
          result = { success: false, message: 'Could not understand' };
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  parseIntent(prompt) {
    const lower = prompt.toLowerCase();
    if (lower.includes('call') || lower.includes('dial')) {
      const phoneMatch = prompt.match(/\d{10,}/);
      return { action: 'call', phoneNumber: phoneMatch ? phoneMatch[0].replace(/\D/g, '') : null };
    }
    if (lower.includes('blog') || lower.includes('article')) {
      return { action: 'blog', prompt };
    }
    if (lower.includes('stat')) {
      return { action: 'stats' };
    }
    return { action: 'unknown' };
  }

  async handleCall(intent) {
    if (!intent.phoneNumber)
      return { success: false, message: 'Phone number not found' };
    const call = await Call.create({ phoneNumber: intent.phoneNumber, status: 'queued' });
    const twilioCall = await twilioService.makeCall(intent.phoneNumber);
    await call.update({ callSid: twilioCall.sid, status: twilioCall.status });
    return { success: true, message: `Call initiated to ${intent.phoneNumber}`, data: call };
  }

  async handleBlog(intent) {
    const title = intent.prompt.replace(/blog|article|write about|gi/i, '').trim();
    const content = await contentGenerator.generateArticle(title);
    const blog = await Blog.create({ title, content });
    return { success: true, message: 'Blog generated', data: blog };
  }

  async handleStats() {
    const totalCalls = await Call.count();
    const totalBlogs = await Blog.count();
    return { success: true, message: 'Stats retrieved', data: { calls: { total: totalCalls }, blogs: { total: totalBlogs } } };
  }
}

module.exports = new AIController();
