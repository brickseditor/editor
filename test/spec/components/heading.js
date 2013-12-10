'use strict';

describe('Component: heading', function () {
  var components, scope;

  beforeEach(module('bricksApp.ui'));
  beforeEach(module('components/heading.html'));

  beforeEach(inject(function (_$rootScope_, _$templateCache_, _components_) {
    _$templateCache_.put(
      'components/components.html',
      _$templateCache_.get('components/heading.html')
    );

    scope = _$rootScope_;
    components = _components_;
  }));

  it('should read the type of the selected node', function () {
    components.forElement('<h3>', function (component) {
      var select = component.options.find('#optionsHeadingType option:selected');
      expect(select.text()).toBe('heading 3');
    });

    components.forElement('<h5>', function (component) {
      var select = component.options.find('#optionsHeadingType option:selected');
      expect(select.text()).toBe('heading 5');
    });
  });

  it('should change the type of the selected node', function () {
    var element = angular.element('<h2>');

    components.forElement(element, function (component) {
      scope.options.type = 'H4';
      expect(element.prop('nodeName')).toBe('H4');

      scope.options.type = 'H6';
      expect(element.prop('nodeName')).toBe('H6');
    });
  });
});
