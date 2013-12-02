'use strict';

describe('Component: grid-column', function () {
  var options, component, scope, template;

  beforeEach(module('bricksApp'));
  beforeEach(module('components/grid-column.html'));

  beforeEach(inject(function ($compile, $templateCache, $rootScope) {
    var componentXML = $templateCache.get('components/grid-column.html');
    componentXML = angular.element(componentXML);

    component = {};
    [].forEach.call(componentXML[0].children, function (child) {
      component[child.nodeName.toLowerCase()] = child.innerHTML.trim();
    });

    options = $compile('<form>' + component.options + '</form>')($rootScope);
    scope = $rootScope;
    scope.options = {};
  }));

  it('should read the HTML classes of the selection', function () {
    scope.selection = angular.element(
      '<div class="col-lg-3 col-md-6 col-xs-12">'
    );
    eval(component['script']);
    scope.$digest();

    expect(options.find('#optionsGridColumnXs option:selected').text()).toBe('12');
    expect(options.find('#optionsGridColumnMd option:selected').text()).toBe('6');
    expect(options.find('#optionsGridColumnSm option:selected').text()).toBe('same as phones');
    expect(options.find('#optionsGridColumnLg option:selected').text()).toBe('3');
  });

  it('should write HTML classes to the selection', function () {
    scope.selection = angular.element('<div>');
    eval(component['script']);
    scope.options.widths = {sm: '12', md: '6'};
    scope.update();
    scope.$digest();

    expect(scope.selection.attr('class').split(' ').length).toBe(2);
    expect(scope.selection.hasClass('col-sm-12')).toBe(true);
    expect(scope.selection.hasClass('col-md-6')).toBe(true);
  });
});
