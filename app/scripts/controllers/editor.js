'use strict';

angular.module('bricksApp')
  .controller('EditorCtrl', function ($http, $scope) {
    // Load components.
    $scope.components = [];
    $http.get('views/components.html', {cache: true})
    .success(function (response) {
      jQuery(response).find('component').each(function (i, component) {
        var object = {};

        [].forEach.call(component.children, function (child) {
          object[child.nodeName.toLowerCase()] = child.innerHTML.trim();
        });
        $scope.components.push(object);
      });
    });

    // Load the default page template.
    $scope.currentPage = {};
    if (!$scope.currentPage.template) {
      $http.get('views/default-template.html', {cache: true})
      .success(function (response) {
        $scope.currentPage.template = response;
      });
    }

    $scope.loadPanel = function (type) {
      $scope.panel = type;
    };
  });
