'use strict';

describe('Service: components', function () {
  var $httpBackend;

  beforeEach(angular.mock.module('bricksApp.ui'));

  beforeEach(inject(function ($injector) {
    $httpBackend = $injector.get('$httpBackend');
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
