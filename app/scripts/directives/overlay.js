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
        var page = iframe.contents();
        var deleteButton = element.find('.delete');
        var selected;

        // Set the overlay position and dimensions according to the
        // target element and the iframe.
        var showElement = function (overlay, target) {
          var top = iframe[0].offsetTop;
          var left = iframe[0].offsetLeft;
          var offset = angular.element(target).offset();

          overlay.css('display', 'block')
            .css('width', target.clientWidth + 'px')
            .css('height', target.clientHeight + 'px')
            .css('top', (top + offset.top) + 'px')
            .css('left', (left + offset.left) + 'px');
        };

        var showHighlight = function (e) {
          if (['HTML', 'BODY'].indexOf(e.target.nodeName) === -1) {
            showElement(highlight, e.target);
          }
        };

        var showSelect = function (e) {
          if (['HTML', 'BODY'].indexOf(e.target.nodeName) === -1) {
            selected = e.target;
            showElement(select, selected);
          }
        };

        iframe.on('load', function () {
          page.on('mouseover', showHighlight);
          page.on('click', showSelect);
        });

        deleteButton.on('click', function (e) {
          e.preventDefault();
          angular.element(selected).remove();
          select.css('display', 'none');
        });
      }
    };
  });
