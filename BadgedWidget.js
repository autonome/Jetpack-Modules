/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim:set ts=2 sw=2 sts=2 et: */
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Jetpack.
 *
 * The Initial Developer of the Original Code is
 * the Mozilla Foundation.
 * Portions created by the Initial Developer are Copyright (C) 2011
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Dietrich Ayala <dietrich@mozilla.com> (Original Author)
 *   Elisée Maurer <elisee@sparklin.org>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */


/*

Widget with an icon as background and a span with text as the badge.

Example:

<snippet>
const badges = require("BadgedWidget");

var widget = badges.BadgedWidget({
  id: "mozilla-link",
  label: "Mozilla!",
  contentURL: "http://www.mozilla.org/favicon.ico"
});

widget.badge = {
  text: '13',
  color: 'white',
  opacity: '0.5'
};
</snippet>

*/

const { Trait } = require("traits");
const widgets = require('widget');

const BadgedWidget = Trait.compose({
  constructor: function(options) {
    this._imageURL = options.contentURL;
    options.contentURL = this._makeContentURL(this._imageURL, this._badge);
    this._widget = widgets.Widget(options);
    this._widget.width += 5;
  },

  get widget() this._widget,

  get badge() this._badge,
  set badge(props) {
    this._badge = props;
    this._updateWidget();
  },
  _badge: {},

  _updateWidget: function _updateWidget() {
    this._widget.contentURL =
      this._makeContentURL(this._imageURL, this._badge);
  },

  _makeContentURL: function _makeContentURL(imageURL, badge) {
    let str = 
      'data:text/html,<html><body style="margin:0; padding:0;">' +
      '<div style="position: relative;">' +
      '<img src="' + imageURL + '">' +
      '<span style="font-size: 0.6em; font-weight: bold; position: absolute; bottom: 0; right: 0; padding: 0; margin: 0;">' +
      (badge.text || '') + '</span>' +
      '<span style="font-size: 0.6em; background-color: ' + (badge.color || '') + ';' +
      'position: absolute; bottom: 0; right: 0; opacity: ' + (badge.opacity || '') + '; padding: 0; margin: 0; -moz-border-radius: 0.3em;">' +
      (badge.text || '') + '</span>' +
      '</div>' +
      '</body></html>';
    return str;
  }
});

exports.BadgedWidget = function(options) BadgedWidget(options);
