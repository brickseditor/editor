'use strict';

angular.module('bricksApp')
  .directive('overlay', function() {
    return {
      replace: true,
      restrict: 'E',
      template: '<div class="overlay">',
      link: function (scope, element, attrs) {
        var iframe = angular.element(attrs.iframe);
        var page = iframe.contents();
        var top = iframe[0].offsetTop;
        var left = iframe[0].offsetLeft;

        // Set the overlay position and dimensions according to the
        // target element and the iframe.
        var show = function (target) {
          element.css('width', target.clientWidth + 'px')
            .css('height', target.clientHeight + 'px')
            .css('top', (top + target.offsetTop) + 'px')
            .css('left', (left + target.offsetLeft) + 'px');
        };

        var mouseover = function (e) {
          if (['HTML', 'BODY'].indexOf(e.target.nodeName) === -1) {
            show(e.target);
          }
        };

        iframe.on('load', function () {
          page.on('mouseover', mouseover);
        });
      }
    };
  });
