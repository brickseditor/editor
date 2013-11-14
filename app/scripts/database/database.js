'use strict';

angular.module('bricksApp.database', [
    'ngRoute',
    'bricksApp.common'
  ])

  .config(function ($routeProvider) {
    $routeProvider
      .when('/database', {
        templateUrl: 'scripts/database/database.html',
        controller: 'DatabaseCtrl'
      });
  })

  .controller('DatabaseCtrl', function ($scope, $window, apps, storage) {
    var Storage;

    var defaultTableColumns = [{
      field: 'actions',
      displayName: '',
      enableCellEdit: false,
      pinnable: false,
      width: 24,
      cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()">' +
        '<a href="" ng-click="deleteRow(row.entity)">' +
        '<span class="fa fa-trash-o text-danger"></span></a></div>'
    }];

    $scope.showMenu = {actions: false};
    $scope.defaultColumns = [
      {name: 'id'},
      {name: 'created_at'},
      {name: 'updated_at'}
    ];

    $scope.app = apps.current();

    $scope.selectTable = function (i) {
      $scope.currentTable = $scope.app.tables[i];
      $scope.currentIndex = i;
      if ($scope.currentTable) {
        $scope.data = Storage.all($scope.currentTable.name);
      }
    };

    storage.init($scope.app).then(function (res) {
      Storage = res;

      if ($scope.app.tables) {
        $scope.selectTable(0);
      }
    });

    $scope.gridOptions = {
      columnDefs: 'columns',
      data: 'data',
      enableCellEditOnFocus: true,
      enableCellSelection: true,
      enablePaging: true,
      enablePinning: true,
      enableRowSelection: false,
      showFooter: true
    };

    // Properties used in modals
    $scope.showModal = {newTable: false, newColumn: false};
    $scope.newTable = {};
    $scope.newColumn = {};
    $scope.newRow = {};
    $scope.columnToDelete = {};

    $scope.$watch(function () {
      if ($scope.currentTable && $scope.currentTable.name) {
        return Storage.all($scope.currentTable.name);
      }
    }, function (data) {
      $scope.data = data;
    });

    // Watch for changes to the current app and set the current table.
    $scope.$watch(function () {
      return apps.current().id;
    }, function (id) {
      if ($scope.app.id !== id) {
        $scope.app = apps.current();
        storage.init($scope.app).then(function (res) {
          Storage = res;

          if ($scope.app.tables) {
            $scope.selectTable(0);
          } else {
            $scope.app.tables = [];
          }
        });
      }
    });

    $scope.$watch('currentTable.columns', function (columns) {
      if (columns) {
        $scope.columns = columns.reduce(function (result, column) {
          result.push({field: column.name});
          return result;
        }, angular.copy(defaultTableColumns));
      }
    }, true);

    $scope.hasTables = function () {
      return $scope.app.tables && $scope.app.tables.length > 0;
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
      var form = angular.element(document.newTableForm);

      if (form.controller('form').$valid) {
        $scope.newTable.columns = angular.copy($scope.defaultColumns);

        var i = $scope.app.tables.push(angular.copy($scope.newTable)) - 1;
        apps.update($scope.app);
        $scope.selectTable(i);

        $scope.newTable = {};
        $scope.showModal.newTable = false;
      }
    };

    // Delete a table after confirmation
    $scope.deleteTable = function () {
      var confirmed = $window.confirm('Are you sure you want to delete the ' +
                                      'table "' + $scope.currentTable.name +
                                      '"?');
      if (confirmed) {
        $scope.app.tables.splice($scope.currentIndex, 1);
        apps.update($scope.app);
        $scope.selectTable(0);
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
    $scope.deleteColumn = function () {
      var column = $scope.currentTable.columns[$scope.columnToDelete];
      var confirmed = $window.confirm('Are you sure you want to delete the ' +
                                      'column "' + column.name + '"?');
      if (confirmed) {
        $scope.currentTable.columns.splice($scope.columnToDelete, 1);
        apps.update($scope.app);
        $scope.showModal.deleteColumn = false;
      }
    };

    $scope.addRow = function () {
      Storage.add($scope.currentTable.name, $scope.newRow);
      $scope.newRow = {};
      $scope.showModal.newRow = false;
    };

    $scope.deleteRow = function (row) {
      Storage.remove($scope.currentTable.name, row);
    };

    $scope.emptyTable = function () {
      var text = 'Are you sure you want to delete all the rows in the table "' +
        $scope.currentTable.name + '"?';

      if ($window.confirm(text)) {
        Storage.clear($scope.currentTable.name);
      }
      $scope.showMenu.actions = false;
    };
  });
