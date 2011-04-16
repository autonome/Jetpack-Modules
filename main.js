console.log("MAIN");

/*
// Translation
let selection = require("selection");
let contextMenu = require("context-menu");

contextMenu.Item({
  label: "Translate Selection...",
  context: contextMenu.SelectionContext(),
  contentScript: 'on("click", postMessage);',
  onMessage: function (node, data) {
    require("request").Request({
      url: "http://ajax.googleapis.com/ajax/services/language/translate",
      content: {
        v: "1.0",
        q: selection.text,
        langpair: "|sw"
      },  
      headers: {
        Referer: require("tabs").activeTab.location
      },  
      onComplete: function() {
        selection.text = this.response.json.responseData.translatedText;
      }   
    }).get();
  }
});
*/

/*
 <div class="stream-item-content tweet stream-tweet " data-user-id="40916412" data-screen-name="sarahkkhan" data-retweet-id="58865782553198593" data-item-id="58856704217067520" data-tweet-id="58856704217067520">
 <div class="tweet-dogear "></div>
 <div class="tweet-image">
 <div class="tweet-content">
 <div class="tweet-row">
 <div class="tweet-row">
 <div class="tweet-row">
 </div>
*/

/*
// twitter widgets
var tabs = require("tabs");
var widget = require("widget");
var pageWorkers = require("page-worker");
pageWorkers.Page({
  contentURL: "https://www.twitter.com/",
  contentScript: "console.log('fooble'); " +
    "var items = document.querySelectorAll('div.tweet');" +
    "for (var i = 0; i < items.length; i++) {" +
      "console.log(items[i].tagName); " +
      "//postMessage(items[i].childNodes[1].src); }",
  contentScriptWhen: "ready",
  onMessage: function(imageURL) {
    console.log(imgURL);
    widget.Widget({
      label: "Latest Friends",
      contentURL: imageURL,
      onClick: function() tabs.active.location = "http://www.facebook.com"
    });
  }
});
*/

/*
// facebook removal machine
// Remove script: <script type="text/javascript" src="http://connect.facebook.net/
// Remove box: <fb:like href="http://www.facebook.com/AirAsiaThailand" show_faces="true" width="233" font="arial"></fb:like>
const pm = require('page-mod');
pm.PageMod({
  include: '*',
  //contentScriptWhen: 'ready',
  contentScript: 'console.log("running mod");  (' + function() {
    var nodes = document.querySelectorAll("script[src]"); 
    for (var i = 0; i < nodes.length; i++) { 
      var node = nodes[i]; 
      var src = node.getAttribute("src"); 
      console.log("src: " + src); 
      if (src && src.indexOf("connect.facebook") != -1) { 
        console.log("fb scrpt"); 
        node.parentNode.removeChild(node); 
      } 
      else if (src && src.indexOf("google-analytics") != -1) { 
        console.log("ga scrpt"); 
        node.parentNode.removeChild(node); 
      } 
      else if (src && src.indexOf("doubleclick") != -1) { 
        console.log("db scrpt"); 
        node.parentNode.removeChild(node); 
      } 
    } 

    var elnode = document.querySelector("*|like");
    if (elnode) { console.log("hit facebook like element"); elnode.parentNode.removeChild(elnode); }
  } + ')();'
});
*/

/*
// awesomebar extender
require('awesomebar').add({
  keyword: 'foo',
  handler: function(search) {
    
  }
});
*/

/*
require("observer-service").add("sessionstore-windows-restored", function(aSubject, aData) {
  require("notifications").notify("session yah!");
}) 
*/

/*
const widgets = require("widget");
widgets.Widget({
  label: "foo",
  content: "202",
});
*/

/*
let window = require("window-utils").activeWindow;
function addURLBarHandler(matchRegex, onMatchCallback, autocompleteImplString) {
  let bar = window.document.getElementById("urlbar");

  let funcName = "onTextEntered" + require("self").id;

  window[funcName] = function(e) {
    if (bar.value && matchRegex.test(bar.value)) {
      onMatchCallback(bar.value);
      e.stopPropagation();
    }
  };

  var textentered = funcName + "(this) || " + 
                    bar.getAttribute("ontextentered");
  bar.setAttribute("ontextentered", textentered); 

  //var acsearch = autocompleteImplString + " " + bar.getAttribute("autocompletesearch");
  //bar.setAttribute("autocompletesearch", acsearch);
}

addURLBarHandler(/^!.+/, window.alert, "search-autocomplete");
*/

