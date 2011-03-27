
const { Ci, Cc, Cu } = require("chrome");

Cu.import("resource://gre/modules/Services.jsm", this);
Cu.import("resource://gre/modules/XPCOMUtils.jsm", this);

function AutoCompleteInput(aSearches) {
  this.searches = aSearches;
}
AutoCompleteInput.prototype = {
  timeout: 10,
  textValue: "",
  searches: null,
  searchParam: "",
  popupOpen: false,
  minResultsForPopup: 0,
  invalidate: function() {},
  disableAutoComplete: false,
  completeDefaultIndex: false,
  get popup() { return this; },
  onSearchBegin: function() {},
  onSearchComplete: function() {},
  setSelectedIndex: function() {},
  get searchCount() { return this.searches.length; },
  getSearchAt: function(aIndex) this.searches[aIndex],
  QueryInterface: XPCOMUtils.generateQI([
    Ci.nsIAutoCompleteInput,
    Ci.nsIAutoCompletePopup,
  ])
};

exports.search = function search(options) {
  let controller = Cc["@mozilla.org/autocomplete/controller;1"].
                   getService(Ci.nsIAutoCompleteController);

  // Make an AutoCompleteInput that uses our searches
  // and confirms results on search complete
  let input = new AutoCompleteInput(["history"]);

  controller.input = input;

  input.searchParam = options.search;

  input.onSearchBegin = function() {};

  input.onSearchComplete = function onSearchComplete() {

    let results = [];
    for (let i = 0; i < controller.matchCount; i++) {
      let result = {
        url: controller.getValueAt(i),
        title: controller.getCommentAt(i),
        //label: controller.getLabelAt(i),
        style: controller.getStyleAt(i),
        image: controller.getImageAt(i)
      };
      if (options.onResult)
        options.onResult(result);
      results.push(result);
    }

    if (options.onComplete)
      options.onComplete(results);
  };

  controller.startSearch(options.search);
};
