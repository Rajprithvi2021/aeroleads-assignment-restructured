const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');

router.get('/', blogController.listBlogs);
router.get('/create', blogController.createBlogForm);
router.get('/:slug', blogController.viewBlog);
router.post('/generate', blogController.generateBlog);
router.post('/bulk-generate', blogController.bulkGenerateBlogs);

module.exports = router;
