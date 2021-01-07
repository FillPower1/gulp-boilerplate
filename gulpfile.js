const del = require('del')
const gulp = require('gulp')
const babel = require('gulp-babel')
const rename = require('gulp-rename')
const postcss = require('gulp-postcss')
const sourcemap = require('gulp-sourcemaps')
const browserSync = require('browser-sync').create()
const postcssPresetEnv = require('postcss-preset-env')

const isDev = process.env.NODE_ENV === 'development'

const clean = () => del('dist')

const html = () =>
    gulp.src('src/*.html')
        .pipe(gulp.dest('dist'))
        .pipe(browserSync.stream())

const styles = () => {
    // TODO: refactor
    return isDev ?
        gulp.src('src/css/style.css')
            .pipe(require('gulp-plumber')())
            .pipe(sourcemap.init())
            .pipe(postcss([
                require('postcss-import'),
                require('postcss-nested'),
                postcssPresetEnv({
                    stage: 0,
                    autoprefixer: true,
                    preserve: false,
                }),
            ]))
            .pipe(rename({ suffix: '.min' }))
            .pipe(sourcemap.write('.'))
            .pipe(gulp.dest('dist/css'))
            .pipe(browserSync.stream())
        : gulp.src('src/css/style.css')
            .pipe(require('gulp-plumber')())
            .pipe(postcss([
                require('postcss-import'),
                require('postcss-nested'),
                postcssPresetEnv({
                    stage: 0,
                    autoprefixer: true,
                    preserve: false,
                }),
            ]))
            .pipe(require('gulp-csso')())
            .pipe(rename({ suffix: '.min' }))
            .pipe(gulp.dest('dist/css'))
            .pipe(browserSync.stream())
}

const scripts = () => {
    return gulp.src(['src/js/*.js'])
        .pipe(sourcemap.init())
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(require('gulp-terser')())
        .pipe(sourcemap.write())
        // .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('dist/js'))
}

const copy = () => gulp.src(
    [
        'src/fonts/**/*.{woff,woff2,eot,ttf,otf}',
        'src/img/**',
        'src/*.ico',
        // 'src/css/normalize.css'
    ],
    {
        base: 'src'
    }
).pipe(gulp.dest('dist'))

const server = () => {
    browserSync.init({
        server: {
            baseDir: './dist'
        },
        cors: true,
    })

    gulp.watch('./src/*.html', html).on('change', browserSync.reload)
    gulp.watch('./src/css/*.css', styles).on('change', browserSync.reload)
}

exports.default = gulp.series(
    clean, copy, html, styles, server
)

exports.build = gulp.series(
    clean, copy, styles, scripts, html
)
