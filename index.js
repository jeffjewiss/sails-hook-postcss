var path = require('path');
var fs = require('fs');
var glob = require('glob');
var postcss = require('postcss');
var mkdirp = require('mkdirp');
var watch = require('watch');

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
        cssSourcePath: path.resolve(sails.config.appPath, 'assets', 'styles'),
        cssDestPath: path.resolve(sails.config.paths.public, 'styles'),
        initialProcess: true
      }
    },

    initialize: function(done) {
      var self = this;
      var processor = postcss();
      var plugins = sails.config[this.configKey].plugins;

      if (!plugins || 0 >= plugins.length) {
        sails.log.error('Please configure at least 1 plugin for Postcss to use.');
        return done();
      }

      plugins.forEach(function(plugin) {
        processor.use(plugin);
      });

      if (sails.config[this.configKey].initialProcess) {
        this.process();
      }

      sails.on('lifted', function() {
        watch.watchTree(self.config[self.configKey].cssSourcePath, function () {
          self.process();
        });
      });

      return done();
    },

    process: function() {
      var cssSourcePath = this.config[this.configKey].cssSourcePath;
      var cssDestPath = this.config[this.configKey].cssDestPath;

      sails.log.verbose('Compiling CSS with Postcss.');

      glob('**/*.css', {
        nonull: false,
        cwd: cssSourcePath
      }, function(err, files) {
        if (err) return sails.log.error(err);

        mkdirp(cssDestPath, function(err) {
          if (err) return sails.log.error(err);

          files.forEach(function(file) {
            processCssFile(cssSourcePath + '/' + file, cssDestPath + '/' + file);
          });
        });
      });
    }
  };
};

function processCssFile(from, to) {
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
}
