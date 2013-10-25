'use strict';

angular.module('bricksApp')
  .directive('bindings', function (apps) {
    return {
      replace: true,
      require: '^editor',
      restrict: 'E',
      scope: {},
      templateUrl: 'views/bindings.html',
      link: function (scope, element, attrs, editorCtrl) {
        var selection;

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
          scope.tables.some(function (t) {
            if (t.name === table) {
              scope.columns = t.columns;
              return true;
            }
          });
        });

        // Changes element attributes according to selected bindings.
        scope.$watch('bindings', function (bindings) {
          if (!selection) {
            return;
          }

          var nodeName = selection.prop('nodeName');
          var isInput = ['INPUT', 'TEXTAREA', 'SELECT'].indexOf(nodeName) > -1;
          var attr, repeat;

          if (bindings.repeat === 'yes') {
            if (bindings.table) {
              repeat = bindings.table + ' in data[\'' + bindings.table + '\']';
              selection.attr('ng-repeat', repeat);
            }
          } else {
            selection.removeAttr('ng-repeat');
          }

          if (bindings.table && bindings.column) {
            attr = isInput ? 'ng-model' : 'ng-bind';
            selection.attr(attr, bindings.table + '.' + bindings.column);
          } else {
            selection.removeAttr('ng-bind').removeAttr('ng-model');
          }

          editorCtrl.updateTemplate();
        }, true);

        // Parses element attributes to set bindings values.
        scope.$on('selection', function () {
          selection = editorCtrl.selection();

          resetBindings();
          parseModel(selection);
          parseRepeat(selection);

          scope.$apply();
        });
      }
    };
  });
