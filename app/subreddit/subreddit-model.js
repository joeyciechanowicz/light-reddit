const {reddit} = require('../config');

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

async function getSubreddit(name, options) {
	try {
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

async function getHot(subreddit, limit, count, before, after) {
	const config = {
		limit: limit
	};

	if (count) {
		config.count = count;
	}

	if (before) {
		config.before = before;
	}

	if (after) {
		config.after = after;
	}


	const hot = await reddit.getHot(subreddit, config);


}

module.exports = {
	getHot,
};
