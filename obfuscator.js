var path = require('path');
var gulp = require('gulp'),
    javascriptObfuscator = require('gulp-javascript-obfuscator');
var orignSrc = path.join(__dirname, './app/renderer/base');
var files = [path.join(orignSrc, '/addSecondProcess.js'), path.join(orignSrc, '/baseParametersUtil.js'), path.join(orignSrc, '/getParametersUtils.js'), path.join(orignSrc, '/new-index.js'), path.join(orignSrc, '/workflow.js')];
// var files = [path.join(orignSrc, '/workflow.js')];
files.forEach((item, index) => {
    console.log(item);
    gulp.src(item)
        .pipe(javascriptObfuscator())
        .pipe(gulp.dest(orignSrc));
});
