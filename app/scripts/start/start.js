'use strict';

// Start screen shown when no app.
// Redirects are done here by replacing the location path because
// there's no point in keeping the corresponding path in the browser history.
angular.module('bricksApp.start', [
    'ngRoute',
    'bricksApp.common'
  ])

  .config(function ($routeProvider) {
    $routeProvider
      .when('/start', {
        templateUrl: 'scripts/start/start.html',
        controller: 'StartCtrl'
      });
  })

  .run(function (apps, $location, $rootScope) {
    $rootScope.$on('$locationChangeStart', function (e, newUrl) {
      if (apps.all().length === 0 && newUrl.indexOf('/start') === -1) {
        $location.path('/start');
      }
    });
  })

  .controller('StartCtrl', function ($location, $scope, apps) {
    if (apps.all().length > 0) {
      $location.path('/').replace();
    }

    $scope.app = {};

    // Creates an app, set it as the current one and redirect.
    $scope.addApp = function () {
      if ($scope.newAppForm.$valid) {
        apps.add($scope.app);
        apps.current($scope.app);
        $location.path('/').replace();
      }
    };
  });
