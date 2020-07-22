/* eslint strict: 0 */
'use strict';

const path = require('path');
const webpack = require('webpack');
// const uglify = require('uglifyjs-webpack-plugin');

module.exports ={
    target: 'electron-renderer',
    entry: [
        './app/renderer.js',
    ],
    // plugins:[
    //     new uglify()
    // ],
    output: {
        path: path.join(__dirname, 'build'),
        // publicPath: path.join(__dirname, 'app'),
        filename: 'encrypt.js',
    }
};