/* sudo npm install -g gulp gulp-concat gulp-minify gulp-replace */
import gulp from 'gulp';
import concat from 'gulp-concat';
import minify from 'gulp-minify';
import replace from 'gulp-replace';

gulp.task('autobuild', function () {
    gulp.watch('src/**', {'ignoreInitial': false}, gulp.series('build'));
});

gulp.task('build', function () {
    gulp.src(['src/jsu.js', 'src/lib/*.js'])
        .pipe(concat('dist/jsu.js'))
        .pipe(minify({
            ext: {'src': '.tmp.mjs', 'min': '.min.mjs'},
            compress: {'hoist_vars': true}
        }))
        .pipe(gulp.dest('.'));

    return gulp.src(['src/jsu.js', 'src/lib/*.js', 'src/load.js'])
        .pipe(replace(/export (default )?/g, ''))
        .pipe(concat('dist/jsu.js'))
        .pipe(minify({
            ext: {'src': '.tmp.js', 'min': '.min.js'},
            compress: {'hoist_vars': true}
        }))
        .pipe(gulp.dest('.'));
});
