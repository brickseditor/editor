'use strict';

angular.module('bricksApp')
  .controller('EditorCtrl', function ($scope) {
    $scope.components = [
      {
        name: 'test 1',
        html: '<div>test 1</div>',
        thumbnail: 'http://placehold.it/32x32'
      },
      {
        name: 'test 2',
        html: '<div>test 2</div>',
        thumbnail: 'http://placehold.it/32x32'
      }
    ];
  });
