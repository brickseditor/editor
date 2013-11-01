'use strict';

angular.module('bricksApp.ui')
  .directive('devices', function () {
    return {
      restrict: 'E',
      templateUrl: 'scripts/ui/screen/devices.html',
      link: function (scope) {
        var iframes = angular.element('#canvas').find('iframe');

        scope.devices = [
          'mobile', 'tablet', 'laptop', 'desktop', 'resize-full'
        ];
        scope.currentDevice = 'resize-full';

        scope.$watch('currentDevice', function (value, oldValue) {
          iframes.removeClass('device-' + oldValue).addClass('device-' + value);
        });
      }
    };
  });
