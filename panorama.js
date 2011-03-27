/*

Panorama Data Groups API

Notes
* All actions are mirrored across all open browser windows.
* Groups created via this API are styled differently than normal groups.
* Items are not tabs. Or are they...
* Clicking on an item will open a new tab in the last active group.
* No, clicking on an item activate the group and item turning them INTO REAL TABS!
* Users cannot modify the group contents.
* IDEA: have a pencil [edit] icon, that allows editing of JS to run for events, etc.

Global
* groups
* addGroup({options})
* removeGroup(group)

Group
* items
* addItem({options})
* removeItem(item)

GroupOptions = {
  title
  locked
}

Item
* title
* content
* contentURL
* thumbnail
* on[Click, Mouseover, Mouseout]

*/

let groups = [];

// public apis

exports.groups = groups;

exports.addGroup = function panorama_addGroup(options) {
  groups.push(new Group(options));
};

function Group(options) {
  this._options = options;
  this._windowItems = [];
  windowTracker.windows.forEach(function(window) {
    group.windowItems[window] = addGroupToWindow(window);
  });

  this.items = [];
  this.addItem = function(options) {
  };
  this.removeItem = function(options) {
  };
}
Group.prototype = {};


// driver

let windowTracker = {
  windows: [],
  onTrack: function (window) {
    console.log("Tracking a window: " + window.TabView);
    groups.forEach(function(group) {
      group.windowItems[window] = addGroupToWindow(window);
    });
  },
  onUntrack: function (window) {
    console.log("Untracking a window: " + window.document.URL);
    groups.forEach(function(group) {
      group.windowItems[window] = null;
    });
  }
};
let windowUtils = require("window-utils");
new windowUtils.WindowTracker(windowTracker);

// internal funcs

function createGroup(contentWindow, width, height, padding, noAnimation) {
  let pageBounds = contentWindow.Items.getPageBounds();
  pageBounds.inset(padding, padding);

  let box = new contentWindow.Rect(pageBounds);
  box.width = width;
  box.height = height;
  
  let immediately = noAnimation ? true: false;
  let emptyGroupItem = 
    new contentWindow.GroupItem([], { bounds: box, immediately: immediately });

  return emptyGroupItem;
}

function addGroupToWindow(window) {
  let contentWindow = window.document.getElementById("tab-view").contentWindow;
  return createGroup(contentWindow, 300, 300, 100, true));
}
