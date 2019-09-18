#!/usr/bin/env node
const app = require('./index');
const config = require('app/config');

const bole = require('bole');

bole.output({level: 'debug', stream: process.stdout});
const log = bole('server');

log.info('server process starting');

// Note that there's not much logic in this file.
// The server should be mostly "glue" code to set things up and
// then start listening
app.listen(config.express.port, config.express.ip, function (error) {
	if (error) {
		log.error('Unable to listen for connections', error);
		process.exit(10)
	}

	log.info(`server is listening on http://${config.express.ip}:${config.express.port}`);
});
