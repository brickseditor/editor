'use strict';

// Start screen shown when no app.
// Redirects are done here by replacing the location path because
// there's no point in keeping the corresponding path in the browser history.
angular.module('bricksApp')
  .controller('StartCtrl', function ($location, $scope, apps) {
    if (apps.all().length > 0) {
      $location.path('/').replace();
    }

    // Creates an app, set it as the current one and redirect.
    $scope.addApp = function (app) {
      apps.add(app);
      apps.current(app);
      $location.path('/').replace();
    };
  });
