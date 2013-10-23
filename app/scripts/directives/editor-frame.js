'use strict';

angular.module('bricksApp')
  .directive('editorFrame', function ($http) {
    return {
      replace: true,
      restrict: 'E',
      scope: {template: '='},
      template: '<div id="canvas"><iframe src="about:blank"></iframe>' +
        '<overlay iframe="#canvas iframe"></overlay></div>',
      link: function (scope, element) {
        var hadDraggable, dragging;
        var iframe = element.find('iframe');
        var page = iframe.contents();
        var selection, template, view;

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

        // Changes the scope template attribute.
        var setTemplate = function () {
          style.detach();
          if (selection) {
            selection.removeClass('bricks-selected');
          }

          template = view.html();
          scope.template = template;

          page.find('head').append(style);
        };

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
              dragging = element;
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

          if (element.is('div[ng-view], :empty')) {
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
             !parent[0].hasAttribute('ng-view')) {
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
          setTemplate();
          scope.$apply();

          return false;
        };

        var selectElement = function (e) {
          var element = angular.element(e.target);

          if (!element.is('html, body, [ng-view]')) {
            if (selection) {
              selection.removeClass('bricks-selected');
            }
            selection = element.addClass('bricks-selected');

            scope.$emit('select', '#canvas iframe');
          }
        };

        // Display the template HTML code.
        scope.$watch('template', function (html) {
          if (view && html && html !== template) {
            view.html(template);
          }
        });

        iframe.on('load', function () {
          view = page.find('div[ng-view]');
          view.html(scope.template);

          page.on('click', selectElement);

          page.on('dragover', dragover);
          page.on('dragleave', dragleave);
          page.on('drop', drop);

          page.on('mouseover', makeDraggable);
          page.on('mouseout', destroyDraggable);
        });

        // Receive external change events to update the template.
        scope.$on('changed', function () {
          setTemplate();
        });

        $http.get('views/layout.html', {cache: true})
          .success(function (response) {
            page[0].open();
            page[0].write(response);
            page[0].close();
          });
      }
    };
  });
