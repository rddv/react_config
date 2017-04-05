var path = require('path');
var del = require('del');
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var uglifycss = require('gulp-uglifycss');

// set variable via $ gulp --type production
var environment = $.util.env.type || 'development';
var isProduction = environment === 'production';
var webpackConfig = require('./webpack.config.js').getConfig(environment);

var port = $.util.env.port || 1337;
var src = 'src/';
var public = 'public/';

var autoprefixerBrowsers = [
    'ie >= 9',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 40',
    'safari >= 7',
    'opera >= 30',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
];

gulp.task('scripts', function() {
    return gulp.src(webpackConfig.entry)
        .pipe($.webpack(webpackConfig))
        .pipe(isProduction ? $.uglify() : $.util.noop())
        .pipe(gulp.dest(public + 'scripts/'))
        .pipe($.size({ title : 'scripts' }))
        .pipe($.connect.reload());
});

// copy html from src to public
gulp.task('html', function() {
    return gulp.src(src + 'index.html')
        .pipe(gulp.dest(public))
        .pipe($.size({ title : 'html' }))
        .pipe($.connect.reload());
});

gulp.task('styles', function () {
    gulp.src('src/sass/**/*.*')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe($.autoprefixer({browsers: autoprefixerBrowsers}))
        .pipe(sourcemaps.write())
        .pipe(isProduction ? uglifycss() : $.util.noop())
        .pipe(gulp.dest('public/css'))
        .pipe($.connect.reload());
});

// add livereload on the given port
gulp.task('serve', function() {
    $.connect.server({
        root: public,
        port: port,
        livereload: {
            port: 35729
        }
    });
});

// copy images
gulp.task('images', function() {
    return gulp.src(src + 'img/**/*.{png,jpg,jpeg,gif}')
        .pipe($.size({ title : 'img' }))
        .pipe(gulp.dest(public + 'img/'));
});

//fonts
gulp.task('fonts', function () {
    gulp.src('src/fonts/*.*')
        .pipe(gulp.dest('public/fonts'))
        .pipe($.connect.reload());
});

// watch scss, html and scripts file changes

gulp.task('watch', function() {
    gulp.watch(src + 'sass/**/*.scss', ['styles']);
    gulp.watch(src + 'index.html', ['html']);
    gulp.watch(src + 'scripts/**/*.js', ['scripts']);
    gulp.watch(src + 'scripts/**/*.jsx', ['scripts']);
    gulp.watch(src + 'fonts/**', ['fonts']);
    gulp.watch(src + 'img/**', ['images']);
});

// remove bundels
gulp.task('clean', function(cb) {
    return del([public], cb);
});


// by default build project and then watch files in order to trigger livereload
gulp.task('default', ['images', 'html','scripts', 'styles', 'serve', 'watch']);

// waits until clean is finished then builds the project
gulp.task('build', ['clean'], function(){
    gulp.start(['images', 'html','scripts','styles', 'fonts']);
});