'use strict';

// Apps management. Gets from localStorage and memoize.
angular.module('bricksApp.apps', [])

  .service('apps', function ($window) {
    var keyAll = 'bricks_apps';
    var keyCurrent = 'bricks_current';
    var apps = $window.localStorage.getItem(keyAll);
    var current = $window.localStorage.getItem(keyCurrent);

    apps = apps ? angular.fromJson(apps) : [];

    return {
      all: function () {
        return angular.copy(apps);
      },

      // Sets the current app id if app parameter was supplied.
      // Gets the current app object if no parameter supplied.
      // Returns the first app If none is set as current.
      current: function (app) {
        if (app) {
          current = app.id;
          $window.localStorage.setItem(keyCurrent, current);
        } else {
          var object;
          current = $window.localStorage.getItem(keyCurrent);
          apps.forEach(function (a) {
            if (a.id === current) {
              object = a;
            }
          });
          return object ? object : apps[0];
        }
      },

      // Adds an app from the supplied parameters. Generates a UUID for
      // the app id.
      add: function (app) {
        app.id = app.id || uuid();
        app.css = app.css || '';
        app.js = app.js || '';
        app.pages = app.pages || [{url: '/', template: ''}];
        app.storage = app.storage || 'local';
        app.tables = app.tables || [];

        apps.push(angular.copy(app));
        $window.localStorage.setItem(keyAll, angular.toJson(apps));
      },

      update: function (app) {
        apps.forEach(function (a, i) {
          if (a.id === app.id) {
            apps[i] = angular.copy(app);
            $window.localStorage.setItem(keyAll, angular.toJson(apps));
          }
        });
      },

      // Deletes the app which id was sent as parameter.
      remove: function (id) {
        apps.forEach(function (a, i) {
          if (a.id === id) {
            apps.splice(i, 1);
            $window.localStorage.setItem(keyAll, angular.toJson(apps));
          }
        });
      }
    };
  })

  .directive('apps', function ($document, apps) {
    return {
      replace: true,
      restrict: 'E',
      templateUrl: 'scripts/apps/apps.html',
      link: function (scope) {
        scope.showAppsMenu = false;
        scope.showAppsModal = false;
        scope.app = {};

        // Watches for apps service for changes by others controllers and
        // updates the apps list and current app.
        scope.$watch(function () {
          return apps.all();
        }, function () {
          scope.apps = apps.all();
          scope.currentApp = apps.current();
        }, true);

        // Add an app and set it as the current one.
        scope.addApp = function () {
          var form = angular.element($document[0].newAppForm);

          if (form.controller('form').$valid) {
            scope.apps.push(scope.app);
            apps.add(scope.app);

            apps.current(scope.app);
            scope.currentApp = scope.app;

            scope.app = {};
            scope.showAppsModal = false;
          }
        };

        // Set an app as the current one.
        scope.selectApp = function (app) {
          apps.current(app);
          scope.currentApp = app;
          scope.showAppsMenu = false;
        };

        scope.toggleAppsMenu = function () {
          scope.showAppsMenu = !scope.showAppsMenu;
        };

        // In addition to what the function name says, it hides the apps
        // menu.
        scope.toggleAppsModal = function () {
          scope.showAppsModal = !scope.showAppsModal;
          scope.showAppsMenu = false;
        };

        scope.hideAppsModal = function () {
          scope.showAppsModal = false;
        };
      }
    };
  })

  .directive('exportApp', function ($http) {
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
          files.html = html;
          return loadScripts();
        })
        .then(function (scripts) {
          files.scripts = scripts;
          return files;
        });
    })();

    var createZip = function (name, files) {
      var zip = new JSZip();

      zip.folder(name)
        .file('index.html', files.html)
        .folder('scripts')
          .file('build.js', files.scripts);

      return zip;
    };

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
      link: function (scope, element) {
        scope.exportZip = function (zip, filename) {
          saveAs(zip.generate({type: 'blob'}), filename);
        };

        element.on('click', function (e) {
          e.preventDefault();

          loadFiles.then(function (files) {
            var inlineScript = '<script>window.bricksApp = JSON.parse(\'' +
              escapeJson(angular.toJson(scope.currentApp)) +
              '\');</script>';

            files = angular.copy(files);
            files.html = files.html.replace(
              '</head>',
              '\n' + inlineScript + '\n</head>'
            );

            var zip = createZip(scope.currentApp.name, files);

            scope.exportZip(zip, scope.currentApp.name + '.zip');
          });
        });
      }
    };
  });
