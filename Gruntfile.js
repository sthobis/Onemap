module.exports = function(grunt) {
// Load Grunt tasks declared in the package.json file
require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

// Configure Grunt
grunt.initConfig({

// Grunt express - our webserver
// https://github.com/blai/grunt-express
express: {
    all: {
        options: {
            bases: ['C:\\Project\\SPF'],
            port: 8080,
            hostname: "0.0.0.0",
            livereload: true
        }
    }
},

// grunt-watch will monitor the projects files
// https://github.com/gruntjs/grunt-contrib-watch
watch: {
    options: {
        livereload: true,
    },
    html: {
        files: ['./index.html', './parallax/parallax.html'],
    },
    js: {
        files: ['./js/*.js', './parallax/*/*.js']
    },
    less: {
        files: ['./css/*.less', './parallax/css/*.less'],
        tasks: ['less'],
        options: {
            livereload: false
        }
    },
    css: {
        files: ['./css/*.css', './parallax/css/*.css'],
    }  

},

less: {
        development: {
            options: {
                paths: ["./css","./parallax/css"],
                yuicompress: true
            },
        files: {
            "./css/main.css": "./css/main.less",
            "./css/responsive.css": "./css/responsive.less",
            "./parallax/css/main.css": "./parallax/css/main.less",
            "./parallax/css/responsive.css": "./parallax/css/responsive.less"
        }
    }
},

// grunt-open will open your browser at the project's URL
// https://www.npmjs.org/package/grunt-open
open: {
    all: {
        path: 'http://localhost:8080/index.html'
    }
}
});

grunt.loadNpmTasks('grunt-contrib-less');
grunt.loadNpmTasks('grunt-contrib-watch');

// Creates the `server` task
grunt.registerTask('server', [
    'express',
    'open',
    'watch'
    ]);
};