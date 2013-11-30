'use strict';

angular.module('bricksApp.ui')
  .directive('events', function ($timeout, apps) {
    return {
      replace: true,
      require: '^ui',
      restrict: 'E',
      scope: {},
      templateUrl: 'scripts/ui/ui/components/events.html',
      link: function (scope, element, attrs, uiCtrl) {
        var nativeTypes = (
          'blur change click copy cut dblclick focus keydown ' +
          'keyup keypress mousedown mouseenter mouseleave mousemove ' +
          'mouseout mouseover mouseup paste submit'
        ).split(' ');

        var appTypes = (
          'database row added, database row updated, database row removed'
        ).split(', ');

        scope.selection = null;
        scope.app = apps.current();
        scope.events = [];

        // Return all the possible events types except those which were
        // already used
        scope.types = function () {
          var types = nativeTypes.concat(appTypes);

          if (scope.events.length > 0) {
            var usedTypes = scope.events.map(function (event) {
              return event.type;
            });

            types = _.difference(types, usedTypes);
          }
          return types;
        };

        scope.actions = {
          add: 'add row',
          update: 'update row',
          remove: 'remove row',
          visit: 'load page',
          custom: 'custom'
        };

        var isAction = function (action) {
          return action && Object.keys(scope.actions).indexOf(action) > -1;
        };

        var attributeToEvent = function (attr, type) {
          var event = {};

          if (attr) {
            event.type = type;
            event.action = attr.split('(')[0];

            if (event.action !== 'custom' && isAction(event.action)) {
              event.object = attr.split('\'')[1];
            } else {
              event.action = 'custom';
              event.object = attr;
            }

            return event;
          }
        };

        var eventToAttribute = function (event) {
          var attr;

          switch (event.action) {
            case 'custom':
              attr = event.object;
              break;

            case 'visit':
              var params = event.object.match(/:(\w+)/);
              params = params ? ', ' + params[1] : '';
              attr = event.action + '(\'' + event.object + '\'' + params + ')';
              break;

            default:
              attr = event.action +
                '(\'' + event.object + '\', ' + event.object + ')';
              break;
          }

          return attr;
        };

        var attributeName = function (type) {
          if (appTypes.indexOf(type) > -1) {
            return 'event-' + type.replace(/\s/g, '-');
          } else {
            return 'ng-' + type;
          }
        };

        scope.$on('selection', function () {
          scope.selection = uiCtrl.selection();
          scope.events = [];
          scope.showForm = false;

          scope.types().forEach(function (type) {
            var attr = scope.selection.attr(attributeName(type));
            var event = attributeToEvent(attr, type);
            if (event) {
              scope.events.push(event);
            }
          });

          $timeout(function () {
            scope.$apply();
          });
        });

        scope.addEvent = function (event) {
          scope.events.push(event);
          scope.selection.attr(attributeName(event.type), eventToAttribute(event));

          uiCtrl.updateTemplate();

          scope.event = {};
          scope.showForm = false;
        };

        scope.removeEvent = function (event) {
          scope.events.some(function (e, i) {
            if (event === e) {
              scope.events.splice(i, 1);
              scope.selection.removeAttr(attributeName(event.type));
            }
          });

          uiCtrl.updateTemplate();
        };
      }
    };
  });
