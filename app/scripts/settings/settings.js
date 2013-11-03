'use strict';

angular.module('bricksApp.settings', [
    'ngRoute',
    'bricksApp.common'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/settings', {
        templateUrl: 'scripts/settings/settings.html',
        controller: 'SettingsCtrl'
      });
  })

  .controller('SettingsCtrl', function ($location, $scope, $window, apps) {
    $scope.alerts = [];
    $scope.app = angular.copy(apps.current());
    $scope.storages = [
      {
        name: 'local',
        label: 'User\'s Device'
      },
      {
        name: 'firebase',
        label: 'Firebase'
      }
    ];

    // Watches for change to the current app.
    $scope.$watch(function () {
      return apps.current();
    }, function (app) {
      $scope.app = angular.copy(app);
    }, true);

    $scope.saveSettings = function () {
      if ($scope.settingsForm.$valid) {
        apps.update($scope.app);
        $scope.alerts.push({type: 'success', message: 'Settings saved.'});
      }
    };

    // Delete the app if the user confirms
    $scope.deleteApp = function (app) {
      var confirmed = $window.confirm(
        'Are you sure you want to delete the app "' + app.name +
        '"? There\'s no going back.'
      );
      if (confirmed) {
        apps.remove(app.id);
        $location.path('/');
      }
    };
  });
