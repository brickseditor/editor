'use strict';

angular.module('bricksApp')
  .directive('events', function (apps) {
    return {
      replace: true,
      require: '^editor',
      restrict: 'E',
      scope: {},
      templateUrl: 'views/events.html',
      link: function (scope, element, attrs, editorCtrl) {
        var selection;

        scope.tables = apps.current().tables;
        scope.events = {};

        var parseEvent = function (selection, type) {
          var event = selection.attr('ng-' + type);

          if (event) {
            scope.events.type = type;
            scope.events.action = event.split('(')[0];
            if (scope.events.action) {
              scope.events.object = event.split('\'')[1];
            }
          } else {
            scope.events = {};
          }
        };

        scope.$on('selection', function () {
          selection = editorCtrl.selection();
          parseEvent(selection, 'click');
          scope.$apply();
        });

        scope.$watch('events', function (events) {
          var attrValue;

          if (!selection) {
            return;
          }

          if (events.type && events.action && events.object) {
            attrValue = events.action + '(\'' + events.object + '\')';
            selection.attr('ng-' + events.type, attrValue);
          }

          editorCtrl.updateTemplate();
        }, true);
      }
    };
  });
