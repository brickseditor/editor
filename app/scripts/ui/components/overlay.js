'use strict';

angular.module('bricksApp.ui')

  .factory('Overlay', function () {
    var Overlay = function (element, events) {
      var iframe = this.iframe = angular.element('iframe[edit-frame]');

      this.element = element;

      iframe.on('load', function () {
        iframe.contents().on(events);
      });
    };

    // Set the overlay position and dimensions according to the
    // target element and the iframe.
    Overlay.prototype.moveTo = function (target) {
      var top = this.iframe[0].offsetTop;
      var left = this.iframe[0].offsetLeft;
      var offset = target.offset();

      this.element.css({
        display: 'block',
        width: target[0].clientWidth + 'px',
        height: target[0].clientHeight + 'px',
        top: (top + offset.top) + 'px',
        left: (left + offset.left) + 'px'
      });
    };

    return Overlay;
  })

  .directive('overlayHighlight', function (Overlay) {
    return {
      replace: true,
      require: '^ui',
      restrict: 'E',
      template: '<div class="overlay-highlight"></div>',
      link: function (scope, element) {
        var showElement = function (e) {
          var target = angular.element(e.target);

          if (!target.is('html, body, div[ng-view]')) {
            overlay.moveTo(target);
          }
        };

        var overlay = new Overlay(element, {
          'click mouseout': function () {element.hide();},
          mouseover: showElement
        });
      }
    };
  })

  .directive('overlaySelect', function (Overlay) {
    return {
      replace: true,
      require: '^ui',
      restrict: 'E',
      template: '<div class="overlay-select"><a href="" class="delete">' +
        '<span class="glyphicon glyphicon-trash"></span></a></div>',
      link: function (scope, element, attrs, uiCtrl) {
        var deleteButton = element.find('.delete');
        var selected;

        var showElement = function (e) {
          var target = angular.element(e.target);

          if (!target.is('html, body, div[ng-view]')) {
            selected = target;
            overlay.moveTo(target);
          }
        };

        var overlay = new Overlay(element, {click: showElement});

        deleteButton.on('click', function (e) {
          var parent = selected.parent();

          e.preventDefault();

          selected.remove();

          if (parent) {
            parent.html(parent.html().trim());
          }

          uiCtrl.updateTemplate();

          element.hide();
        });

        // Redraws selected element overlay when the element changes.
        scope.$watch(function () {
          return selected && selected.prop('outerHTML');
        }, function () {
          if (selected) {
            overlay.moveTo(selected);
          }
        });

        scope.$watch(function () {
          return uiCtrl.page();
        }, function () {
          element.hide();
        });
      }
    };
  });
