'use strict';

angular.module('bricksApp.ui')
  .directive('droppable', function () {
    return {
      require: '^ui',
      link: function (scope, element, attrs, uiCtrl) {
        var dropTarget, view;

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

        var removeClass = function () {
          dropTarget.removeClass('bricks-dragover');
          if (dropTarget.attr('class') === '') {
            dropTarget.removeAttr('class');
          }
        };

        var dragleave = function () {
          removeClass();
        };

        // Insert element being dragged or component html and update
        // template property of the scope.
        var drop = function (e) {
          e.stopPropagation();

          var html = element.data('dragging');
          element.removeData('dragging');

          if (html) {
            html.removeAttr('draggable');
          } else {
            html = e.originalEvent.dataTransfer.getData('text/plain');
          }

          removeClass();
          insertComponent(html, e.target);
          uiCtrl.updateTemplate();
          scope.$apply();

          return false;
        };

        element.on('load', function () {
          var page = element.contents();

          view = page.find('div[ng-view]');

          page.on({
            dragover: dragover,
            dragleave: dragleave,
            drop: drop
          });
        });
      }
    };
  });
