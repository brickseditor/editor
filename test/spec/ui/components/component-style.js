'use strict';

describe('Directive: componentStyle', function () {
  var element, scope, uiCtrl;

  beforeEach(module('bricksApp.ui'));
  beforeEach(module('scripts/ui/ui/components/component-style.html'));

  beforeEach(inject(function ($compile, $rootScope, $templateCache) {
    $templateCache.put(
      'components/components.html',
      '<components><component>' +
        '<name>test</name>' +
        '<template><div>test</div></template>' +
        '<selector>.test</selector>' +
        '<admin><div class="admin">admin</div></admin>' +
        '<admin-script>scope.options.test = "yes"</admin-script>' +
        '<component></components>'
    );

    var ui = $compile(angular.element('<div ui>'))($rootScope);
    var selection = angular.element('<div class="test">');

    uiCtrl = ui.controller('ui');
    spyOn(uiCtrl, 'selection').andReturn(selection);
    spyOn(uiCtrl, 'updateTemplate');

    element = angular.element('<component-style>').appendTo(ui);
    element = $compile(element)($rootScope);

    $rootScope.$digest();

    scope = element.isolateScope();
  }));

  it('should set the scope objects used by the components', function () {
    expect(scope.options).toEqual({});
    expect(scope.select).toEqual(uiCtrl.selection);
    expect(typeof(scope.update)).toBe('function');
    expect(typeof(scope.change)).toBe('function');
  });

  it('should update the template', function () {
    spyOn(scope, 'update');
    scope.change();
    expect(scope.update).toHaveBeenCalled();
    expect(uiCtrl.updateTemplate).toHaveBeenCalled();
  });

  it('should set the selected element', inject(function ($timeout) {
    scope.$emit('selection');
    $timeout.flush();
    expect(scope.selection[0].tagName).toBe('DIV');
    expect(scope.selection[0].className).toBe('test');
    expect(scope.component.name).toBe('test');
    expect(scope.component.template).toBe('<div>test</div>');
    expect(scope.options.test).toBe('yes');
    expect(element.find('form .admin').length).toBe(1);
  }));
});