/*
// Reflector: shows how many times you flipped tabs, and which were the most popular
const widgets = require("widget");
let numFlips = 0;
let flips = {};
widgets.Widget({
  label: "Reflector",
  description: "Shows how many times you flipped tabs, and which were the most popular",
  content: "<bold>" + numFlips + "</bold>",
  panel: require("panel").Panel({
    contentURL: require("self").data.url("reflector.html"),
    onMessage: function(message) {
      console.log(response);
    }
  })
});

const tabs = require("tabs");
tabs.on("activate", function(tab) {
  numFlips++;
  if (!flips[tab]) flips[tab] = 0;
  flips[tab]++;
});
*/

/*
// facemelt
// TODO: update on a timer
// TODO: friend name on tooltip
// TODO: link direct to message
var tabs = require("tabs");
var widget = require("widget");
var pageWorkers = require("page-worker");
pageWorkers.Page({
  contentURL: "https://www.facebook.com/home.php",
  contentScript: "var blocks = document.querySelectorAll('.profilePic');" + "for (var i = 0; i < blocks.length; i++) { postMessage(blocks[i].src); }",
  contentScriptWhen: "ready",
  onMessage: function(imageURL) {
    widget.Widget({
      label: "Latest Friends",
      contentURL: imageURL,
      onClick: function() tabs.active.location = "http://www.facebook.com"
    });
  }
});
*/

/*
// facetest
require("widget").Widget({
  label: "Latest Friend",
  contentURL: "https://www.facebook.com/home.php",
  contentScript: "document.location = document.querySelector('.profilePic').src;",
  contentScriptWhen: "ready",
  onClick: function() require("tabs").tabs.active.location = this.contentURL
});
*/


/*
const widget = require("widget");
const gcal = require("gcal-quick-add");

// test api immediately
gcal.addEvent("7pm pick up shiloh from school", function(response) {
  console.log('callback called');
});

// Google calendar quick-add widget
// TODO: add keyboard shortcut
widget.add(widget.Widget({
  label: "Google Calendar Quick-add",
  image: "http://calendar.google.com/googlecalendar/images/favicon_v2010.ico",
  panel: require("panel").Panel({
    contentURL: "data:text/html,Add Event: <input id='input' type='text'>",
    contentScript: "document.body.firstElementChild.addEventListener('keypress', function(e) { if (e.keyCode == 13) postMessage(this.value); }, false);",
    contentScriptWhen: "ready",
    onMessage: function(message) {
      gcal.addEvent(message, function(response) {
        console.log(response);
      });
    }
  })
}));
*/

/*
// addon bar additions
function addToolbarButton(aOptions) {
  // XUL element container for widget
  let node = this.doc.createElement("toolbarbutton");
  let guid = require("xpcom").makeUuid().toString();
  let id = "button:" + guid;
  node.setAttribute("id", id);
  node.setAttribute("label", widget.label);
  node.setAttribute("tooltiptext", widget.tooltip);

  // TODO move into a stylesheet
  node.setAttribute("style", [
      "overflow: hidden; margin: 5px; padding: 0px;",
      "border: 1px solid #71798F; -moz-box-shadow: 1px 1px 3px #71798F;",
      "-moz-border-radius: 3px;"
  ].join(""));

  node.style.minWidth = widget.width + "px";

  // Add to the customization palette
  let toolbox = this.doc.getElementById("navigator-toolbox");
  let palette = toolbox.palette;
  palette.appendChild(node);

  // Add the item to the toolbar
  this.container.insertItem(id, null, null, false);

  let item = {widget: widget, node: node};

  this._items.push(item);
}

if (firstRun) {
  let addonBar = document.getElementById("addon-bar");
  let currentSet = addonBar.currentSet;
  if (currentSet.indexOf("myAddonItem") == -1) {
    addonBar.currentSet += ",myAddonItem";
    addonBar.setAttribute("currentset", addonBar.currentSet);
    document.persist("addon-bar", "currentset");
    addonBar.collapsed = false;
  }
}
*/

/*
console.log("NAME: " + require("self").name);

console.log(packaging.options);

for (let [packageName, packageData] in Iterator(packaging.options.metadata))
  for (let [key, value] in Iterator(packageData))
    console.log(packageName + ": " + key + ", " + value);

let jetpackId = packaging.options.jetpackID;
//console.log("ID: " + jetpackId);
//console.log("self.ID: " + require("self").id);
*/

/*
// packaging pagemods hack
if (packaging.options.metadata.scratchpad.keywords &&
    packaging.options.metadata.scratchpad.keywords.pagemods) {
  const pm = require("page-mod");
  let pageModData = packaging.options.metadata.scratchpad.keywords.pagemods;
  pageModData.forEach(pm.add);
}
*/
