'use strict';

angular.module('bricksApp.ui', [
    'ngRoute',
    'bricksApp.common'
  ])

  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'scripts/ui/ui.html'
      });
  })

  .directive('ui', function (components, apps) {
    return {
      controller: function ($scope, $element) {
        var iframe = $element.find('iframe');
        var selectedElement, view;
        var currentPage = apps.current().pages[0];

        // Changes the scope template attribute.
        var updateTemplate = function () {
          if (selectedElement) {
            selectedElement.removeClass('bricks-selected');
          }
          if (!view) {
            view = iframe.contents().find('div[ng-view]');
          }
          currentPage.template = html_beautify(view.html());
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

        var selection = function (element) {
          if (element) {
            selectedElement = element;
            $scope.$broadcast('selection');
          } else {
            return selectedElement;
          }
        };

        var page = function (current) {
          if (current) {
            current.template = html_beautify(current.template);
            currentPage = current;
          } else {
            return currentPage;
          }
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
      }
    };
  })

  .service('components', function ($http) {
    var components = [];

    // Gets the components template and parses it to return an object.
    $http.get('scripts/ui/components/components.html', {cache: true})
      .success(function (response) {
        jQuery(response).find('component').each(function (i, component) {
          var object = {};

          [].forEach.call(component.children, function (child) {
            object[child.nodeName.toLowerCase()] = child.innerHTML.trim();
          });
          components.push(object);
        });
      });

    return {
      all: function () {
        return components;
      }
    };
  });
