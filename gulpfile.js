// * Команды *
// "gulp" - запуск gulp.
// "gulp mg" - группировка всех медиазапросов в конец файла style.css.
// "gulp min" - сжимает js, css (создает минимизированные файлы script.min.js и style.min.css).
// "gulp img-min" - сжимает изображения
// "gulp webp" - конвертирует изображения jpeg, jpg, png в формат webp
// "gulp svgsprite" - собирает все svg из папки svg_icons в один svg спрайт

// * Настройки *
const html = false; // Нужно ли делать перезагрузку браузера при изменении html файлов (если не используется pug)
const server = false; // Если используется OpenServer и php

// * Пути к папкам относительно корня проекта *
const scssPath = 'scss', // Scss
  cssPath = 'css', // Css
  pugPath = 'pug', // Pug
  htmlPath = './', // Html
  jsPath = 'js', // Js
  imgPath = 'img'; // Изображения

// Код
const gulp = require('gulp'),
  sass = require('gulp-sass')(require('sass')),
  pug = require('gulp-pug'),
  autoprefixer = require('gulp-autoprefixer'),
  cleanCSS = require('gulp-clean-css'),
  browserSync = require('browser-sync'),
  uglify = require('gulp-uglify'),
  rename = require("gulp-rename"),
  gcmq = require('gulp-group-css-media-queries'),
  imageMin = require('gulp-imagemin'),
  pngquant = require('imagemin-pngquant'),
  plumber = require('gulp-plumber'),
  webp = require('gulp-webp'),
  svgSprite = require('gulp-svg-sprite');

gulp.task('pug', function () {
  return gulp.src(pugPath + '/*.pug')
    .pipe(plumber())
    .pipe(pug({
      pretty: '\t'
    }))
    .pipe(gulp.dest(htmlPath))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task('style', function () {
  return gulp.src(scssPath + '/*.scss')
    .pipe(plumber())
    .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
    .pipe(autoprefixer({
      cascade: false
    }))
    .pipe(gulp.dest(cssPath))
    .pipe(browserSync.reload({ stream: true }));
});

if (!server) {
  gulp.task('browser-sync', function () {
    browserSync.init({
      server: {
        baseDir: htmlPath,
      },
      notify: true,
    });
  });
}else {
  gulp.task('browser-sync', function () {
    browserSync.init({
      proxy: 'http://wp-dev.ru/',
    });
  });
}

gulp.task('css-min', function () {
  return gulp.src(cssPath + '/style.css')
    .pipe(cleanCSS({
      level: 2
    }))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(cssPath))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task('js-min', function () {
  return gulp.src(jsPath + '/scripts.js')
    .pipe(uglify())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(jsPath))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task('img-min', function () {
  return gulp.src(imgPath + '/*')
    /* .pipe(gulp.dest(imgPath + '-full')) */
    .pipe(imageMin([
      imageMin.gifsicle(),
      imageMin.mozjpeg(),
      imageMin.svgo(),
      pngquant()
    ], {
      verbose: true
    }))
    .pipe(gulp.dest(imgPath));
});

gulp.task('mg', function () {
  return gulp.src(cssPath + '/style.css')
    .pipe(gcmq())
    .pipe(gulp.dest(cssPath))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task('svgsprite', function () {
  return gulp.src(imgPath + '/svg_icons/*.svg')
    .pipe(svgSprite({
      shape: {
        dimension: {
          maxWidth: 500,
          maxHeight: 500
        },
        spacing: {
          padding: 0
        },
        transform: [{
          "svgo": {
            "plugins": [
              { removeViewBox: false },
              { removeUnusedNS: false },
              { removeUselessStrokeAndFill: true },
              { cleanupIDs: false },
              { removeComments: true },
              { removeEmptyAttrs: true },
              { removeEmptyText: true },
              { collapseGroups: true },
              { removeAttrs: { attrs: '(fill|stroke|style)' } }
            ]
          }
        }]
      },
      mode: {
        symbol: {
          dest: '.',
          sprite: 'sprite.svg'
        }
      }
    })).on('error', function (error) { console.log(error); })
    .pipe(gulp.dest(imgPath));
});

gulp.task('watch', function () {
  gulp.watch(pugPath + '/**/*.pug', gulp.parallel('pug'));
  if (html) {
    gulp.watch(htmlPath + '/**/*.html', function reload(done) {
      browserSync.reload();
      done();
    });
  }
  gulp.watch(jsPath + '/**/*.js', function reload(done) {
    browserSync.reload();
    done();
  });
  gulp.watch('**/*.php', function reload(done) {
    browserSync.reload();
    done();
  });
  gulp.watch(scssPath + '/**/*.scss', gulp.parallel('style'));
  gulp.watch(imgPath + '/svg_icons/*.svg', gulp.parallel('svgsprite'));
});

gulp.task('webp', () =>
  gulp.src(imgPath + '/**/*.+(jpg|png|jpeg)')
    .pipe(webp())
    .pipe(gulp.dest(imgPath))
);

gulp.task('default', gulp.parallel('browser-sync', 'pug', 'style', 'svgsprite', 'watch'));

gulp.task('min', gulp.parallel('css-min', 'js-min'));
