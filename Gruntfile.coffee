module.exports = (grunt)->

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch: {
      coffee: {
        files: ['src/javascripts/**/*.coffee'],
        tasks: ['coffee']
      },
      javascript: {
        files: ["app/javascripts/*.js", "specs/*_spec.js"],
        tasks: ['test']
      },
      less: {
        files: ["src/css/*.less"],
        tasks: ['less']
      }
    },
    coffee: {
      compile: {
        files: {
          'app/javascripts/app.js': ['src/javascripts/components/*.coffee','src/javascripts/*.coffee']
        }
      }
    },
    jasmine: {
      src: 'app/javascripts/*.js',
      options: {
        specs: 'spec/*_spec.js',
        helpers: 'spec/*_helper.js',
        vendor: [
          "http://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"
        ]
      }
    },
    less: {
      development: {
        files: {
          "app/stylesheets/app.css": ["node_modules/normalize.css/normalize.css","src/css/app.less"]
        }
      }
    }
  })

  grunt.loadNpmTasks('grunt-contrib-coffee')
  grunt.loadNpmTasks('grunt-contrib-jasmine')
  grunt.loadNpmTasks('grunt-contrib-watch')
  grunt.loadNpmTasks('grunt-contrib-less');

  grunt.registerTask('test', ['jasmine'])
  grunt.registerTask('default', ['watch'])
