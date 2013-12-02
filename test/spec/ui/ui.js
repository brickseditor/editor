'use strict';

describe('Service: components', function () {
  var $httpBackend;

  beforeEach(angular.mock.module('bricksApp.ui'));

  beforeEach(inject(function (_$httpBackend_) {
    $httpBackend = _$httpBackend_;
    $httpBackend.when('GET', 'components/components.html')
      .respond('<component><name>test 1</name></component>' +
               '<component><name>test 2</name></component>');
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should give the list of components', inject(function (components) {
    $httpBackend.expectGET('components/components.html');
    components.all().then(function (all) {
      expect(all.length).toEqual(2);
    });
    $httpBackend.flush();
  }));
});

describe('Directive: ui', function () {
  var controller, element, scope, uiCtrl;

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

  beforeEach(inject(function ($compile, $rootScope, $templateCache) {
    $templateCache.put(
      'components/components.html',
      '<component><name>test 1</name></component>' +
        '<component><name>test 2</name></component>'
    );

    element = $compile('<div ui><iframe src="about:blank"></div>')($rootScope);
    element.appendTo(window.document.body);
    scope = element.scope();
    uiCtrl = element.controller('ui');
  }));

  it('should load the components', inject(function ($timeout) {
    $timeout(function () {
      expect(scope.components.length).toBe(2);
    });
  }));

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
