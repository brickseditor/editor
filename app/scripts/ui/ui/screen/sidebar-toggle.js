'use strict';

angular.module('bricksApp.ui')
  .directive('sidebarToggle', function ($animate) {
    return {
      replace: true,
      restrict: 'E',
      scope: {},
      template: '<button class="collapse-button" ng-click="toggleSidebar()"></button>',
      link: function (scope, element, attrs) {
        var body = angular.element('body');
        var bodyClass = 'collapsed-' + attrs.position;
        var parentClasses = 'collapse-button-parent' + ' ' + attrs.position;
        var parent = element.parent().addClass(parentClasses);
        var open = false;

        scope.toggleSidebar = function () {
          if (open) {
            $animate.removeClass(parent, 'closed', function () {
              body.removeClass(bodyClass);
            });
          } else {
            $animate.addClass(parent, 'closed', function () {
              body.addClass(bodyClass);
            });
          }
          open = !open;
        };
      }
    };
  });
