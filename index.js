const http = require('http');
const express = require('express');
const handlebars  = require('express-handlebars');
const reload = require('reload');
const snoowrap = require('snoowrap');
const dotenv = require('dotenv');
const redis = require('express-redis-cache')();

dotenv.config();

const routes = require('./routes/sub-reddit');
const {error} = require('./lib/middleware');

const app = express();

const environment = process.env.NODE_ENV;
app.set('environment', process.env.NODE_ENV);
app.set('port', process.env.PORT || 3000);

app.engine('hbs', handlebars({
	helpers: require('./views/helpers'),
	extname: '.hbs',
	defaultLayout: 'layout'
}));
app.set('view engine', 'hbs');

app.use(express.static('dist'));

// get anonymous token from: https://not-an-aardvark.github.io/reddit-oauth-helper/
// this won't work long term...
// app.r.config({proxies: false})
app.r = new snoowrap({
	userAgent: 'no-js-reddit',

	clientId: process.env.CLIENT_ID,
	clientSecret: process.env.CLIENT_SECRET,

	accessToken: process.env.ACCESS_TOKEN,
	refreshToken: process.env.REFRESH_TOKEN,

	// Disable snoopwrap using JS proxies to hide stuff
	proxies: false
});

if (environment === 'development') {
	app.redis = {
		route: () => (req, res, next) => next()
	};
} else {
	app.redis = redis;
}

redis.on('error', function (error) {
	console.error(error);
});

app.use(error);

routes(app);

const server = http.createServer(app);

if (environment === 'development') {
	app.locals.reload = true;

	reload(app).then(function (reloadReturned) {
		// reloadReturned is documented in the returns API in the README

		// Reload started, start web server
		server.listen(app.get('port'), function () {
			console.log(`Web server listening on http://localhost:${app.get('port')}. Reload is on`)
		});
	}).catch(function (err) {
		console.error('Reload could not start, could not start server/sample app', err)
	});
} else {
	server.listen(app.get('port'), function () {
		console.log(`Web server listening on port http://localhost:${app.get('port')}`)
	});
}
