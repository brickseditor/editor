'use strict';

(function (window) {
  var stub = function () {
    var out = {};
    angular.forEach(arguments, function(m) {
      out[m] = jasmine.createSpy();
    });
    return out;
  }

  window.Firebase = function () {
    // firebase is invoked using new Firebase, but we need a static ref
    // to the functions before it is instantiated, so we cheat here by
    // attaching the functions as Firebase.fns, and ignore new (we don't use `this` or `prototype`)
    var fns = stub('set');
    customSpy(fns, 'child', function() { return fns; });
    fns.child = function () {
      return fns;
    };
    spyOn(fns, 'child').andCallThrough();

    var Firebase = function() {
      angular.extend(this, fns);
      return fns;
    };
    Firebase.fns = fns;

    return Firebase;
  }

  window.angularFireAuth = function () {
    var auth = stub('login', 'logout', 'createAccount', 'changePassword');
    auth._authClient = stub('changePassword', 'createUser');
    return auth;
  }

})(window);
