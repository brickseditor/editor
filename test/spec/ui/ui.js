'use strict';

describe('Service: components', function () {
  var $httpBackend, components;

  beforeEach(angular.mock.module('bricksApp.ui'));

  beforeEach(inject(function (_$httpBackend_, _components_) {
    $httpBackend = _$httpBackend_;
    components = _components_;

    $httpBackend.when('GET', 'plugins/components.html').respond(
      '<component><name>test 1</name></component>' +
        '<component><name>test 2</name>' +
        '<selector>.test</selector>' +
        '<options><div>{{name}}</div></options>' +
        '<script>register("test 2", function (element) {' +
        'this.name = "test"});</script></component>'
    );
    $httpBackend.expectGET('plugins/components.html');
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should give the list of components', function () {
    components.all(function (all) {
      var keys = Object.keys(all);

      expect(keys.length).toBe(2);
      expect(keys[0]).toBe('test 1');
      expect(keys[1]).toBe('test 2');
    });
    $httpBackend.flush();
  });

  it('should iterate the list of components', function () {
    var all = [];
    components.each(function (component) {
      all.push(component);
    });
    $httpBackend.flush();

    expect(all.length).toBe(2);
    expect(all[0].name).toBe('test 1');
    expect(all[1].name).toBe('test 2');
  });

  it('should give the components for an element', function () {
    var element = angular.element('<div class="test"></div>');
    var all = [];
    components.forElement(element, function (component) {
      all.push(component);
    });
    $httpBackend.flush();

    expect(all[0].name).toBe('test 2');
    expect(all[0].options[0].textContent).toBe('test');
  });
});

describe('Directive: ui', function () {
  var $httpBackend, controller, element, scope, uiCtrl;

  beforeEach(module('bricksApp.ui'));

  beforeEach(module({
    apps: {
      current: function () {
        return {
          pages: [
            {url: '/first'},
            {url: '/second'}
          ]
        };
      }
    },
    beautify: {
      html: function (html) {
        return angular.element(html).append('beautified')[0].outerHTML;
      }
    }
  }));

  beforeEach(inject(function (_$compile_, _$httpBackend_, _$rootScope_) {
    $httpBackend = _$httpBackend_;
    $httpBackend.when('GET', 'plugins/components.html').respond(
      '<component><name>test 1</name></component>' +
        '<component><name>test 2</name></component>'
    );
    $httpBackend.expectGET('plugins/components.html');

    element = _$compile_(
      '<div ui><iframe src="about:blank"></div>'
    )(_$rootScope_).appendTo(window.document.body);

    scope = element.scope();
    uiCtrl = element.controller('ui');

    $httpBackend.flush();
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should load the components', function () {
    expect(Object.keys(scope.components).length).toBe(2);
  });

  it('should get the first page of the current app by default', function () {
    expect(uiCtrl.page().url).toBe('/first');
  });

  it('should set and get the current page', inject(function (beautify) {
    var page = {url: '/third', template: '<div></div>'};

    uiCtrl.page(page);

    expect(uiCtrl.page().url).toBe('/third');
    expect(uiCtrl.page().template).toBe('<div>beautified</div>');
  }));

  it('should set and get the selected element', function () {
    var element = angular.element('<div>');

    spyOn(scope, '$broadcast');
    uiCtrl.selection(element);

    expect(scope.$broadcast).toHaveBeenCalledWith('selection');
    expect(uiCtrl.selection()).toBe(element);
  });

  it('should not set the selected element twice', function () {
    var element = angular.element('<div>');

    spyOn(scope, '$broadcast');
    uiCtrl.selection(element);
    uiCtrl.selection(element);

    expect(scope.$broadcast.calls.length).toBe(1);
  });

  it('should update the template', function () {
    var iframe = element.find('iframe');

    iframe.on('load', function () {
      var content = '<div ng-view><div class="template"></div></div>';
      iframe.contents().find('body')[0].innerHTML = content;

      uiCtrl.updateTemplate();
      expect(uiCtrl.page().template).toBe('<div class="template">beautified</div>');
    }).trigger('load');
  });
});
