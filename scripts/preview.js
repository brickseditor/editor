'use strict';

angular.module('bricksApp', ['ngRoute', 'bricksApp.storage'])
  .config(function ($routeProvider) {
    window.bricksApp.pages.forEach(function (page) {
      $routeProvider.when(page.url, {
        controller: 'MainCtrl',
        template: page.template,
        resolve: {
          Storage: ['$window', 'storage', function ($window, storage) {
            return storage($window.bricksApp);
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

  .controller('MainCtrl', function ($location, $parse, $routeParams, $scope, $window, Storage) {
    var routeKeys = Object.keys($routeParams);
    var data = {};

    $window.bricksApp.tables.forEach(function (table) {
      data[table.name] = Storage.all(table.name);
    });

    $scope.data = data;

    if (routeKeys.length > 0) {
      routeKeys.forEach(function (table) {
        $scope[table] = Storage.get(table, $routeParams[table]) || {};
      });
    }

    $scope.add = function (table, instance) {
      Storage.add(table, angular.copy(instance), function () {
        $scope[table] = {};
        $scope.$broadcast('database-row-added');
      });
    };

    $scope.update = function (table, instance) {
      Storage.update(table, instance, function () {
        $scope.$broadcast('database-row-updated');
      });
    };

    $scope.remove = function (table, instance) {
      Storage.remove(table, instance, function () {
        $scope.$broadcast('database-row-removed');
      });
    };

    $scope.visit = function (url, table) {
      var path;

      if (table) {
        path = url.replace(/:(\w+)/, table.id);
      } else {
        path = url;
      }

      $location.path(path);
    };

    eval($window.bricksApp.js); // jshint ignore:line
  });

angular.forEach(
  {
    'database-row-added': 'eventDatabaseRowAdded',
    'database-row-updated': 'eventDatabaseRowUpdated',
    'database-row-removed': 'eventDatabaseRowRemoved'
  },
  function (directiveName, eventName) {
    angular.module('bricksApp').directive(directiveName, function ($parse) {
      return {
        compile: function ($element, attr) {
          var fn = $parse(attr[directiveName]);
          return function (scope) {
            scope.$on(eventName, function (e) {
              fn(scope, {$event: e});
            });
          };
        }
      };
    });
  }
);
