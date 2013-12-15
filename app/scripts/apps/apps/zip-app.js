'use strict';

angular.module('bricksApp.apps')
  .factory('zipApp', function ($log, $window, IS_NODE_WEBKIT) {
    return {
      create: function (name, files) {
        var zip = new JSZip();
        var root = zip.folder(name);

        Object.keys(files).forEach(function (path) {
          root.file(path, files[path]);
        });

        return zip;
      },

      save: function (name, files) {
        var filename = name + '.zip';
        var zip = this.create(name, files);

        if (IS_NODE_WEBKIT) {
          var element = angular.element(
            '<input type="file" class="hidden" nwsaveas="' + filename + '">'
          ).appendTo(angular.element('body'));

          element.on('change', function (e) {
            var path = e.target.value;
            this.saveZipToFileSystem(path, zip);
          }.bind(this));
          element.trigger('click');
        } else {
          saveAs(zip.generate({type: 'blob'}), filename);
        }
      },

      saveZipToFileSystem: function (path, zip) {
        var fs = require('fs');
        var file = zip.generate({type: 'nodebuffer'});

        // Add the extension in case it wasn't there
        path = path.replace(/\.zip$/, '') + '.zip';

        fs.writeFile(path, file, function (err) {
          if (err) {
            $log.error(err);
            $window.alert('Unable to write the file ' + path);
          }
        });
      }
    };
  });
