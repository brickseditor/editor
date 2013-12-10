'use strict';

angular.module('bricksApp.ui')
  .directive('componentStyle', function ($compile, $timeout, components) {
    return {
      replace: true,
      require: '^ui',
      restrict: 'E',
      scope: {},
      templateUrl: 'scripts/ui/ui/components/component-style.html',
      link: function (scope, element, attrs, uiCtrl) {
        var form = element.find('form');

        // Update the selected DOM element and emit a change event to be
        // received by the iframe.
        scope.$watch(function () {
          return scope.selection && scope.selection[0].outerHTML;
        }, function () {
          if (scope.selection) {
            uiCtrl.selection(scope.selection);
            uiCtrl.updateTemplate();
          }
        });

        // Sets the selected element and its corresponding component, appends
        // the component admin template to the directive element and executes
        // the component admin scripts.
        scope.$on('selection', function () {
          form.empty();

          scope.selection = uiCtrl.selection();

          components.forElement(scope.selection, function (component) {
            form.append(component.options);
          });
        });
      }
    };
  });
