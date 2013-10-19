'use strict';

// Start screen shown when no app.
// Redirects are done here by replacing the location path because
// there's no point in keeping the corresponding path in the browser history.
angular.module('bricksApp')
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
