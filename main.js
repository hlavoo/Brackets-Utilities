/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

/** Simple extension that adds a "File > Hello World" menu item */
define(function (require, exports, module) {
    "use strict";

    var CommandManager = brackets.getModule("command/CommandManager"),
        Menus          = brackets.getModule("command/Menus"),
        Dialogs        = brackets.getModule("widgets/Dialogs"),
        ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
        FileSystem = brackets.getModule("filesystem/FileSystem"),
        PreferencesManager = brackets.getModule("preferences/PreferencesManager"),
        prefs = PreferencesManager.getExtensionPrefs("nete"),
        stateManager = PreferencesManager.stateManager.getPrefixedSystem("nete");
    
    // Preferences
    prefs.definePreference("error-color", "string", "#FFFF00");
	prefs.definePreference("fade-pane", "string", "1!important");
    
    function initSettings(prefs) {
        console.log('init');
        console.log(prefs);
        $('#error-color').val(prefs.get('error-color'));
		$('input[value="'+prefs.get('fade-pane')+'"]').attr('checked', 'checked');
		console.log(prefs.get('fade-pane'));
    }

    // Thirdparty libraries    
    var colorpicker = require('jquery.minicolors.min');
    
    // extension path
    var path = ExtensionUtils.getModulePath(module);
    
    
    // import style sheet
    ExtensionUtils.loadStyleSheet(module, 'less/main.less');
    
    // preferences template
    var prefHTML = require("text!tpls/prefs.html");
    
    // color settings
    var file = FileSystem.getFileForPath(path + 'less/variables.less');
    
    function setColorSettings(settings) {
		console.log('Set color settings.');
        var cssSettings = '@error-color: ' + settings["error-color"] + ';\n'
						 + '@fade-pane: ' + settings["fade-pane"] + ';\n';
        prefs.set('error-color', settings["error-color"]);
		prefs.set('fade-pane', settings["fade-pane"]);

        file.write(cssSettings, {blind: true});

        ExtensionUtils.addEmbeddedStyleSheet('.cm-error {background-color: ' + settings["error-color"] + '!important}');
		
		
		if (settings["fade-pane"] == '1!important') {
			ExtensionUtils.addEmbeddedStyleSheet('.view-pane {opacity: ' + settings["fade-pane"] + '}');
		} else {
			ExtensionUtils.addEmbeddedStyleSheet('.view-pane {opacity: ' + settings["fade-pane"] + '!important}');
			ExtensionUtils.addEmbeddedStyleSheet('.active-pane {opacity: 1!important}');
		}

        stateManager.save();
    }
            
    // show settings dialog
    function showSettingsDialog() {
        var template = Mustache.render(prefHTML);
		var dialog = Dialogs.showModalDialogUsingTemplate(template);
        var $dialog = dialog.getElement();
        
        initSettings(prefs);
        $('#error-color').minicolors();
        dialog.done(function (buttonId) {
            if (buttonId === 'ok') {
                var settings = {
                    'error-color' : $('#error-color', $dialog).val(),
					'fade-pane' : $('input[name="fade-pane"]:checked', $dialog).val()
                };                
                setColorSettings(settings);
            }
        });
        
    }
    
/*    function bindListeners() {
		$("button[data-button-id='defaults']").on("click", function (e) {
            e.stopPropagation();
        });
        $("button[data-button-id='ok']").on("click", function (e) {
            console.log('button click');
            setColorSettings();
        });
	}
    
    $('button').on('click', function(){
        console.log('click');
    });
	
	bindListeners();*/

    // First, register a command - a UI-less object associating an id to a handler
    var SHOW_SETTINGS_DIALOG = "nete-brackets.showprefdialog";   // package-style naming to avoid collisions
    CommandManager.register("NETE Bracket Settings", SHOW_SETTINGS_DIALOG, showSettingsDialog);

    // Then create a menu item bound to the command
    // The label of the menu item is the name we gave the command (see above)
    var menu = Menus.getMenu(Menus.AppMenuBar.FILE_MENU);
    menu.addMenuItem(SHOW_SETTINGS_DIALOG);

    // We could also add a key binding at the same time:
    //menu.addMenuItem(MY_COMMAND_ID, "Ctrl-Alt-H");
    // (Note: "Ctrl" is automatically mapped to "Cmd" on Mac)
});
