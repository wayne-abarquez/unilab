'use strict';

var gulp = require('gulp');

var paths = gulp.paths;

var $ = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'del'],
    lazy: true
});


////////////////
function log(msg) {
    if (typeof(msg) === 'object') {
        for (var item in msg) {
            if (msg.hasOwnProperty(item)) {
                $.util.log($.util.colors.blue(msg));
            }
        }
    } else {
        $.util.log($.util.colors.blue(msg));
    }
}
////////////////

gulp.task('wiredep', function() {
   var indexSrc = paths.src + 'base.html';
   var srcJs = [
       paths.srcJs + 'app/**/*.js'
   ];
   var options = {
       bowerJson: require('../bower.json'),
       directory: paths.bower,
       ignorePath: '../../'
   };
   var wiredep = require('wiredep').stream;
   var clientDest = paths.src + '.tmp/';

   return gulp
       .src(indexSrc)
       .pipe(wiredep(options))
       .pipe($.inject(gulp.src(srcJs)))
       .pipe(gulp.dest(clientDest));
});

gulp.task('images', function () {
    return gulp.src(paths.srcImages + '**/*')
        .pipe(gulp.dest(paths.destImages));
});

gulp.task('fonts', function () {
    return gulp.src(paths.bower + '**/*')
        .pipe($.filter('**/*.{eot,otf,ttf,woff,woff2}'))
        .pipe($.flatten())
        .pipe(gulp.dest(paths.destFonts + '/'));
});

gulp.task('clean', function (done) {
    $.del(
        [
            paths.destImages,
            paths.destFonts ,
            paths.destCss   ,
            paths.destJs    ,
            paths.tmp
        ]
        , done);
});



gulp.task('buildapp', ['styles', 'scripts', 'images', 'fonts']);

