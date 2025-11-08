require('dotenv').config();
const app = require('./app');
const sequelize = require('./config/database');
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');
    await sequelize.sync({ alter: true });
    console.log('Models synchronized');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

startServer();


// API index router
const apiRouter = require('./routes/api');
app.use('/api', apiRouter);
