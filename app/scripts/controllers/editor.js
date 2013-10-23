'use strict';

angular.module('bricksApp')
  .controller('EditorCtrl', function ($scope, components, pages) {
    $scope.components = components.all();
    $scope.currentPage = pages.current();

    $scope.loadPanel = function (type) {
      $scope.panel = type;
    };

    // Send received events from one child scope to all children.
    $scope.$on('select', function (e, iframe) {
      e.stopPropagation();
      $scope.$broadcast('selected', iframe);
    });
    $scope.$on('change', function (e) {
      e.stopPropagation();
      $scope.$broadcast('changed');
    });
  });
