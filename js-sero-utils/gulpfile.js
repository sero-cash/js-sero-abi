'use strict';

var fs = require('fs');
var through = require('through');

var gulp = require("gulp");
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");

var browserify = require("browserify");
var source = require('vinyl-source-stream');
var tsify = require("tsify");

var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var buffer = require('vinyl-buffer');

function createTransform(transforms, show) {
    if (!show) { show = { }; }

    function padding(length) {
        let pad = '';
        while (pad.length < length) { pad += ' '; }
        return pad;
    }

    function transformFile(path) {
        for (var pattern in transforms) {
            if (path.match(new RegExp('/' + pattern + '$'))) {
                return transforms[pattern];
            }
        }
        return null;
    }

    return function(path, options) {
        var data = '';

        return through(function(chunk) {
            data += chunk;
        }, function () {
            var transformed = transformFile(path);
            var shortPath = path;
            if (shortPath.substring(0, __dirname.length) == __dirname) {
                shortPath = shortPath.substring(__dirname.length);
            }
            var size = fs.readFileSync(path).length;
            if (transformed != null) {
                if (show.transformed) {
                    console.log('Transformed:', shortPath, padding(70 - shortPath.length), size, padding(6 - String(size).length), '=>', transformed.length);
                }
                data = transformed;
            } else {
                if (show.preserved) {
                    console.log('Preserved:  ', shortPath, padding(70 - shortPath.length), size);
                }
            }
            this.queue(data);
            this.queue(null);
        });
    }
}

/**
 *  Bundled Library (browser)
 *
 *  Source: src.ts/index.ts src.ts/{contracts,providers,utils,wallet}/*.ts src.ts/wordlists/lang-en.ts
 *  Target: dist/js-sero-utils{.min,}.js
 */
function taskBundle(name, options) {
    var show = options.show || { };

    // The elliptic package.json is only used for its version
    var ellipticPackage = require('elliptic/package.json');
    ellipticPackage = JSON.stringify({ version: ellipticPackage.version });

    var version = require('./package.json').version;

    var undef = "module.exports = undefined;";
    var empty = "module.exports = {};";

    // This is only used in getKeyPair, which we do not use; but we'll
    // leave it in tact using the browser crypto functions
    var brorand = "module.exports = function(length) { var result = new Uint8Array(length); (global.crypto || global.msCrypto).getRandomValues(result); return result; }";

    // setImmediate is installed globally by our src.browser/shims.ts, loaded from src.ts/index.ts
    var process = "module.exports = { browser: true };";
    var timers = "module.exports = { setImmediate: global.setImmediate }; ";


    var transforms = {

        // Remove the precomputed secp256k1 points
        "elliptic/lib/elliptic/precomputed/secp256k1.js": undef,

        // Remove curves we don't care about
        "elliptic/curve/edwards.js": empty,
        "elliptic/curve/mont.js": empty,
        "elliptic/lib/elliptic/eddsa/.*": empty,

        // We only use the version from this JSON package
        "elliptic/package.json" : ellipticPackage,

        // Remove RIPEMD160 and unneeded hashing algorithms
        //"hash.js/lib/hash/ripemd.js": "module.exports = {ripemd160: null}",
        "hash.js/lib/hash/sha/1.js": empty,
        "hash.js/lib/hash/sha/224.js": empty,
        "hash.js/lib/hash/sha/384.js": empty,

        // Swap out borland for the random bytes we already have
        "brorand/index.js": brorand,


        // Used by sha3 if it exists; (so make it no exist)
        "process/browser.js": process,
        "timers-browserify/main.js": timers,


    };

    gulp.task(name, function () {

        var result = browserify({
            basedir: '.',
            debug: false,
            entries: [ './index.js' ],
            cache: { },
            packageCache: {},
            standalone: "js-sero-utils",
            transform: [ [ createTransform(transforms, show), { global: true } ] ],
        })
        .bundle()
        .pipe(source(options.filename))

        if (options.minify) {
            result = result.pipe(buffer())
            .pipe(sourcemaps.init({ loadMaps: true }))
            .pipe(uglify({
                output: { ascii_only: true }
            }))
            .pipe(sourcemaps.write('./'))
        }

        result = result.pipe(gulp.dest(options.dest));

        return result;
    });
}

// Creates dist/js-sero-utils
taskBundle("default", { filename: "js-sero-utils", dest: 'dist', show: { transformed: true, preserved: true }, minify: false });

// Creates dist/js-sero-utils
taskBundle("default-test", { filename: "js-sero-utils", dest: 'tests/dist', show: { transformed: true }, minify: false });

// Creates dist/js-sero-utils.min.js
taskBundle("minified", { filename: "js-sero-utils.min.js", dest: 'dist', minify: true });

// Creates dist/js-sero-utils.min.js
taskBundle("minified-test", { filename: "js-sero-utils.min.js", dest: 'tests/dist', minify: true });

/*
// Dump the TypeScript definitions to dist/types/
gulp.task("types", function() {
    return gulp.src(['./src.ts/index.ts', './src.ts / * * / * . ts'])
    .pipe(ts({
        declaration: true,
        esModuleInterop: true,
        moduleResolution: "node",
        lib: [ "es2015", "es5", "dom" ],
        module: "commonjs",
        outDir: './dist/types',
        target: "es5",
    }))
    .dts
    .pipe(gulp.dest("dist/types/"))
});
*/

/**
 *  Browser Friendly BIP39 Wordlists
 *
 *  source: src.ts/wordlist/lang-*.ts
 *  target: dist/wordlist-*.js
 *
 *  Since all of the functions these wordlists use is already
 *  available from the global js-sero-utils library, we use this to
 *  target the global js-sero-utils functions directly, rather than
 *  re-include them.
 */
function taskLang(locale) {
    function transformBip39(path, options) {
        var data = '';

        return through(function(chunk) {
            data += chunk;
        }, function () {
            var shortPath = path;
            if (shortPath.substring(0, __dirname.length) == __dirname) {
                shortPath = shortPath.substring(__dirname.length);
            }

            // Word list files...
            if (shortPath.match(/^\/src\.ts\/wordlists\//)) {
                shortPath = '/';
            }

            switch (shortPath) {
                // Use the existing "js-sero-utils.errors"
                case '/src.ts/errors.ts':
                    data = "module.exports = global.js-sero-utils.errors";
                    break;

                // Use the existing "js-sero-utils.utils"
                case '/src.ts/utils/bytes.ts':
                case '/src.ts/utils/hash.ts':
                case '/src.ts/utils/properties.ts':
                case '/src.ts/utils/utf8.ts':
                    data = "module.exports = global.js-sero-utils.utils";
                    break;

                // Do nothing
                case '/':
                    break;

                default:
                    throw new Error('unhandled file: ' + shortPath);
            }

            this.queue(data);
            this.queue(null);
        });
    }


}

