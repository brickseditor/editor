'use strict';

angular.module('bricksApp')
  .directive('editor', function ($timeout, components, apps) {
    return {
      controller: function ($scope, $element) {
        var iframe = $element.find('iframe');
        var selectedElement, view;

        // Changes the scope template attribute.
        var updateTemplate = function () {
          if (selectedElement) {
            selectedElement.removeClass('bricks-selected');
          }
          if (!view) {
            view = iframe.contents().find('div[ng-view]');
          }
          $scope.currentPage.template = view.html();
        };

        var selectElement = function (element) {
          if (!element.is('html, body, [ng-view]')) {
            if (selectedElement) {
              selectedElement.removeClass('bricks-selected');
            }
            selectedElement = element.addClass('bricks-selected');
            $scope.$broadcast('selection');
          }
        };

        var selection = function () {
          return selectedElement;
        };

        var page = function () {
          return $scope.currentPage;
        };

        return {
          iframe: iframe,
          updateTemplate: updateTemplate,
          selectElement: selectElement,
          selection: selection,
          page: page
        };
      },

      link: function (scope) {
        scope.components = components.all();
        scope.app = apps.current();
        scope.newPage = {template: ''};
        scope.savePageText = 'Save Page';

        scope.codemirrorOptions = {
          lineWrapping : true,
          lineNumbers: true,
          mode: {
            name: 'xml',
            htmlMode: true
          },
          theme: 'base16-dark'
        };

        if (!scope.app.pages || scope.app.pages.length === 0) {
          scope.app.pages = [{url: '/', template: ''}];
        }
        scope.currentPage = scope.app.pages[0];

        scope.addPage = function () {
          var newPage = angular.copy(scope.newPage);

          scope.app.pages.push(newPage);
          apps.update(scope.app);
          scope.currentPage = newPage;

          scope.newPage = {template: ''};
          scope.showNewPageModal = false;
        };

        scope.deletePage = function (page) {
          scope.app.pages.some(function (p, i) {
            if (page.url === p.url) {
              scope.app.pages.splice(i, 1);
              return true;
            }
          });
          apps.update(scope.app);
          scope.currentPage = scope.app.pages[0];
        };

        // Saves the current page.
        scope.savePage = function () {
          apps.update(scope.app);

          scope.savePageText = 'Saving...';
          $timeout(function () {
            scope.savePageText = 'Save Page';
          }, 1000);
        };
      }
    };
  });
