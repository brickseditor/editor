'use strict';

describe('Component: description', function () {
  var options, component, scope, template;

  beforeEach(module('bricksApp'));
  beforeEach(module('components/description.html'));

  beforeEach(inject(function ($compile, $rootScope, $templateCache) {
    var componentXML = $templateCache.get('components/description.html');
    componentXML = angular.element(componentXML);

    component = {};
    [].forEach.call(componentXML[0].children, function (child) {
      component[child.nodeName.toLowerCase()] = child.innerHTML.trim();
    });

    options = $compile('<form>' + component.options + '</form>')($rootScope);
    scope = $rootScope;
    scope.options = {};
  }));

  it('should read the style of the selected list', function () {
    scope.selection = angular.element('<dl>');
    eval(component['script']);
    scope.$digest();

    var field = options.find('#optionsDescriptionStyle');
    expect(field.prop('checked')).toBe(false);

    scope.selection = angular.element('<dl class="dl-horizontal">');
    eval(component['script']);
    scope.$digest();

    var field = options.find('#optionsDescriptionStyle');
    expect(field.prop('checked')).toBe(true);
  });

  it('should change the style of the selected list', function () {
    scope.selection = angular.element('<dl>');
    eval(component['script']);

    scope.options.horizontal = true;
    scope.update();
    expect(scope.selection.hasClass('dl-horizontal')).toBe(true);

    scope.options.horizontal = false;
    scope.update();
    expect(scope.selection.hasClass('dl-horizontal')).toBe(false);
  });
});
