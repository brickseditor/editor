'use strict';

angular.module('bricksApp', ['ngRoute'])
  .config(function ($routeProvider) {
    var template = function (route) {
      var app = window.bricksApp;
      var notFound = 'Nothing Found.';
      var path = route.route ? '/' + route.route : '/';
      var template;

      if (app.pages.length === 0) {
        return notFound;
      }

      app.pages.some(function (p) {
        if (p.url === path) {
          template = p.template;
          return true;
        }
      });

      return template ? template : notFound;
    };

    var params = {
      template: template,
      controller: 'MainCtrl'
    };

    $routeProvider
      .when('/', params)
      .when('/:route*', params);
  })

  .factory('Storage', function ($window) {
    var Storage = {};
    var app = $window.bricksApp;
    var prefix = 'bricks_app_' + app.id + '_';

    Storage.all = function () {
      var data = {};
      app.tables.forEach(function (table) {
        var tableData = $window.localStorage.getItem(prefix + table.name);
        data[table.name] = tableData ? JSON.parse(tableData) : [];
      });
      return data;
    };

    return Storage;
  })

  .controller('MainCtrl', function ($scope, Storage) {
    $scope.data = Storage.all();

    $scope.save = function (table, instance) {
      var row = angular.copy(instance);
      var date = (new Date()).toISOString().split('.')[0].replace('T', ' ');

      row.id = uuid();
      row.created_at = date;
      row.updated_at = date;

      $scope.data[table] = $scope.data[table] || [];
      $scope.data[table].push(row);
      $scope[table] = {};
      $scope.submitted = true;
    };

    $scope.delete = function (table, instance) {
      angular.forEach($scope.data[table], function (row, i) {
        if (row.id === instance.id) {
          $scope.data[table].splice(i, 1);
        }
      });
    };
  });
