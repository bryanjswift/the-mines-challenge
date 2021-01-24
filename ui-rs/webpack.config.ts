import { execSync } from 'child_process';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';
import webpack from 'webpack';

const mode =
  process.env.NODE_ENV === 'production' ? 'production' : 'development';
const dev = mode === 'development';
const gitVersion = execSync('git rev-parse HEAD').toString().trim();

const config: webpack.Configuration = {
  mode,
  devtool: dev ? 'eval-source-map' : undefined,
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    ...(dev ? [new webpack.HotModuleReplacementPlugin()] : []),
    new HtmlWebpackPlugin(),
    new webpack.DefinePlugin({
      'process.browser': true,
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.VERSION': JSON.stringify(gitVersion),
    }),
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx', '.wasm'],
  },
  experiments: {
    asyncWebAssembly: true,
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[chunkhash].bundle.js',
  },
};

export default config;
