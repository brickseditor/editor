'use strict';

angular.module('bricksApp')
  .factory('Storage', function ($window) {
    var Storage = function (app) {
      this.app = app;
      this.prefix = 'bricks_app_' + app + '_';
    };

    Storage.prototype.getTable = function (table) {
      var data = $window.localStorage.getItem(this.prefix + table);
      return data ? JSON.parse(data) : [];
    };

    Storage.prototype.emptyTable = function (table) {
      return $window.localStorage.removeItem(this.prefix + table);
    };

    Storage.prototype.addRow = function (table, attributes) {
      var data = this.getTable(table);
      var date = this._date();

      attributes.id = uuid();
      attributes.created_at = date;
      attributes.updated_at = date;

      data.push(attributes);
      $window.localStorage.setItem(this.prefix + table, JSON.stringify(data));
    };

    Storage.prototype.removeRow = function (table, attributes) {
      var data = this.getTable(table);
      data.forEach(function (row, i) {
        if (row.id === attributes.id) {
          data.splice(i, 1);
        }
      });
      $window.localStorage.setItem(this.prefix + table, JSON.stringify(data));
    };

    Storage.prototype._date = function () {
      return (new Date()).toISOString().split('.')[0].replace('T', ' ');
    };

    return Storage;
  });
