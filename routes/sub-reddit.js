const express = require('express');

// const {cacheGet, cacheSet} = require('../lib/cache');

function setNsfw(req, res, next) {
	res.locals.nsfw = true;
	next();
}

const limit = 25;

module.exports = function (app) {
	async function subredditHot(subreddit, req, res, next) {
		try {

			const config = {
				limit: limit
			};

			const count = parseInt(req.query.count || 0);

			if (req.query.count) {
				config.count = count;
			}

			if (req.query.after) {
				config.after = req.query.after;
			}

			console.log(config);

			const hotRequest = await app.r.getHot(subreddit, config);

			if (typeof hotRequest === 'string') {
				// invalid access_token
				return next(new Error('Invalid access token'));
			}

			const hot = hotRequest.map(post => {
				const displayedPost = {
					...post,
					author: post.author ? post.author.name : 'UNNAMED!!!!!',
					authorIsModerator: post.distinguished === 'moderator'
				};

				if (post.is_video) {
					displayedPost.media = {
						videos: {
							formats: [
								{
									url: post.media.reddit_video.scrubber_media_url,
									type: 'video/mp4'
								}
							],
							width: post.media.reddit_video.width,
							height: post.media.reddit_video.height,
							placeholder: post.preview.images[0].resolutions[0].url
						}
					};
				} else if (post.preview && post.preview.reddit_video_preview) {
					displayedPost.media = {
						videos: {
							isGif: post.preview.reddit_video_preview.is_gif,
							formats: [
								{
									url: post.preview.reddit_video_preview.fallback_url,
									type: 'video/mp4'
								}
							],
							width: post.preview.reddit_video_preview.width,
							height: post.preview.reddit_video_preview.height,
							placeholder: post.preview.images[0].resolutions[0].url
						}
					};
				} else if (/\.(jpg|png)$/.exec(post.url)) {
					if (post.preview && post.preview.images.length > 0) {
						displayedPost.media = {
							images: post.preview.images[0].resolutions
						}
					} else {
						displayedPost.media = {
							image: {
								url: post.url
							}
						}
					}
				}

				return displayedPost;
			});

			const after = hot[hot.length - 1].id;

			return res.render('sub-reddit', {
				subredditName: subreddit,
				posts: hot,
				showPostSubreddit: subreddit === 'popular',
				showBack: count !== 0,
				backwardCount: count - limit,
				forwardCount: count + limit,
				after
			});
		} catch (error) {
			next(error);
		}
	}

	const popularHot = () => (req, res, next) => subredditHot('popular', req, res, next);

	const nsfwRouter = express.Router();
	nsfwRouter.use(setNsfw);
	nsfwRouter.get('/', popularHot());
	nsfwRouter.get('/r/:sub', (req, res, next) => subredditHot(req.params.sub, req, res, next));
	app.use('/nsfw', nsfwRouter);

	const router = express.Router();
	router.get('/', popularHot());
	router.get('/r/:sub', (req, res, next) => subredditHot(req.params.sub, req, res, next));

	router.get('/r/:sub/json', async (req, res) => {
		const hot = await app.r.getHot(req.params.sub)
			.map(post => ({
				...post,
				author: post.author.name,
				authorIsModerator: post.distinguished === 'moderator'
			}));

		res.json(hot);
	});
	app.use('/', router);


};
