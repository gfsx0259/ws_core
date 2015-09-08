core.apps.layout_columns.extendPrototype({


    updateClipboardControls: function() {
        if(desktop.admin_toolbars) {
            desktop.admin_toolbars.setElementDisabled("main", "btn_paste", !core.data.apps_clipboard);
        }
    },



    parseClipboardData: function() {
        var app = this.getActiveApp();
        if(!app) return null;

        var res = {
            profiles: {},
            apps: {},
            layout: []
        }
        this.layout_parser.parse(app.$["window"], res, true);
        if(!res.layout.length) {
            res = null;
        }
        return res;
    },


    copy: function() {
        desktop.setState("loading");
        core.data.apps_clipboard = this.parseClipboardData();
        var r = {
            dialog: "apps_clipboard",
            data: varToString(core.data.apps_clipboard)
        }
        core.transport.send("/controller.php", r, this.onCopyResponse.bind(this), "POST");
    },


    onCopyResponse: function() {
        desktop.setState("normal");
        this.updateClipboardControls();
    },


    paste: function(callback) {
        if(!core.data.apps_clipboard) return false;

        var data = clone(core.data.apps_clipboard);

        var res = {
            el: document.createDocumentFragment(),
            app_ids: []
        }

        var start_id = this.getFreeAppId();
        var new_ids = {};
        var new_app_names = {};
        for(var tmp_id in data.apps) {
            new_app_names[data.apps[tmp_id].name] = true;
            new_ids[tmp_id] = start_id;
            this.profiles[start_id] = clone(data.profiles[tmp_id]);
            res.app_ids.push(start_id);
            start_id++;
        }
        this.replaceVirtualIds(data.layout, new_ids);

        desktop.setState("loading");
        core.launcher.load({
            components: array_keys(new_app_names),
            onload: function() {
                desktop.layout.renderNodes(res.el, data.layout, true);
                callback(res);
                desktop.setState("normal");
            }
        });
    },



    replaceVirtualIds: function(data, new_ids) {
        for(var i=0; i<data.length; i++) {
            if(data[i].type == "app") {
                data[i].id = new_ids[data[i].id];
            }
            if(data[i].childs) {
                this.replaceVirtualIds(data[i].childs, new_ids);
            }
        }
    }



});