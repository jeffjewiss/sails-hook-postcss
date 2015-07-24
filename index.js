var path = require('path');
var fs = require('fs');
var glob = require('glob');
var postcss = require('postcss');
var mkdirp = require('mkdirp');
var watch = require('watch');
var objectAssign = require('object-assign');

/**
 * sails-hook-postcss
 *
 * Process your CSS with Postcss.
 *
 * @param {App} sails
 * @return {Object}
 * @hook
 */

module.exports = function(sails) {
  return {
    defaults: {
      __configKey__: {
        initialCompile: true
      }
    },

    configure: function() {
      objectAssign(sails.config[this.configKey], {
        cssSourcePath: path.resolve(sails.config.appPath, 'assets', 'styles'),
        cssDestPath: path.resolve(sails.config.paths.public, 'styles'),
      });
    },

    initialize: function(done) {
      var plugins = sails.config[this.configKey].plugins;
      var processor = this.processor = postcss();
      var cssSourcePath = sails.config[this.configKey].cssSourcePath;
      var compile = this.compile;

      if (!plugins || 0 >= plugins.length) {
        sails.log.error('Please configure at least 1 plugin for Postcss to use.');
        return done();
      }

      plugins.forEach(function(plugin) {
        processor.use(plugin);
      });

      if (sails.config[this.configKey].initialCompile) {
        this.compile();
      }

      if ("production" !== process.env.NODE_ENV) {
        sails.on('lifted', function() {
          sails.log.verbose('Postcss watching CSS files in: "' + cssSourcePath + '".');
          watch.watchTree(cssSourcePath, function () {
            compile();
          });
        });
      }

      return done();
    },

    compile: function() {
      var cssSourcePath = sails.config[this.configKey].cssSourcePath;
      var cssDestPath = sails.config[this.configKey].cssDestPath;
      var processor = this.processor;

      sails.log.verbose('Compiling CSS with Postcss.');

      glob('**/*.css', {
        nonull: false,
        cwd: cssSourcePath
      }, function(err, files) {
        if (err) return sails.log.error(err);

        mkdirp(cssDestPath, function(err) {
          if (err) return sails.log.error(err);

          files.forEach(function(file) {
            var from = path.resolve(cssSourcePath, file);
            var to = path.resolve(cssDestPath, file);

            fs.readFile(from, { encoding: 'utf8' }, function(err, data) {
              if (err) throw err;

              processor
                .process(data, { from: from, to: to })
                .then(function (result) {
                  fs.writeFileSync(to, result.css);
                })
                .catch(function (error) {
                  sails.log.error(error);
                });

            });
          });
        });
      });
    }
  };
};
