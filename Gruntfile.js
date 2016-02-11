module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    concat: {
      options: {
        separator: ''
      },
      deps: {
        // the files to concatenate
        src: [
          './public/lib/jquery.js',
          './public/lib/underscore.js',
          './public/lib/backbone.js',
          './public/lib/handlebars.js'
          ],
        // the location of the resulting JS file
        dest: 'public/dist/<%= pkg.name %>-deps.js'
      },
      cust: {
        src: ['./public/client/*.js'],
        dest: 'public/dist/<%= pkg.name %>-cust.js'
      }
    },

    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/**/*.js']
      }
    },

    nodemon: {
      dev: {
        script: 'server.js'
      }
    },

    uglify: {
        options: {
          // the banner is inserted at the top of the output
          banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
        },
        deps: {
          files: {
            'public/dist/<%= pkg.name %>-deps.min.js': ['<%= concat.deps.dest %>']
          }
        },
        cust: {
          files: {
            'public/dist/<%= pkg.name %>-cust.min.js': ['<%= concat.cust.dest %>']
          }
        }
    },

    eslint: {
      target: [
        // Add list of files to lint here
        './public/client/*.js',
        './server.js',
        './server-config.js',
        './app/**/*.js',
        './test/*.js'
      ]
    },

    cssmin: {
      target: {
        files: {
          './public/style-min.css': ['./public/style.css']
        }
      }
    },

    watch: {
      scripts: {
        files: [
          'public/client/**/*.js',
          'public/lib/**/*.js',
        ],
        tasks: [
          'concat',
          'uglify'
        ]
      },
      css: {
        files: 'public/*.css',
        tasks: ['cssmin']
      }
    },

    shell: {
      prodServer: {
         command: 'git push live master'
      }
    },

    gitpush: {
      target: {
        options: {
          remote: 'live',
          branch: 'master'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-git');

  grunt.registerTask('server-dev', function (target) {
    // Running nodejs in a different process and displaying output on the main console
    var nodemon = grunt.util.spawn({
      cmd: 'grunt',
      grunt: true,
      args: 'nodemon'
    });
    nodemon.stdout.pipe(process.stdout);
    nodemon.stderr.pipe(process.stderr);

    grunt.task.run([ 'watch' ]);
  });

  ////////////////////////////////////////////////////
  // Main grunt tasks
  ////////////////////////////////////////////////////

  grunt.registerTask('test', [
    'mochaTest'
  ]);

  grunt.registerTask('build', [
    'concat',
    'uglify',
    'cssmin'
  ]);

  grunt.registerTask('upload', function(n) {
    if (grunt.option('prod')) {
      // add your production server task here
    } else {
      grunt.task.run([ 'server-dev' ]);
    }
  });

  grunt.registerTask('deploy', [
    // add your deploy tasks here
    'eslint',
    'build',
    'test',
    'nodemon' // change to 'server-dev' or 'upload'?
  ]);


};
