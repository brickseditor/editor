'use strict';

angular.module('bricksApp')
  .service('pages', function ($http) {
    var defaultPage = {template: ''};

    $http.get('views/default-template.html', {cache: true})
      .success(function (response) {
        defaultPage.template = response;
      });

    return {
      current: function () {
        return defaultPage;
      }
    };
  });
