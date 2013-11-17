'use strict';

angular.module('bricksApp.ui')
  .directive('preview', function ($http, $location, $window, apps) {
    return {
      replace: true,
      require: '^ui',
      restrict: 'E',
      template: '<button class="preview" ng-click="preview()">Preview</button>',
      link: function (scope) {
        var preview = null;

        scope.preview = function () {
          // Don't reuse the window reference because the load event
          // is only sent once.
          if (preview && !preview.closed) {
            preview.close();
          }
          preview = $window.open('preview.html');

          angular.element(preview).on('load', function () {
            preview.postMessage(apps.current(), $location.absUrl());
          });
        };

        scope.$on('$destroy', function () {
          if (preview) {
            preview.close();
          }
        });
      }
    };
  });
