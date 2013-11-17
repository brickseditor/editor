'use strict';

angular.module('bricksApp.ui')
  .directive('droppable', function () {
    return {
      require: '^ui',
      link: function (scope, element, attrs, uiCtrl) {
        var hadDraggable, dragging;
        var iframe = element;
        var dropTarget, view;

        // Makes an element on the page draggable, saves previous
        // draggable status and the element being dragged.
        // Used to restore draggable attribute of an element if
        // necessary.
        var makeDraggable = function (e) {
          var element = angular.element(e.target);

          if (!element.is('html, body, div[ng-view]')) {
            hadDraggable = e.target.draggable;
            e.target.draggable = true;

            element.on('dragstart', function (e) {
              e.originalEvent.dataTransfer.effectAllowed = 'move';
              dragging = angular.element(e.target);
            });
          }
        };

        var destroyDraggable = function (e) {
          if (!hadDraggable) {
            e.target.removeAttribute('draggable');
          }
        };

        // Insert a node or HTML code after an element, into the body
        // element or an empty one.
        var insertNode = function (node, element) {
          element = angular.element(element);

          if (element.is('html, body')) {
            element = view;
          }

          if (element.is('div[ng-view], :empty:not(input, textarea)')) {
            element.append(node);
          } else {
            element.after(node);
          }
        };

        // Inserts a component into the page.
        // Adds empty class to the component or previous parent if necessary.
        // Removes empty class from destination.
        var insertComponent = function (node, element) {
          var parent;

          element = angular.element(element);

          if (angular.isElement(node)) {
            parent = node.parent();
          } else {
            node = angular.element(node);
          }

          insertNode(node, element);

          if (parent) {
            parent.html(parent.html().trim());
          }
        };

        // This enable drop behaviour.
        var dragover = function (e) {
          e.preventDefault();
          e.originalEvent.dataTransfer.dropEffect = 'move';

          dropTarget = angular.element(e.target);
          dropTarget.addClass('bricks-dragover');
        };

        var dragleave = function () {
          dropTarget.removeClass('bricks-dragover');
        };

        // Insert element being dragged or component html and update
        // template property of the scope.
        var drop = function (e) {
          var html;

          e.stopPropagation();

          if (dragging) {
            dragging[0].removeAttribute('draggable');
            html = dragging;
            dragging = null;
          } else {
            html = e.originalEvent.dataTransfer.getData('text/plain');
          }

          dropTarget.removeClass('bricks-dragover');
          insertComponent(html, e.target);
          uiCtrl.updateTemplate();
          scope.$apply();

          return false;
        };

        iframe.on('load', function () {
          var page = iframe.contents();

          view = page.find('div[ng-view]');

          page.on({
            dragover: dragover,
            dragleave: dragleave,
            drop: drop,
            mousedown: makeDraggable,
            mouseup: destroyDraggable
          });
        });
      }
    };
  });
