'use strict';

angular.module('bricksApp')
  .directive('collapseButton', function ($animate) {
    return {
      replace: true,
      restrict: 'E',
      template: '<button class="collapse-button"></button>',
      link: function (scope, element, attrs) {
        var body = angular.element('body');
        var bodyClass = 'collapsed-' + attrs.position;
        var parentClasses = 'collapse-button-parent' + ' ' + attrs.position;
        var parent = element.parent().addClass(parentClasses);
        var open = true;

        element.bind('click', function () {
          open = !open;
          if (open) {
            $animate.removeClass(parent, 'closed', function () {
              body.removeClass(bodyClass);
            });
          } else {
            $animate.addClass(parent, 'closed', function () {
              body.addClass(bodyClass);
            });
          }
        });
      }
    };
  });
