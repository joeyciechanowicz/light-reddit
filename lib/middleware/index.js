
function error(err, req, res, next) {
	res.status(500).render('error', {
		error: err,
		stack: err.stack
	});
}

module.exports = {
	error
};
