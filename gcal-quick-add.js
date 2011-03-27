// Quick'n'dirty port of http://torrez.us/archives/2006/04/18/433/

const {Cc, Ci} = require("chrome");
const request = require("request");

function number_html(i) {
  var num = 16;
  var j ="";
  for(var n = 0; n < i.length; n++) {
    j += ("&#x"+(i.charCodeAt(n)).toString(num)+";");
  }
  return j;
}

/*

Notes:
* load calendar in a page-worker instead of xhr
* try to pull the cookie from there

*/

exports.addEvent = function addEvent(text, callback) {
  var quickAddText = number_html(text);

  var keys = {};

  var quickAddEntry = "<entry xmlns='http://www.w3.org/2005/Atom' xmlns:gCal='http://schemas.google.com/gCal/2005'>";
  quickAddEntry    += "    <content type=\"html\">" + quickAddText + "</content>";
  quickAddEntry    += "    <gCal:quickadd value=\"true\"/>";
  quickAddEntry    += "</entry>";

  var currentCalendar = "http://www.google.com/calendar/feeds/default/private/full";

  // get a cookie set
  let req = request.Request({
    url: 'http://calendar.google.com/',
    onComplete: function() {
      console.log("REQ HEADERS: " + req.headers.toSource());
      // pull CAL value from cookie
      request.Request({
        url: currentCalendar,
        headers: {
          'Content-type': 'application/atom+xml'
        },
        content: encodeURIComponent(quickAddEntry),
        onComplete: function(response) {
          if (response.headers["WWW-Authenticate"]) {
            
          }
          else if (response.headers["Cookie"]) {
            response.headers['Cookie'].split(";").map(function(e) {
              var cookie = e.split("=", 2); 
              cookie[0] = cookie[0].replace(/^\s*/, "").replace(/\s*$/, "");
              keys[cookie[0]] = cookie[1];
            });
          }

          if(keys['CAL'] == null)
            throw new Error("Please make sure you are logged in to Google Calendar.");

          // post event
          if (response.status != 201) {
            request.Request({
              url: currentCalendar,
              headers: {
                'Authorization': 'GoogleLogin auth=' + keys['CAL'],
                'Content-type': 'application/atom+xml'
              },
              content: quickAddEntry,
              onComplete: function(response) {
                if (response.status == 401) {
                  console.log("Please make sure you are logged in to Google Calendar.");
                } else if(response.status != 201) {
                  console.log("There was an error posting your quick calendar entry. Error code:" + response.status + " " + response.statusText);
                }
                if (callback)
                  callback(response);
              }
            }).post();
          }
        }
      }).post();
    }
  }).get();
} 
