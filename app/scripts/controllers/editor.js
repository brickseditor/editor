'use strict';

angular.module('bricksApp')
  .controller('EditorCtrl', function ($scope, components, apps) {
    $scope.components = components.all();
    $scope.app = apps.current();
    $scope.newPage = {template: ''};

    if (!$scope.app.pages || $scope.app.pages.length === 0) {
      $scope.app.pages = [{url: '/', template: ''}];
    }
    $scope.currentPage = $scope.app.pages[0];

    // Send received events from one child scope to all children.
    $scope.$on('select', function (e, iframe) {
      e.stopPropagation();
      $scope.$broadcast('selected', iframe);
    });
    $scope.$on('change', function (e) {
      e.stopPropagation();
      $scope.$broadcast('changed');
    });

    $scope.loadPanel = function (type) {
      $scope.panel = type;
    };

    $scope.selectPage = function (page) {
      $scope.currentPage = page;
    };

    $scope.addPage = function () {
      var newPage = angular.copy($scope.newPage);

      $scope.app.pages.push(newPage);
      apps.update($scope.app);
      $scope.currentPage = newPage;

      $scope.newPage = {template: ''};
      $scope.showNewPageModal = false;
    };

    $scope.deletePage = function (page) {
      $scope.app.pages.some(function (p, i) {
        if (page.url === p.url) {
          $scope.app.pages.splice(i, 1);
          return true;
        }
      });
      apps.update($scope.app);
      $scope.currentPage = $scope.app.pages[0];
    };

    // Saves the current page.
    $scope.savePage = function () {
      apps.update($scope.app);
    };
  });
