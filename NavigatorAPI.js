const { Cc, Ci, Cm, Cu, Cr, components } = require("chrome");

var tmp = {};
Cu.import("resource://gre/modules/Services.jsm", tmp);
Cu.import("resource://gre/modules/XPCOMUtils.jsm", tmp);
var { XPCOMUtils, Services } = tmp;

function uuid() {
  return Cc["@mozilla.org/uuid-generator;1"].
         getService(Ci.nsIUUIDGenerator).generateUUID();
}

function addAPI(name, object) {
  let contractId = '@mozilla.org/jetpack/navigatorAPI/' + name + ';1';
  let classId = Components.ID(uuid());
  
  function navigatorAPI() {};
  navigatorAPI.prototype = {
    QueryInterface: XPCOMUtils.generateQI([Ci.nsIDOMGlobalPropertyInitializer]),
    init: function navigatorAPI_init(window) {

      // Generate map of name + description objects for each property.
      let properties = {};
      Object.keys(object.__exposedProps__).map(function(propName) {
        properties[propName] = {
          enumerable: true,
          configurable: true,
          writable: object.__exposedProps__[propName].indexOf('w') != -1,
          value: object[propName].bind(object)
        };
      });

      // Return an actual content object here, instead of a wrapped
      // chrome object. This allows things like console.log.bind() to work.
      let contentObj = Cu.createObjectIn(window);
      Object.defineProperties(contentObj, properties);
      Cu.makeObjectPropsNormal(contentObj);

      return contentObj;
    }
  };

  let factory = {
    createInstance: function(outer, iid) {
      if (outer != null) throw Cr.NS_ERROR_NO_AGGREGATION;
      return (new navigatorAPI()).QueryInterface(iid);
    }
  };

  Cm.QueryInterface(Ci.nsIComponentRegistrar).registerFactory(
    classId, name + "API", contractId, factory
  );

  const catMan = Cc["@mozilla.org/categorymanager;1"].
                 getService(Ci.nsICategoryManager);

  catMan.addCategoryEntry("JavaScript-navigator-property", name,
                          contractId, false, true);

  require('unload').when(function() {
    Cm.QueryInterface(Ci.nsIComponentRegistrar).unregisterFactory(classId, factory);
    catMan.deleteCategoryEntry("JavaScript-navigator-property", name, false);
  });
}

exports.add = addAPI;
