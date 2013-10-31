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
          scope.selection = uiCtrl.selection();
          parseEvent(scope.selection, 'click');

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
            attrValue = events.action + '(\'' + events.object + '\')';
            scope.selection.attr('ng-' + events.type, attrValue);
          } else {
            scope.selection.removeAttr('ng-' + events.type);
          }

          uiCtrl.updateTemplate();
        }, true);
      }
    };
  });
