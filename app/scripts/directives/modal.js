'use strict';

angular.module('bricksApp')
  .directive('modal', function () {
    return {
      replace: true,
      restrict: 'E',
      scope: {
        closeable: '&',
        close: '&',
        open: '&',
        submit: '&',
        title: '='
      },
      templateUrl: 'views/modal.html',
      transclude: true,
      link: function(scope, element, attrs) {
        // Modal can be closed by default.
        scope.closeable = scope.closeable();
        if (scope.closeable === void 0) {
          scope.closeable = true;
        }
      }
    };
  });
