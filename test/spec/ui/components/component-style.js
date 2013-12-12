'use strict';

describe('Directive: componentStyle', function () {
  var element, scope, selection, uiCtrl;

  beforeEach(module('bricksApp.ui'));
  beforeEach(module('scripts/ui/ui/components/component-style.html'));

  beforeEach(inject(function ($compile, $rootScope, $templateCache) {
    $templateCache.put(
      'plugins/components.html',
      '<component>' +
        '<name>test</name>' +
        '<template><div>test</div></template>' +
        '<selector>.test</selector>' +
        '<options><div class="admin">{{options.test}}</div></options>' +
        '<script>register("test", function (selection) {' +
        'this.options = {test: selection[0].tagName}; this.update = function () {};' +
        '});</script>' +
        '<component>'
    );

    var ui = $compile(angular.element('<div ui>'))($rootScope);

    selection = angular.element('<div class="test">');

    uiCtrl = ui.controller('ui');
    spyOn(uiCtrl, 'selection').andReturn(selection);
    spyOn(uiCtrl, 'updateTemplate');

    element = angular.element('<component-style>').appendTo(ui);
    element = $compile(element)($rootScope);

    $rootScope.$digest();

    scope = element.isolateScope();
  }));

  it('should update the template', function () {
    scope.selection = selection;
    scope.$digest();
    expect(uiCtrl.selection).toHaveBeenCalled();
    expect(uiCtrl.updateTemplate).toHaveBeenCalled();
  });

  it('should set the selected element', inject(function ($timeout) {
    scope.$emit('selection');
    $timeout.flush();

    var admin = element.find('form .admin');

    expect(scope.selection[0].tagName).toBe('DIV');
    expect(scope.selection[0].className).toBe('test');
    expect(admin.length).toBe(1);
    expect(admin.html()).toBe(selection[0].tagName);
  }));
});
