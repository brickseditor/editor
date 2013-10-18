'use strict';

angular.module('bricksApp')
  .controller('SettingsCtrl', function ($location, $scope, $window, apps) {
    $scope.deleteApp = function () {
      var app = apps.current();
      var confirmed = $window.confirm('Are you sure you want to delete the app "' +
                                    app.name + '"? There\'s no going back.');
      if (confirmed) {
        apps.remove(app.id);
        $location.path('/');
      }
    };
  });
