'use strict';

describe('Directive: events', function () {
  var element, scope, types, uiCtrl;

  beforeEach(module('bricksApp.ui'));
  beforeEach(module('scripts/ui/ui/components/events.html'));

  beforeEach(inject(function ($compile, $rootScope, $templateCache) {
    types = ('blur change click copy cut dblclick focus keydown ' +
             'keyup keypress mousedown mouseenter mouseleave mousemove ' +
             'mouseout mouseover mouseup paste submit').split(' ');

    $templateCache.put('components/components.html', '');

    var ui = $compile(angular.element('<div ui>'))($rootScope);
    var selection = angular.element(
      '<input ng-focus="custom()" ng-change="add(\'puppy\', puppy)"' +
      'ng-dblclick="visit(\'/puppies/{{puppy.id}}\')">'
    );

    uiCtrl = ui.controller('ui');
    spyOn(uiCtrl, 'selection').andReturn(selection);
    spyOn(uiCtrl, 'updateTemplate');

    element = angular.element('<events>').appendTo(ui);
    element = $compile(element)($rootScope);

    $rootScope.$digest();

    scope = element.isolateScope();
  }));

  it('types() should return the event types except the used ones', function () {
    expect(scope.types()).toEqual(types);

    scope.$broadcast('selection');

    scope.events = [{type: 'click'}, {type: 'change'}];
    expect(scope.types()).toEqual(_.without(types, 'click', 'change'));
  });

  it('on selection should read the events from the selection attributes', function () {
    scope.$broadcast('selection');

    expect(scope.selection).not.toBe(null);
    expect(scope.events).toEqual([
      {type: 'change', action: 'add', object: 'puppy'},
      {type: 'dblclick', action: 'visit', object: '/puppies/:puppy'},
      {type: 'focus', action: 'custom', object: 'custom()'}
    ]);
  });

  it('addEvent() should add the event to the selection', function () {
    var events = [
      {type: 'change', action: 'remove', object: 'cat'},
      {type: 'dblclick', action: 'visit', object: '/cats/:cat'},
      {type: 'focus', action: 'custom', object: 'meow()'}
    ];

    scope.$broadcast('selection');

    scope.events = [];
    events.forEach(function (event) {scope.addEvent(event)});

    expect(scope.events).toEqual(events);

    expect(scope.selection.attr('ng-change')).toBe('remove(\'cat\', cat)');
    expect(scope.selection.attr('ng-dblclick')).toBe('visit(\'/cats/{{cat.id}}\')');
    expect(scope.selection.attr('ng-focus')).toBe('meow()');

    expect(uiCtrl.updateTemplate.calls.length).toEqual(3);
  });

  it('removeEvent() should remove the event from the selection', function () {
    scope.$broadcast('selection');

    var event = scope.events[1];

    scope.removeEvent(event);
    expect(scope.events.indexOf(event)).toBe(-1);
    expect(scope.selection.attr('ng-' + event.type)).toBe(undefined);
  });
});
