'use strict';

angular.module('bricksApp')
  .directive('editorFrame', function () {
    return {
      replace: true,
      restrict: 'E',
      scope: {template: '='},
      template: '<div id="canvas"><iframe src="about:blank"></iframe>' +
        '<overlay iframe="#canvas iframe"></overlay></div>',
      link: function (scope, element) {
        var hadDraggable, dragging;
        var page = element.find('iframe').contents();
        var body;

        // Element inserted in the page for highlighting the place where
        // the dragged element will be inserted.
        // Dragged elements are inserted in the body element or after
        // the element they are dragged over.
        var highlight = angular.element('<div style="width: 100%; height: 3px;' +
                                        'background:#428bca;">');

        // CSS code inserted in the page to highlight empty elements
        var style = angular.element('<style>');
        style.append('.bricks-empty {min-height: 50px; min-width: 50px; ' +
                     'border: 4px dashed #f0ad4e;}');

        // Makes an element on the page draggable, saves previous
        // draggable status and the element being dragged.
        // Used to restore draggable attribute of an element if
        // necessary.
        var makeDraggable = function (e) {
          if (['HTML', 'BODY'].indexOf(e.target.nodeName) > -1) {
            return;
          }

          var element = angular.element(e.target);

          hadDraggable = e.target.draggable;
          e.target.draggable = true;

          element.on('dragstart', function (e) {
            e.originalEvent.dataTransfer.effectAllowed = 'move';
            dragging = element;
          });
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

          if ('HTML' === element[0].nodeName) {
            element = body;
          }

          if ('BODY' === element[0].nodeName || element.is(':empty')) {
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

          element.removeClass('bricks-empty');

          if (parent && parent.text().trim() === '' &&
             parent[0].nodeName !== 'BODY') {
            parent.addClass('bricks-empty');
          }

          if (node.text().trim() === '') {
            node.addClass('bricks-empty');
          }
        };

        // This enable drop behaviour.
        var dragover = function (e) {
          e.preventDefault();
          e.originalEvent.dataTransfer.dropEffect = 'move';
          insertNode(highlight, e.target);
        };

        var dragleave = function () {
          highlight.remove();
        };

        // Insert element being dragged or component html and update
        // template property of the scope.
        var drop = function (e) {
          var html;

          e.stopPropagation();

          if (dragging) {
            html = dragging;
            dragging = null;
          } else {
            html = e.originalEvent.dataTransfer.getData('text/plain');
          }

          highlight.remove();
          insertComponent(html, e.target);
          scope.template = '<!DOCTYPE html>' + page[0].documentElement.outerHTML;

          return false;
        };

        // Writes HTML code in the iframe and bind drop events.
        var displayHTML = function (html) {
          page[0].open();
          page[0].write(html);
          page[0].close();

          body = page.find('body');

          page.find('head').append(style);

          page.on('dragover', dragover);
          page.on('dragleave', dragleave);
          page.on('drop', drop);

          page.on('mouseover', makeDraggable);
          page.on('mouseout', destroyDraggable);
        };

        // Display the template HTML code.
        scope.$watch('template', function (template) {
          if (template) {
            displayHTML(template);
          }
        });
      }
    };
  });
