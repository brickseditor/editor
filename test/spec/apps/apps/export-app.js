'use strict';

describe('Directive: exportApp', function () {
  var $httpBackend, element, scope, zipApp;

  beforeEach(module('bricksApp.apps', function ($provide) {
    zipApp = {save: jasmine.createSpy()};
    $provide.value('zipApp', zipApp);
  }));

  beforeEach(inject(function (_$compile_, _$httpBackend_, _$rootScope_) {
    $httpBackend = _$httpBackend_;
    $httpBackend.when('GET', 'build.html').respond('<head></head>test html');
    $httpBackend.when('GET', 'plugins/styles.css').respond('style');
    $httpBackend.when('GET', 'scripts/build.js').respond('script');

    _$rootScope_.currentApp = {name: 'test'};

    element = angular.element('<div export-app="currentApp">');
    element = _$compile_(element)(_$rootScope_);

    scope = element.isolateScope();
    scope.$digest();
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should zip and download the app on click', function () {
    scope.exportApp().then(function () {
      expect(zipApp.save).toHaveBeenCalledWith('test', {
        'index.html' : '<head>\n<script>window.bricksApp = ' +
          'JSON.parse(\'{"name":"test"}\');</script>\n</head>test html',
        'styles/build.css': 'style',
        'scripts/build.js': 'script'
      });
    });

    $httpBackend.flush();
  });
});
