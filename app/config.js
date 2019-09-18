const path = require('path');
const dotenv = require('dotenv');
const snoowrap = require('snoowrap');

dotenv.config({
	path: path.resolve(path.join(__dirname, '../.env'))
});

const production = process.env.NODE_ENV === 'production';

const config = module.exports;

config.express = {
	port: process.env.PORT || 3000,
	ip: '127.0.0.1'
};

// get anonymous token from: https://not-an-aardvark.github.io/reddit-oauth-helper/
// this won't work long term...
// app.r.config({proxies: false})
config.reddit = new snoowrap({
	userAgent: 'no-js-reddit',

	clientId: process.env.CLIENT_ID,
	clientSecret: process.env.CLIENT_SECRET,

	accessToken: process.env.ACCESS_TOKEN,
	refreshToken: process.env.REFRESH_TOKEN,

	// Disable snoopwrap using JS proxies to hide stuff
	proxies: false
});

if (production) {
	config.express.ip = '0.0.0.0'
}

