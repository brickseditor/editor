'use strict';

angular.module('bricksApp.storage', ['firebase'])

  .service('localStorage', function ($window) {
    var data = {};
    var indexes = {};
    var prefix;

    var getTable = function (tableName) {
      var dataString = $window.localStorage.getItem(prefix + tableName);
      return dataString ? angular.fromJson(dataString) : [];
    };

    var saveTable = function (tableName, success, error) {
      var dataString = data[tableName] ?
        angular.toJson(data[tableName]) :
        '';
      var saved = false;

      try {
        $window.localStorage.setItem(prefix + tableName, dataString);
        saved = true;
      } catch (e) {
        if (error) {
          error();
        }
      } finally {
        if (saved && success) {
          success();
        }
      }
    };

    var getIndex = function (tableName, id) {
      var index;

      if (indexes[tableName]) {
        index = indexes[tableName][id];
      } else {
        index = -1;
      }

      return index;
    };

    var updateIndexes = function (tableName, start) {
      var start = start || 0;

      indexes[tableName] = indexes[tableName] || [];

      for (var i = start; i < data[tableName].length; i++) {
        var id = data[tableName][i].id;
        indexes[tableName][id] = i;
      }
    };

    var load = function (tableName, success) {
      if (!data[tableName]) {
        data[tableName] = getTable(tableName);
        updateIndexes(tableName);
      }

      if (success) {
        success();
      }

      return data[tableName];
    };

    var Storage = function (app) {
      prefix = 'bricks_app_' + app.id + '_';

      return Storage;
    };

    Storage.all = function (tableName, success, error) {
      return load(tableName);
    };

    Storage.get = function (tableName, id, success, error) {
      load(tableName);

      var index = getIndex(tableName, id);

      if (index > -1) {
        if (success) {
          success();
        }

        return data[tableName][index];
      }

      if (error) {
        error();
      }
    };

    Storage.add = function (tableName, row, success, error) {
      load(tableName);

      var date = (new Date()).toISOString().split('.')[0].replace('T', ' ');

      row.id = uuid();
      row.created_at = date; // jshint ignore:line
      row.updated_at = date; // jshint ignore:line

      data[tableName] = data[tableName] || [];
      indexes[tableName] = indexes[tableName] || {};

      var index = data[tableName].length;

      indexes[tableName][row.id] = index;
      data[tableName][index] = row;

      saveTable(tableName, success, error);
    };

    Storage.update = function (tableName, row, success, error) {
      load(tableName);

      var index = getIndex(tableName, row.id);

      if (index > -1) {
        data[tableName][index] = row;

        return saveTable(tableName, success, error);
      }

      if (error) {
        error();
      }
    };

    Storage.remove = function (tableName, row, success, error) {
      load(tableName);

      var index = getIndex(tableName, row.id);

      if (index > -1) {
        data[tableName].splice(index, 1);
        updateIndexes(tableName, index);

        return saveTable(tableName, success, error);
      }

      if (error) {
        error();
      }
    };

    Storage.clear = function (tableName, success, error) {
      load(tableName);

      indexes[tableName] = {};
      data[tableName].length = 0;

      saveTable(tableName, success, error);
    };

    return Storage;
  })

  .factory('firebaseStorage', function (Firebase, angularFireCollection) {
    var data = {};
    var url;

    var Storage = function (app) {
      url = 'https://' + app.settings.firebase + '.firebaseio.com/';
      return Storage;
    };

    var load = function (tableName, success, error) {
      if (data[tableName]) {
        if (success) {
          success();
        }
      } else {
        var ref = new Firebase(url + tableName);

        ref.once('value', function () {
          if (success) {
            success();
          }
        }, function () {
          if (error) {
            error();
          }
        });

        data[tableName] = angularFireCollection(
          ref,
          null,
          function (action, item) {
            if (action === 'item_added' && !item.id) {
              item.id = item.$id;
              item.$ref.child('id').set(item.$id);
            }
          }
        );
      }
      return data[tableName];
    };

    Storage.all = function (tableName, success, error) {
      return load(tableName, success, error);
    };

    Storage.get = function (tableName, id, success, error) {
      var row = {};

      load(tableName, function () {
        var result = data[tableName].getByName(id);

        if (result) {
          angular.copy(result, row);

          if (success) {
            success();
          }
        } else {
          if (error) {
            error();
          }
        }
      });

      return row;
    };

    Storage.add = function (tableName, row, success, error) {
      var date = (new Date()).toISOString().split('.')[0].replace('T', ' ');

      row.created_at = date; // jshint ignore:line
      row.updated_at = date; // jshint ignore:line

      load(tableName, function () {
        data[tableName].add(row, function (err) {
          if (err) {
            if (error) {
              error();
            }
          } else {
            if (success) {
              success();
            }
          }
        });
      });
    };

    Storage.update = function (tableName, row, success, error) {
      load(tableName, function () {
        data[tableName].update(row, function (err) {
          if (err) {
            if (error) {
              error();
            }
          } else {
            if (success) {
              success();
            }
          }
        });
      });
    };

    Storage.remove = function (tableName, row, success, error) {
      load(tableName, function () {
        data[tableName].remove(row, function (err) {
          if (err) {
            if (error) {
              error();
            }
          } else {
            if (success) {
              success();
            }
          }
        });
      });
    };

    Storage.clear = function (tableName, success, error) {
      (new Firebase(url + tableName)).remove(function (err) {
        if (err) {
          if (error) {
            error();
          }
        } else {
          if (success) {
            success();
          }
        }
      });
    };

    return Storage;
  })

  .factory('storage', function ($injector) {
    return function (app) {
      var storage;

      if (app.storage) {
        storage = app.storage + 'Storage';
      } else {
        storage = 'localStorage';
      }
      return $injector.get(storage)(app);
    };
  });
