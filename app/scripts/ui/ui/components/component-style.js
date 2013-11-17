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
        var allComponents = components.all();
        scope.component = {};
        scope.options = {};
        scope.update = function () {};
        scope.select = uiCtrl.selection;

        // Update the selected DOM element and emit a change event to be
        // received by the iframe.
        scope.change = function () {
          scope.update();
          uiCtrl.updateTemplate();
        };

        // Sets the selected element and its corresponding component, appends
        // the component admin template to the directive element and executes
        // the compoent admin scripts.
        scope.$on('selection', function () {
          scope.options = {};
          scope.component = {};
          form.empty();

          allComponents.some(function (component) {
            var condition;

            scope.selection = uiCtrl.selection();
            condition = scope.selection.is(component.selector);

            if (condition) {
              scope.component = component;
            }

            return condition;
          });

          if (scope.component['admin-script']) {
            eval(scope.component['admin-script']);
          }

          if (scope.component.admin) {
            form.append($compile(scope.component.admin)(scope));
          }

          $timeout(function () {
            scope.$apply();
          });
        });
      }
    };
  });
