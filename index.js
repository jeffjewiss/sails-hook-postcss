var path = require('path')
var fs = require('fs')
var glob = require('glob')
var postcss = require('postcss')
var mkdirp = require('mkdirp')
var watch = require('watch')
var objectAssign = require('object-assign')
var async = require('async')

/**
 * sails-hook-postcss
 *
 * Process your CSS with Postcss.
 *
 * @param {App} sails
 * @return {Object}
 * @hook
 */

module.exports = function (sails) {
  return {
    defaults: {
      __configKey__: {
        initialCompile: true
      }
    },

    configure: function () {
      sails.emit('hook:postcss:configuring')

      objectAssign({
        enabled: true,
        cssSourcePath: path.resolve(sails.config.appPath, 'assets', 'styles'),
        cssDestPath: path.resolve(sails.config.paths.public, 'styles')
      }, sails.config[this.configKey])

      sails.emit('hook:postcss:configured')
    },

    initialize: function (done) {
      var enabled = sails.config[this.configKey].enabled
      var plugins = sails.config[this.configKey].plugins
      var processor = this.processor = postcss()
      var cssSourcePath = sails.config[this.configKey].cssSourcePath
      var compile = this.compile

      if (!enabled) {
        return done()
      }

      sails.emit('hook:postcss:initializing')

      if (!plugins || plugins.length <= 0) {
        sails.log.error('Please configure at least 1 plugin for Postcss to use.')
        return done()
      }

      plugins.forEach(function (plugin) {
        processor.use(plugin)
      })

      sails.emit('hook:postcss:initialized')

      if (sails.config[this.configKey].initialCompile) {
        this.compile()
      }

      if (process.env.NODE_ENV !== 'production') {
        sails.on('lifted', function () {
          sails.log.verbose('Postcss watching CSS files in: "' + cssSourcePath + '".')
          sails.emit('hook:postcss:watching')
          watch.watchTree(cssSourcePath, function () {
            compile()
          })
        })
      }

      return done()
    },

    compile: function () {
      var cssSourcePath = sails.config[this.configKey].cssSourcePath
      var cssDestPath = sails.config[this.configKey].cssDestPath
      var processor = this.processor

      sails.log.verbose('Compiling CSS with Postcss.')
      sails.emit('hook:postcss:compiling')

      async.series([
        function (done) {
          glob('**/*.css', {
            nonull: false,
            cwd: cssSourcePath
          }, function (err, files) {
            if (err) return done(err)

            return done(null, files)
          })
        },

        function (done) {
          mkdirp(cssDestPath, function (err) {
            if (err) {
              return done(err)
            }

            return done()
          })
        }
      ],

      function (err, results) {
        if (err) {
          return sails.log.error(err)
        }

        var files = results[0]

        async.each(files, function (file) {
          var from = path.resolve(cssSourcePath, file)
          var to = path.resolve(cssDestPath, file)

          fs.readFile(from, { encoding: 'utf8' }, function (err, data) {
            if (err) {
              throw err
            }

            processor
              .process(data, { from: from, to: to })
              .then(function (result) {
                fs.writeFileSync(to, result.css)
              })
              .catch(function (err) {
                sails.log.error(err)
              })
          }, function (err) {
            if (err) {
              sails.log.error(err)
            }

            sails.emit('hook:postcss:compiled')
          })
        })
      })
    }
  }
}
