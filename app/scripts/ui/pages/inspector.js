'use strict';

angular.module('bricksApp.ui')
  .directive('inspector', function (apps) {
    return {
      replace: true,
      require: '^ui',
      restrict: 'E',
      templateUrl: 'scripts/ui/pages/inspector.html',
      link: function (scope, element, attrs, uiCtrl) {
        var iframe = angular.element('iframe[edit-frame]');
        var style;

        var codemirrorOptions = {
          lineWrapping : true,
          lineNumbers: true,
          theme: 'base16-dark'
        };

        scope.page = uiCtrl.page;
        scope.view = 'html';
        scope.app = apps.current();

        scope.htmlOptions = angular.extend({
          mode: {
            name: 'xml',
            htmlMode: true
          },
        }, codemirrorOptions);

        scope.cssOptions = angular.extend({
          mode: 'css',
        }, codemirrorOptions);

        iframe.on('load', function () {
          if (!style) {
            style = iframe.contents().find('#bricksAppStyle');
          }
          style.html(scope.app.css);
        });

        scope.$watch('app.css', function (css) {
          if (style) {
            style.html(css);
          }
        });
      }
    };
  });
