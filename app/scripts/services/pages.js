'use strict';

angular.module('bricksApp')
  .service('pages', function () {
    return {
      current: function () {
        return {template: ''};
      }
    };
  });
