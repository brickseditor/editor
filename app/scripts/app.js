'use strict';

angular.module('bricksApp', [
    'ngAnimate',
    'ngRoute',
    'ui.codemirror',
    'bricksApp.common',
    'bricksApp.about',
    'bricksApp.apps',
    'bricksApp.database',
    'bricksApp.settings',
    'bricksApp.start',
    'bricksApp.storage',
    'bricksApp.ui'
  ])

  .config(function ($routeProvider) {
    $routeProvider
      .otherwise({
        redirectTo: '/'
      });
  });
