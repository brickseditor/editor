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

      var iframeWindow = this.iframe[0].contentWindow;
      var top = this.iframe[0].offsetTop - iframeWindow.pageYOffset;
      var left = this.iframe[0].offsetLeft - iframeWindow.pageXOffset;
      var offset = target.offset();

      return this.element.css({
        display: 'block',
        width: target.outerWidth() + 'px',
        height: target.outerHeight() + 'px',
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
          '<span>{{selector}}</span>' +
          '<a href="" title="Select parent" ng-click="parent($event)">' +
            '<span class="fa fa-level-up"></span></a>' +
          '<a href="" title="Duplicate" ng-click="copy($event)">' +
            '<span class="fa fa-copy"></span></a>' +
          '<a href="" title="Delete" ng-click="delete($event)">' +
            '<span class="fa fa-trash-o"></span></a>' +
        '</div></div>',
      link: function (scope, element, attrs, uiCtrl) {
        var overlay = new Overlay(element, {
          click: function (e) {
            if (element.is(':visible') && scope.selected[0] === e.target) {
              element.hide();
              scope.selected = null;
            } else {
              var target = angular.element(e.target);
              if (overlay.moveTo(target)) {
                scope.selected = target;
              }
            }
          }
        });

        var setSelector = function (element) {
          var id = element.attr('id');

          if (id) {
            scope.selector = '#' + id;
          } else {
            var classes = element.attr('class');
            var selector = element.prop('tagName').toLowerCase();

            if (classes) {
              scope.selector = selector + '.' + classes.split(/\s+/).join('.');
            } else {
              scope.selector = selector;
            }
          }
        };

        // Selects the parent of an element.
        scope.parent = function (e) {
          e.preventDefault();
          var parent = scope.selected.parent();
          if (!parent.is('div[ng-view]')) {
            scope.selected = parent;
            uiCtrl.selectElement(scope.selected);
          }
        };

        // Clones an element and selects the clone.
        scope.copy = function (e) {
          e.preventDefault();
          scope.selected = scope.selected.clone().insertAfter(scope.selected);
          uiCtrl.selectElement(scope.selected);
          uiCtrl.updateTemplate();
        };

        // Deletes selected element and trim parent element to remove
        // empty text nodes.
        scope.delete = function (e) {
          var parent = scope.selected.parent();

          e.preventDefault();

          scope.selected.remove();

          if (parent) {
            var html = parent.html();
            html = html ? parent.html().trim() : '';
            parent.html(html);
          }

          uiCtrl.updateTemplate();

          element.hide();
        };

        // Redraws selected element overlay when the element changes.
        scope.$watch('selected', function (selected) {
          if (selected) {
            overlay.moveTo(selected);
            setSelector(selected);
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
