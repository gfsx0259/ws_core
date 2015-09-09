core.apps.admin_toolbars = function() {

    this.objects = {};
    if(core.usertype < USERTYPE_ADMIN) return;


    // order is important
    var toolbars = {
        app_settings: {
            height: 400,
            visible: false
        },
        theme_colors: {
            left: 100,
            top: 200,
            visible: false
        },
        theme_fonts: {
            left: 100,
            top: 200,
            visible: false
        },
        obj_settings: {
            left: 10,
            top: 100,
            height: 300,
            visible: false
        },
        menu: {
            left: 15,
            top: 180,
            visible: false
        },
        pages_list: {
            left: 245,
            top: 180,
            height: 300,
            visible: false
        },
        main: {
            left: 0,
            top: 120,
            visible: true
        }
    };

    var always_start_hidden = {
        app_settings: true,
        obj_settings: true,
        theme_colors: true,
        theme_fonts: true
    };

    if(!core.data.admin_toolbars_state) {
        core.data.admin_toolbars_state = {};
    }
    for(var name in toolbars) {
        if(!core.data.admin_toolbars_state[name]) {
            core.data.admin_toolbars_state[name] = toolbars[name];
        } else {
            var state = core.data.admin_toolbars_state[name];
            for(var k in toolbars[name]) {
                if((isNaN(state[k]) && k != "visible") || state[k] == undefined) {
                    state[k] = toolbars[name][k];
                }
            }
        }
        if(core.data.admin_toolbars_state[name].visible && !always_start_hidden[name]) {
            this.show(name, true);
        }
    }

};

core.apps.admin_toolbars.prototype = {


    
    show: function(name, skip_session_update) {
        if(!this.objects[name]) {
            this.objects[name] = new core.apps["admin_toolbar_" + name]();
            this.objects[name].init(name);
        }
        this.objects[name].show(skip_session_update);
        this.bringToFront(name);
    },

    hide: function(name) {
        if(this.objects[name]) {
            this.objects[name].hide();
        }
    },

    toggle: function(name) {
        if(!this.objects[name] || !core.data.admin_toolbars_state[name].visible) {
            this.show(name);
        } else {
            this.hide(name);
        }
    },


    isVisible: function(name) {
        return this.objects[name] && core.data.admin_toolbars_state[name].visible;
    },


    get: function(name) {
        return this.objects[name];
    },


    setElementDisabled: function(toolbar_name, element_id, flag) {
        if(this.get(toolbar_name)) {
            this.get(toolbar_name).setElementDisabled(element_id, flag);
        }
    },




// Z

    z_start: 16010,
    z_order: {},
    z_front_name: false,


    bringToFront: function(name) {
        if(name == this.z_front_name) return;
        var prev_z_value = -1, prev_z_name = false;
        for(var i in this.z_order) {
            if(this.z_order[i] > prev_z_value) {
                prev_z_name = i;
                prev_z_value = this.z_order[i];
            }
        }
        if(this.z_order[name] == undefined) {
            this.z_order[name] = prev_z_value + 1;
        } else {
            swapValues(this.z_order, prev_z_name, name);
        }
        this.get(name).$["window"].style.zIndex = this.z_start + this.z_order[name];
        if(prev_z_name) {
            this.get(prev_z_name).$["window"].style.zIndex = this.z_start + this.z_order[prev_z_name];
        }
        this.z_front_name = name;
    },


// stuff

    exitEditor: function() {
        if(core.data.site_info.is_paid != 0 && (core.data.site_version.is_changed == 1 || desktop.layout.site_changed)) {
            var p = {
                title: "Exiting site editor",
                message: "<img src='/js_apps/core.apps.admin_toolbars/images/icons/exit.png'/> Would you like to publish your changes now?",
                buttons: [
                    { title: "Revert to live version", callback: this.unpublishSite.bind(this), type: "link", className: "float_left" },
                    { title: "Yes", callback: this.publishSite.bind(this), ok_button: true },
                    { title: "No", callback: this.gotoUserSites.bind(this) }
                ]
            };
            desktop.modal_dialog.open(p);
        } else {
            this.gotoUserSites();
        }
    },


    publishSite: function() {
        desktop.setState("loading");
        var p = {
            dialog: "save_site",
            act: "publish"
        };
        core.transport.send("/site.php", p, this.onPublishResponse.bind(this));
    },



    onPublishResponse: function(r) {
        desktop.setState("normal");
        if(r && r.status == "ok") {
            desktop.loadURL("http://" + core.data.http_host + "/site.php?dialog=user_sites&action=stop_build_site");
        } else {
            desktop.modal_dialog.alert("Server error");
        }
    },



    unpublishSite: function() {
        desktop.setState("loading");
        var p = {
            dialog: "save_site",
            act: "unpublish"
        };
        core.transport.send("/site.php", p, this.onUnpublishResponse.bind(this));
    },


    onUnpublishResponse: function(r) {
        desktop.setState("normal");
        if(r && r.status == "ok") {
            desktop.loadURL("http://" + core.data.http_host + "/site.php?dialog=user_sites&action=stop_build_site");
        } else {
            desktop.modal_dialog.alert("Server error");
        }
    },


    gotoUserSites: function() {
        desktop.loadURL("http://" + core.data.http_host + "/site.php?dialog=user_sites&action=stop_build_site");
    },


    blinkUndo: function() {
        if(this.get("main")) {        
            core.baloon_tooltips.blink(this.get("main").$["btn_undo"]);
        }
    }

};
core.apps.admin_toolbars.extendPrototype(core.components.html_component);