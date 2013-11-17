'use strict';

angular.module('bricksApp.ui')
  .directive('inspectorToggle', function () {
    return {
      replace: true,
      restrict: 'E',
      template: '<button class="btn btn-link" ng-click="toggleInspector()">' +
        '<span class="fa fa-code"></span></button>',
      link: function (scope) {
        var body = angular.element('body');
        var show = false;

        scope.toggleInspector = function () {
          show = !show;
          if (show) {
            body.addClass('inspector-visible');
          } else {
            body.removeClass('inspector-visible');
          }
        };
      }
    };
  });
