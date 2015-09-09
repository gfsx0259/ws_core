core.apps.themes_manager = function() {};

core.apps.themes_manager.prototype = {


    window_resize: {
        wmargin: 10,
        hmargin: 160,
        target: "lists"
    },


    getTitle: function() {
        return "Themes manager";
    },


    renderContent: function() {
        this.displayTpl(this.$["content"], "themes_manager");
        this.selectTab("user_themes");
        this.loadList(true);
    },



    setMode: function(mode) {
        switch(mode) {
            case "loading":
                desktop.setState("loading");
                break;

            case "error":
                desktop.setState("normal");
                desktop.modal_dialog.alert("Server error. Can't load data.");
                break;

            case "lists":
                desktop.setState("normal");
                break;
        }
        desktop.updatePopupPos();
    },



    // tabs
    onTabClick: function(e) {
        e = core.browser.event.fix(e);
        var el = e.target.key ? e.target : e.target.parentNode;
        el.blur();
        this.selectTab(el.key);
    },


    selectTab: function(tab) {
        if(this.active_tab) {
            this.hideElement("list_" + this.active_tab);
            this.$["btn_tab_" + this.active_tab].className = "";
        }
        this.active_tab = tab;
        this.showElement("list_" + this.active_tab);
        this.$["btn_tab_" + this.active_tab].className = "active";
                                   
        if(this.active_tab == "user_themes") {
            this.showElements(["btn_create", "btn_install"]);
        } else {
            this.hideElements(["btn_create", "btn_install"]);
        }
    },




    // lists requests 

    loadList: function(first_load) {
        if(core.data.themes_list) {
            this.renderUserThemesList();
            return;
        }
        this.setMode("loading");
        var p = {
            dialog: "themes_manager",
            act: "get_list",
            admin_themes: first_load ? 1 : 0
        };
        core.transport.send("/controller.php", p, this.onListResponce.bind(this));
    },


    onListResponce: function(r) {
        if(!r || r.status != "ok") {
            this.setMode("error");
            return;
        }
        if(r.admin_themes_list) {
            core.data.admin_themes_list = r.admin_themes_list;
            this.renderAdminThemesList();
        }
        core.data.themes_list = r.themes_list;
        this.renderUserThemesList();
    },




    // my themes list

    renderUserThemesList: function() {
        this.setMode("lists");

        var el = this.$["list_user_themes"];
        el.innerHTML = "";

        var i, t, m = [], is_active_theme, title;
        core.values.used_themes_titles = {};
        if(core.data.themes_list.length) {
            for(i=0; i<core.data.themes_list.length; i++) {
                t = core.data.themes_list[i];
                core.values.used_themes_titles[t.title] = t.id;

                is_active_theme = core.data.site_version[core.data.layout_mode + "_theme_id"] == t.id;


                m.push(
                    { tag: "div",
                      id: "theme" + t.id,
                      className: "theme" + (is_active_theme ? " active_theme" : ""),
                      events: { 
                        onmouseover: [ "onThemeMouseOver", t.id ],
                        onmouseout: [ "onThemeMouseOut", t.id ],
                        onclick: [ "onThemeClick", t.id ] 
                      },
                      html: "<div class='title'><span class='nowrap'>" + t.title + "</span><div></div></div><img class='thumb' src='" + t.thumb_path + "'/>" }
                );
            }
        } else {
            m.push(
                { tag: "text", innerHTML: "Empty list" }
            );
        }

        this.buildModel(el, m);
    },




    onRemoveThemeClick: function(e) {
        core.browser.event.kill(e);
        desktop.modal_dialog.confirm("Delete theme?", this.deleteTheme.bind(this, this.hover_theme_id));
    },


    deleteTheme: function(id) {
        this.setMode("loading");
        var p = {
            dialog: "themes_manager",
            act: "delete",
            id: id
        };
        core.transport.send("/controller.php", p, this.onDeleteFormResponce.bind(this));
    },


    onDeleteFormResponce: function(r) {
        if(!r || r.status != "ok") {
            this.setMode("error");
            return;
        }
        core.data.themes_list = r.themes_list;
        this.renderUserThemesList();
        this.setMode("lists");
    },




    // templates list
    renderAdminThemesList: function() {
        this.setMode("lists");

        
        var el = this.$["list_admin_themes"];
        el.innerHTML = "";

        if(!core.data.admin_themes_list) return;

        var i, t, m = [], is_active_theme, title;

        if(core.data.admin_themes_list.length) {
            for(i=0; i<core.data.admin_themes_list.length; i++) {
                t = core.data.admin_themes_list[i];

                is_active_theme = core.data.site_version[core.data.layout_mode + "_theme_id"] == t.id;

                title = "<span class='nowrap'>" + (is_active_theme ? "<img src='/static/icons/accept.png'/>" : "") + t.title + "</span><div></div>";

                m.push(
                    { tag: "div",
                      id: "theme" + t.id,
                      className: "theme" + (is_active_theme ? " active_theme" : ""),
                      events: { 
                        onclick: [ "onThemeClick", t.id ] 
                      },
                      childs: [
                        { tag: "div", className: "title", 
                          html:  title },
                        { tag: "img", className: "thumb",
                          src: t.thumb_path }
                      ]}
                );
            }
        } else {
            m.push(
                { tag: "text", innerHTML: "Empty list" }
            );
        }
        this.buildModel(el, m);
    },





// use theme
    onThemeClick: function(e, id) {
        if(core.data.theme.id == id) return;
        desktop.setState("loading");
        var p = {
            dialog: "themes_manager",
            act: "use_theme",
            id: id
        };
        core.transport.send("/controller.php", p, this.onUseThemeResponse.bind(this));
    },


    onUseThemeResponse: function(r) {
        if(!r || r.status != "ok") {
            this.setMode("error");
            return;
        }        
        desktop.admin_slider.hide();
        if(!core.data.site_info.theme) {
            desktop.loadURL(location.href);
        } else {
            core.data.theme_styles = null;
            core.data.theme = r.theme;
            this.renderAdminThemesList();
            this.renderUserThemesList();
            desktop.reloadThemeCSS();
        }
    },





    // new empty theme
    createTheme: function() {
        core.values.theme_editor = {
            theme: {
                id: false,
                title: "New theme",
                thumb: "",
                colors: core.data.site_version[core.data.layout_mode + "_colors"],
                fonts: core.data.site_version[core.data.layout_mode + "_fonts"]
            },
            callback: this.onThemeData.bind(this)
        };
        desktop.showPopupApp("theme_editor");
    },


    onThemeData: function(theme) {
        this.setMode("loading");
        var p = {
            dialog: "themes_manager",
            act: "create",
            title: theme.title,
            thumb: theme.thumb,
            colors: theme.colors,
            fonts: theme.fonts,
            styles: varToString(theme.styles)
        };
        core.transport.send("/controller.php", p, this.onThemeCreatedResponse.bind(this));
    },


    onThemeCreatedResponse: function(r) {
        if(!r || r.status != "ok") {
            this.setMode("error");
            return;
        }        
        core.data.themes_list = r.themes_list;
        this.renderUserThemesList();
    },



    // update theme
    onEditThemeClick: function(e) {
        core.browser.event.kill(e);

        var theme;
        for(var i=0; i<core.data.themes_list.length; i++) {
            if(core.data.themes_list[i].id == this.hover_theme_id) {
                theme = core.data.themes_list[i];
                break;
            }
        }

        if(!theme) return;

        core.values.theme_editor = {
            theme: {
                id: theme.id,
                title: theme.title,
                thumb: theme.thumb,
                colors: theme.colors,
                fonts: theme.fonts
            },
            callback: this.onEditThemeData.bind(this)
        };
        desktop.showPopupApp("theme_editor");
    },


    onEditThemeData: function(theme) {
        this.reload_theme = theme.id == core.data.theme.id;
        this.setMode("loading");
        var p = {
            dialog: "themes_manager",
            act: "update",
            id: theme.id,
            title: theme.title,
            thumb: theme.thumb,
            colors: theme.colors,
            fonts: theme.fonts,
            styles: varToString(theme.styles),
            load_default_styles: this.reload_theme ? 1 : 0
        };
        core.transport.send("/controller.php", p, this.onThemeUpdatedResponse.bind(this));
    },


    onThemeUpdatedResponse: function(r) {
        if(!r || r.status != "ok") {
            this.setMode("error");
            return;
        }        
        core.data.themes_list = r.themes_list;
        if(r.theme_default_styles) {
            core.data.theme_default_styles = r.theme_default_styles;
        }

        this.renderUserThemesList();
        if(this.reload_theme) {
            desktop.reloadThemeCSS();
        }
    },


    // load
    onLoadClick: function(e) {
        desktop.openFilesManager(this.onThemeFileSelected.bind(this), "themes");
    },

    onThemeFileSelected: function(file) {
        desktop.modal_dialog.prompt("Enter theme name", "", this.onThemeNameEntered.bind(this, file));
    },


    onThemeNameEntered: function(file, theme_name) {
        var id = core.values.used_themes_titles[theme_name];
        if(!id) {
            this.setMode("loading");
            var p = {
                dialog: "themes_manager",
                act: "load_from_file",
                file: file,
                new_title: theme_name
            };
            core.transport.send("/controller.php", p, this.onThemeLoadResponse.bind(this));
        } else {
            desktop.modal_dialog.alert("Theme name already used");
        }        
    },



    onThemeLoadResponse: function(r) {
        if(!r || r.status != "ok") {
            this.setMode("error");
            return;
        }
        core.data.themes_list = r.themes_list;
        this.renderUserThemesList();
        this.setMode("lists");
    },


    // save
    onSaveThemeClick: function(e) {
        desktop.setState("loading");
        var p = {
            dialog: "themes_manager",
            act: "save_to_file",
            id: this.hover_theme_id
        };
        core.transport.send("/controller.php", p, this.onThemeSaveResponse.bind(this));        
    },


    onThemeSaveResponse: function(r) {
        if(!r || r.status != "ok") {
            this.setMode("error");
            return;
        }
        desktop.setState("normal");
        desktop.hidePopupApp();
        desktop.openFilesManager(false, "themes");
    },




    // styles
    onManageStylesClick: function(e) {
        core.browser.event.kill(e);
        key = e.target.style_key;
        if(key) {
            desktop.openStylesManager(
                key
            );
        }
    },





    // theme controls
    onThemeMouseOver: function(e, id) {
        if(this.hover_theme_id == id) return;

        this.hover_theme_id = id;
        if(!this.$.theme_controls || !this.$.theme_controls.parentNode) {
            this.displayTpl(this.$["theme" + id], "themes_manager_theme_controls");
        } else {
            this.$["theme" + id].appendChild(this.$.theme_controls);
        }
        if(id == core.data.theme.id) {
            this.hideElement("cbtn_delete");
//            this.showElements(["cbtn_custom_code", "cbtn_typo", "cbtn_pager", "cbtn_imagebox"]);
        } else {
            this.showElement("cbtn_delete");
//            this.hideElements(["cbtn_custom_code", "cbtn_typo", "cbtn_pager", "cbtn_imagebox"]);
        }
    },


    onThemeMouseOut: function(e) {
        if(!this.hover_theme_id) return;
        core.browser.event.fix(e);

        var el = e.toElement, theme_el = this.$["theme" + this.hover_theme_id];
        while(el && el.parentNode) {
            el = el.parentNode;
            if(el == theme_el) return;
        }
        this.hover_theme_id = null;
        desktop.$.tmp_hidden.appendChild(this.$.theme_controls);
    },



    // popup bootom btns

    onCreateClick: function() {
        this.createTheme();
    },

    onCancelClick: function() {
        desktop.hidePopupApp();
    }

};
core.apps.themes_manager.extendPrototype(core.components.html_component);
core.apps.themes_manager.extendPrototype(core.components.popup_app);