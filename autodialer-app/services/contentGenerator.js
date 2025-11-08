const aiService = require('./aiService');

class ContentGenerator {
  async generateArticle(title, details = '') {
    console.log('Generating', title);
    const outline = await aiService.generateOutline(title, details);
    const content = await aiService.expandOutline(title, outline);
    console.log('Generated');
    return content;
  }

  async generateProgrammingArticles() {
    const topics = [
      "Node.js Event Loop",
      "JavaScript Closures",
      "RESTful API Best Practices",
      "Database Indexing",
      "Async/Await vs Promises",
      "Microservices Architecture",
      "SQL vs NoSQL",
      "Git Workflow",
      "Docker Basics",
      "Node.js Testing"
    ];
    const articles = [];
    for (const topic of topics) {
      try {
        const content = await this.generateArticle(topic);
        articles.push({ title: topic, content, status: "success" });
        await this.delay(3000);
      } catch (error) {
        articles.push({ title: topic, status: "failed", error: error.message });
      }
    }
    return articles;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new ContentGenerator();
