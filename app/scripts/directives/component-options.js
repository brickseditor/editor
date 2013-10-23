'use strict';

angular.module('bricksApp')
  .directive('componentOptions', function ($compile, components) {
    return {
      restrict: 'E',
      replace: true,
      scope: {},
      template: '<div></div>',
      link: function (scope, element) {
        var allComponents = components.all();
        scope.component = {};
        scope.selection = {};
        scope.options = {};
        scope.updateSelection = function () {};

        // Update the selected DOM element and emit a change event to be
        // received by the iframe.
        scope.change = function () {
          scope.updateSelection();
          scope.$emit('change');
        };

        // Sets the selected element and its corresponding component, appends
        // the component admin template to the directive element and executes
        // the compoent admin scripts.
        scope.$on('selected', function (e, iframe) {
          var page = angular.element(iframe).contents();

          scope.selection = page.find('.bricks-selected');

          allComponents.some(function (component) {
            var condition = scope.selection.is(component.selector);
            if (condition) {
              scope.component = component;
            }
            return condition;
          });

          eval(scope.component['admin-script']);
          element.empty().append($compile(scope.component.admin)(scope));
          scope.$apply();
        });
      }
    };
  });
