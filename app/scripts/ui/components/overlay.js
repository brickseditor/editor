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
      if (target.closest('div[ng-view]').length === 0) {
        return;
      }

      var top = this.iframe[0].offsetTop;
      var left = this.iframe[0].offsetLeft;
      var offset = target.offset();

      return this.element.css({
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
        var overlay = new Overlay(element, {
          'click mouseout': function () {
            element.hide();
          },
          mouseover: function (e) {
            overlay.moveTo(angular.element(e.target));
          }
        });
      }
    };
  })

  .directive('overlaySelect', function (Overlay) {
    return {
      replace: true,
      require: '^ui',
      restrict: 'E',
      template: '<div class="overlay-select"><div class="actions">' +
          '<a href="" ng-click="copy($event)"><span class="fa fa-copy">' +
            '</span></a>' +
          '<a href="" ng-click="delete($event)"><span class="fa fa-trash-o">' +
            '</span></a>' +
        '</div></div>',
      link: function (scope, element, attrs, uiCtrl) {
        var selected;

        var overlay = new Overlay(element, {
          click: function (e) {
            if (element.is(':visible') && selected[0] === e.target) {
              element.hide();
              selected = null;
            } else {
              var target = angular.element(e.target);
              if (overlay.moveTo(target)) {
                selected = target;
              }
            }
          }
        });

        // Clones an element and selects the clone.
        scope.copy = function (e) {
          e.preventDefault();
          selected = selected.clone().insertAfter(selected);
          overlay.moveTo(selected);
        };

        // Deletes selected element and trim parent element to remove
        // empty text nodes.
        scope.delete = function (e) {
          var parent = selected.parent();

          e.preventDefault();

          selected.remove();

          if (parent) {
            var html = parent.html();
            html = html ? parent.html().trim() : '';
            parent.html(html);
          }

          uiCtrl.updateTemplate();

          element.hide();
        };

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
