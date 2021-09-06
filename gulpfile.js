`use strict`;

const gulp = require("gulp"),
  sass = require("gulp-sass")(require("sass")),
  bs = require("browser-sync"),
  prefixer = require("gulp-autoprefixer"),
  cleanCss = require("gulp-clean-css"),
  concat = require("gulp-concat"),
  sourcemaps = require("gulp-sourcemaps"),
  pug = require("gulp-pug"),
  rename = require("gulp-rename"),
  htmlmin = require("gulp-htmlmin"),
  uglify = require("gulp-uglify-es").default,
  imagemin = require('gulp-imagemin');

// Собираем Stylus
gulp.task("style", () => {
  return (
    gulp
      .src("./app/sass/**/*.sass", "!./app/sass/_*.sass")
      .pipe(sourcemaps.init())
      .pipe(sass().on("error", sass.logError))
      .pipe(
        prefixer({
          overrideBrowserslist: ["last 8 versions"],
          browsers: [
            "Android >= 4",
            "Chrome >= 20",
            "Firefox >= 24",
            "Explorer >= 11",
            "iOS >= 6",
            "Opera >= 12",
            "Safari >= 6",
          ],
        })
      )
      .pipe(
        cleanCss({
          level: 2,
        })
      )
      .pipe(
        rename({
          suffix: ".min",
        })
      )
      .pipe(sourcemaps.write("/sourcemaps"))
      .pipe(gulp.dest("./app/css"))
      .pipe(bs.reload({ stream: true }))
  );
});

// Собираем html из Jade
gulp.task("pug", function () {
  return (
    gulp
      .src(["./app/pug/*.pug", "!./app/pug/**/_*.pug"])
      .pipe(pug({ pretty: "\t" }))
      .pipe(gulp.dest("./app"))
      .pipe(bs.reload({stream: true})) // даем команду на перезагрузку страницы
  )
});


// Собираем JS
gulp.task('js', function() {
  return(
    gulp
      .src(["./app/js/**/*.js", "!./assets/js/**/*_.js"])
      .pipe(concat("index.js")) // Собираем все JS, кроме тех которые не начинаются _
      .pipe(sourcemaps.write("./app/js/sourcemaps"))
      .pipe(uglify())
      .pipe(gulp.dest("./dist/js"))
      .pipe(bs.reload({stream: true})) // даем команду на перезагрузку страницы
  )
});

// Копируем и минимизируем изображения

gulp.task("img", () => {
  return gulp
    .src("app/img/**/*")
    .pipe(
      imagemin(
        {
          interlaced: true,
          progressive: true,
          optimizationLevel: 5,
        },
        [
          imagemin.gifsicle(),
          imagemin.optipng(),
          imagemin.svgo(),
        ]
      )
    )
    .pipe(gulp.dest("dist/img"))
});

gulp.task("html", () => {
  return gulp
    .src(["app/**/*.html", "!app/**/_*.html"])
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest("dist"))
    .pipe(bs.reload({ stream: true }));
});

gulp.task("css", () => {
  return gulp
    .src("app/css/**/*.css")
    .pipe(gulp.dest("./dist/css"))
    .pipe(bs.reload({ stream: true }));
});

// запуск сервера +
gulp.task('webserver', function () {
    bs.init({
      server: {
        baseDir: "./app",
      },
    });
});


gulp.task('dev', () => {
  gulp.watch('./app/sass/**/*.sass', gulp.parallel('style'))
  gulp.watch("./app/pug/**/*.pug", gulp.parallel("pug"))
  gulp.watch("./app/js/**/*.js", gulp.parallel("js"))
})

gulp.task("prod", gulp.parallel("css", "html", "js", "img"));

gulp.task(
  "default",
  gulp.parallel("style", "pug", "js", "html", "dev", "webserver")
);