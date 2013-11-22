'use strict';

angular.module('bricksApp.ui')
  .directive('draggable', function() {
    return  function (scope, element, attrs) {
      var hadDraggable;

      // Makes an element on the page draggable, saves previous
      // draggable status and the element being dragged.
      // Used to restore draggable attribute of an element if
      // necessary.
      var makeDraggable = function (e) {
        var target = angular.element(e.target);

        if (!target.is('html, body, div[ng-view]')) {
          hadDraggable = e.target.getAttribute('draggable');
          e.target.setAttribute('draggable', true);

          target.on('dragstart', function (e) {
            e.originalEvent.dataTransfer.effectAllowed = 'move';
            element.data('dragging', target);
          });

          target.on('dragend', function (e) {
            e.target.removeAttribute('draggable');
            element.removeData('dragging');
          });
        }
      };

      var destroyDraggable = function (e) {
        if (hadDraggable) {
          e.target.setAttribute('draggable', hadDraggable);
        } else {
          e.target.removeAttribute('draggable');
        }
      };

      if (element[0].tagName === 'IFRAME') {
        element.on('load', function () {
          element.contents().on({
            mousedown: makeDraggable,
            mouseup: destroyDraggable
          });
        });
      } else {
        element.on('dragstart', function (e) {
          var html = scope.$eval(attrs.html);
          e.originalEvent.dataTransfer.effectAllowed = 'move';
          e.originalEvent.dataTransfer.setData('text/plain', html);
        });
      }
    };
  });
