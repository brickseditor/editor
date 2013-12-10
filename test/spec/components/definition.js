'use strict';

describe('Component: description', function () {
  var components, scope;

  beforeEach(module('bricksApp.ui'));
  beforeEach(module('components/description.html'));

  beforeEach(inject(function (_$rootScope_, _$templateCache_, _components_) {
    _$templateCache_.put(
      'components/components.html',
      _$templateCache_.get('components/description.html')
    );

    scope = _$rootScope_;
    components = _components_;
  }));

  it('should read the style of the selected list', function () {
    components.forElement('<dl>', function (component) {
      var field = component.options.find('#optionsDescriptionStyle');

      expect(field.prop('checked')).toBe(false);
    });

    components.forElement('<dl class="dl-horizontal">', function (component) {
      var field = component.options.find('#optionsDescriptionStyle');

      expect(field.prop('checked')).toBe(true);
    });
  });

  it('should change the style of the selected list', function () {
    var element = angular.element('<dl>');

    components.forElement(element, function (component) {
      scope.options.horizontal = true;
      scope.update();
      expect(element.hasClass('dl-horizontal')).toBe(true);

      scope.options.horizontal = false;
      scope.update();
      expect(element.hasClass('dl-horizontal')).toBe(false);
    });
  });
});
