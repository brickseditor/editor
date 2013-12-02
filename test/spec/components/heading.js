'use strict';

describe('Component: heading', function () {
  var options, component, scope, template;

  beforeEach(module('bricksApp'));
  beforeEach(module('components/heading.html'));

  beforeEach(inject(function ($compile, $rootScope, $templateCache) {
    var componentXML = $templateCache.get('components/heading.html');
    componentXML = angular.element(componentXML);

    component = {};
    [].forEach.call(componentXML[0].children, function (child) {
      component[child.nodeName.toLowerCase()] = child.innerHTML.trim();
    });

    options = $compile('<form>' + component.options + '</form>')($rootScope);
    scope = $rootScope;
    scope.options = {};
  }));

  it('should read the type of the selected node', function () {
    scope.selection = angular.element('<h3>');
    eval(component['script']);
    scope.$digest();

    var select = options.find('#optionsHeadingType option:selected');
    expect(select.text()).toBe('heading 3');

    scope.selection = angular.element('<h5>');
    eval(component['script']);
    scope.$digest();

    var select = options.find('#optionsHeadingType option:selected');
    expect(select.text()).toBe('heading 5');
  });

  it('should change the type of the selected node', function () {
    scope.selection = angular.element('<h2>');
    eval(component['script']);

    scope.options.type = 'H4';
    scope.update();

    expect(scope.selection.prop('nodeName')).toBe('H4');

    scope.options.type = 'H6';
    scope.update();

    expect(scope.selection.prop('nodeName')).toBe('H6');
  });
});
