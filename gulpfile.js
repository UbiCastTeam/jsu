/* globals require */
/* sudo npm install -g gulp gulp-concat gulp-minify */
const gulp = require('gulp');
const concat = require('gulp-concat');
const minify = require('gulp-minify');

gulp.task('autobuild', function () {
    gulp.watch('src/**', {'ignoreInitial': false}, gulp.series('build'));
});

gulp.task('build', function () {
    return gulp.src(['src/jsu.js', 'src/lib/*.js'])
        .pipe(concat('dist/jsu.js'))
        .pipe(minify({
            ext: {'src': '.tmp.js', 'min': '.min.js'},
            compress: {'hoist_vars': true}
        }))
        .pipe(gulp.dest('.'));
});
