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

        scope.component = {};
        scope.options = {};
        scope.update = function () {};

        // Update the selected DOM element and emit a change event to be
        // received by the iframe.
        scope.change = function () {
          scope.update();
          uiCtrl.selection(scope.selection);
          uiCtrl.updateTemplate();
        };

        // Sets the selected element and its corresponding component, appends
        // the component admin template to the directive element and executes
        // the component admin scripts.
        scope.$on('selection', function () {
          scope.options = {};
          scope.component = {};
          form.empty();

          scope.selection = uiCtrl.selection();

          components.all().then(function (list) {
            list.some(function (component) {
              var condition = scope.selection.is(component.selector);

              if (condition) {
                scope.component = component;
              }

              return condition;
            });

            if (scope.component['script']) {
              eval(scope.component['script']); // jshint ignore:line
            }

            if (scope.component.options) {
              form.append($compile(scope.component.options)(scope));
            }
          });

          $timeout(function () {
            scope.$apply();
          });
        });
      }
    };
  });
