'use strict';

angular.module('bricksApp')
  .directive('componentOptions', function ($compile, $timeout, components) {
    return {
      replace: true,
      require: '^editor',
      restrict: 'E',
      scope: {},
      templateUrl: 'views/component-options.html',
      link: function (scope, element, attrs, editorCtrl) {
        var form = element.find('form');
        var allComponents = components.all();
        scope.component = {};
        scope.options = {};
        scope.update = function () {};
        scope.select = editorCtrl.selection;

        // Update the selected DOM element and emit a change event to be
        // received by the iframe.
        scope.change = function () {
          scope.update();
          editorCtrl.updateTemplate();
        };

        // Sets the selected element and its corresponding component, appends
        // the component admin template to the directive element and executes
        // the compoent admin scripts.
        scope.$on('selection', function () {
          allComponents.some(function (component) {
            var condition;

            scope.selection = editorCtrl.selection();
            condition = scope.selection.is(component.selector);

            if (condition) {
              scope.component = component;
            }

            return condition;
          });

          eval(scope.component['admin-script']);
          form.empty().append($compile(scope.component.admin)(scope));

          $timeout(function () {
            scope.$apply();
          });
        });
      }
    };
  });
