'use strict';

var gulp = require('gulp');
var srcDir = 'src/',
    staticDir = 'static/',
    templatesDir = 'templates/';

gulp.paths = {
    src: srcDir,
    bower: srcDir + 'bower_components/',
    tmp: srcDir + '.tmp/',
    srcImages: srcDir + 'images/',
    srcSass: srcDir + 'sass/',
    srcCss: srcDir + 'css/',
    srcJs: srcDir + 'js/',
    srcLibJs: srcDir + 'lib_js/',
    destStatic: staticDir,
    destImages: staticDir + 'resources/images/',
    templates: templatesDir,
    destFonts: templatesDir + 'fonts/',
    destCss: templatesDir + 'css/',
    destJs: templatesDir + 'js/'
};

require('require-dir')('./gulp');

gulp.task('build', ['clean'], function () {
    gulp.start('buildapp');
});


