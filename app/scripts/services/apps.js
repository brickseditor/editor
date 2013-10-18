'use strict';

// Apps management. Gets from localStorage and memoize.
angular.module('bricksApp')
  .factory('apps', function ($window) {
    var keyAll = 'bricks_apps';
    var keyCurrent = 'bricks_current';
    var apps = $window.localStorage.getItem(keyAll);
    var current = $window.localStorage.getItem(keyCurrent);

    apps = apps ? JSON.parse(apps) : [];

    return {
      all: function () {
        return angular.copy(apps);
      },

      // Sets the current app id if app parameter was supplied.
      // Gets the current app object if no parameter supplied.
      // Returns the first app If none is set as current.
      current: function (app) {
        if (app) {
          current = app.id;
          $window.localStorage.setItem(keyCurrent, current);
        } else {
          var object;
          current = $window.localStorage.getItem(keyCurrent);
          apps.forEach(function (a) {
            if (a.id === current) {
              object = a;
            }
          });
          return angular.copy(object ? object : apps[0]);
        }
      },

      // Adds an app from the supplied parameters. Generates a UUID for
      // the app id.
      add: function (app) {
        app.id = uuid();
        apps.push(angular.copy(app));
        $window.localStorage.setItem(keyAll, JSON.stringify(apps));
      },

      // Deletes the app which id was sent as parameter.
      remove: function (id) {
        apps.forEach(function (a, i) {
          if (a.id === id) {
            apps.splice(i, 1);
            $window.localStorage.setItem(keyAll, JSON.stringify(apps));
          }
        });
      }
    };
  });
