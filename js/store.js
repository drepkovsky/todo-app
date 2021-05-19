/*jshint eqeqeq:false */
(function (window) {
  "use strict";

  /**
   * Creates a new client side storage object and will create an empty
   * collection if no collection already exists.
   *
   * @param {string} name The name of our DB we want to use
   * @param {function} callback Our fake DB uses callbacks because in
   * real life you probably would be making AJAX calls
   */
  function Store(name, callback) {
    callback = callback || function () {};

    this._dbName = name;

    // changed todos from [] to an object of all tasks and categories , tasks is a map which uses ids as keys and todos/tasks as values
    // added categories map, maps category name to an array of all tasks/todos ids with given category
    if (!localStorage.getItem(name)) {
      var todos = { tasks: {}, categories: {} };

      localStorage.setItem(name, JSON.stringify(todos));
    }

    callback.call(this, JSON.parse(localStorage.getItem(name)));
  }

  /**
   * Finds tasks based on a query given as a JS object
   *
   * @param {object} query The query to match against (i.e. {foo: 'bar'})
   * @param {function} callback	 The callback to fire when the query has
   * completed running
   *
   * @example
   * db.find({foo: 'bar', hello: 'world'}, function (data) {
   *	 // data will return any items that have foo: bar and
   *	 // hello: world in their properties
   * });
   */
  Store.prototype.find = function (query, callback) {
    if (!callback) {
      return;
    }

    var todos = Object.values(
      JSON.parse(localStorage.getItem(this._dbName)).tasks
    );

    callback.call(
      this,
      todos.filter(function (todo) {
        for (var q in query) {
          if (query[q] !== todo[q]) {
            return false;
          }
        }
        return true;
      })
    );
  };
  /**
   * Will retrieve all data from the task collection
   *
   * @param {function} callback The callback to fire upon retrieving data
   */
  Store.prototype.findAll = function (callback) {
    callback = callback || function () {};
    callback.call(
      this,
      Object.values(JSON.parse(localStorage.getItem(this._dbName)).tasks)
    );
  };

  /**
   * Will retrieve all categorized data from the task collection
   *
   * @param {function} callback The callback to fire upon retrieving data
   */
  Store.prototype.findCategoriesAll = function (callback) {
    callback = callback || function () {};

    const todos = JSON.parse(localStorage.getItem(this._dbName));
    const categorizedTodos = todos.categories;

    // map categories to categorizied objects
    Object.keys(categorizedTodos).forEach((key) => {
      categorizedTodos[key] = categorizedTodos[key].map(
        (id) => todos.tasks[id]
      );
    });

    callback.call(this, categorizedTodos);
  };

  /**
   * Will retrieve all categorized data from the task collection
   *
   * @param {function} callback The callback to fire upon retrieving data
   */
  Store.prototype.findCategories = function (query, callback) {
    if (!callback) {
      return;
    }

    const todos = JSON.parse(localStorage.getItem(this._dbName));
    // get categories
    const categorizedTodos = todos.categories;

    // map categories to categorizied objects
    Object.keys(categorizedTodos).forEach((key) => {
      categorizedTodos[key] = categorizedTodos[key]
        .map((id) => {
          todos.tasks[id];
        })
        .filter((todo) => {
          for (var q in query) {
            if (query[q] !== todo[q]) {
              return false;
            }
          }
          return true;
        });
    });

    callback.call(this, categorizedTodos);
  };

  /**
   * Will save the given data to the DB. If no item exists it will create a new
   * item, otherwise it'll simply update an existing item's properties
   *
   * @param {object} updateData The data to save back into the DB
   * @param {function} callback The callback to fire after saving
   * @param {number} id An optional param to enter an ID of an item to update
   */
  Store.prototype.save = function (updateData, callback, id) {
    var todos = JSON.parse(localStorage.getItem(this._dbName));

    callback = callback || function () {};

    // If an ID was actually given, find the item and update each property
    if (id) {
      // if ID is invalid return
      const task = todos.tasks[id];
      if (!task) return;

      for (let key in updateData) {
        task[key] = updateData[key];
      }
      todos.tasks[id] = task;

      localStorage.setItem(this._dbName, JSON.stringify(todos));
      callback.call(this, todos);
    } else {
      // Generate an ID
      updateData.id = new Date().getTime();

      // map task to todos using its ids as key
      todos.tasks[updateData.id] = updateData;

      //   if category does not exist create it
      if (!todos.categories[updateData.category])
        todos.categories[updateData.category] = [];

      // add todo id to categories
      todos.categories[updateData.category].push(updateData.id);

      localStorage.setItem(this._dbName, JSON.stringify(todos));
      callback.call(this, [updateData]);
    }
  };

  /**
   * Will remove an item from the Store based on its ID
   *
   * @param {number} id The ID of the item you want to remove
   * @param {function} callback The callback to fire after saving
   */
  Store.prototype.remove = function (id, callback) {
    var todos = JSON.parse(localStorage.getItem(this._dbName));

    // dont remove if task id is not valid
    const task = todos.tasks[id];
    if (!task) return;

    // iterate over all ids in categories till we find our wanted id
    for (let i = 0; i < todos.categories[task.category].length; i++) {
      // remove id from categories
      if (todos.categories[task.category][i] == id) {
        todos.categories[task.category].splice(i, 1);

        // remove task by id
        delete todos.tasks[id];

        // if categories are empty remove
        if (todos.categories[task.category].length == 0) {
          delete todos.categories[task.category];
        }
        break;
      }
    }

    localStorage.setItem(this._dbName, JSON.stringify(todos));
    callback.call(this, todos);
  };

  /**
   * Will drop all storage and start fresh
   *
   * @param {function} callback The callback to fire after dropping the data
   */
  Store.prototype.drop = function (callback) {
    var todos = { list: [], categories: {} };
    localStorage.setItem(this._dbName, JSON.stringify(todos));
    callback.call(this, todos);
  };

  // Export to window
  window.app = window.app || {};
  window.app.Store = Store;
})(window);
