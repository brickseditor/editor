'use strict';

describe('Component: list', function () {
  var options, component, scope, template;

  beforeEach(module('bricksApp'));
  beforeEach(module('components/list.html'));

  beforeEach(inject(function ($compile, $rootScope, $templateCache) {
    var componentXML = $templateCache.get('components/list.html');
    componentXML = angular.element(componentXML);

    component = {};
    [].forEach.call(componentXML[0].children, function (child) {
      component[child.nodeName.toLowerCase()] = child.innerHTML.trim();
    });

    options = $compile('<form>' + component.options + '</form>')($rootScope);
    scope = $rootScope;
    scope.options = {};
  }));

  it('should read the type of the selected list', function () {
    scope.selection = angular.element('<ul>');
    eval(component['script']);
    scope.$digest();

    expect(options.find('#optionsListType').val()).toBe('UL');

    scope.selection = angular.element('<ol>');
    eval(component['script']);
    scope.$digest();

    expect(options.find('#optionsListType').val()).toBe('OL');
  });

  it('should change the type of the selected node', function () {
    scope.selection = angular.element('<ol>');
    eval(component['script']);

    scope.options.type = 'UL';
    scope.update();

    expect(scope.selection.prop('nodeName')).toBe('UL');

    scope.options.type = 'OL';
    scope.update();

    expect(scope.selection.prop('nodeName')).toBe('OL');
  });

  it('should read the style of the selected list', function () {
    scope.selection = angular.element('<ol>');
    eval(component['script']);
    scope.$digest();

    var select = options.find('#optionsListStyle option:selected');
    expect(select.text()).toBe('normal');

    scope.selection = angular.element('<ol class="list-unstyled">');
    eval(component['script']);
    scope.$digest();

    var select = options.find('#optionsListStyle option:selected');
    expect(select.text()).toBe('unstyled');

    scope.selection = angular.element('<ol class="list-inline">');
    eval(component['script']);
    scope.$digest();

    var select = options.find('#optionsListStyle option:selected');
    expect(select.text()).toBe('inline');
  });

  it('should change the style of the selected list', function () {
    scope.selection = angular.element('<ul>');
    eval(component['script']);

    scope.options.style = 'unstyled';
    scope.update();
    expect(scope.selection.hasClass('list-unstyled')).toBe(true);
    expect(scope.selection.hasClass('list-inline')).toBe(false);

    scope.options.style = 'inline';
    scope.update();
    expect(scope.selection.hasClass('list-unstyled')).toBe(false);
    expect(scope.selection.hasClass('list-inline')).toBe(true);

    scope.options.style = '';
    scope.update();
    expect(scope.selection.hasClass('list-unstyled')).toBe(false);
    expect(scope.selection.hasClass('list-inline')).toBe(false);
  });
});
