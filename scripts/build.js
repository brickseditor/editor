//     uuid.js
//
//     Copyright (c) 2010-2012 Robert Kieffer
//     MIT License - http://opensource.org/licenses/mit-license.php

(function() {
  var _global = this;

  // Unique ID creation requires a high quality random # generator.  We feature
  // detect to determine the best RNG source, normalizing to a function that
  // returns 128-bits of randomness, since that's what's usually required
  var _rng;

  // Node.js crypto-based RNG - http://nodejs.org/docs/v0.6.2/api/crypto.html
  //
  // Moderately fast, high quality
  if (typeof(require) == 'function') {
    try {
      var _rb = require('crypto').randomBytes;
      _rng = _rb && function() {return _rb(16);};
    } catch(e) {}
  }

  if (!_rng && _global.crypto && crypto.getRandomValues) {
    // WHATWG crypto-based RNG - http://wiki.whatwg.org/wiki/Crypto
    //
    // Moderately fast, high quality
    var _rnds8 = new Uint8Array(16);
    _rng = function whatwgRNG() {
      crypto.getRandomValues(_rnds8);
      return _rnds8;
    };
  }

  if (!_rng) {
    // Math.random()-based (RNG)
    //
    // If all else fails, use Math.random().  It's fast, but is of unspecified
    // quality.
    var  _rnds = new Array(16);
    _rng = function() {
      for (var i = 0, r; i < 16; i++) {
        if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
        _rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
      }

      return _rnds;
    };
  }

  // Buffer class to use
  var BufferClass = typeof(Buffer) == 'function' ? Buffer : Array;

  // Maps for number <-> hex string conversion
  var _byteToHex = [];
  var _hexToByte = {};
  for (var i = 0; i < 256; i++) {
    _byteToHex[i] = (i + 0x100).toString(16).substr(1);
    _hexToByte[_byteToHex[i]] = i;
  }

  // **`parse()` - Parse a UUID into it's component bytes**
  function parse(s, buf, offset) {
    var i = (buf && offset) || 0, ii = 0;

    buf = buf || [];
    s.toLowerCase().replace(/[0-9a-f]{2}/g, function(oct) {
      if (ii < 16) { // Don't overflow!
        buf[i + ii++] = _hexToByte[oct];
      }
    });

    // Zero out remaining bytes if string was short
    while (ii < 16) {
      buf[i + ii++] = 0;
    }

    return buf;
  }

  // **`unparse()` - Convert UUID byte array (ala parse()) into a string**
  function unparse(buf, offset) {
    var i = offset || 0, bth = _byteToHex;
    return  bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]];
  }

  // **`v1()` - Generate time-based UUID**
  //
  // Inspired by https://github.com/LiosK/UUID.js
  // and http://docs.python.org/library/uuid.html

  // random #'s we need to init node and clockseq
  var _seedBytes = _rng();

  // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
  var _nodeId = [
    _seedBytes[0] | 0x01,
    _seedBytes[1], _seedBytes[2], _seedBytes[3], _seedBytes[4], _seedBytes[5]
  ];

  // Per 4.2.2, randomize (14 bit) clockseq
  var _clockseq = (_seedBytes[6] << 8 | _seedBytes[7]) & 0x3fff;

  // Previous uuid creation time
  var _lastMSecs = 0, _lastNSecs = 0;

  // See https://github.com/broofa/node-uuid for API details
  function v1(options, buf, offset) {
    var i = buf && offset || 0;
    var b = buf || [];

    options = options || {};

    var clockseq = options.clockseq != null ? options.clockseq : _clockseq;

    // UUID timestamps are 100 nano-second units since the Gregorian epoch,
    // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
    // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
    // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
    var msecs = options.msecs != null ? options.msecs : new Date().getTime();

    // Per 4.2.1.2, use count of uuid's generated during the current clock
    // cycle to simulate higher resolution clock
    var nsecs = options.nsecs != null ? options.nsecs : _lastNSecs + 1;

    // Time since last uuid creation (in msecs)
    var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;

    // Per 4.2.1.2, Bump clockseq on clock regression
    if (dt < 0 && options.clockseq == null) {
      clockseq = clockseq + 1 & 0x3fff;
    }

    // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
    // time interval
    if ((dt < 0 || msecs > _lastMSecs) && options.nsecs == null) {
      nsecs = 0;
    }

    // Per 4.2.1.2 Throw error if too many uuids are requested
    if (nsecs >= 10000) {
      throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
    }

    _lastMSecs = msecs;
    _lastNSecs = nsecs;
    _clockseq = clockseq;

    // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
    msecs += 12219292800000;

    // `time_low`
    var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
    b[i++] = tl >>> 24 & 0xff;
    b[i++] = tl >>> 16 & 0xff;
    b[i++] = tl >>> 8 & 0xff;
    b[i++] = tl & 0xff;

    // `time_mid`
    var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
    b[i++] = tmh >>> 8 & 0xff;
    b[i++] = tmh & 0xff;

    // `time_high_and_version`
    b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
    b[i++] = tmh >>> 16 & 0xff;

    // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
    b[i++] = clockseq >>> 8 | 0x80;

    // `clock_seq_low`
    b[i++] = clockseq & 0xff;

    // `node`
    var node = options.node || _nodeId;
    for (var n = 0; n < 6; n++) {
      b[i + n] = node[n];
    }

    return buf ? buf : unparse(b);
  }

  // **`v4()` - Generate random UUID**

  // See https://github.com/broofa/node-uuid for API details
  function v4(options, buf, offset) {
    // Deprecated - 'format' argument, as supported in v1.2
    var i = buf && offset || 0;

    if (typeof(options) == 'string') {
      buf = options == 'binary' ? new BufferClass(16) : null;
      options = null;
    }
    options = options || {};

    var rnds = options.random || (options.rng || _rng)();

    // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
    rnds[6] = (rnds[6] & 0x0f) | 0x40;
    rnds[8] = (rnds[8] & 0x3f) | 0x80;

    // Copy bytes to buffer, if provided
    if (buf) {
      for (var ii = 0; ii < 16; ii++) {
        buf[i + ii] = rnds[ii];
      }
    }

    return buf || unparse(rnds);
  }

  // Export public API
  var uuid = v4;
  uuid.v1 = v1;
  uuid.v4 = v4;
  uuid.parse = parse;
  uuid.unparse = unparse;
  uuid.BufferClass = BufferClass;

  if (typeof define === 'function' && define.amd) {
    // Publish as AMD module
    define(function() {return uuid;});
  } else if (typeof(module) != 'undefined' && module.exports) {
    // Publish as node.js module
    module.exports = uuid;
  } else {
    // Publish as global (in browsers)
    var _previousRoot = _global.uuid;

    // **`noConflict()` - (browser only) to reset global 'uuid' var**
    uuid.noConflict = function() {
      _global.uuid = _previousRoot;
      return uuid;
    };

    _global.uuid = uuid;
  }
}).call(this);

