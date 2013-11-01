'use strict';

angular.module('bricksApp.ui')
  .directive('preview', function ($http, apps) {
    return {
      replace: true,
      require: '^ui',
      restrict: 'E',
      template: '<button class="preview" ' +
        'ng-click="visible = !visible">{{buttonText}}',
      link: function (scope, element, attrs, uiCtrl) {
        var canvas = angular.element('#canvas');
        var iframe = canvas.find('iframe[preview-frame]');
        var document = iframe.contents();

        scope.app = apps.current();
        scope.visible = false;
        scope.buttonText = 'Preview';
        scope.content = '';

        scope.reload = function () {
          if (scope.visible) {
            iframe[0].src = '#' + uiCtrl.page().url;
            document[0].open();
            document[0].write(scope.content);
            document[0].close();
          }
        };

        $http.get('preview.html', {cache: true})
          .success(function (response) {
            scope.content = response;
            scope.reload();
          });

        scope.$watch('app', function (app) {
          iframe[0].contentWindow.bricksApp = app;
          scope.reload();
        }, true);

        scope.$watch('visible', function (visible) {
          if (visible) {
            canvas.addClass('preview');
            scope.buttonText = 'Edit';
            scope.reload();
          } else {
            canvas.removeClass('preview');
            scope.buttonText = 'Preview';
          }
        });
      }
    };
  });
