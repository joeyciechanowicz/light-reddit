const msPerMinute = 60 * 1000;
const msPerHour = msPerMinute * 60;
const msPerDay = msPerHour * 24;
const msPerMonth = msPerDay * 30;
const msPerYear = msPerDay * 365;

function timeAgo(utcTime) {
	const elapsed = new Date() - (utcTime * 1000);

	if (elapsed < msPerMinute) {
		const amount = Math.round(elapsed/1000);
		return  `${amount} second${amount === 1 ? '' : 's'} ago`;
	}

	else if (elapsed < msPerHour) {
		const amount = Math.round(elapsed/msPerMinute);
		return  `${amount} minute${amount === 1 ? '' : 's'} ago`;
	}

	else if (elapsed < msPerDay ) {
		const amount = Math.round(elapsed/msPerHour);
		return  `${amount} hour${amount === 1 ? '' : 's'} ago`;
	}

	else if (elapsed < msPerMonth) {
		const amount = Math.round(elapsed/msPerDay);
		return  `${amount} day${amount === 1 ? '' : 's'} ago`;
	}

	else if (elapsed < msPerYear) {
		const amount = Math.round(elapsed/msPerMonth);
		return  `${amount} month${amount === 1 ? '' : 's'} ago`;
	}

	else {
		const amount = Math.round(elapsed/msPerYear);
		return  `${amount} year${amount === 1 ? '' : 's'} ago`;
	}
}


module.exports = {
	timeAgo
};
