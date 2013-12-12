'use strict';

describe('Directive: events', function () {
  var element, scope, uiCtrl;

  beforeEach(module('bricksApp.ui'));
  beforeEach(module('scripts/ui/ui/components/events.html'));

  beforeEach(inject(function ($compile, $rootScope, $templateCache) {
    $templateCache.put('plugins/components.html', '');

    var ui = $compile(angular.element('<div ui>'))($rootScope);
    var selection = angular.element(
      '<input event-database-row-added="custom()" ng-change="add(\'puppy\', puppy)"' +
      'ng-dblclick="visit(\'/puppies/:puppy\', puppy)">'
    );

    uiCtrl = ui.controller('ui');
    spyOn(uiCtrl, 'selection').andReturn(selection);
    spyOn(uiCtrl, 'updateTemplate');

    element = angular.element('<events>').appendTo(ui);
    element = $compile(element)($rootScope);

    $rootScope.$digest();

    scope = element.isolateScope();
  }));

  it('types() should not return the used events', function () {
    scope.$broadcast('selection');

    scope.events = [{type: 'click'}, {type: 'change'}];
    var types = scope.types();

    expect(types.indexOf('database row added')).not.toBe(-1);
    expect(types.indexOf('click')).toBe(-1);
    expect(types.indexOf('change')).toBe(-1);
  });

  it('on selection should read the events from the selection attributes', function () {
    scope.$broadcast('selection');

    expect(scope.selection).not.toBe(null);
    expect(scope.events).toEqual([
      {type: 'change', action: 'add', object: 'puppy'},
      {type: 'dblclick', action: 'visit', object: '/puppies/:puppy'},
      {type: 'database row added', action: 'custom', object: 'custom()'}
    ]);
  });

  it('addEvent() should add the event to the selection', function () {
    var events = [
      {type: 'change', action: 'remove', object: 'cat'},
      {type: 'dblclick', action: 'visit', object: '/cats/:cat'},
      {type: 'submit', action: 'visit', object: '/cats'},
      {type: 'focus', action: 'custom', object: 'meow()'}
    ];

    scope.$broadcast('selection');

    scope.events = [];
    events.forEach(function (event) {scope.addEvent(event)});

    expect(scope.events).toEqual(events);

    expect(scope.selection.attr('ng-change')).toBe('remove(\'cat\', cat)');
    expect(scope.selection.attr('ng-dblclick')).toBe('visit(\'/cats/:cat\', cat)');
    expect(scope.selection.attr('ng-submit')).toBe('visit(\'/cats\')');
    expect(scope.selection.attr('ng-focus')).toBe('meow()');

    expect(uiCtrl.updateTemplate.calls.length).toEqual(4);
  });

  it('removeEvent() should remove the event from the selection', function () {
    scope.$broadcast('selection');

    var event = scope.events[1];

    scope.removeEvent(event);
    expect(scope.events.indexOf(event)).toBe(-1);
    expect(scope.selection.attr('ng-' + event.type)).toBe(undefined);
  });
});
