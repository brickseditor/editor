'use strict';

angular.module('bricksApp')
  .controller('DatabaseCtrl', function ($scope, $window, apps) {
    $scope.app = apps.current();
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
    // Properties used in modals
    $scope.showModal = {newTable: false, newColumn: false};
    $scope.newTable = {};
    $scope.newColumn = {};

    // Watch for changes to the current app and set the current table.
    $scope.appsService = apps;
    $scope.$watch('appsService.current().id', function () {
      $scope.app = apps.current();

      if ($scope.app.tables) {
        $scope.selectTable(0);
      } else {
        $scope.app.tables = [];
      }
    }, true);

    $scope.hasTables = function () {
      return $scope.app.tables && $scope.app.tables.length > 0;
    };

    $scope.selectTable = function (i) {
      $scope.currentTable = $scope.app.tables[i];
      $scope.currentIndex = i;
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
      $scope.newTable.columns = angular.copy($scope.defaultColumns);
      var i = $scope.app.tables.push($scope.newTable) - 1;
      $scope.selectTable(i);
      apps.update($scope.app);
      $scope.newTable = {};
      $scope.showModal.newTable = false;
    };

    // Delete a table after confirmation
    $scope.deleteTable = function (table) {
      var confirmed = $window.confirm('Are you sure you want to delete the ' +
                                      'table "' + table.name + '"?');
      if (confirmed) {
        $scope.app.tables.splice($scope.currentIndex, 1);
        apps.update($scope.app);
        $scope.currentTable = $scope.app.tables[0];
      }
      $scope.showMenu.actions = false;
    };

    // Add a column to the current table and hide the modal.
    $scope.addColumn = function () {
      var form = angular.element(document.newColumnForm);
      if (form.controller('form').$valid) {
        $scope.currentTable.columns.push(angular.copy($scope.newColumn));
        apps.update($scope.app);
        $scope.newColumn = {};
        $scope.showModal.newColumn = false;
      }
    };

    // Delete a column after confirmation.
    $scope.deleteColumn = function (column, i) {
      var confirmed = $window.confirm('Are you sure you want to delete the ' +
                                      'column "' + column.name + '"?');
      if (confirmed) {
        $scope.currentTable.columns.splice(i, 1);
        apps.update($scope.app);
      }
    };
  });
