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

        var parseRepeat = function (expression) {
          if (!expression) {
            return {};
          }

          var filters = [];
          var repeat, table;

          // The part before an eventual first pipe is in the form 'test in tests'.
          expression = expression.split('|');
          repeat = expression ? expression.shift().trim().split(' ') : [];
          if (repeat.length !== 3) {
            return {};
          }

          // Table name is the first part.
          scope.tables.some(function (t) {
            if (t.name === repeat[0]) {
              table = t.name;
              return true;
            }
          });

          // Processing filters (pipes separations after the first pipe).
          expression.forEach(function (filter) {
            filter = filter.split(':');

            // Before the first colon is the filter name.
            if (filter.shift().trim() === 'filter' && filter.length > 0) {
              // Pull back all the remaining part of the filter together to
              // change the whole into an object.
              filter = filter.join(':').slice(1, -1).split(',');

              filter.forEach (function (column) {
                column = column.split(':');
                filters.push({
                  column: column[0].trim(),
                  value: column[1].trim().slice(1, -1)
                });
              });
            }
          });

          return {table: table, filters: filters};
        };

        // Creates the ng-repeat attribute.
        // If a filter was set with no column, filter on all attributes.
        // If a filter was set with no value, check for column existence.
        var writeRepeat = function (selection, bindings) {
          if (!bindings.repeat) {
            scope.selection.removeAttr('ng-repeat');
            return;
          }

          var repeat = bindings.repeat + ' in data[\'' + bindings.repeat + '\']';
          var filters = [];

          if (bindings.filters.length > 0) {
            bindings.filters.forEach(function (filter) {
              var column, value;

              if (filter.column || filter.value) {
                column = filter.column ? filter.column : '$';
                value = filter.value ? '\'' + filter.value + '\'' : 'true';

                filters.push(column + ': ' + value);
              }
            });

            if (filters.length > 0) {
              repeat += ' | filter:{' + filters.join(', ') + '}';
            }
          }

          scope.selection.attr('ng-repeat', repeat);
        };

        // Changes element attributes according to selected bindings.
        scope.$watch('bindings', function (bindings) {
          if (!scope.selection || !scope.tables) {
            return;
          }

          scope.selection.attr('ng-bind', bindings.bind);
          scope.selection.attr('ng-model', bindings.model);

          writeRepeat(scope.selection, bindings);

          uiCtrl.updateTemplate();
        }, true);

        // Parses element attributes to set bindings values.
        scope.$on('selection', function () {
          scope.selection = uiCtrl.selection();
          scope.nodeName = scope.selection.prop('nodeName');
          scope.isInput = ['INPUT', 'TEXTAREA', 'SELECT'].indexOf(scope.nodeName) > -1;

          var repeat = parseRepeat(scope.selection.attr('ng-repeat'));

          scope.bindings = {
            bind: scope.selection.attr('ng-bind'),
            model: scope.selection.attr('ng-model'),
            repeat: repeat.table,
            filters: repeat.filters || []
          };

          $timeout(function () {
            scope.$apply();
          });
        });
      }
    };
  });
