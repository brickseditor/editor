'use strict';

angular.module('bricksApp.ui')
  .directive('events', function ($timeout, apps) {
    return {
      replace: true,
      require: '^ui',
      restrict: 'E',
      scope: {},
      templateUrl: 'scripts/ui/components/events.html',
      link: function (scope, element, attrs, uiCtrl) {
        scope.selection = null;
        scope.tables = apps.current().tables;
        scope.event = {};

        scope.names = (
          'blur change click copy cut dblclick focus keydown keyup ' +
          'keypress mousedown mouseenter mouseleave mousemove mouseout ' +
          'mouseover mouseup paste submit'
        ).split(' ');

        var parseEvent = function (selection, type) {
          var event = selection.attr('ng-' + type);

          if (event) {
            scope.event.type = type;
            scope.event.action = event.split('(')[0];
            if (scope.event.action) {
              scope.event.object = event.split('\'')[1];
            }
          }
        };

        scope.$on('selection', function () {
          scope.selection = uiCtrl.selection();
          scope.event = {};
          scope.names.forEach(function (event) {
            parseEvent(scope.selection, event);
          });

          $timeout(function () {
            scope.$apply();
          });
        });

        scope.$watch('events', function (events) {
          var attrValue;

          if (!scope.selection) {
            return;
          }

          if (events.type && events.action && events.object) {
            attrValue = events.action +
              '(\'' + events.object + '\', ' + events.object + ')';
            scope.selection.attr('ng-' + events.type, attrValue);
          } else {
            scope.selection.removeAttr('ng-' + events.type);
          }

          uiCtrl.updateTemplate();
        }, true);
      }
    };
  });
