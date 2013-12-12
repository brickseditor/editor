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

  function getComponentsFiles(configs) {
    var files = [];

    Object.keys(configs).forEach(function (pluginDir) {
      var file = path.join(
        pluginsDir,
        pluginDir,
        configs[pluginDir].components,
        '*.html'
      );
      files.push(file);
    });

    return files;
  }

  var configs = getPluginsConfigs(pluginsDir);

  return {
    path: pluginsDir,
    components: getComponentsFiles(configs)
  };
};
