/**
 * Module for using an external editor.
 *
 * Example where the user will be prompted for the path
 * to their editor of choice. The callback is passed the
 * entirety of the changed contents, whenever a change is
 * detected.
 *
 * const extEditor = require("ext-editor");
 *
 * let editor = new extEditor.Editor();
 *
 * editor.launch("foo\nbar\nbaz\n", function(changedText) {
 *   console.log(changedText);
 * });
 *
 * You can get the editor path as a string, after the user has chosen one:
 *
 * console.log(editor.editorPath);
 *
 * You can pass the editor path to the Editor constructor, so that
 * applications can cache it, and the user is only prompted the
 * initial time.
 *
 * let editor = new extEditor.Editor(stringPathToEditor);
 *
 */

const { Ci, Cc, Cu } = require("chrome");
Cu.import("resource://gre/modules/Services.jsm", this);

function Editor(editorPath) {
  this.editorPath = editorPath;
}
Editor.prototype = {
  // string path to editor
  editorPath: "",

  // function callback to pass contents of file to when modified
  onChangeHandler: null,

  // interval to check temp file for modifications
  watchFileInterval: 500,

  // temp file (nsIFile)
  _tempFile: null,

  // last modified time
  _lastModifiedTime: null,

  // prompts user to select the editor application
  // returns string path to editor, for caller to
  // persist for later use.
  choose: function choose() {
    var fp = Cc["@mozilla.org/filepicker;1"].createInstance(Ci.nsIFilePicker);
    fp.init(require("window-utils").activeWindow,
            "Choose an editor...", Ci.nsIFilePicker.modeOpen);
    fp.appendFilters(Ci.nsIFilePicker.filterAll | Ci.nsIFilePicker.filterText);
    var rv = fp.show();
    if (rv == Ci.nsIFilePicker.returnOK || rv == Ci.nsIFilePicker.returnReplace) {
      this.editorPath = fp.file.path;
    }
    return null;
  },

  launch: function launch(value, onChangeHandler) {
    if (!this.editorPath)
      this.choose();
    if (!this.editorPath)
      throw new Error("Editor: editor path undefined");
    if (!onChangeHandler)
      throw new Error("Editor: no change handler callback passed to launch()");

    this.onChangeHandler = onChangeHandler;

    this._tempFile = this._openStringInEditor(value);
    if (!this._tempFile || !this._tempFile.exists()) {
      throw new Error("Editor unable to create temp file");
    }
    this._lastModifiedTime = this._tempFile.lastModifiedTime;
    let self = this;
    require("timer").setTimeout(function() self._watchFile(), this.watchFileInterval);
  },

  // opens the editor with the given string content.
  // returns the nsIFile handle to the temp file.
  // deletes the temp file when the external app exits.
  _openStringInEditor: function _openStringInEditor(value) {
    // For the mac, wrap with a call to "open".
    var isOSX = Ci.nsIMacDockSupport && this.editorPath.slice(-4) === ".app";
    var executable = (Cc["@mozilla.org/file/local;1"]
                      .createInstance(Ci.nsILocalFile));
    executable.followLinks = true;
    executable.initWithPath(isOSX ? "/usr/bin/open" : this.editorPath);
    if (executable.exists()) {
      let file = Services.dirsvc.get("TmpD", Ci.nsIFile);
      file.append("jetpack.editor.tmp");
      file.createUnique(Ci.nsIFile.NORMAL_FILE_TYPE, 0666);

      let foStream = (Cc["@mozilla.org/network/file-output-stream;1"]
                      .createInstance(Ci.nsIFileOutputStream));

      // use 0x02 | 0x10 to open file for appending.
      foStream.init(file, 0x02 | 0x08 | 0x20, 0666, 0);
      // write, create, truncate
      // In a c file operation, we have no need to set file mode with or operation,
      // directly using "r" or "w" usually.
      foStream.write(value, value.length);
      foStream.close();
      try {
        let process = (Cc["@mozilla.org/process/util;1"]
                       .createInstance(Ci.nsIProcess));
        process.init(executable);
        let args = [];
        if (isOSX) {
          args.push("-a", this.editorPath, file.path);
        }
        else {
          args[0] = file.path;
        }
        let ret = process.run(false, args, args.length);
      } catch (e) {
        Cu.reportError(e);
        throw new Error("Error running editor : " + e);
        return null;
      }
      Cc["@mozilla.org/uriloader/external-helper-app-service;1"].
        getService(Ci.nsPIExternalAppLauncher).
        deleteTemporaryFileOnExit(file);
      return file;
    }
    throw new Error(editor + " is not an executable");
  },

  // returns the contents of a file path as a string
  _readFile: function _readFile(file) {
    var fstream = (Cc["@mozilla.org/network/file-input-stream;1"]
                   .createInstance(Ci.nsIFileInputStream));
    var sstream = (Cc["@mozilla.org/scriptableinputstream;1"]
                   .createInstance(Ci.nsIScriptableInputStream));
    fstream.init(file, -1, 0, 0);
    sstream.init(fstream);

    var value = "";
    var str = sstream.read(4096);
    while (str) {
      value += str;
      str = sstream.read(4096);
    }

    sstream.close();
    fstream.close();
    return value;
  },

  // watches a file for modifications
  _watchFile: function _watchFile() {
    if (!this._tempFile || !this._tempFile.exists()) {
      throw new Error("Editor: temp file was deleted or moved.");
      return;
    }
    var time = this._tempFile.lastModifiedTime;
    if (time > this._lastModifiedTime) {
      this.onChangeHandler(this._readFile(this._tempFile));
      this._lastModifiedTime = time;
    }
    let self = this;
    require("timer").setTimeout(function() self._watchFile(), this.watchFileInterval);
  }
}

exports.Editor = Editor;
