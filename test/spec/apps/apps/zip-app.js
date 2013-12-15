'use strict';

describe('Factory: zipApp', function () {
  var files, zipApp;

  beforeEach(module('bricksApp.apps', function ($provide) {
    $provide.value('IS_NODE_WEBKIT', false);
  }));

  beforeEach(function () {
    files = {
      'index.html': 'index html',
      'scripts/build.js': 'scripts build'
    };
  });

  it('should create zips', inject(function (zipApp) {
    var zip = zipApp.create('name', files);

    expect(zip.file(/.*/).length).toBe(2);

    var index = zip.file(/index.html/)[0];
    expect(index.name).toBe('name/index.html');
    expect(index._data).toBe('index html');

    var scripts = zip.file(/scripts\/build\.js/)[0];
    expect(scripts.name).toBe('name/scripts/build.js');
    expect(scripts._data).toBe('scripts build');
  }));

  describe('in the browser', function () {
    it('should call saveAs() with the zip object and its name', inject(function (zipApp) {
      spyOn(window, 'saveAs').andCallFake(function (zip, filename) {
        expect(filename).toBe('name.zip');
      });

      zipApp.save('name', files);
      expect(saveAs).toHaveBeenCalled();
    }));
  });

  describe('in node-webkit', function () {
    beforeEach(function ($provide) {
      $provide.value('IS_NODE_WEBKIT', true);
    });
  });
});
