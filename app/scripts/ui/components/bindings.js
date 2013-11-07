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

        // Parse an string representation of an object.
        var parseObject = function (expression) {
          var objects = [];

          if (angular.isString(expression)) {
            expression = expression.trim();

            if (expression.charAt(0) === '{' && expression.slice('-1') === '}') {
              expression.slice(1, -1).split(',').forEach (function (part) {
                  part = part.split(':');

                  objects.push({
                    name: part[0].trim().slice(1, -1),
                    value: part[1].trim()
                  });
                });
            }
          }

          return objects;
        };

        // Parses a string of filters into an array.
        var parseFilters = function (expression) {
          var filters = [];

          expression.forEach(function (filter) {
            filter = filter.split(':');

            // Before the first colon is the filter name.
            if (filter.shift().trim() === 'filter' && filter.length > 0) {
              // Pull back all the remaining part of the filter together to
              // change the whole into an object.
              filter = parseObject(filter.join(':')).map(function (unit) {
                unit.value = unit.value.slice(1, -1);
                return unit;
              });
              filters = filters.concat(filter);
            }
          });

          return filters;
        };

        var parseRepeat = function (expression) {
          if (!expression) {
            return {};
          }

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

          return {
            table: table,
            filters: parseFilters(expression)
          };
        };

        var writeClass = function (selection, bindings) {
          var classes = [];

          bindings.classes.forEach(function (object) {
            if (object.name && object.value) {
              classes.push('\'' + object.name + '\': ' + object.value);
            }
          });

          if (classes.length > 0) {
            selection.attr('ng-class', '{' + classes.join(', ') + '}');
          } else {
            selection.removeAttr('ng-class');
          }
        };

        var writeFilters = function (bindings) {
          var filters = [];

          if (bindings.filters.length > 0) {
            bindings.filters.forEach(function (filter) {
              var name, value;

              if (filter.name || filter.value) {
                name = filter.name ? filter.name : '$';
                value = filter.value ? filter.value : 'true';

                filters.push('\'' + name + '\': ' + value);
              }
            });

            if (filters.length > 0) {
              return 'filter:{' + filters.join(', ') + '}';
            }
          }

          return '';
        };

        // Creates the ng-repeat attribute.
        // If a filter was set with no column, filter on all attributes.
        // If a filter was set with no value, check for column existence.
        var writeRepeat = function (selection, bindings) {
          if (!bindings.repeat) {
            selection.removeAttr('ng-repeat');
            return;
          }

          var repeat = bindings.repeat + ' in data[\'' + bindings.repeat + '\']';
          var filters = writeFilters(bindings);

          if (filters) {
            repeat += ' | ' + filters;
          }

          selection.attr('ng-repeat', repeat);
        };

        // Changes element attributes according to selected bindings.
        scope.$watch('bindings', function (bindings) {
          if (!scope.selection || !scope.tables) {
            return;
          }

          if (bindings.bind) {
            scope.selection.attr('ng-bind', bindings.bind);
          } else {
            scope.selection.removeAttr('ng-bind');
          }

          if (bindings.model) {
            scope.selection.attr('ng-model', bindings.model);
          } else {
            scope.selection.removeAttr('ng-model');
          }

          writeClass(scope.selection, bindings);
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
            filters: repeat.filters || [],
            classes: parseObject(scope.selection.attr('ng-class'))
          };

          $timeout(function () {
            scope.$apply();
          });
        });
      }
    };
  });
