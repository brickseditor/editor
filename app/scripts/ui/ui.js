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

  .directive('ui', function (apps, beautify, components) {
    return {
      scope: true,
      controller: function ($scope, $element) {
        var iframe = $element.find('iframe');
        var currentPage, selectedElement, view;

        // Changes the scope template attribute.
        var updateTemplate = function () {
          if (!view) {
            view = iframe.contents().find('div[ng-view]');
          }
          page().template = beautify.html(view.html());
        };

        var selection = function (element) {
          if (element && !element.is('html, body, [ng-view]')) {
            selectedElement = element;
            $scope.$broadcast('selection');
          } else {
            return selectedElement;
          }
        };

        var page = function (current) {
          if (current) {
            current.template = beautify.html(current.template);
            currentPage = current;
          } else {
            if (!currentPage) {
              currentPage = apps.current().pages[0];
            }
            return currentPage;
          }
        };

        components.all().then(function (all) {
          $scope.components = all;
        });

        return {
          updateTemplate: updateTemplate,
          selection: selection,
          page: page
        };
      }
    };
  })

  .service('components', function ($http, $templateCache) {
    // Gets the components template and parses it to return an object.
    var promise = $http.get('components/components.html', {cache: $templateCache})
      .then(function (response) {
        var components = [];

        angular.element('<div>' + response.data + '</div>').find('component')
          .each(function (i, component) {
            var object = {};

            [].forEach.call(component.children, function (child) {
              object[child.nodeName.toLowerCase()] = child.innerHTML.trim();
            });
            components.push(object);
          });

        return components;
      });

    return {
      all: function () {
        return promise;
      }
    };
  });
