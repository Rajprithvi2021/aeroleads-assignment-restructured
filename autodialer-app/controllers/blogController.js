const { Blog } = require('../models');
const contentGenerator = require('../services/contentGenerator');

// Slugify utility for converting a blog title to a URL slug
const slugify = str => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

class BlogController {
  async listBlogs(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      const { count, rows } = await Blog.findAndCountAll({
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });
      res.render('blog/index', {
        title: 'Blog',
        blogs: rows,
        pagination: { total: count, page, pages: Math.ceil(count / limit) }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async viewBlog(req, res) {
    try {
      const slug = req.params.slug;
      const blog = await Blog.findOne({ where: { slug } });
      if (!blog) return res.status(404).send('Not found');
      await blog.increment('views');
      res.render('blog/view', { title: blog.title, blog });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async generateBlog(req, res) {
    try {
      const { title, details } = req.body;
      const content = await contentGenerator.generateArticle(title, details);
      const blog = await Blog.create({
        title,
        content,
        category: "Programming",
        slug: slugify(title)
      });
      res.json({ success: true, message: 'Generated', data: blog });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async bulkGenerateBlogs(req, res) {
    try {
      const articles = req.body.articles || [];
      const results = [];
      for (const article of articles) {
        try {
          const content = await contentGenerator.generateArticle(article.title);
          const blog = await Blog.create({
            title: article.title,
            content,
            slug: slugify(article.title)
          });
          results.push({ title: article.title, status: 'success', blog });
        } catch (error) {
          results.push({ title: article.title, status: 'failed', error: error.message });
        }
      }
      res.json({
        success: true,
        data: {
          generated: results.filter(r => r.status === 'success'),
          errors: results.filter(r => r.status === 'failed')
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async createBlogForm(req, res) {
    res.render('blog/create', { title: 'Create Blog' });
  }
}

module.exports = new BlogController();
