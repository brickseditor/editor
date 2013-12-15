'use strict';

angular.module('bricksApp.apps')
  .directive('exportApp', function ($http, $q, zipApp) {
    var urls = {
      'index.html': $http.get('build.html', {cache: true}),
      'styles/build.css': $http.get('plugins/styles.css', {cache: true}),
      'scripts/build.js': $http.get('scripts/build.js', {cache: true})
    };

    var files = $q.all(urls)
      .then(function (responses) {
        var files = {};

        Object.keys(responses).forEach(function (file) {
          files[file] = responses[file].data;
        });
        return files;
      });

    var escapeJson = function (string) {
      var escapes = {
        '\'':     '\'',
        '\\':     '\\',
        '\r':     'r',
        '\n':     'n',
        '\t':     't',
        '\u2028': 'u2028',
        '\u2029': 'u2029'
      };
      var escaper = /\\|\'|\r|\n|\t|\u2028|\u2029/g;

      return string.replace(escaper, function (match) {
        return '\\' + escapes[match];
      });
    };

    return {
      restrict: 'A',
      scope: {
        app: '&exportApp',
      },
      link: function (scope, element) {
        scope.exportApp = function () {
          return files.then(function (files) {
            var inlineScript = '<script>window.bricksApp = JSON.parse(\'' +
              escapeJson(angular.toJson(scope.app())) +
              '\');</script>';

            files = angular.copy(files);
            files['index.html'] = files['index.html'].replace(
              '</head>',
              '\n' + inlineScript + '\n</head>'
            );

            zipApp.save(scope.app().name, files);
          });
        };

        element.on('click', function (e) {
          e.preventDefault();
          scope.exportApp();
        });
      }
    };
  });

