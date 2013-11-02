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

  .run(function ($window) {
    angular.element('#bricksAppStyle').html($window.bricksApp.css);
  })

  .factory('Storage', function ($window) {
    var Storage = {};
    var app = $window.bricksApp;
    var data = {};
    var prefix = 'bricks_app_' + app.id + '_';

    var getTable = function (tableName) {
      var dataString = $window.localStorage.getItem(prefix + tableName);
      return dataString ? angular.fromJson(dataString) : [];
    };

    var saveTable = function (tableName) {
      var dataString = data[tableName] ? angular.toJson(data[tableName]) : '';
      $window.localStorage.setItem(prefix + tableName, dataString);
    };

    app.tables.forEach(function (table) {
      data[table.name] = getTable(table.name);
    });

    Storage.all = function () {
      return data;
    };

    Storage.add = function (tableName, row) {
      var date = (new Date()).toISOString().split('.')[0].replace('T', ' ');

      row.id = uuid();
      row.created_at = date;
      row.updated_at = date;

      data[tableName] = data[tableName] || [];
      data[tableName].push(row);
      saveTable(tableName);
    };

    Storage.delete = function (tableName, row) {
      if (data[tableName]) {
        data[tableName].some(function (storedRow, i) {
          if (storedRow.id === row.id) {
            data[tableName].splice(i, 1);
          }
        });
        saveTable(tableName);
      }
    };

    return Storage;
  })

  .controller('MainCtrl', function ($scope, Storage) {
    $scope.data = Storage.all();

    $scope.save = function (table, instance) {
      var row = angular.copy(instance);
      Storage.add(table, row);
      $scope[table] = {};
      $scope.submitted = true;
    };

    $scope.delete = function (table, instance) {
      Storage.delete(table, instance);
    };
  });
