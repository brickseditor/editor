'use strict';

angular.module('bricksApp.ui')

  .service('Overlay', function () {
    var Overlay = function (element, iframe) {
      var _this = this;

      this.element = element;
      this.iframe = iframe;

      iframe.on('load', function () {
        iframe.contents().on('scroll', _this.reposition.bind(_this));
      });
    };

    // Set the overlay position and dimensions according to the
    // target element and the iframe.
    Overlay.prototype.moveTo = function (target) {
      this.target = target;
      this.element.css({
        display: 'block',
        width: target.outerWidth() + 'px',
        height: target.outerHeight() + 'px'
      });
      this.reposition();
    };

    Overlay.prototype.reposition = function () {
      if (!this.target) {
        return;
      }

      var iframeDocument = this.iframe.contents();
      var iframeOffset = this.iframe.offset();
      var targetOffset = this.target.offset();
      var top = iframeOffset.top + targetOffset.top - iframeDocument.scrollTop();
      var left = iframeOffset.left + targetOffset.left - iframeDocument.scrollLeft();

      this.element.css({
        top: top + 'px',
        left: left + 'px'
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
        var iframe = angular.element('iframe[edit-frame]');

        iframe.on('load', function () {
          iframe.contents().on({
            'click mouseout': function () {
              element.hide();
            },
            mouseover: function (e) {
              overlay.moveTo(angular.element(e.target));
            }
          });
        });

        var overlay = new Overlay(element, iframe);
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
        var iframe = angular.element('iframe[edit-frame]');

        iframe.on('load', function () {
          iframe.contents().on('click', function (e) {
            if (element.is(':visible') && scope.selected[0] === e.target) {
              element.hide();
              scope.selected = null;
            } else {
              var target = angular.element(e.target);
              if (target.closest('div[ng-view]').length !== 0) {
                overlay.moveTo(target);
                scope.selected = target;
              }
            }
          });
        });

        var overlay = new Overlay(element, iframe);

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
          }
        };

        // Clones an element and selects the clone.
        scope.copy = function (e) {
          e.preventDefault();
          scope.selected = scope.selected.clone().insertAfter(scope.selected);
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
            uiCtrl.selectElement(scope.selected);
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
