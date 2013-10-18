'use strict';

angular.module('bricksApp')
  .controller('NavbarCtrl', function ($location, $route, $scope, apps) {
    $scope.show = $location.path() !== '/start';
    $scope.showAppsMenu = false;
    $scope.showAppsModal = false;

    // Watches for apps service for changes by others controllers and
    // updates the apps list and current app.
    $scope.appsService = apps;
    $scope.$watch('appsService.all()', function (newVal, oldVal) {
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
    $scope.addApp = function (app) {
      $scope.apps.push(app);
      apps.add(app);
      apps.current(app);
      $scope.currentApp = app;
      $scope.app = {};
      $scope.showAppsModal = false;
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
  });
