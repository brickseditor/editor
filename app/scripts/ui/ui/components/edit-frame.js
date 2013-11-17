'use strict';

angular.module('bricksApp.ui')
  .directive('editFrame', function (beautify) {
    return {
      require: '^ui',
      link: function (scope, element, attrs, uiCtrl) {
        var iframe = element;
        var view;

        var select = function (e) {
          e.preventDefault();
          uiCtrl.selectElement(angular.element(e.target));
        };

        // Display the template HTML code.
        scope.$watch(function () {
          return uiCtrl.page().template;
        }, function (template) {
          if (view && template !== beautify.html(view.html())) {
            view.html(template);
          }
        });

        iframe.on('load', function () {
          var page = iframe.contents();

          view = page.find('div[ng-view]');
          view.html(uiCtrl.page().template);

          page.on('click', select);
        });
      }
    };
  });
