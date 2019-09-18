const path = require('path');
const express = require('express');
const handlebars  = require('express-handlebars');

const app = express();

app.set('views', __dirname);
app.engine('hbs', handlebars({
	helpers: require('./views/helpers'),
	extname: '.hbs',
	defaultLayout: 'layout',
	partialsDir: path.join(__dirname, 'views/partials'),
	layoutsDir: path.join(__dirname, 'views/layouts'),
}));
app.set('view engine', 'hbs');

app.use(express.static(path.resolve(path.join(__dirname, '../dist'))));

require('./development')(app);

app.use(require('./post'));
app.use(require('./subreddit'));

// Must come last, a catch all
app.use(require('./errors/errors-router'));

module.exports = app;
