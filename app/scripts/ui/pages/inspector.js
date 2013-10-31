'use strict';

angular.module('bricksApp.ui')
  .directive('inspector', function () {
    return {
      replace: true,
      require: '^ui',
      restrict: 'E',
      template: '<div class="inspector">' +
          '<textarea ng-model="page().template" ui-refresh="show" ' +
            'ui-codemirror="codemirrorOptions"></textarea>' +
        '</div>',
      link: function (scope, element, attrs, uiCtrl) {
        scope.page = uiCtrl.page;

        scope.codemirrorOptions = {
          lineWrapping : true,
          lineNumbers: true,
          mode: {
            name: 'xml',
            htmlMode: true
          },
          theme: 'base16-dark'
        };
      }
    };
  });
