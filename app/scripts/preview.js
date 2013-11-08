'use strict';

angular.module('bricksApp', ['ngRoute', 'bricksApp.storage'])
  .config(function ($routeProvider) {
    window.bricksApp.pages.forEach(function (page) {
      $routeProvider.when(page.url, {
        controller: 'MainCtrl',
        template: page.template,
        resolve: {
          storage: ['$window', 'Storage', function ($window, Storage) {
            return Storage.init($window.bricksApp);
          }]
        }
      });
    });

    $routeProvider.otherwise({
      template: 'Nothing Found.'
    });
  })

  .run(function ($window) {
    angular.element('#bricksAppStyle').html($window.bricksApp.css);
  })

  .controller('MainCtrl', function ($location, $parse, $routeParams, $scope, $window, storage) {
    var routeKeys = Object.keys($routeParams);

    $scope.data = storage.all();

    if (routeKeys.length > 0) {
      routeKeys.forEach(function (table) {
        $scope[table] = storage.get(table, $routeParams[table]) || {};
      });
    }

    $scope.add = function (table, instance, e) {
      if (e) {
        e.preventDefault();
      }

      storage.add(table, angular.copy(instance));
      $scope[table] = {};
    };

    $scope.update = function (table, instance, e) {
      if (e) {
        e.preventDefault();
      }

      storage.update(table, instance);
    };

    $scope.remove = function (table, instance, e) {
      if (e) {
        e.preventDefault();
      }

      storage.remove(table, instance);
    };

    $scope.visit = function (url, e) {
      if (e) {
        e.preventDefault();
      }

      $location.path(url);
    };

    eval($window.bricksApp.js);
  });
