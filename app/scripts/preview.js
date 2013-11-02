'use strict';

angular.module('bricksApp', ['ngRoute'])
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

    Storage.get = function (tableName, id) {
      var row;

      if (data[tableName]) {
        data[tableName].some(function (storedRow, i) {
          if (storedRow.id === id) {
            row = storedRow;
            return true;
          }
        });
      }

      return row;
    };

    Storage.create = function (tableName, row) {
      var date = (new Date()).toISOString().split('.')[0].replace('T', ' ');

      row.id = uuid();
      row.created_at = date;
      row.updated_at = date;

      data[tableName] = data[tableName] || [];
      data[tableName].push(row);
      saveTable(tableName);
    };

    Storage.update = function (tableName, row) {
      if (data[tableName]) {
        data[tableName].some(function (storedRow, i) {
          if (storedRow.id === row.id) {
            data[tableName][i] = row;
            return true;
          }
        });
        saveTable(tableName);
      }
    };

    Storage.delete = function (tableName, row) {
      if (data[tableName]) {
        data[tableName].some(function (storedRow, i) {
          if (storedRow.id === row.id) {
            data[tableName].splice(i, 1);
            return true;
          }
        });
        saveTable(tableName);
      }
    };

    return Storage;
  })

  .controller('MainCtrl', function ($routeParams, $scope, Storage) {
    var routeKeys = Object.keys($routeParams);

    $scope.data = Storage.all();

    if (routeKeys.length > 0) {
      routeKeys.forEach(function (table) {
        $scope[table] = Storage.get(table, $routeParams[table]) || {};
      });
    }

    $scope.save = function (table, instance) {
      if (instance.id) {
        Storage.update(table, instance);
      } else {
        Storage.create(table, angular.copy(instance));
      }
      $scope[table] = {};
      $scope.submitted = true;
    };

    $scope.delete = function (table, instance) {
      Storage.delete(table, instance);
    };
  });
