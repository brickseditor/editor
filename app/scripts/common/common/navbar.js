'use strict';

angular.module('bricksApp.common')
  .directive('navbar', function ($location, $parse) {
    return {
      replace: true,
      restrict: 'E',
      templateUrl: 'scripts/common/common/navbar.html',
      link: function (scope, element, attrs) {
        var hideOn = $parse(attrs.hideOn)(scope);

        if (!Array.isArray(hideOn)) {
          hideOn = [hideOn];
        }

        scope.show = hideOn.indexOf($location.path()) === -1;

        // Watch for location path change to hide the navbar on the start
        // screen.
        scope.$watch(function () {
          return $location.path();
        }, function (newVal, oldVal) {
          if (newVal !== oldVal) {
            scope.show = hideOn.indexOf(newVal) === -1;
          }
        });
      }
    };
  });
