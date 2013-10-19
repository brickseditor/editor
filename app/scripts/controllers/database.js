'use strict';

angular.module('bricksApp')
  .controller('DatabaseCtrl', function ($scope, apps) {
    $scope.app = apps.current();
    $scope.showModal = {newTable: false};
    $scope.showMenu = {actions: false};
    $scope.defaultColumns = [
      {
        name: 'id',
        type: 'text'
      },
      {
        name: 'created_at',
        type: 'date'
      },
      {
        name: 'updated_at',
        type: 'date'
      }
    ];
    $scope.table = {};

    // Watch for changes to the current app and set the current table.
    $scope.appsService = apps;
    $scope.$watch('appsService.current().id', function () {
      $scope.app = apps.current();

      if ($scope.app.tables) {
        $scope.currentTable = $scope.app.tables[0];
      } else {
        $scope.app.tables = [];
      }
    }, true);

    $scope.hasTables = function () {
      return $scope.app.tables && $scope.app.tables.length > 0;
    };

    $scope.selectTable = function (table) {
      $scope.currentTable = table;
    };

    $scope.isDefaultColumn = function (column) {
      var isDefault = false;
      $scope.defaultColumns.forEach(function (c) {
        if (c.name === column.name) {
          isDefault = true;
        }
      });
      return isDefault;
    };

    // Set the table default columns, add it to the app tables array,
    // set it as the current table and hide the modal
    $scope.addTable = function () {
      $scope.table.columns = angular.copy($scope.defaultColumns);
      $scope.app.tables.push($scope.table);
      apps.update($scope.app);
      $scope.currentTable = angular.copy($scope.table);
      $scope.table = {};
      $scope.showModal.newTable = false;
    };
  });