'use strict';

angular.module('bricksApp.storage', ['firebase'])

  .service('localStorage', function ($window) {
    var data = {};
    var indexes = {};
    var prefix;

    var getTable = function (tableName) {
      var dataString = $window.localStorage.getItem(prefix + tableName);
      return dataString ? angular.fromJson(dataString) : [];
    };

    var saveTable = function (tableName, success, error) {
      var dataString = data[tableName] ?
        angular.toJson(data[tableName]) :
        '';
      var saved = false;

      try {
        $window.localStorage.setItem(prefix + tableName, dataString);
        saved = true;
      } catch (e) {
        if (error) {
          error();
        }
      } finally {
        if (saved && success) {
          success();
        }
      }
    };

    var getIndex = function (tableName, id) {
      var index;

      if (indexes[tableName]) {
        index = indexes[tableName][id];
      } else {
        index = -1;
      }

      return index;
    };

    var updateIndexes = function (tableName, start) {
      start = start || 0;

      indexes[tableName] = indexes[tableName] || [];

      for (var i = start; i < data[tableName].length; i++) {
        var id = data[tableName][i].id;
        indexes[tableName][id] = i;
      }
    };

    var load = function (tableName, success) {
      if (!data[tableName]) {
        data[tableName] = getTable(tableName);
        updateIndexes(tableName);
      }

      if (success) {
        success();
      }

      return data[tableName];
    };

    var Storage = function (app) {
      prefix = 'bricks_app_' + app.id + '_';

      return Storage;
    };

    Storage.all = function (tableName, success, error) {
      return load(tableName, success, error);
    };

    Storage.get = function (tableName, id, success, error) {
      load(tableName);

      var index = getIndex(tableName, id);

      if (index > -1) {
        if (success) {
          success();
        }

        return data[tableName][index];
      }

      if (error) {
        error();
      }
    };

    Storage.add = function (tableName, row, success, error) {
      load(tableName);

      var date = (new Date()).toISOString().split('.')[0].replace('T', ' ');

      row.id = uuid();
      row.created_at = date; // jshint ignore:line
      row.updated_at = date; // jshint ignore:line

      data[tableName] = data[tableName] || [];
      indexes[tableName] = indexes[tableName] || {};

      var index = data[tableName].length;

      indexes[tableName][row.id] = index;
      data[tableName][index] = row;

      saveTable(tableName, success, error);
    };

    Storage.update = function (tableName, row, success, error) {
      load(tableName);

      var index = getIndex(tableName, row.id);

      if (index > -1) {
        data[tableName][index] = row;

        return saveTable(tableName, success, error);
      }

      if (error) {
        error();
      }
    };

    Storage.remove = function (tableName, row, success, error) {
      load(tableName);

      var index = getIndex(tableName, row.id);

      if (index > -1) {
        data[tableName].splice(index, 1);
        updateIndexes(tableName, index);

        return saveTable(tableName, success, error);
      }

      if (error) {
        error();
      }
    };

    Storage.clear = function (tableName, success, error) {
      load(tableName);

      indexes[tableName] = {};
      data[tableName].length = 0;

      saveTable(tableName, success, error);
    };

    return Storage;
  })

  .factory('firebaseStorage', function (Firebase, angularFireCollection) {
    var data = {};
    var url;

    var Storage = function (app) {
      url = 'https://' + app.settings.firebase + '.firebaseio.com/';
      return Storage;
    };

    var load = function (tableName, success, error) {
      if (data[tableName]) {
        if (success) {
          success();
        }
      } else {
        var ref = new Firebase(url + tableName);

        ref.once('value', function () {
          if (success) {
            success();
          }
        }, function () {
          if (error) {
            error();
          }
        });

        data[tableName] = angularFireCollection(
          ref,
          null,
          function (action, item) {
            if (action === 'item_added' && !item.id) {
              item.id = item.$id;
              item.$ref.child('id').set(item.$id);
            }
          }
        );
      }
      return data[tableName];
    };

    Storage.all = function (tableName, success, error) {
      return load(tableName, success, error);
    };

    Storage.get = function (tableName, id, success, error) {
      var row = {};

      load(tableName, function () {
        var result = data[tableName].getByName(id);

        if (result) {
          angular.copy(result, row);

          if (success) {
            success();
          }
        } else {
          if (error) {
            error();
          }
        }
      });

      return row;
    };

    Storage.add = function (tableName, row, success, error) {
      var date = (new Date()).toISOString().split('.')[0].replace('T', ' ');

      row.created_at = date; // jshint ignore:line
      row.updated_at = date; // jshint ignore:line

      load(tableName, function () {
        data[tableName].add(row, function (err) {
          if (err) {
            if (error) {
              error();
            }
          } else {
            if (success) {
              success();
            }
          }
        });
      });
    };

    Storage.update = function (tableName, row, success, error) {
      load(tableName, function () {
        data[tableName].update(row, function (err) {
          if (err) {
            if (error) {
              error();
            }
          } else {
            if (success) {
              success();
            }
          }
        });
      });
    };

    Storage.remove = function (tableName, row, success, error) {
      load(tableName, function () {
        data[tableName].remove(row, function (err) {
          if (err) {
            if (error) {
              error();
            }
          } else {
            if (success) {
              success();
            }
          }
        });
      });
    };

    Storage.clear = function (tableName, success, error) {
      (new Firebase(url + tableName)).remove(function (err) {
        if (err) {
          if (error) {
            error();
          }
        } else {
          if (success) {
            success();
          }
        }
      });
    };

    return Storage;
  })

  .factory('storage', function ($injector) {
    return function (app) {
      var storage;

      if (app.storage) {
        storage = app.storage + 'Storage';
      } else {
        storage = 'localStorage';
      }
      return $injector.get(storage)(app);
    };
  });

