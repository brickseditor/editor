'use strict';

angular.module('bricksApp.ui', [
    'ngRoute',
    'bricksApp.common'
  ])

  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'scripts/ui/views/ui.html',
        controller: 'UiCtrl'
      });
  });
