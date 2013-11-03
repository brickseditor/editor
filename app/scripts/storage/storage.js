'use strict';

angular.module('bricksApp.storage', ['firebase'])

  .factory('localData', function ($rootScope, $window) {
    var scope = $rootScope.$new();
    var prefix;

    var getTable = function (tableName) {
      var dataString = $window.localStorage.getItem(prefix + tableName);
      return dataString ? angular.fromJson(dataString) : [];
    };

    var saveTable = function (tableName) {
      var dataString = scope.data[tableName] ?
        angular.toJson(scope.data[tableName]) :
        '';
      $window.localStorage.setItem(prefix + tableName, dataString);
    };

    scope.data = {};

    return function (app) {
      prefix = 'bricks_app_' + app.id + '_';

      app.tables.forEach(function (table) {
        scope.data[table.name] = getTable(table.name);

        scope.$watch('data.' + table.name, function () {
          saveTable(table.name);
        }, true);
      });

      return scope.data;
    }
  })

  .factory('firebaseData', function ($rootScope, angularFire) {
    return function (app) {
      var scope = $rootScope.$new();

      scope.data = {};

      app.tables.forEach (function (table) {
        scope.data[table.name] = [];

        angularFire(new Firebase(
          'https://' + app.settings.firebase + '.firebaseio.com/' + table.name
        ), scope, 'data.' + table.name);
      });

      return scope.data;
    }
  })

  .factory('Storage', function (firebaseData, localData) {
    var data;

    var Storage = function (app) {
      if (app.storage === 'firebase') {
        data = firebaseData(app);
      } else {
        data = localData(app);
      }
    };

    Storage.prototype.all = function (tableName) {
      if (tableName) {
        return data[tableName];
      } else {
        return data;
      }
    };

    Storage.prototype.get = function (tableName, id) {
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

    Storage.prototype.add = function (tableName, row) {
      var date = (new Date()).toISOString().split('.')[0].replace('T', ' ');

      row.id = uuid();
      row.created_at = date;
      row.updated_at = date;

      data[tableName] = data[tableName] || [];
      data[tableName].push(row);
    };

    Storage.prototype.update = function (tableName, row) {
      if (data[tableName]) {
        data[tableName].some(function (storedRow, i) {
          if (storedRow.id === row.id) {
            data[tableName][i] = row;
            return true;
          }
        });
      }
    };

    Storage.prototype.remove = function (tableName, row) {
      if (data[tableName]) {
        data[tableName].some(function (storedRow, i) {
          if (storedRow.id === row.id) {
            data[tableName].splice(i, 1);
            return true;
          }
        });
      }
    };

    Storage.prototype.clear = function (tableName) {
      data[tableName].length = 0;
    };

    return Storage;
  });
