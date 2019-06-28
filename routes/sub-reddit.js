// const {cacheGet, cacheSet} = require('../lib/cache');

module.exports = function (app) {
	async function subredditHot(subreddit, req, res, next) {
		try {
			const hotRequest = await app.r.getHot(subreddit);

			if (typeof hotRequest === 'string') {
				// invalid access_token
				return next(new Error('Invalid access token'));
			}

			const hot = hotRequest.map(post => ({
				...post,
				author: post.author ? post.author.name : 'UNNAMED!!!!!',
				authorIsModerator: post.distinguished === 'moderator'
			}));

			return res.render('sub-reddit', {
				subreddit,
				posts: hot,
				showPostSubreddit: subreddit === 'popular'
			});
		} catch (error) {
			next(error);
		}
	}

	const popularHot = () => (req, res, next) => subredditHot('popular', req, res, next);

	app.get('/', popularHot());
	app.get('/r/:sub', (req, res, next) => subredditHot(req.params.sub, req, res, next));

	app.get('/r/:sub/json', async (req, res) => {
		const hot = await app.r.getHot(req.params.sub)
			.map(post => ({
				...post,
				author: post.author.name,
				authorIsModerator: post.distinguished === 'moderator'
			}));

		res.json(hot);
	});

};
