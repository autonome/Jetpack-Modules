/*

From the TaskPaper docs:

TaskPaper’s file format is fairly simple. Here’s how TaskPaper reads a file:

- Files are expected to use the UTF-8 encoding and use ‘\n’ to separate lines.

- A task is a line that begins with a hyphen followed by a space ('- ') which
  can optionally be prefixed (i.e indented) with tabs or spaces. A task can
  have zero or more tags anywhere on the line (not just trailing at the end).

- A project is a line that isn't a task and ends with a colon (':'), or a
  colon (':\n') followed by a newline. Tags can exist after the colon, but if
  any non-tag text is present, then it won’t be recognized as a project.

- A note is any line that doesn't match the task or project rules.

- Indentation level (with tabs, not spaces) defines ownership. For instance,
  if you indent one task under another task, then it is considered a subtask.
  Tasks and notes own all objects that are indented underneath them. Empty
  lines are ignored when calculating ownership.

- A tag has the form "@tag", i.e. it starts with an "at" character ("@"),
  followed by a run of non-whitespace characters. A tag can optionally have a
  value assigned to it. The value syntax immediately follows the tag word
  (no whitespace between) and is enclosed by parentheses: '(' and ')'. The
  value text inside can have whitespace, but no newlines. Here is an example
  of a tag with a value: @tag (tag's value)

- ME ADDED: task completion is denoted by adding " @done(YYYY-MM-DD)" somewhere in the line (end, anywhere?)

*/


/*
Created by Emil Erlandsson
Modified by Matt Dawson
Copyright (c) 2009 Matt Dawson

Rewritten by Bjoern Brandenburg
Copyright (c) 2010 Bjoern Brandenburg

Converted to JavaScript by Dietrich Ayala
Copywrong (cw) 2011 Dietrich Ayala

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <http://www.gnu.org/licenses/>.
*/


// extract tags from a line.
function extract_tags(line) {
  var firstTagIndex = line.indexOf('@');
  if (!line.length || firstTagIndex == -1)
    return;

  var tags = {};

  var tagChunks = line.split('@');
  if (firstTagIndex != 0)
    tagChunks.shift();

  for (var i = 0; i < tagChunks.length; i++) {
    var text = tagChunks[i];
    var firstSpace = text.indexOf(' ');
    if (!text.trim() || firstSpace == 0)
      continue;
    var tagText = (firstSpace != -1) ? text.substring(0, firstSpace) : text;
    var openParens = tagText.indexOf('(');
    var closingParens = tagText.indexOf(')');
    var tag = tagText, value = '';
    if (openParens != -1 && closingParens != -1) {
      tag = tagText.substr(0, openParens);
      value = tagText.substr(openParens + 1, closingParens - openParens - 1);
    }
    tags[tag] = value;
  }

  return tags
}

function indent_level(line) {
  var level = 0;
  for (var i = 0; i < line.length; i++) {
    if (line[i] != '\t')
      break
    level += 1;
  }
  return level
}


// An entry in a TaskPaper file. Corresponds to one line.
function TaskItem(str) {
  this.parse(str);
}
TaskItem.prototype = {

  init: function __init__(txt, tags, items, parent) {
    this.txt = txt || '';
    this.cleanTxt = this.txt.trim();
    this.parent = parent;
    this.items = items || [];
    this.tags = tags || {};
    if (parent == this)
      throw("can't add item to self");
  },

  parse: function parse(line, parent) {
    var tags = line.indexOf('@') ? extract_tags(line) : {};
    this.init(line, tags, parent);
  },

  add_item: function add_item(item) {
    this.items.push(item)
  },

  is_task: function is_task() {
    return this.txt.trim().indexOf('-') == 0;
  },

  is_project: function is_project() {
    return this.txt[this.txt.length - 1] == ':' && !this.is_task();
  },

  is_note: function is_note() {
    return !(this.is_task() || this.is_project());
  },

  // TODO: add support and test
  delete: function delete() {
    // Remove node from parent's item list.
    if (this.parent)
      this.parent.items.splice(this.parent.items.indexOf(this), 1);
  },

  // TODO: test
  level: function level() {
    // Count how far this node is removed from the top level
    count = -1;
    cur = this;
    while (cur.parent) {
      count += 1;
      cur = cur.parent;
    }
    return count
  },

  // TODO: add support and test
  add_tag: function add_tag(tag, value) {
    this.tags[tag] = value;
  },

  // TODO: add support and test
  drop_tag: function drop_tag(tag) {
    if (tag in this.tags) {
      delete this.tags[tag];
      return true;
    }
    else
      return false;
  },

  // with_tabs defaulted to true
  // TODO: support with_tabs
  // TODO: support added/removed tags
  format: function format(with_tabs) {
    return this.txt;
    /*
    tag_txt  = " ".join(['@%s' % x if self.tags[x] is None else "@%s(%s)" % (x, self.tags[x])
                         for x in self.tags])
    tabs_txt = '\t' * self.level() if with_tabs else ''
    return "%s%s%s%s" % (tabs_txt, self.txt, ' ' if tag_txt else '', tag_txt)
    */
  },

  toString: function toString() {
    return this.format(false);
  }
}


