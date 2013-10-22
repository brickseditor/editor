'use strict';

angular.module('bricksApp')
  .directive('overlay', function() {
    return {
      replace: true,
      restrict: 'E',
      template: '<div class="overlay"><a href="" class="delete">' +
        '<span class="glyphicon glyphicon-trash"></span></a></div>',
      link: function (scope, element, attrs) {
        var iframe = angular.element(attrs.iframe);
        var page = iframe.contents();
        var top = iframe[0].offsetTop;
        var left = iframe[0].offsetLeft;
        var deleteButton = element.find('.delete');
        var target;

        // Set the overlay position and dimensions according to the
        // target element and the iframe.
        var show = function (target) {
          var offset = angular.element(target).offset();
          element.css('display', 'block')
            .css('width', target.clientWidth + 'px')
            .css('height', target.clientHeight + 'px')
            .css('top', (top + offset.top) + 'px')
            .css('left', (left + offset.left) + 'px');
        };

        var mouseover = function (e) {
          if (['HTML', 'BODY'].indexOf(e.target.nodeName) === -1) {
            target = e.target;
            show(target);
          }
        };

        iframe.on('load', function () {
          page.on('mouseover', mouseover);
        });

        deleteButton.on('click', function (e) {
          e.preventDefault();
          angular.element(target).remove();
          element.css('display', 'none');
        });
      }
    };
  });
