const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CompressionPlugin = require('compression-webpack-plugin');

const production = process.env.NODE_ENV === 'production';

const plugins = [
	new MiniCssExtractPlugin({
		// Options similar to the same options in webpackOptions.output
		// both options are optional
		filename: '[name].css',
		chunkFilename: '[id].css'
	}),
];

if (production) {
	plugins.push(new CompressionPlugin());
}


module.exports = {
	entry: {
		styles:path.resolve(__dirname, 'src/scss/main.scss')
	},
	mode: production ? 'production' : 'development',
	devtool: production ? 'none' : 'source-map',
	module: {
		rules: [{
			test: /\.scss$/,
			use: [
				// fallback to style-loader in development
				production ? 'style-loader' : MiniCssExtractPlugin.loader,
				'css-loader',
				'sass-loader'
			]
		}]
	},
	plugins,
	output: {
		path: path.resolve(__dirname, 'dist'),
		publicPath: 'dist',
		filename: 'bundle.js'
	}
};
