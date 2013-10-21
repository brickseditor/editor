'use strict';

angular.module('bricksApp')
  .directive('canvas', function ($http) {
    return {
      replace: true,
      restrict: 'E',
      template: '<div id="canvas"><iframe src="about:blank"></iframe>' +
        '<overlay iframe="#canvas iframe"></overlay></div>',
      link: function (scope, element) {
        var hadDraggable, dragging;
        var page = element.find('iframe').contents();

        // Element inserted in the page for highlighting the place where
        // the dragged element will be inserted.
        // Dragged elements are inserted in the body element or after
        // the element they are dragged over.
        var highlight = angular.element('<div style="width: 100%; height: 3px;' +
                                        'background:#428bca;">');

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

        // Insert a node or HTML code into the body or after an element.
        var insert = function (node, element) {
          if ('HTML' === element.nodeName) {
            element = page.find('body');
          } else {
            element = angular.element(element);
          }

          if ('BODY' === element[0].nodeName) {
            element.append(node);
          } else {
            element.after(node);
          }
        };

        var dragenter = function (e) {
          insert(highlight, e.target);
        };

        // This enable drop behaviour.
        var dragover = function (e) {
          e.preventDefault();
          e.originalEvent.dataTransfer.dropEffect = 'move';
        };

        var dragleave = function () {
          highlight.remove();
        };

        // Insert element being dragged or component html.
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

          insert(html, e.target);

          return false;
        };

        // Writes HTML code in the iframe and bind drop events.
        var loadHTML = function (html) {
          page[0].open();
          page[0].write(html);
          page[0].close();

          page.on('dragenter', dragenter);
          page.on('dragover', dragover);
          page.on('dragleave', dragleave);
          page.on('drop', drop);

          page.on('mouseover', makeDraggable);
          page.on('mouseout', destroyDraggable);
        };

        // Load the default template.
        $http.get('views/default-template.html', {cache: true})
          .then(function (response) {
            loadHTML(response.data);
          });
      }
    };
  });
