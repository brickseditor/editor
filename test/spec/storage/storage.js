'use strict';

describe('Factory: storage', function () {
  var app;

  beforeEach(module('bricksApp.storage', function ($provide) {
    $provide.value('fakeStorage', function (app) {
      return 'this is ' + app.storage;
    });
  }));

  beforeEach(function () {
    app = {storage: 'fake'};
  });

  it('should return the correct storage service', inject(function (storage) {
    expect(storage(app)).toBe('this is fake');
  }));
});

describe('Factory: localStorage', function () {
  var $window, Storage, app, dogs;

  beforeEach(module('bricksApp.storage', function ($provide) {
    dogs = [
      {
        id: 'milou',
        name: 'milou',
        owner: 'tintin'
      },
      {
        id: 'rantanplan',
        name: 'rantanplan',
        owner: 'lucky luke'
      }
    ];

    $window = {
      localStorage: {
        getItem: function (key) {
          if (key === 'bricks_app_test_dog') {
            return angular.toJson(dogs);
          }
        },
        setItem: jasmine.createSpy()
      }
    };
    spyOn($window.localStorage, 'getItem').andCallThrough();

    $provide.value('$window', $window);
  }));

  beforeEach(inject(function (_localStorage_) {
    app = {
      id: 'test',
      tables: [
        {name: 'dog'},
        {name: 'cat'}
      ]
    };

    Storage = _localStorage_(app);
  }));

  it('should get all rows from a table', function () {
    var get = $window.localStorage.getItem;
    expect(Storage.all('dog')).toEqual(dogs);
    expect(Storage.all('cat')).toEqual([]);
    expect(get).toHaveBeenCalledWith('bricks_app_test_cat');
    expect(get).toHaveBeenCalledWith('bricks_app_test_dog');
  });

  it('should get one row from a table', function () {
    expect(Storage.get('dog', 'milou')).toEqual(dogs[0]);
    expect(Storage.get('dog', 'rantanplan')).toEqual(dogs[1]);
    expect(Storage.get('dog', 'unknown')).toBe(undefined);
    expect(Storage.get('cat', 'unknown')).toBe(undefined);
  });

  it('should add a row to a table', function () {
    var set = $window.localStorage.setItem;
    var cats = Storage.all('cat');
    var cat = {
      name: 'happy',
      owner: 'natsu'
    };

    Storage.add('cat', cat);

    expect(cats.length).toBe(1);
    expect(cats[0].name).toBe('happy');
    expect(cats[0].id).not.toBe(undefined);
    expect(cats[0].created_at).not.toBe(undefined);
    expect(cats[0].updated_at).not.toBe(undefined);

    var json = angular.toJson(cats);

    expect(set).toHaveBeenCalledWith('bricks_app_test_cat', json);
  });

  it('should update a row in a table', function () {
    var set = $window.localStorage.setItem;
    var dog = {
      id: 'milou',
      name: 'bill',
      owner: 'boule'
    };
    dogs[0] = dog;
    var json = angular.toJson(dogs);

    Storage.update('dog', dog);

    expect(Storage.all('dog')[0].name).toBe('bill');
    expect(set).toHaveBeenCalledWith('bricks_app_test_dog', json);
  });

  it('should remove a row from a table', function () {
    var set = $window.localStorage.setItem;
    var json = angular.toJson([dogs[1]]);

    Storage.remove('dog', dogs[0]);

    expect(Storage.all('dog')[0].id).toBe('rantanplan');
    expect(set).toHaveBeenCalledWith('bricks_app_test_dog', json);
  });

  it('should delete all rows in a table', function () {
    var set = $window.localStorage.setItem;

    Storage.clear('dog');

    expect(Storage.all('dog').length).toBe(0);
    expect(set).toHaveBeenCalledWith('bricks_app_test_dog', '[]');
  });
});

describe('Factory: firebaseStorage', function () {
  var Firebase, Storage, angularFireCollection, app, dogs, firebaseFns;

  beforeEach(module('bricksApp.storage'));

  beforeEach(module(function ($provide) {
    dogs = [
      {
        id: 'milou',
        name: 'milou',
        owner: 'tintin'
      },
      {
        id: 'rantanplan',
        name: 'rantanplan',
        owner: 'lucky luke'
      }
    ];

    var stub = {
      Firebase: window.Firebase(),
      angularFireCollection: window.angularFireCollection({dog: dogs})
    };
    firebaseFns = stub.Firebase.fns;

    spyOn(stub, 'Firebase').andCallThrough();
    spyOn(stub, 'angularFireCollection').andCallThrough();

    $provide.value('Firebase', stub.Firebase);
    $provide.value('angularFireCollection', stub.angularFireCollection);
  }));

  beforeEach(inject(function (_Firebase_, _angularFireCollection_, _firebaseStorage_) {
    angularFireCollection = _angularFireCollection_;
    Firebase = _Firebase_;

    app = {
      id: 'test',
      settings: {
        firebase: 'instance'
      },
      tables: [
        {name: 'dog'},
        {name: 'cat'}
      ]
    };

    spyOn(firebaseFns, 'once').andCallFake(function (eventName) {
      if (eventName === 'value') {
        return dogs;
      }
    });

    Storage = _firebaseStorage_(app);
  }));

  it('should get all rows from a table', function () {
    var storedDogs = Storage.all('dog');
    expect(Firebase).toHaveBeenCalledWith('https://instance.firebaseio.com/dog');
    expect(storedDogs[0]).toEqual(dogs[0]);
    expect(storedDogs[1]).toEqual(dogs[1]);
    expect(storedDogs.length).toEqual(dogs.length);

    var storedCats = Storage.all('cat');
    expect(storedCats.length).toBe(0);
  });

  it('should get one row from a table', function () {
    var dogs = Storage.all('dog');

    spyOn(dogs, 'getByName').andCallFake(function () {
      return {id: 'test'};
    });

    var dog = Storage.get('dog', 'milou');

    expect(dogs.getByName.mostRecentCall.args[0]).toEqual('milou');
    expect(dog).toEqual({id: 'test'});
  });

  it('should add a row to a table', function () {
    var cats = Storage.all('cat');
    var cat = {
      id: 'happy',
      name: 'happy',
      owner: 'natsu'
    };

    spyOn(cats, 'add');
    Storage.add('cat', cat);
    expect(cats.add.mostRecentCall.args[0]).toEqual(cat);
    expect(cat.created_at).not.toBe(null);
    expect(cat.updated_at).not.toBe(null);
  });

  it('should update a row in a table', function () {
    var dogs = Storage.all('dog');
    var dog = {
      id: 'milou',
      name: 'bill',
      owner: 'boule'
    };

    spyOn(dogs, 'update');
    Storage.update('dog', dog);
    expect(dogs.update.mostRecentCall.args[0]).toEqual(dog);
  });

  it('should remove a row from a table', function () {
    var dogs = Storage.all('dog');
    var dog = dogs[0];

    spyOn(dogs, 'remove');
    Storage.remove('dog', dog);
    expect(dogs.remove.mostRecentCall.args[0]).toEqual(dog);
  });

  it('should delete all rows in a table', function () {
    spyOn(firebaseFns, 'remove');
    Storage.clear('dog');
    expect(Firebase).toHaveBeenCalledWith('https://instance.firebaseio.com/dog');
    expect(firebaseFns.remove).toHaveBeenCalled();
  });
});
