'use strict';

describe('Directive: exportApp', function () {
  var element, httpBackend, saveAs, scope;

  beforeEach(module('bricksApp.ui'));

  beforeEach(inject(function ($compile, $httpBackend, $rootScope) {
    httpBackend = $httpBackend;
    httpBackend.when('GET', 'build.html').respond('<head></head>test html');
    httpBackend.when('GET', 'scripts/build.js').respond('script');

    scope = $rootScope;
    scope.currentApp = {name: 'test'};

    element = angular.element('<div export-app>');
    element = $compile(element)(scope);

    scope.$digest();
  }));

  afterEach(function () {
    httpBackend.verifyNoOutstandingExpectation();
    httpBackend.verifyNoOutstandingRequest();
  });

  it('should zip and download the app on click', function () {
    element.on('click', function (e) {
      expect(e.isDefaultPrevented()).toBe(true);
    });

    spyOn(scope, 'exportZip').andCallFake(function (zip, name) {
      expect(name).toBe('test.zip');
      expect(zip.file(/.*/).length).toBe(2);

      var index = zip.file(/index\.html/);

      expect(index[0].name).toBe('test/index.html');
      expect(index[0]._data).toBe(
        '<head>\n<script>window.bricksApp = ' +
        'JSON.parse(\'{"name":"test"}\');</script>\n</head>test html'
      );

      var script = zip.file(/build\.js/);

      expect(script[0].name).toBe('test/scripts/build.js');
      expect(script[0]._data).toBe('script');
    });

    element.trigger('click');

    httpBackend.flush();
  });
});
