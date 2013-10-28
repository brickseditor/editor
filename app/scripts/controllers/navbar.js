'use strict';

angular.module('bricksApp')
  .controller('NavbarCtrl', function ($http, $location, $route, $scope, apps) {
    var escape = function (string) {
      var escapes = {
        "'":      "'",
        '\\':     '\\',
        '\r':     'r',
        '\n':     'n',
        '\t':     't',
        '\u2028': 'u2028',
        '\u2029': 'u2029'
      };
      var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

      return string.replace(escaper, function (match) {
        return '\\' + escapes[match];
      });
    };

    $scope.show = $location.path() !== '/start';
    $scope.showAppsMenu = false;
    $scope.showAppsModal = false;
    $scope.app = {};

    // Watches for apps service for changes by others controllers and
    // updates the apps list and current app.
    $scope.appsService = apps;
    $scope.$watch('appsService.all()', function () {
      $scope.apps = apps.all();
      $scope.currentApp = apps.current();
    }, true);

    // Watch for location path change to hide the navbar on the start
    // screen.
    $scope.location = $location;
    $scope.$watch('location.path()', function (newVal, oldVal) {
      if (newVal !== oldVal) {
        $scope.show = newVal !== '/start';
      }
    });

    // Add an app and set it as the current one.
    $scope.addApp = function () {
      var form = angular.element(document.newAppForm);

      if (form.controller('form').$valid) {
        $scope.apps.push($scope.app);
        apps.add($scope.app);

        apps.current($scope.app);
        $scope.currentApp = $scope.app;

        $scope.app = {};
        $scope.showAppsModal = false;
      }
    };

    // Set an app as the current one.
    $scope.selectApp = function (app) {
      apps.current(app);
      $scope.currentApp = app;
      $scope.showAppsMenu = false;
    };

    $scope.toggleAppsMenu = function () {
      $scope.showAppsMenu = !$scope.showAppsMenu;
    };

    // In addition to what the function name says, it hides the apps
    // menu.
    $scope.toggleAppsModal = function () {
      $scope.showAppsModal = !$scope.showAppsModal;
      $scope.showAppsMenu = false;
    };

    $scope.hideAppsModal = function () {
      $scope.showAppsModal = false;
    };

    $scope.download = function () {
      var zip = new JSZip();
      var root = zip.folder($scope.currentApp.name);

      $http.get('views/build.html', {cache: true})
        .then(function (response) {
          var app = '<script>window.bricksApp = JSON.parse(\'' +
            escape(JSON.stringify($scope.currentApp)) +
            '\');</script>';
          var html = response.data.replace('</head>', app + '\n</head>');
          root.file('index.html', html);

          return $http.get('bower_components/node-uuid/uuid.js', {
            cache: true
          });
        })

        .then(function (response) {
          $scope.scripts = response.data;

          return $http.get('scripts/preview.js', {
            cache: true
          });
        })

        .then(function (response) {
          root.folder('scripts')
            .file('build.js', $scope.scripts + response.data);

          saveAs(zip.generate({type: 'blob'}), $scope.currentApp.name + '.zip');
        });
    };
  });
