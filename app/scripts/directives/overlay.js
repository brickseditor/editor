'use strict';

angular.module('bricksApp')
  .directive('overlay', function() {
    return {
      replace: true,
      restrict: 'E',
      template: '<div class="overlay"><div class="overlay-highlight"></div>' +
        '<div class="overlay-select"><a href="" class="delete">' +
        '<span class="glyphicon glyphicon-trash"></span></a></div>',
      link: function (scope, element, attrs) {
        var iframe = angular.element(attrs.iframe);
        var select = element.find('.overlay-select');
        var highlight = element.find('.overlay-highlight');
        var deleteButton = element.find('.delete');
        var selected;

        // Set the overlay position and dimensions according to the
        // target element and the iframe.
        var showElement = function (overlay, target) {
          var top = iframe[0].offsetTop;
          var left = iframe[0].offsetLeft;
          var offset = target.offset();

          overlay.css('display', 'block')
            .css('width', target[0].clientWidth + 'px')
            .css('height', target[0].clientHeight + 'px')
            .css('top', (top + offset.top) + 'px')
            .css('left', (left + offset.left) + 'px');
        };

        var showHighlight = function (e) {
          var target = angular.element(e.target);

          if (!target.is('html, body, div[ng-view]')) {
            showElement(highlight, target);
          }
        };

        var showSelect = function (e) {
          var target = angular.element(e.target);

          if (!target.is('html, body, div[ng-view]')) {
            selected = target;
            showElement(select, target);
            highlight.hide();
          }
        };

        iframe.on('load', function () {
          var page = iframe.contents();
          page.on('mouseover', showHighlight);
          page.on('click', showSelect);
        });

        deleteButton.on('click', function (e) {
          var parent = selected.parent();

          e.preventDefault();

          selected.remove();

          if (parent) {
            parent.html(parent.html().trim());
          }

          select.hide();
        });

        // Redraws selected element overlay when the element changes.
        scope.$watch(function () {
          return selected && selected.prop('outerHTML');
        }, function () {
          if (selected) {
            showElement(select, selected);
          }
        });
      }
    };
  });
