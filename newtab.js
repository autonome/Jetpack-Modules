exports.setURI = function setURI(uri) {
  let window = require("window-utils").activeWindow;
  // Make BrowserOpenTab point to the new tab uri instead of about:blank
  window.eval(window.BrowserOpenTab.toSource().replace(/about:blank/g, uri));
  // Clear out the new tab url
  window.eval(window.URLBarSetURI.toSource().replace(/}$/, 'if (gURLBar.value == "' + uri + '") gURLBar.value = ""; $&'));
};