'use strict';

angular.module('bricksApp', ['ngRoute', 'bricksApp.storage'])
  .config(function ($routeProvider) {
    window.bricksApp.pages.forEach(function (page) {
      $routeProvider.when(page.url, {
        controller: 'MainCtrl',
        template: page.template,
        resolve: {
          Storage: ['$window', 'storage', function ($window, storage) {
            return storage($window.bricksApp);
          }]
        }
      });
    });

    $routeProvider.otherwise({
      template: 'Nothing Found.'
    });
  })

  .run(function ($window) {
    angular.element('#bricksAppStyle').html($window.bricksApp.css);
  })

  .controller('MainCtrl', function ($location, $parse, $routeParams, $scope, $window, Storage) {
    var routeKeys = Object.keys($routeParams);
    var data = {};

    $window.bricksApp.tables.forEach(function (table) {
      data[table.name] = Storage.all(table.name);
    });

    $scope.data = data;

    if (routeKeys.length > 0) {
      routeKeys.forEach(function (table) {
        $scope[table] = Storage.get(table, $routeParams[table]) || {};
      });
    }

    $scope.add = function (table, instance) {
      Storage.add(table, angular.copy(instance), function () {
        $scope[table] = {};
        $scope.$broadcast('database-row-added');
      });
    };

    $scope.update = function (table, instance) {
      Storage.update(table, instance, function () {
        $scope.$broadcast('database-row-updated');
      });
    };

    $scope.remove = function (table, instance) {
      Storage.remove(table, instance, function () {
        $scope.$broadcast('database-row-removed');
      });
    };

    $scope.visit = function (url, table) {
      var path;

      if (table) {
        path = url.replace(/:(\w+)/, table.id);
      } else {
        path = url;
      }

      $location.path(path);
    };

    eval($window.bricksApp.js); // jshint ignore:line
  });

angular.forEach(
  {
    'database-row-added': 'eventDatabaseRowAdded',
    'database-row-updated': 'eventDatabaseRowUpdated',
    'database-row-removed': 'eventDatabaseRowRemoved'
  },
  function (directiveName, eventName) {
    angular.module('bricksApp').directive(directiveName, function ($parse) {
      return {
        compile: function ($element, attr) {
          var fn = $parse(attr[directiveName]);
          return function (scope) {
            scope.$on(eventName, function (e) {
              fn(scope, {$event: e});
            });
          };
        }
      };
    });
  }
);
