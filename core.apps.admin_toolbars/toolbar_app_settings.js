core.apps.admin_toolbar_app_settings = function() {};

core.apps.admin_toolbar_app_settings.prototype = {

    template: "admin_toolbar_window_list",
    resize_height_element: "scrollable_content",


    renderContent: function() {
        this.displayTpl(this.$["content"], "admin_toolbar_app_settings");
        this.$["window"].className += " admin_toolbar_settings";
        if(core.data.page_settings.apps_locked) {
            this.hideElement("tab_styles");
        }
    },


// interface



    onSaveClick: function(e) {
        desktop.layout.log.push("block " + desktop.layout.active_app.appName + " settings updated");
        desktop.layout.callActiveApp("onSaveSettingClick", e);
        desktop.layout.callActiveApp("blur", e);
        this.hideElement("window");
    },

    onPreviewClick: function(e) {
        desktop.layout.log.push("block " + desktop.layout.active_app.appName + " settings updated");
        desktop.layout.callActiveApp("onApplySettingClick", e);
    },


    onDeleteClick: function(e) {
        desktop.layout.log.push("block " + desktop.layout.active_app.appName + " removed");
        desktop.layout.closeActiveApp();
    },


    onCopyClick: function(e) {
        desktop.layout.copy();
    },



    show: function(skip_session_update) {
        var state = this.getState();
        if(typeof(state.left) == "undefined") {
            var rect = core.browser.getWindowSize();
            state.left = rect.width;
            state.top = rect.height - state.height ;
        }
        state.visible = true;
        this.setState(state);
        this.updatePosition();

        var app = desktop.layout.getActiveApp();

        var t = "", l = core.data.apps_list;
        for(var i=0; i<l.length; i++) {
            if(l[i].name == app.appName) {
                t = l[i].title;
                break;
            }
        }
        this.setTitle(t + " Properties");

        this.$["properties"].appendChild(app.$.settings);
        this.showTab("properties");
    },


    onHideClick: function(e) {
        desktop.layout.callActiveApp("onCancelSettingClick", e);
        desktop.layout.callActiveApp("blur", e);
        this.hide();
    },



    onDocumentKeyUp: function(key_code) {
        if(!this.getState().visible) return;
        if(key_code == 27) {
            this.onHideClick();
            return true;
        } else if(key_code == 13) {
            this.onSaveClick();
            return true;
        }
        return false;
    },




    // tabs
    showProperties: function(e) {
        this.showTab("properties");
    },


    showStyles: function(e) {
        this.showTab("styles");
    },



    showTab: function(tab) {
        if(this.active_tab) {
            this.hideElement(this.active_tab);
            this.$["tab_" + this.active_tab].className = "";
        }

        this.active_tab = tab;
        this.showElement(tab);
        this.$["tab_" + tab].className = "active";

        if(tab == "styles") {
            if(!this.style_select) {
                this.style_select = new core.objects.style_select({
                    parent_el: this.$.styles,
                    callback: this.onStyleSelected.bind(this)
                });
            }
            this.style_select.setParams({ 
                key: desktop.layout.getActiveApp().appName,
                selected_style_id: desktop.layout.getActiveApp().profile.theme2_style_id
            });
        }
    },


    onStyleSelected: function(id) {
        desktop.layout.getActiveApp().onAppStyleSelected(id, true);
    }


};
core.apps.admin_toolbar_app_settings.extendPrototype(core.objects.admin_toolbar);
core.apps.admin_toolbar_app_settings.extendPrototype(core.components.html_component);