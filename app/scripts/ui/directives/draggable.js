'use strict';

angular.module('bricksApp.ui')
  .directive('draggable', function() {
    return  function (scope, element, attrs) {
      element.on('dragstart', function (e) {
        var html = scope.$eval(attrs.html);
        e.originalEvent.dataTransfer.effectAllowed = 'move';
        e.originalEvent.dataTransfer.setData('text/plain', html);
      });
    };
  });
