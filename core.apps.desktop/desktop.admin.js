core.apps.desktop.extendPrototype({


    autorun_popups: [ 
        "files_upload",
        "text_editor"
    ],



    initInterface_admin: function() {
        this.displayTpl(document.body, "desktop_popup");

//        if(core.data.layout_mode == "mobile") this.initMobileEditor();

        this.files_uploader = new core.objects.files_uploader();

        if(!core.values.is_page_preview) {
            this.admin_slider = new core.apps.admin_slider();
            this.admin_toolbars = new core.apps.admin_toolbars();
        }

        this.initPopupApps(this.autorun_popups);

//        this.uploader = this.popup_apps["files_upload"];
//        this.uploader.loadObject();


        if(!core.values.is_page_preview) {
            setTimeout("desktop.createEditTitleBtn()", 1000);
            setTimeout(this.createEditSiteLogoBtn.bind(this), 1000);
        }
        if(core.data.site_info.show_help == 1){
            this.showHelp();
        }

        this.initKbdHandler();
    },



    // site logo image edit button
    createEditSiteLogoBtn: function() {
        if(!this.$["site_logo"]) return;
        if(this.$["site_logo"].style.display == "none") return;
        this.buildModel(this.$["site_logo"], [
            { tag: "div",
              events: { onclick: "onEditSiteLogoClick" },
              className: "edit_site_title_btn",
              title: "Click to edit site logo" },
            { tag: "div",
              events: { onclick: "onClearSiteLogoClick" },
              className: "clear_site_title_btn",
              title: "Click clear site logo" }
        ]);
    },


    onEditSiteLogoClick: function(e) {
        desktop.openFilesManager(this.onSiteLogoFileSelected.bind(this), "pictures");
    },


    onSiteLogoFileSelected: function(file) {
        core.data.site_info.site_logo = file;
        var r = {
            dialog: "save_site",
            act: "update_site_logo",
            value: file
        }
        core.transport.send("/controller.php", r, this.onSiteLogoUpdated.bind(this), "POST");
    },



    onSiteLogoUpdated: function() {
        this.renderSiteLogo();
    },


    onClearSiteLogoClick: function() {
        this.onSiteLogoFileSelected("");
    },


    // site title editor

    createEditTitleBtn: function() {
        if(!this.$["site_title"]) return;
        var el = core.browser.element.create(
            "div", 
            { className: "edit_site_title_btn",
              title: "Click to edit site title" } 
        );
        var oThis = this;
        el.onclick = function() {
            oThis.onTitleClick();
        }
        this.$["site_title"].appendChild(el);
    },

    createSaveTitleBtn: function() {
        var el = document.createElement("DIV");
        el.setAttribute("class", "save_site_title_btn");
        var oThis = this;
        el.onclick = function() {
            oThis.saveTitle();
        }
        this.$["site_title"].appendChild(el);
    },

    onTitleClick: function() {
        if(this.editTitle || core.values.is_page_preview) return;

        this.editTitle = true;

        
        var fs = "";
        var color = "";
        var fw = "";
        var pEl = this.$["site_title"].firstChild;
        if (pEl.currentStyle) {
            fs = pEl.currentStyle["fontSize"];
        }
        else if (window.getComputedStyle) {
            fs = document.defaultView.getComputedStyle(pEl, null).getPropertyValue("font-size");
        }
        this.$["site_title"].innerHTML = "";

//        var el = this.$["site_header"].getElementsByTagName("h1")[0];
//        this.$["site_title"] = el;

        var inp = document.createElement("input");
        inp.setAttribute("type", "text");
        inp.setAttribute("value", core.data.site_info.title);
        inp.setAttribute("class", "site_title_edit");

        inp.style.fontSize = fs;
        inp.style.color = color;

        var oThis = this;
        inp.onkeyup = function(e) {
            e = core.browser.event.fix(e);
            oThis.onTitleKeyPress(e.keyCode);
        };

        inp.onblur = function() {
            oThis.saveTitle();
        }
        this.$["site_title"].appendChild(inp);

        this.$["site_title_inp"] = inp;

        this.$["site_title"].firstChild.style.display = "none";
        this.$["site_title_inp"].value = core.data.site_info.title;
        this.$["site_title_inp"].style.display = "";
        this.$["site_title_inp"].focus();
        this.$["site_title_inp"].select();
        this.createSaveTitleBtn();
    },

    onTitleKeyPress: function(keyCode) {
        switch(keyCode) {
            case 13:
                this.saveTitle();
                break;
            case 27:
                this.setTitle(core.data.site_info.title);
                this.editTitle = false;
                this.createEditTitleBtn();
                break;
        }
    },

    saveTitle: function(title) {
        var r = {
            dialog: "save_site",
            title: this.$["site_title_inp"].value,
            subdomain: core.data.site_info.subdomain,
            act: "update_info"
        }
        core.transport.send("/controller.php", r, this.onTitleSaved.bind(this), "POST");
    },

    onTitleSaved: function() {
        core.data.site_info.title = this.$["site_title_inp"].value.replace(/<[^>]>/g, "");
        this.setTitle(core.data.site_info.title);
        this.editTitle = false;
        this.createEditTitleBtn();
    },





    // notification popup
    notify_list: [],
    notify_bar_state: "hidden",
    notify_hide_timeout: 500,
    notify_dimmer_timeout: 50,

    showNotify: function(str) {
        if(this.notify_bar_text == str) return;
        for(var i=0; i<this.notify_list.length; i++) {
            if(this.notify_list[i] == str) {
                this.notify_list.splice(i, 1);
            }
        }
        this.notify_list.push(str);
        this.renderNotifyBar();
        this.processNotifyBar();
    },


    renderNotifyBar: function() {
        if(!this.$.notify_bar) {
            this.displayTpl(document.body, "notify_bar");
        }
    },

    processNotifyBar: function() {
        if(!this.notify_timeout) {
            this.notifyBarLoop();
        }
    },


    notifyBarLoop: function() {
        clearTimeout(this.notify_timeout);
        this.notify_timeout = null;

        switch(this.notify_bar_state) {
            case "visible":
                if(this.notify_list.length) {
                    this.notify_bar_state = "hidden";
                    this.notify_timeout = setTimeout(this.notifyBarLoop.bind(this), this.notify_hide_timeout);
                } else {
                    this.notify_bar_state = "dimmer";
                    this.notify_bar_opacity = 70;
                    this.notifyBarLoop();
                }
                break;

            case "dimmer":
                if(this.notify_list.length) {
                    this.notify_bar_state = "hidden";
                    this.notifyBarLoop();
                } else {
                    this.notify_bar_opacity -= 10;
                    if(this.notify_bar_opacity > 0) {
                        this.setElementOpacity("notify_bar", this.notify_bar_opacity);
                        this.notify_timeout = setTimeout(this.notifyBarLoop.bind(this), this.notify_dimmer_timeout);
                    } else {
                        this.notify_bar_state = "hidden";
                        this.notify_bar_text = false;
                        this.hideElement("notify_bar");
                    }
                }
                break;

            case "hidden":
                if(this.notify_list.length) {
                    var str = this.notify_list.shift();
                    this.$.notify_text.innerHTML = str;
                    this.notify_bar_text = str;
                    this.showElement("notify_bar");
                    this.setElementOpacity("notify_bar", 70);
                    this.notify_bar_state = "visible";
                    this.notify_timeout = setTimeout(this.notifyBarLoop.bind(this), this.notify_hide_timeout);
                }
                break;
        }
    },






    // kbd

    initKbdHandler: function() {
        core.browser.event.attach(document, "onkeyup", this.onKbdKeyUp.bind(this));
    },



    onKbdKeyUp: function(e) {
        e = core.browser.event.fix(e);
        var key_code = e.keyCode || e.which;


        if(this.modal_dialog.onDocumentKeyUp(key_code)) return;

        var popup = this.getActivePopup();
        if(!popup) {
            var app_settings_toolbar = this.admin_toolbars.get("app_settings");
            if(app_settings_toolbar && app_settings_toolbar.onDocumentKeyUp(key_code)) return;
        }


        if(popup) {
            if(key_code == 27) {
                desktop.hidePopupApp();
            } else {
                popup.callFunction("onDocumentKeyUp", e);
            }
        } else {
            if(core.data.page_settings.apps_locked || e.target.tagName != "BODY" || !this.layout.active_app) return;
            switch(key_code) {
                case 46: 
                    desktop.layout.closeActiveApp();
                    break;
                case 37: 
                    if(e.ctrlKey) {
                        desktop.layout.app_move.move("ctrl_left");
                    } else {
                        desktop.layout.app_move.move("left");
                    }
                    break;
                case 38:
                    desktop.layout.app_move.move("up");
                    break;
                case 39:
                    if(e.ctrlKey) {
                        desktop.layout.app_move.move("ctrl_right");
                    } else {
                        desktop.layout.app_move.move("right");
                    }
                    break;
                case 40:
                    desktop.layout.app_move.move("down");
                    break;
            }
        }
    },



    reloadThemeCSS: function() {
        $("css_theme").href = this.getThemeFile() + "?_rnd=" + Math.random();
    },


    getThemeFile: function() {
//        return "/themes_v2/" + core.data.site_info.id + "_" + core.data.site_version.id + "_" + core.data.layout_mode + ".css";
        return "/themes_v2/" + core.data.site_version.id + "_" + core.data.layout_mode + ".css";
    }


});