'use strict';

describe('Component: grid-column', function () {
  var components, scope;

  beforeEach(module('bricksApp.ui'));
  beforeEach(module('components/grid-column.html'));

  beforeEach(inject(function (_$rootScope_, _$templateCache_, _components_) {
    _$templateCache_.put(
      'components/components.html',
      _$templateCache_.get('components/grid-column.html')
    );

    scope = _$rootScope_;
    components = _components_;
  }));

  it('should read the HTML classes of the selection', function () {
    components.forElement(
      '<div class="col-lg-3 col-md-6 col-xs-12">',
      function (component) {
        var options = component.options;

        expect(options.find('#optionsGridColumnXs option:selected').text()).toBe('12');
        expect(options.find('#optionsGridColumnMd option:selected').text()).toBe('6');
        expect(options.find('#optionsGridColumnSm option:selected').text()).toBe('same as phones');
        expect(options.find('#optionsGridColumnLg option:selected').text()).toBe('3');
      }
    );
  });

  it('should write HTML classes to the selection', function () {
    var element = angular.element('<div>');

    components.forElement(element, function (component) {
      scope.options.widths = {sm: '12', md: '6'};

      expect(element.attr('class').split(' ').length).toBe(2);
      expect(element.hasClass('col-sm-12')).toBe(true);
      expect(element.hasClass('col-md-6')).toBe(true);
    });
  });
});
