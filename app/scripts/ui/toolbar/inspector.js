'use strict';

angular.module('bricksApp.ui')
  .directive('inspector', function ($compile) {
    return {
      replace: true,
      restrict: 'E',
      scope: {template: '='},
      template: '<button class="btn btn-link" ng-click="show = !show">' +
        '<span class="fa fa-code"></span></button>',
      link: function (scope, element) {
        var canvas = element.parent().parent();

        canvas.append($compile('<div id="inspector" ng-show="show">' +
            '<textarea ng-model="template" ui-refresh="show" ' +
              'ui-codemirror="codemirrorOptions"></textarea>' +
            '</div>')(scope));

        scope.show = false;
        scope.codemirrorOptions = {
          lineWrapping : true,
          lineNumbers: true,
          mode: {
            name: 'xml',
            htmlMode: true
          },
          theme: 'base16-dark'
        };

        scope.$watch('show', function (show) {
          if (show) {
            canvas.addClass('inspector-visible');
          } else {
            canvas.removeClass('inspector-visible');
          }
        });
      }
    };
  });
