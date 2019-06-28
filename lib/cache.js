const {promisify} = require('util');

// const response = require('./frontpage-snapshot.json');

// const redis = require('redis');
// const client = redis.createClient();
// const getAync = promisify(client.get).bind(client);
// const setAync = promisify(client.set).bind(client);

async function cacheGet(key) {
	const cached = await getAync(key);

	if (cached) {
		return JSON.parse(cached);
	}
	return undefined;
}

async function cacheSet(key, value) {
	return setAync(key, JSON.stringify(value));
}

module.exports = {
	cacheGet,
	cacheSet
};
