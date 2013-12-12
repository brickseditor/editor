'use strict';

var fs = require('fs');
var path = require('path');

module.exports = function (grunt, pluginsDir) {

  function getPluginsConfigs() {
    var fsEntries = fs.readdirSync(pluginsDir);
    var configs = {};

    fsEntries.forEach(function (entry) {
      var config = path.join(pluginsDir, entry, 'bricks.json');

      if (grunt.file.isFile(config)) {
        configs[entry] = grunt.file.readJSON(config);
      }
    });

    return configs;
  }

  function getFiles(configs) {
    var files = {components: [], styles: []};

    Object.keys(configs).forEach(function (pluginDir) {
      var base = pluginsDir + '/' + pluginDir + '/';

      if (configs[pluginDir].components) {
        var components = [].concat(configs[pluginDir].components);

        components.forEach(function (component) {
          files.components.push(base + component);
        });
      }

      if (configs[pluginDir].styles) {
        var styles = [].concat(configs[pluginDir].styles);

        styles.forEach(function (style) {
          files.styles.push(base + style);
        });
      }
    });

    return files;
  }

  var files = getFiles(getPluginsConfigs(pluginsDir));

  return {
    path: pluginsDir,
    components: files.components,
    styles: files.styles
  };
};
