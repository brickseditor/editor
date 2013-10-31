'use strict';

angular.module('bricksApp.ui')
  .directive('bindings', function ($timeout, apps) {
    return {
      replace: true,
      require: '^ui',
      restrict: 'E',
      scope: {},
      templateUrl: 'scripts/ui/components/bindings.html',
      link: function (scope, element, attrs, uiCtrl) {
        scope.selection = null;
        scope.tables = apps.current().tables;
        scope.bindings = {};

        var parseRepeat = function (repeat) {
          var table;

          repeat = repeat ? repeat.split(' ') : [];

          if (repeat.length === 3) {
            scope.tables.some(function (t) {
              if (t.name === repeat[0]) {
                table = t.name;
                return true;
              }
            });

            return table;
          }
        };

        // Changes element attributes according to selected bindings.
        scope.$watch('bindings', function (bindings) {
          if (!scope.selection || !scope.tables) {
            return;
          }

          scope.selection.attr('ng-bind', scope.bindings.bind);
          scope.selection.attr('ng-model', scope.bindings.model);

          if (bindings.repeat) {
            var repeat = bindings.repeat + ' in data[\'' + bindings.repeat + '\']';
            scope.selection.attr('ng-repeat', repeat);
          } else {
            scope.selection.removeAttr('ng-repeat');
          }

          uiCtrl.updateTemplate();
        }, true);

        // Parses element attributes to set bindings values.
        scope.$on('selection', function () {
          scope.selection = uiCtrl.selection();
          scope.nodeName = scope.selection.prop('nodeName');
          scope.isInput = ['INPUT', 'TEXTAREA', 'SELECT'].indexOf(scope.nodeName) > -1;

          scope.bindings = {
            bind: scope.selection.attr('ng-bind'),
            model: scope.selection.attr('ng-model'),
            repeat: parseRepeat(scope.selection.attr('ng-repeat'))
          };

          $timeout(function () {
            scope.$apply();
          });
        });
      }
    };
  });
