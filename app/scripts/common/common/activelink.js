'use strict';

angular.module('bricksApp.common')
  .directive('activelink', function ($location) {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        var className = attrs.activelink,
        path = element.find('a')[0].hash.substring(1);

        scope.$location = $location;

        scope.$watch('$location.path()', function (newPath) {
          if ((path.length > 1 && newPath.substr(0, path.length) === path) ||
              newPath.split('/')[1] === path.substr(1, path.length) ||
                (path.length === 1 && newPath.length === 1)) {
            element.addClass(className);
          } else {
            element.removeClass(className);
          }
        });
      }
    };
  });
