'use strict';

angular.module('bricksApp', ['ngRoute', 'bricksApp.storage'])
  .config(function ($routeProvider) {
    window.bricksApp.pages.forEach(function (page) {
      $routeProvider.when(page.url, {
        controller: 'MainCtrl',
        template: page.template
      });
    });

    $routeProvider.otherwise({
      template: 'Nothing Found.'
    });
  })

  .run(function ($window) {
    angular.element('#bricksAppStyle').html($window.bricksApp.css);
  })

  .controller('MainCtrl', function ($location, $parse, $routeParams, $scope, $window, Storage) {
    var routeKeys = Object.keys($routeParams);
    var storage = new Storage($window.bricksApp);

    $scope.data = storage.all();

    if (routeKeys.length > 0) {
      routeKeys.forEach(function (table) {
        $scope[table] = storage.get(table, $routeParams[table]) || {};
      });
    }

    $scope.save = function (table, instance) {
      if (instance.id) {
        storage.update(table, instance);
      } else {
        storage.add(table, angular.copy(instance));
      }
      $scope[table] = {};
      $scope.submitted = true;
    };

    $scope.delete = function (table, instance) {
      storage.remove(table, instance);
    };

    $scope.visit = function (url) {
      $location.path(url);
    };

    eval($window.bricksApp.js);
  });
