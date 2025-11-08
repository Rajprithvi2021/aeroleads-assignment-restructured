const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const dialerRoutes = require('./routes/dialer');
const blogRoutes = require('./routes/blog');
const aiRoutes = require('./routes/ai');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
  res.render('dialer/index', { title: 'Autodialer' });
});
app.use('/api/dialer', dialerRoutes);
app.use('/blog', blogRoutes);
app.use('/api/ai', aiRoutes);

app.use(errorHandler);

module.exports = app;
