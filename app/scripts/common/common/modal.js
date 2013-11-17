'use strict';

angular.module('bricksApp.common')
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
      templateUrl: 'scripts/common/common/modal.html',
      transclude: true,
      link: function(scope) {
        // Modal can be closed by default.
        scope.closeable = scope.closeable();
        if (scope.closeable === void 0) {
          scope.closeable = true;
        }
      }
    };
  });
