const fs = require('fs');
const express = require('express');

// const {cacheGet, cacheSet} = require('../lib/cache');

function setNsfw(req, res, next) {
	res.locals.nsfw = true;
	next();
}

const limit = 25;

function resolveMedia(post) {
	const displayedPost = {
		...post,
		author: post.author && post.author.name ? post.author.name : post.author,
		authorIsModerator: post.distinguished === 'moderator'
	};

	if (post.post_hint === 'link') {
		displayedPost.externalLink = post.url;
	} else if (post.is_video) {
		displayedPost.resolvedMedia = {
			video: {
				formats: [
					{
						url: post.media.reddit_video.fallback_url,
						type: 'video/mp4'
					}
				],
				width: post.media.reddit_video.width,
				height: post.media.reddit_video.height,
				placeholder: post.preview.images[0].resolutions[0].url
			}
		};
	} else if (post.preview && post.preview.reddit_video_preview) {
		displayedPost.resolvedMedia = {
			video: {
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
	} else if (post.post_hint === 'image' && post.media) {
		displayedPost.resolvedMedia = {
			images: post.media.images
		};
	} else if (/\.(jpg|png)$/.exec(post.url)) {
		if (post.preview && post.preview.images.length > 0) {
			displayedPost.resolvedMedia = {
				images: post.preview.images[0].resolutions
			}
		} else {
			displayedPost.resolvedMedia = {
				image: {
					url: post.url
				}
			}
		}
	}

	return displayedPost;
}

function formatComments(comment) {
	return {
		...comment,
		author: comment.author && comment.author.name ? comment.author.name : comment.author,
		authorIsModerator: comment.distinguished === 'moderator',
		replies: comment.replies ? comment.replies.map(formatComments) : []
	};
}

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

			// let hotRequest;
			// if (req.query.cached) {
			// 	hotRequest = JSON.parse(fs.readFileSync('./cached.json'));
			// } else {
			// 	hotRequest = await app.r.getHot(subreddit, config);
			// 	fs.writeFileSync('./cached.json', JSON.stringify(hotRequest));
			// }

			const hotRequest = await app.r.getHot(subreddit, config);


			if (typeof hotRequest === 'string') {
				// invalid access_token
				return next(new Error('Invalid access token'));
			}

			const hot = hotRequest.map(post => resolveMedia(post));

			const after = hot[hot.length - 1].id;

			const subredditPrefixed = `r/${subreddit}`;

			const viewModel = {
				posts: hot,
				showPostSubreddit: subreddit === 'popular',
				showBack: count !== 0,
				backwardCount: count - limit,
				forwardCount: count + limit,
				redditUrl: subredditPrefixed,
				title: subredditPrefixed,
				after
			};

			// if (req.query.json) {
			// 	return res.json(viewModel);
			// }

			return res.render('sub-reddit', viewModel);
		} catch (error) {
			next(error);
		}
	}

	async function post(id, req, res, next) {
		try {
			const post = await app.r.getSubmission(id).fetch();

			const viewModel = {
				...resolveMedia(post),
				comments: post.comments ? post.comments.map(formatComments) : [],
				showPostSubreddit: true,
				redditUrl: req.url,
			};

			// if (req.query.json) {
			// 	return res.json(viewModel);
			// }

			res.render('post-with-comments', viewModel);
		} catch (error) {
			next(error);
		}
	}

	const popularHot = () => (req, res, next) => subredditHot('popular', req, res, next);

	const router = express.Router();
	router.use(app.redis.route());
	router.get('/', popularHot());
	router.get('/r/:sub', (req, res, next) => subredditHot(req.params.sub, req, res, next));
	router.get('/r/:sub/comments/:id/:title', (req, res, next) => post(req.params.id, req, res, next));

	const nsfwRouter = express.Router();
	nsfwRouter.use(setNsfw);
	nsfwRouter.use(router);
	app.use('/nsfw', nsfwRouter);

	app.use('/', router);


};
