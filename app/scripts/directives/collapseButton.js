'use strict';

angular.module('bricksApp')
  .directive('collapseButton', function ($animate) {
    return {
      replace: true,
      restrict: 'E',
      template: '<button class="collapse-button"></button>',
      link: function (scope, element, attrs) {
        var parentClasses = 'collapse-button-parent' + ' ' + attrs.position;
        var parent = element.parent().addClass(parentClasses);
        var open = true;

        element.bind('click', function () {
          open = !open;
          if (open) {
            $animate.removeClass(parent, 'closed');
          } else {
            $animate.addClass(parent, 'closed');
          }
        });
      }
    };
  });
