'use strict';

module.exports = function (bricks) {
  return {
    bricks: bricks,
    watch: {
      less: {
        files: ['<%= bricks.app %>/styles/{,*/}*.less'],
        tasks: ['less']
      },
      styles: {
        files: ['<%= bricks.app %>/styles/{,*/}*.css'],
        tasks: ['concat:server', 'newer:copy:styles', 'autoprefixer']
      },
      tests: {
        files: [
          '<%= bricks.app %>/scripts/**/*.js',
          'test/mock/**/*.js',
          'test/spec/**/*.js'
        ],
        tasks: ['karma']
      },
      grunt: {
        files: ['Gruntfile.js']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= bricks.app %>/*.html',
          '<%= bricks.app %>/scripts/**/*.html',
          '.tmp/styles/{,*/}*.css',
          '{.tmp,<%= bricks.app %>}/scripts/**/*.js',
          '<%= bricks.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },
    autoprefixer: {
      options: ['last 1 version'],
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/styles/',
          src: '{,*/}*.css',
          dest: '.tmp/styles/'
        }]
      }
    },
    connect: {
      options: {
        port: 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost',
        livereload: 35729
      },
      livereload: {
        options: {
          open: true,
          base: [
            '.tmp',
            '<%= bricks.app %>'
          ]
        }
      },
      test: {
        options: {
          port: 9001,
          base: [
            '.tmp',
            'test',
            '<%= bricks.app %>'
          ]
        }
      },
      dist: {
        options: {
          base: '<%= bricks.dist %>'
        }
      }
    },
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= bricks.dist %>/*',
            '!<%= bricks.dist %>/.git*'
          ]
        }]
      },
      server: '.tmp'
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        'Gruntfile.js',
        'grunt/*.js',
        '<%= bricks.app %>/scripts/**/*.js'
      ]
    },
    less: {
      dist: {
        files: {
          '.tmp/styles/main.css': ['<%= bricks.app %>/styles/main.less']
        }
      }
    },
    concat: {
      server: {
        files: {
          '.tmp/plugins/components.html': '<%= bricks.plugins.components %>',
          '.tmp/plugins/styles.css': '<%= bricks.plugins.styles %>',
          '.tmp/scripts/build.js': [
            '<%= bricks.app %>/bower_components/node-uuid/uuid.js',
            '<%= bricks.app %>/scripts/storage/storage.js',
            '<%= bricks.app %>/scripts/preview.js'
          ]
        }
      },
      dist: {
        files: {
          '.tmp/concat/scripts/scripts.js': [
            '.tmp/concat/scripts/scripts.js',
            '.tmp/components.js',
            '.tmp/templates.js'
          ]
        }
      }
    },
    rev: {
      dist: {
        files: {
          src: [
            '<%= bricks.dist %>/scripts/**/*.js',
            '!<%= bricks.dist %>/scripts/{build,preview,storage/storage}.js',
            '<%= bricks.dist %>/styles/{,*/}*.css',
            '!<%= bricks.dist %>/styles/build.css',
            '<%= bricks.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
            '<%= bricks.dist %>/styles/fonts/*'
          ]
        }
      }
    },
    useminPrepare: {
      dist: {
        src: [
          '<%= bricks.app %>/index.html',
          '<%= bricks.app %>/edit.html',
          '<%= bricks.app %>/preview.html'
        ]
      },
      options: {
        dest: '<%= bricks.dist %>'
      }
    },
    usemin: {
      html: [
        '<%= bricks.dist %>/*.html',
        '<%= bricks.dist %>/scripts/**/*.html'
      ],
      css: ['<%= bricks.dist %>/styles/{,*/}*.css'],
      options: {
        assetsDirs: ['<%= bricks.dist %>']
      }
    },
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= bricks.app %>/images',
          src: '{,*/}*.{png,jpg,jpeg}',
          dest: '<%= bricks.dist %>/images'
        }]
      }
    },
    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= bricks.app %>/images',
          src: '{,*/}*.svg',
          dest: '<%= bricks.dist %>/images'
        }]
      }
    },
    htmlmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= bricks.app %>',
          src: ['*.html'],
          dest: '<%= bricks.dist %>'
        }]
      }
    },
    // Put files not handled in other tasks here
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= bricks.app %>',
          dest: '<%= bricks.dist %>',
          src: [
            'CNAME',
            '*.{ico,png,txt}',
            '.htaccess',
            '.nojekyll',
            'bower_components/**/*',
            'images/{,*/}*.{gif,webp}',
            'styles/fonts/*',
            'scripts/preview.js',
            'scripts/storage/storage.js'
          ]
        }, {
          expand: true,
          cwd: '.tmp/images',
          dest: '<%= bricks.dist %>/images',
          src: [
            'generated/*'
          ]
        }, {
          expand: true,
          dest: '<%= bricks.dist %>',
          src: [
            'package.json'
          ]
        }, {
          expand: true,
          cwd: '.tmp',
          dest: '<%= bricks.dist %>',
          src: [
            'plugins/styles.css',
            'scripts/build.js',
            'styles/build.css'
          ]
        }]
      },
      styles: {
        expand: true,
        cwd: '<%= bricks.app %>/styles',
        dest: '.tmp/styles/',
        src: '{,*/}*.css'
      }
    },
    concurrent: {
      server: [
        'less',
        'copy:styles',
        'concat:server'
      ],
      test: [
        'less',
        'copy:styles',
        'concat:server'
      ],
      dist: [
        'less',
        'copy:styles',
        'imagemin',
        'svgmin',
        'htmlmin',
        'concat:server'
      ]
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true
      }
    },
    ngmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/concat/scripts',
          src: [
            '*.js',
            '!{build,preview,storage/storage}.js'
          ],
          dest: '.tmp/concat/scripts'
        }]
      }
    },
    ngtemplates:  {
      dist: {
        options: {
          module: '<%= bricks.name %>'
        },
        files: [{
          cwd: '<%= bricks.app %>',
          src: ['scripts/**/*.html'],
          dest: '.tmp/templates.js'
        }, {
          cwd: '.tmp',
          src: ['plugins/components.html'],
          dest: '.tmp/components.js'
        }]
      }
    },
    nodewebkit: {
      dist: {
        options: {
          build_dir: 'build', // jshint ignore:line
          mac: true,
          win: true,
          linux32: false,
          linux64: false
        },
        src: ['<%= bricks.dist %>/**/*']
      }
    }
  };
};
