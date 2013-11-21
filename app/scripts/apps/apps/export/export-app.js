'use strict';

angular.module('bricksApp.apps')
  .directive('exportApp', function ($http, zipApp) {
    var loadHtml = function () {
      return $http.get('build.html', {cache: true})
        .then(function (response) {
          return response.data;
        });
    };

    var loadScripts = function () {
      return $http.get('scripts/build.js', {cache: true})
        .then(function (response) {
          return response.data;
        });
    };

    var loadFiles = (function () {
      var files = {};

      return loadHtml()
        .then(function (html) {
          files['index.html'] = html;
          return loadScripts();
        })
        .then(function (scripts) {
          files['scripts/build.js'] = scripts;
          return files;
        });
    })();

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
          return loadFiles.then(function (files) {
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

