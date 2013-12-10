'use strict';

describe('Component: list', function () {
  var components, scope;

  beforeEach(module('bricksApp.ui'));
  beforeEach(module('components/list.html'));

  beforeEach(inject(function (_$rootScope_, _$templateCache_, _components_) {
    _$templateCache_.put(
      'components/components.html',
      _$templateCache_.get('components/list.html')
    );

    scope = _$rootScope_;
    components = _components_;
  }));

  it('should read the type of the selected list', function () {
    components.forElement('<ul>', function (component) {
      expect(component.options.find('#optionsListType').val()).toBe('UL');
    });

    components.forElement('<ol>', function (component) {
      expect(component.options.find('#optionsListType').val()).toBe('OL');
    });
  });

  it('should change the type of the selected node', function () {
    var element = angular.element('<ol>');

    components.forElement(element, function (component) {
      scope.options.type = 'UL';
      expect(element.prop('nodeName')).toBe('UL');

      scope.options.type = 'OL';
      expect(element.prop('nodeName')).toBe('OL');
    });
  });

  it('should read the style of the selected list', function () {
    components.forElement('<ol>', function (component) {
      var select = component.options.find('#optionsListStyle option:selected');
      expect(select.text()).toBe('normal');
    });

    components.forElement('<ol class="list-unstyled">', function (component) {
      var select = component.options.find('#optionsListStyle option:selected');
      expect(select.text()).toBe('unstyled');
    });

    components.forElement('<ol class="list-inline">', function (component) {
      var select = options.find('#optionsListStyle option:selected');
      expect(select.text()).toBe('inline');
    });
  });

  it('should change the style of the selected list', function () {
    var element = angular.element('<ul>');

    components.forElement(element, function (component) {
      scope.options.style = 'unstyled';
      expect(element.hasClass('list-unstyled')).toBe(true);
      expect(element.hasClass('list-inline')).toBe(false);

      scope.options.style = 'inline';
      expect(element.hasClass('list-unstyled')).toBe(false);
      expect(element.hasClass('list-inline')).toBe(true);

      scope.options.style = '';
      expect(element.hasClass('list-unstyled')).toBe(false);
      expect(element.hasClass('list-inline')).toBe(false);
    });
  });
});
