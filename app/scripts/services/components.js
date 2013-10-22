'use strict';

angular.module('bricksApp')
  .service('components', function ($http) {
    var components = [];

    // Gets the components template and parses it to return an object.
    $http.get('views/components.html', {cache: true})
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
