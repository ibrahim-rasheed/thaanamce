const gulp = require('gulp');
const connect = require('gulp-connect');
const clean = require('gulp-clean');
const less = require('gulp-less');
const lessAutoprefix = require('less-plugin-autoprefix');
const gulpStylelint = require('gulp-stylelint');
const header = require('gulp-header');
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

const autoprefix = new lessAutoprefix({
  browsers: ['last 2 Safari versions', 'iOS 14.0', 'last 2 Chrome versions', 'Firefox ESR'],
  grid: 'no-autoplace'
});

//
// Lint less files using stylelint
//
gulp.task('lint', function() {
  return gulp.src('./src/less/**/*.less')
    .pipe(gulpStylelint({
      failAfterError: true,
      reporters: [
        {formatter: 'string', console: true}
      ]
    }));
});


//
// Build HTML demos
//
gulp.task('buildDemos', function() {
  return gulp.src(['./src/demo/**/*'])
    .pipe(gulp.dest('./build'));
});

//
// Copy TinyMCE from modules/tinymce to the build folder.
// NOTE. This task must be run after the buildDemos task
//
gulp.task('copyTinymce', function(done) {
  if (fs.existsSync('../tinymce/js/tinymce/tinymce.min.js')) {
    return gulp.src(['../tinymce/js/tinymce/**/*'], {
        base: '../tinymce/js/'
      })
      .pipe(gulp.dest('./build'));
  } else {
    console.log(chalk.red('Local TinyMCE does not exist. Using cloud version instead'));
    console.log(chalk.yellow('Run yarn build in the repository root to build a local version of TinyMCE'));
    const url = 'https://cdn.tiny.cloud/1/qagffr3pkuv17a8on1afax661irst1hbr4e6tbv888sz91jc/tinymce/5-dev/tinymce.min.js';
    const html = fs.readFileSync('./build/index.html', 'utf8');
    fs.writeFileSync('./build/index.html', html.replace('/tinymce/tinymce.min.js', url));
    done();
  }
});

// Generate list of available skins and content css:es to populate select field in index.html
const getDirs = (p) => fs.readdirSync(p).filter(f => fs.statSync(path.join(p, f)).isDirectory());
gulp.task('buildSkinSwitcher', (done) => {
  const uiSkins = getDirs(`./build/skins/ui`);
  const contentSkins = getDirs(`./build/skins/content`);
  const data = `uiSkins = ${JSON.stringify(uiSkins)}, contentSkins = ${JSON.stringify(contentSkins)}`;
  const html = fs.readFileSync('./build/index.html', 'utf8');
  fs.writeFileSync('./build/index.html', html.replace('/** ADD_DATA */', data));

  done();
});

//
// Build CSS
//
gulp.task('less', function() {
  return gulp.src('./src/less/skins/**/*.less')
    .pipe(less({
      math: 'always',
      relativeUrls: true,
      plugins: [autoprefix]
    }))
    .pipe(gulp.dest('./build/skins/'));
});

//
// Minify CSS
//
gulp.task('minifyCss', function() {
  return gulp.src(['./build/skins/**/*.css', '!**/*.min.css'])
    .pipe(sourcemaps.init())
    .pipe(cleanCSS({ rebase: false }))
    .pipe(header(fs.readFileSync('src/text/license-header.css', 'utf8')))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./build/skins'))
    .pipe(connect.reload());
});

//
// Copy icon font used by the mobile skin to each skin folder in /build
//
gulp.task('copyFonts', function() {
  let base = './build/skins/ui';

  return fs.readdirSync(base).reduce((stream, skin) => {
    return stream.pipe(gulp.dest(base + '/' + skin + '/fonts/'));
  }, gulp.src('./src/fonts/**'));
});
//
// Copy icon font used by the mobile skin to each skin folder in /build
//
gulp.task('copyFonts', function() {
  let base = './build/skins/content';

  return fs.readdirSync(base).reduce((stream, skin) => {
    return stream.pipe(gulp.dest(base + '/' + skin + '/fonts/'));
  }, gulp.src('./src/fonts/**'));
});

//
// watch and rebuild CSS for Oxide demos
//
gulp.task('monitor', function (done) {
  connect.server({
    root: './build',
    port: 3000,
    livereload: true
  }, function () {
    this.server.on('close', done);
  });

  gulp.watch('./src/**/*').on('change', gulp.series('css', 'buildDemos', 'copyTinymce'));
});

//
// clean builds
//
gulp.task('clean', function () {
  return gulp.src('./build', {
    read: false,
    allowEmpty: true
  })
  .pipe(clean());
});

//
// Build project and watch LESS file changes
//
gulp.task('css', gulp.series('lint', 'less', 'minifyCss'));
gulp.task('build', gulp.series('clean', 'css', 'copyFonts'));
gulp.task('default', gulp.series('build'));

gulp.task('demo-build', gulp.series('css', 'less', 'minifyCss', 'buildDemos', 'buildSkinSwitcher'));
gulp.task('watch', gulp.series('build', 'buildDemos', 'copyTinymce', 'buildSkinSwitcher', 'monitor'));
