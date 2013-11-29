'use strict';

(function (window) {
  window.Firebase = function () {
    var fns = {};
    ['child', 'once', 'remove', 'set'].forEach(function (m) {
      fns[m] = function () {
        return fns;
      };
    });

    var Firebase = function (url) {
      fns.name = function () {
        return url.split('/').pop();
      };

      angular.extend(this, fns);
      return fns;
    };
    Firebase.fns = fns;

    return Firebase;
  };

  window.angularFireCollection = function (data) {
    var angularFireCollection = function (ref, initial, change) {
      var collectionName = ref.name();
      var collection = data[collectionName] ? data[collectionName] : [];

      collection = angular.copy(collection);

      ['getByName', 'add', 'update', 'remove'].forEach(function (m) {
        collection[m] = function () {};
      });

      return collection;
    };

    return angularFireCollection;
  };

})(window);
