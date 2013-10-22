'use strict';

angular.module('bricksApp')
  .controller('EditorCtrl', function ($scope, components, pages) {
    $scope.components = components.all();
    $scope.currentPage = pages.current();

    $scope.loadPanel = function (type) {
      $scope.panel = type;
    };

    $scope.$on('select', function (e, iframe) {
      e.stopPropagation();
      $scope.$broadcast('selected', iframe);
    });
  });
