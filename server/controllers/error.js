function resError(req, res) {
	return res
		.status(404)
		.json({
			connection_status: 'failure',
			error_message: 'Resource not found'
		});
};

module.exports = {
	resError
};