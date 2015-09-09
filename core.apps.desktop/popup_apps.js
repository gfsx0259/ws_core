core.apps.desktop.extendPrototype({


    popup_apps: {},
    popup_stack: [],


    initPopupApps: function(list) {
        window.onresize = this.onWindowResize.bindAsEventListener(this);
        for(var i=0; i<list.length; i++) {
            var n = list[i];
            if(core.apps[n]) {
                this.popup_apps[n] = new core.apps[n]();
            }
        }
    },



    setPopupTitle: function(str) {
        this.$["popup_title"].innerHTML = str;
    },


    showPopupApp: function(name, popup_args) {
        if(!this.popup_apps[name]) {
            this.loadPopupApp(name, popup_args);
            return;
        }

        for(var i=0; i<this.popup_stack.length; i++) {
            if(this.popup_stack[i] == name) {
                this.popup_stack.splice(i, 1);
                break;
            }
        }

        var lastIdx = this.popup_stack.length-1;
        var lastAppName = this.popup_stack[lastIdx];
        if(lastAppName) {
            var lastApp = this.popup_apps[lastAppName];
            if(lastApp.name == name) return;
            lastApp._hideContent();
        }
        
        this.popup_stack.push(name);
        this.active_popup_name = name;
        var a = this.popup_apps[name];
        a._showContent();
        this.initPopupPosition();
        this.showOverlay();

        if(a.no_help_icon) {
            this.hideElement("btn_popup_help");
        } else {
            this.showElement("btn_popup_help");
        }

        a.callFunction("init", popup_args);
        a.callFunction("onContentVisible");
    },



    getActivePopup: function() {
        return this.popup_apps[this.active_popup_name];
    },


    hidePopupApp: function(e) {
        var pn = this.popup_stack.pop();
        if(!this.popup_apps[pn]) return;

        this.popup_apps[pn]._hideContent();

        if(this.popup_stack.length) {
            var lastIdx = this.popup_stack.length-1;
            this.active_popup_name = this.popup_stack[lastIdx];
            this.popup_apps[this.active_popup_name]._showContent();
            this.updatePopupPos();
        } else {
            this.active_popup_name = null;
            this.hideOverlay();
        }
    },



    loadPopupApp: function(name, popup_args) {
        this.setState("loading");
        this.loading_app = name;
        var p = {
            onload: this.onPopupAppLoaded.bind(this, popup_args),
            components: [ name ]
        };
        core.launcher.load(p);
    },


    onPopupAppLoaded: function(popup_args) {
        desktop.setState("normal");
        if(core.apps[this.loading_app]) {
            this.popup_apps[this.loading_app] = new core.apps[this.loading_app]();
            this.showPopupApp(this.loading_app, popup_args);
        } else {
            desktop.modal_dialog.alert("Session expired, please relogin.");
        }
    },



    // overlay
    showOverlay: function() {
        this.showElements(["popup_window", "overlay"]);
        this.updatePopupPos();
    },

    hideOverlay: function() {
        this.hideElements(["popup_window", "overlay"]);
    },


    // mode = desktop (default) || document
    updatePopupPos: function(mode) {
        if(mode == "document") {
            var wname = "desktop_loading";
        } else {
            if(this.popup_stack.length == 0) return;
            var wname = "popup_window";
        }

        var winSize = core.browser.getWindowSize();
        var l = Math.round((winSize.width - this.$[wname].offsetWidth) * 0.5);
        var t = Math.round((winSize.height - this.$[wname].offsetHeight) * 0.5);
        this.$[wname].style.left = (l > 0 ? l : 0) + "px";
        this.$[wname].style.top = (t > 0 ? t : 0) + "px";
    },




// popup resize
    initPopupPosition: function() {
        var app = this.getActivePopup();
        if(!app) return;
        if(app.window_resize) {
            this.$["popup_footer"].style.cursor = "s-resize";
            this.$["popup_right"].style.cursor = "e-resize";

            var el = app.$[app.window_resize.target];

            var win_size = core.browser.getWindowSize();
            win_size.width -= 50;
//            win_size.height -= 50;

            if(!core.data.popups_position) {
                win_size.width = Math.min(win_size.width, 1000);
                win_size.height = Math.min(win_size.height, 700);
                core.data.popups_position = win_size;
            } else {
                if(core.data.popups_position.width > win_size.width) {
                    core.data.popups_position.width = win_size.width;
                }
                if(core.data.popups_position.height > win_size.height) {
                    core.data.popups_position.height = win_size.height;
                }
            }
            var rect = {
                width: core.data.popups_position.width - (app.window_resize.wmargin || 0),
                height: core.data.popups_position.height - (app.window_resize.hmargin || 0)
            };
//varp(app.window_resize);
            el.style.width = rect.width + "px";
            el.style.height = rect.height + "px";
            app.callFunction("onResize", rect);

        } else {
            this.$["popup_footer"].style.cursor = "default"; 
            this.$["popup_right"].style.cursor = "default";
        }
        this.updatePopupPos();
    },



    startPopupResize: function(e) {
        var app = this.getActivePopup();
        if(!app || !app.window_resize) return;

        e = core.browser.event.fix(e);

        this.mouse_ofs = {
            width: core.data.popups_position.width - 2*e.clientX,
            height: core.data.popups_position.height - 2*e.clientY
        };

        core.browser.event.push(document, ["onmousemove", "onmouseup"]);
        document.onmousemove = this.processPopupResize.bindAsEventListener(this);
        document.onmouseup = this.stopPopupResize.bindAsEventListener(this);
        core.browser.event.kill(e);
    },


    popup_min_size: {
        width: 800,
        height: 400
    },


    processPopupResize: function(e) {
        var app = this.popup_apps[this.active_popup_name];
        if(!app) return;

        e = core.browser.event.fix(e);

        core.data.popups_position = {
            width: Math.max(this.popup_min_size.width, this.mouse_ofs.width + 2*e.clientX),
            height: Math.max(this.popup_min_size.height, this.mouse_ofs.height + 2*e.clientY)
        };


        var el = app.$[app.window_resize.target];
        var rect = {
            width: core.data.popups_position.width - (app.window_resize.wmargin || 0),
            height: core.data.popups_position.height - (app.window_resize.hmargin || 0)
        };


        el.style.width = rect.width + "px";
        el.style.height = rect.height + "px";
        app.callFunction("onResize", rect);
        this.updatePopupPos();
    },



    stopPopupResize: function(e) {
        core.browser.event.pop();
        var r = {
            dialog: "desktop",
            act: "set",
            key: "popups_position",
            data: varToString(core.data.popups_position)
        };
        core.transport.send("/controller.php", r, this.onSetPopupPositionResponse.bind(this), "POST");
    },

    onSetPopupPositionResponse: function(r) {},





    // browser resize

    onWindowResize: function(e) {
        this.updatePopupPos(this.isLoading ? "document" : "desktop");
        if(this.admin_slider) {
            this.admin_slider.onWindowResize();
        }

        var app = this.layout.getActiveApp();
        if(app && app.focused) {
            app.updateOuterOverlayPosition();
        }
    },





    // clicks

    showPopupAppHelp: function() {
        var app = this.popup_stack[this.popup_stack.length - 1];
        this.showHelp("tools/" + app + ".html");
    },




    // drag
    startPopupDrag: function(e) {
        e = core.browser.event.fix(e);
        var el = this.$["popup_window"];

        this.popup_ofs = { 
            left: el.offsetLeft - e.clientX, 
            top: el.offsetTop - e.clientY 
        };

        core.browser.event.push(document, ["onmousemove", "onmouseup"]);
        document.onmouseup = this.stopPopupDrag.bindAsEventListener(this);
        document.onmousemove = this.movePopup.bindAsEventListener(this);
        core.browser.event.kill(e);
        return false;
    },

    movePopup: function(e) {
        e = core.browser.event.fix(e);
        var el = this.$["popup_window"];
        el.style.left = this.popup_ofs.left + e.clientX + "px";
        el.style.top = this.popup_ofs.top + e.clientY + "px";
    },

    stopPopupDrag: function(e) {
        core.browser.event.pop();
    },



    ///////////////////////////////////////
    // Popups
    ///////////////////////////////////////


    showHelp: function(file) {
        core.values.help_center_file = file;
        this.showPopupApp("help_center");
    },




    // mode: [ "simple" | "std" ] 
    openTextEditor: function(text, callback, options) {
        var te = this.popup_apps["text_editor"];
        te.onsave = callback;
        this.showPopupApp("text_editor");

        var default_text = {
            content: "",
            summary: "",
            tags: "",
            author: false,
            modified: false,
            title: "New document"
        };
        if(!text) text = {};
        for(var key in default_text) {
            if(text[key] == undefined) text[key] = default_text[key];
        }
        te.setData(text, options);
        desktop.updatePopupPos();
    },


    // multiselect: if set empty array or array of doc ID - show doc manager in multiselect mode
    openTextsManager: function(callback, multiselect) {
        core.values.texts_manager_args = {
            callback: callback,
            multiselect: multiselect
        };
        this.showPopupApp("texts_manager");
    },


    openFilesManager: function(callback, folder) {
        var p = {
            folder: folder
        };
        if(callback && callback["onselect"]) {
            p.onselect = callback["onselect"];
            p.onselect_multiple = callback["onselect_multiple"];
        } else {
            p.onselect = callback;
        }
        core.values.files_manager = p;
        this.showPopupApp("files_manager");
    },


    refreshFilesManager: function() {
        if(desktop.popup_apps["files_manager"]) {
            desktop.popup_apps["files_manager"].refresh_on_show = true;
        }
    },


    openEcommerceManager: function(callback, mode, bar, list_filter) {
        core.values.ecommerce_manager = {
            callback: callback,
            mode: mode,//standard,select,select_one
            bar: bar,
            list_filter: list_filter
        };
        this.showPopupApp("ecommerce_manager");
    },

    openEventsManager: function(callback, mode, bar) {
        core.values.event_manager = {
            callback: callback,
            mode: mode,//standard,select
            bar: bar
        };
        this.showPopupApp("events_manager");
    },

    openCalendarEvent: function(data) {
        core.values.calendar_event_data = data;
        this.showPopupApp("calendar_event");
    },


    showColorPicker: function(c, cb) {
        core.values.color_picker = {
            callback: cb,
            color: c
        };
        this.showPopupApp("color_picker");
    },



    // image editor

    runImageEditor: function(fname, cb) {
        core.values.image_editor = { callback: cb };
        this.setState("loading");
        var p = {
            dialog: "files_manager",
            act: "get_image_data",
            file: fname
        };
        core.transport.send("/controller.php", p, this.onImageInfoResponce.bind(this));
    },


    onImageInfoResponce: function(r) {
        desktop.setState("normal");
        if(r) {
            core.values.image_editor.file = r;
            this.showPopupApp("image_editor");
        } else {
            desktop.modal_dialog.alert("Can't edit this file");
        }
    },




// styles manager

    openStylesManager: function(key, style_id, callback, is_single_style) {
        if(core.data.site_version[core.data.layout_mode + "_theme_id"] == 0) {
//            desktop.modal_dialog.alert("Available only for themes v2");
            return;
        }

        core.values.styles_manager = {
            key: key,
            selected_id: style_id,
            callback: callback,
            is_single_style: is_single_style
        };
        this.showPopupApp("styles_manager");
    }


});