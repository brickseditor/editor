'use strict';

angular.module('bricksApp.storage', ['firebase'])

  .factory('localData', function ($q, $window) {
    var data = {};
    var prefix;

    var getTable = function (tableName) {
      var dataString = $window.localStorage.getItem(prefix + tableName);
      return dataString ? angular.fromJson(dataString) : [];
    };

    var saveTable = function (tableName) {
      var dataString = data[tableName] ?
        angular.toJson(data[tableName]) :
        '';
      $window.localStorage.setItem(prefix + tableName, dataString);
    };

    return function (app, scope) {
      var deferred = $q.defer();

      data = scope.data;
      prefix = 'bricks_app_' + app.id + '_';

      app.tables.forEach(function (table) {
        scope.data[table.name] = getTable(table.name);

        scope.$watch('data.' + table.name, function () {
          saveTable(table.name);
        }, true);
      });

      deferred.resolve();

      return deferred.promise;
    }
  })

  .factory('firebaseData', function ($rootScope, angularFire) {
    return function (app, scope) {
      return angularFire(new Firebase(
        'https://' + app.settings.firebase + '.firebaseio.com'
      ), scope, 'data');
    }
  })

  .service('Storage', function ($q, $rootScope, firebaseData, localData) {
    var Storage = {};
    var data;

    Storage.init = function (app) {
      var deferred = $q.defer();
      var scope = $rootScope.$new();
      var dataPromise;

      scope.data = {};

      if (app.storage === 'firebase') {
        dataPromise = firebaseData(app, scope);
      } else {
        dataPromise = localData(app, scope);
      }

      dataPromise.then(function () {
        deferred.resolve(Storage);
        data = scope.data;
      });

      return deferred.promise;
    };

    Storage.all = function (tableName) {
      if (tableName) {
        return data[tableName];
      } else {
        return data;
      }
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

    Storage.add = function (tableName, row) {
      var date = (new Date()).toISOString().split('.')[0].replace('T', ' ');

      row.id = uuid();
      row.created_at = date;
      row.updated_at = date;

      data[tableName] = data[tableName] || [];
      data[tableName].push(row);
    };

    Storage.update = function (tableName, row) {
      if (data[tableName]) {
        data[tableName].some(function (storedRow, i) {
          if (storedRow.id === row.id) {
            data[tableName][i] = row;
            return true;
          }
        });
      }
    };

    Storage.remove = function (tableName, row) {
      if (data[tableName]) {
        data[tableName].some(function (storedRow, i) {
          if (storedRow.id === row.id) {
            data[tableName].splice(i, 1);
            return true;
          }
        });
      }
    };

    Storage.clear = function (tableName) {
      data[tableName].length = 0;
    };

    return Storage;
  });
