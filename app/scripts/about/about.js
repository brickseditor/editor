'use strict';

angular.module('bricksApp.about', ['ngRoute'])

  .config(function ($routeProvider) {
    $routeProvider
      .when('/about', {
        templateUrl: 'scripts/about/about.html',
        controller: 'AboutCtrl'
      });
  })

  .controller('AboutCtrl', function () {});
