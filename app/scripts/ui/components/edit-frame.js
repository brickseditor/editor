'use strict';

angular.module('bricksApp.ui')
  .directive('editFrame', function ($http) {
    return {
      require: '^ui',
      link: function (scope, element, attrs, uiCtrl) {
        var iframe = element;
        var page = iframe.contents();
        var view;

        var select = function (e) {
          e.preventDefault();
          uiCtrl.selectElement(angular.element(e.target));
        };

        // Display the template HTML code.
        scope.$watch(function () {
          return uiCtrl.page().template;
        }, function (template) {
          if (view && template !== view.html()) {
            view.html(template);
          }
        });

        iframe.on('load', function () {
          view = page.find('div[ng-view]');
          view.html(uiCtrl.page().template);

          page.on('click', select);
        });

        $http.get('edit.html', {cache: true})
          .success(function (response) {
            page[0].open();
            page[0].write(response);
            page[0].close();
          });
      }
    };
  });