// A wrapper class for TaskPaper files.
function TaskPaper(str) {
  this.items = [];
  this.parent = null;
  this.parse(str.split("\n"));
}
TaskPaper.prototype = {
  parse: function parse(lines) {
    var last_level = -1;
    var last_item  = this;
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var level = indent_level(line);
      if (level == last_level) {
        // sibling
        last_item = new TaskItem(line, last_item.parent);
      }
      else if (level > last_level) {
        // sub-item
        last_item = new TaskItem(line, last_item);
      }
      else {
        // go back up
        last_item = new TaskItem(line, this.last_item(level - 1));
      }
      last_level = level;
      this.add_item(last_item);
    }
  },

  add_item: function add_item(item) {
    this.items.push(item)
  },

  level: function level() {
    return 0;
  },

  last_item: function last_item(level) {
    if (level == null)
      level = 0;
    item = this;
    while (level >= 0) {
      level -= 1;
      if (item.items)
        item = item.items[-1];
      else
        break
    }
    return item;
  },

  // TODO: test searching
  select: function select(filter) {
    // Iterate over all items, return only those that match the filter.
    return this.items.forEach(function(item) {
      return item.items.filter(filter);
    });
  },

  // TODO: test. and wtf.
  __getitem__: function __getitem__(key) {
    // does it look like a string?
    if ((typeof key) == 'string') {
      // filter by tags
      //return this.select(lambda nd: key in nd.tags)
      return this.select(function(item) {
        return item.tags[key];
      });
    }
    else {
      // assume it's an index
      return this.items[key];
    }
  },

  // TODO: fixme
  // Iterate over all items.
  __iter__: function() {
    return this.select(function() {
      return true;
    });
  },

  // TODO: test options
  format: function(filter, show_parents) {
    // TODO: make show_parents default to true
    if (filter) {
      // find all child items that match filter
      var to_show = [];
      var filtered = this.select(filter);
      for (var nd in filtered) {
        to_show.push(nd);
        // show all parents of matching items
        if (show_parents) {
          while (nd.parent) {
            to_show.push(nd.parent);
            nd = nd.parent;
          }
        }
      }
      // filter on showable, format and join
      return this.select(function(nd) {
        return to_show[nd];
      }).map(function(item) {
        return item.format(true);
      }).join("\n");
    }
    else {
      return this.items.map(function(item) {
        return item.format(true);
      }).join("\n");
    }
  },

  toString: function toString() {
    return this.format()
  }
};


// testinggggg
(function test() {
  var sourceStr = require('self').data.load('general.taskpaper');
  var tp = new TaskPaper(sourceStr);
  var formattedStr = tp.format();
  var sourceLines = sourceStr.split('\n');
  var formattedLines = formattedStr.split('\n');
  console.log('string size', sourceStr.length == formattedStr.length ? 'PASS' : 'FAIL');
  console.log('string', sourceStr == formattedStr ? 'PASS' : 'FAIL');
  /*
  // for line-by-line comparison debugging
  for (var i = 0; i < sourceLines.length; i++) {
    if (sourceLines[i] != formattedLines[i]) {
      console.log(i, 'fail', sourceLines[i], formattedLines[i]);
      break;
    }
  }
  */

  // text to test, isProject, isTask, isNote, tags
  [
    ['asdf:', 1, 0, 0, {}],
    ['-asdf', 0, 1, 0, {}],
    ['asdf', 0, 0, 1, {}],
    ['asdf @foo @ (@bar(baz))(', 0, 0, 1, {'foo':'', 'bar':'baz'}],
  ].forEach(function(test) {
    var item = new TaskItem(test[0]);
    console.log(item.tags.toSource(), test[4].toSource());
    console.log(
      test[0],
      item.is_project() == test[1] ? 'PASS' : 'FAIL',
      item.is_task() == test[2] ? 'PASS' : 'FAIL',
      item.is_note() == test[3] ? 'PASS' : 'FAIL',
      item.tags.toSource() == test[4].toSource() ? 'PASS' : 'FAIL'
    );
  });
})();

