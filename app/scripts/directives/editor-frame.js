'use strict';

angular.module('bricksApp')
  .directive('editorFrame', function ($http, $timeout) {
    return {
      replace: true,
      restrict: 'E',
      scope: {template: '='},
      template: '<iframe src="about:blank" seamless></iframe>',
      link: function (scope, element) {
        var hadDraggable, dragging;
        var iframe = element;
        var page = iframe.contents();
        var dropTarget, selection, template, view;

        // Changes the scope template attribute.
        var setTemplate = function () {
          if (selection) {
            selection.removeClass('bricks-selected');
          }

          template = view.html();
          scope.template = template;
          $timeout(function () {
            scope.$apply();
          });
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
          setTemplate();

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
            view.html(scope.template);
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
