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
          if (element && !element.is('html, body, [ng-view]') &&
              selectedElement !== element) {
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

        components.all(function (all) {
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

  .service('components', function ($compile, $http, $rootScope, $templateCache) {
    // Gets the components template and parses it to return an object.
    var promise = $http.get('plugins/components.html', {cache: $templateCache})
      .then(function (response) {
        var components = {};

        var register = function (name, script) {
          components[name].script = script;
        };

        angular.element('<div>' + response.data + '</div>').find('component')
          .each(function (i, component) {
            var object = {
              name: component.getAttribute('name'),
              title: component.getAttribute('title')
            };

            [].forEach.call(component.children, function (child) {
              object[child.nodeName.toLowerCase()] = child.innerHTML.trim();
            });
            components[object.name] = object;

            if (object.script) {
              (new Function('register', object.script))(register); // jshint ignore:line
            }
          });

        return components;
      });

    var compileOptions = function (component, element) {
      if (!component.options) {
        return;
      }

      var scope = $rootScope.$new(true);

      if (component.script) {
        angular.extend(scope, new component.script(element));
      }

      return $compile(component.options)(scope);
    };

    return {
      all: function (cb) {
        promise.then(cb);
      },

      each: function (cb) {
        promise.then(function (components) {
          Object.keys(components).forEach(function (name) {
            cb(components[name]);
          });
        });
      },

      forElement: function (element, cb) {
        promise.then(function (components) {
          Object.keys(components).forEach(function (name) {
            var component = angular.copy(components[name]);

            if (!element.is) {
              element = angular.element(element);
            }

            if (element.is(component.selector)) {
              component.options = compileOptions(component, element);
              cb(component);
            }
          });
        });
      }
    };
  });
