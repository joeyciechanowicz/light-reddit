
function error(err, req, res, next) {
	res.status(500).render('not-found.hbs', {
		error: err,
		stack: err.stack
	});
}

module.exports = {
	error
};
