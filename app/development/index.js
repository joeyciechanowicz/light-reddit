const reload = require('reload');
const log = require('bole')('reload');

module.exports = function(app) {
	app.locals.reload = true;

	reload(app).then(function (reloadReturned) {
		log.info('Reload enabled');
	}).catch(error => {
		log.error(error, 'Error starting reload');
	});
};
