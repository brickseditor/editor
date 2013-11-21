'use strict';

angular.module('bricksApp', [
    'ngAnimate',
    'ngRoute',
    'ngGrid',
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

  .constant(
    'IS_NODE_WEBKIT',
    typeof process === 'object' && process.versions &&
      process.versions['node-webkit']
  )


  .config(function ($routeProvider) {
    $routeProvider
      .otherwise({
        redirectTo: '/'
      });
  });
