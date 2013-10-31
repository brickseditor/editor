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

        var resetBindings = function () {
          scope.bindings = {
            column: '',
            repeat: 'no',
            table: ''
          };
        };

        var parseModel = function (selection) {
          var  column, model, table;

          model = selection.attr('ng-model') || selection.attr('ng-bind');
          model = model ? model.split('.') : [];

          if (model.length === 2) {
            if (!scope.bindings.table) {
              table = scope.tables.filter(function (t) {
                return t.name === model[0];
              })[0];
              scope.bindings.table = table ? table.name : '';
            }

            column = table.columns.filter(function (c) {
              return c.name === model[1];
            })[0];
            scope.bindings.column = column ? column.name : '';
          }
        };

        var parseRepeat = function (selection) {
          var repeat = selection.attr('ng-repeat');
          var table;

          repeat = repeat ? repeat.split(' ') : [];

          if (repeat.length === 3) {
            scope.bindings.repeat = 'yes';

            if (!scope.bindings.table) {
              table = scope.tables.filter(function (t) {
                return t.name === repeat[0];
              })[0];
              scope.bindings.table = table ? table.name : '';
            }
          }
        };

        scope.$watch('bindings.table', function (table) {
          if (scope.tables && table) {
            scope.tables.some(function (t) {
              if (t.name === table) {
                scope.columns = t.columns;
                return true;
              }
            });
          }
        });

        // Changes element attributes according to selected bindings.
        scope.$watch('bindings', function (bindings) {
          if (!scope.selection || !scope.tables) {
            return;
          }

          var nodeName = scope.selection.prop('nodeName');
          var isInput = ['INPUT', 'TEXTAREA', 'SELECT'].indexOf(nodeName) > -1;
          var attr, repeat;

          if (bindings.repeat === 'yes' && bindings.table) {
            repeat = bindings.table + ' in data[\'' + bindings.table + '\']';
            scope.selection.attr('ng-repeat', repeat);
          } else {
            scope.selection.removeAttr('ng-repeat');
          }

          if (bindings.table && bindings.column) {
            attr = isInput ? 'ng-model' : 'ng-bind';
            scope.selection.attr(attr, bindings.table + '.' + bindings.column);
          } else {
            scope.selection.removeAttr('ng-bind').removeAttr('ng-model');
          }

          uiCtrl.updateTemplate();
        }, true);

        // Parses element attributes to set bindings values.
        scope.$on('selection', function () {
          scope.selection = uiCtrl.selection();

          resetBindings();
          parseModel(scope.selection);
          parseRepeat(scope.selection);

          $timeout(function () {
            scope.$apply();
          });
        });
      }
    };
  });
