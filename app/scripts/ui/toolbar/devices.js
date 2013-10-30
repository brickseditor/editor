'use strict';

angular.module('bricksApp.ui')
  .directive('devices', function () {
    return {
      restrict: 'E',
      scope: {
        iframe: '@'
      },
      templateUrl: 'scripts/ui/toolbar/devices.html',
      link: function (scope) {
        var iframe = angular.element(scope.iframe);

        scope.devices = [
          'mobile', 'tablet', 'laptop', 'desktop', 'resize-full'
        ];
        scope.currentDevice = 'resize-full';

        scope.$watch('currentDevice', function (value, oldValue) {
          iframe.removeClass('device-' + oldValue).addClass('device-' + value);
        });
      }
    };
  });
