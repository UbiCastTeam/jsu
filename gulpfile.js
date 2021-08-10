/* sudo npm install -g gulp gulp-concat gulp-minify */
import gulp from 'gulp';
import * as concat from 'gulp-concat';
import * as minify from 'gulp-minify';

gulp.task('autobuild', function () {
    gulp.watch('src/**', {'ignoreInitial': false}, gulp.series('build'));
});

gulp.task('build', function () {
    return gulp.src(['src/jsu.js', 'src/lib/*.js'])
        .pipe(concat.default('dist/jsu.js'))
        .pipe(minify.default({
            ext: {'src': '.tmp.js', 'min': '.min.js'},
            compress: {'hoist_vars': true}
        }))
        .pipe(gulp.dest('.'));
});
