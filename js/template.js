/*jshint laxbreak:true */
(function (window) {
  "use strict";

  var htmlEscapes = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "`": "&#x60;",
  };

  var escapeHtmlChar = function (chr) {
    return htmlEscapes[chr];
  };

  var reUnescapedHtml = /[&<>"'`]/g;
  var reHasUnescapedHtml = new RegExp(reUnescapedHtml.source);

  var escape = function (string) {
    return string && reHasUnescapedHtml.test(string)
      ? string.replace(reUnescapedHtml, escapeHtmlChar)
      : string;
  };

  /**
   * Sets up defaults for all the Template methods such as a default template
   *
   * @constructor
   */
  function Template() {
    this.templateWrapper =
      '<ul class="{{wrapperClass}}">' + "{{items}}" + "</ul>";

    this.defaultTemplate =
      '<li data-id="{{id}}" class="{{completed}}">' +
      '<div class="view">' +
      '<input class="toggle" type="checkbox" {{checked}}>' +
      '<label class="title-label">{{title}}</label>' +
      '<label class="category-label">{{category}}</label>' +
      '<button class="destroy"></button>' +
      "</div>" +
      "</li>";
    this.categoryTemplate =
      "<li>" +
      '<label class="category-label">{{category}}</label>' +
      "{{items}}" +
      "</li>";
  }

  /**
   * Creates an <li> HTML string and returns it for placement in your app.
   *
   * NOTE: In real life you should be using a templating engine such as Mustache
   * or Handlebars, however, this is a vanilla JS example.
   *
   * @param {object} data The object containing keys you want to find in the
   *                      template to replace.
   * @returns {string} HTML String of an <li> element
   *
   * @example
   * view.show({
   *	id: 1,
   *	title: "Hello World",
   *	completed: 0,
   * });
   */
  Template.prototype.show = function (data, showCategory = true) {
    var i, l;
    var view = "";

    for (i = 0, l = data.length; i < l; i++) {
      var template = this.defaultTemplate;
      var completed = "";
      var checked = "";

      if (data[i].completed) {
        completed = "completed";
        checked = "checked";
      }

      template = template.replace("{{id}}", data[i].id);
      template = template.replace("{{title}}", escape(data[i].title));
      template = template.replace(
        "{{category}}",
        showCategory ? escape(data[i].category) : ""
      );
      template = template.replace("{{completed}}", completed);
      template = template.replace("{{checked}}", checked);

      view = view + template;
    }

    view = this.templateWrapper.replace("{{items}}", view);
    view = view.replace("{{wrapperClass}}", "todo-list");

    return view;
  };

  Template.prototype.showCategories = function (data) {
    let view = "";

    const categories = Object.keys(data);

    for (let i = 0; i < categories.length; i++) {
      var template = this.categoryTemplate;

      template = template.replace("{{category}}", escape(categories[i]));
      template = template.replace(
        "{{items}}",
        this.show(data[categories[i]], false)
      );

      view += template;
    }

    view = this.templateWrapper.replace("{{items}}", view);
    view = view.replace("{{wrapperClass}}", "category-list");

    return view;
  };

  /**
   * Displays a counter of how many to dos are left to complete
   *
   * @param {number} activeTodos The number of active todos.
   * @returns {string} String containing the count
   */
  Template.prototype.itemCounter = function (activeTodos) {
    var plural = activeTodos === 1 ? "" : "s";

    return "<strong>" + activeTodos + "</strong> item" + plural + " left";
  };

  /**
   * Updates the text within the "Clear completed" button
   *
   * @param  {[type]} completedTodos The number of completed todos.
   * @returns {string} String containing the count
   */
  Template.prototype.clearCompletedButton = function (completedTodos) {
    if (completedTodos > 0) {
      return "Clear completed";
    } else {
      return "";
    }
  };

  // Export to window
  window.app = window.app || {};
  window.app.Template = Template;
})(window);
