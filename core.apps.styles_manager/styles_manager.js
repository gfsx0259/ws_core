if(!core.data.css_styles_list) {
    core.data.css_styles_list = {};
}

core.apps.styles_manager = function() {

    this.style_title = "Select style";

}

core.apps.styles_manager.prototype = {


    window_resize: {
        height: 400,
        min_height: 400,
        width: 670,
        min_width: 480,
        target: "lists_box"
//        hmargin: 190
    },


    getTitle: function() {
        return this.style_title;
    },


    renderContent: function() {
        this.displayTpl(this.$["content"], "styles_manager");
        if(core.usertype == USERTYPE_WEBSEMBLE_ADMIN) {
            this.showElement("btn_create");
        }
    },




    onShowContent: function() {
        if(this.skip_on_show_content) {
            this.skip_on_show_content = false;
            return;
        }
        this.selected_style_id = core.values.styles_manager.selected_id;
        this.loadData();
    },




    // data

    loadData: function() {
    /*
        if(core.data.css_styles_list[core.values.styles_manager.key]) {
            this.renderStylesList();
            this.refreshSelectedItem();
        } else {
        */
            desktop.setState("loading");
            var p = {
                dialog: "styles_manager",
                act: "get_styles_list",
                key: core.values.styles_manager.key,
                load_default_styles: core.data.css_default_styles ? 0 : 1
            }
            core.transport.send("/controller.php", p, this.onDataResponse.bind(this));
//        }
    },


    onDataResponse: function(r) {
        desktop.setState("normal");
        if(!r || r.status != "ok") {
            desktop.modal_dialog.alert("Error");
            return;
        }

        if(r.css_default_styles) {
            core.data.css_default_styles = r.css_default_styles;
        }

        if(r.title) {
            this.style_title = r.title;
        } else {
            this.style_title = "";
            for(var i=0; i<core.data.apps_list.length; i++) {
                if(core.data.apps_list[i].name == core.values.styles_manager.key) {
                    this.style_title = core.data.apps_list[i].title
                    break;
                }
            }
        }
        this.style_title += " style";
        desktop.setPopupTitle(this.style_title);
        if(!this.selected_style_id) {
            this.selected_style_id = core.data.css_default_styles[core.values.styles_manager.key];
        }
        this.setStylesLists(r.data);
    },



    setStylesLists: function(data) {
        core.data.css_styles = false;
        core.data.css_styles_list[core.values.styles_manager.key] = data;
        this.renderStylesList();
        this.refreshSelectedItem();
    },






    renderStylesList: function() {
        this.onStyleMouseOut();

        var l = core.data.css_styles_list[core.values.styles_manager.key];

        this.$["list_user"].innerHTML = "";
        this.$["list_admin"].innerHTML = "";


        this.styles_count = {
            user: 0,
            admin: 0
        }

        var target, m = [], events;
        for(var i=0; i<l.length; i++) {
            target = l[i].is_admin_style ? "admin" : "user";
            this.styles_count[target]++;

            this.buildModel(this.$["list_" + target], 
                { tag: "div", 
                  className: "item nowrap",
                  id: "style_" + l[i].id,
                  is_style: true,
                  events: { 
                    onmouseover: ["onStyleMouseOver", i], 
                    onmouseout: "onStyleMouseOut",
                    onclick: ["onStyleClick", i] 
                  },
                  innerHTML: 
                    "<img src='" + l[i].thumb_path + "'/>" +
                    "<span>" + l[i].title }
            );
        }


        if(this.styles_count.user == 0) {
            this.hideElement("box_user");
        } else {
            this.showElement("box_user");
        }

        if(this.styles_count.admin == 0) {
            this.hideElement("box_admin");
        } else {
            this.showElement("box_admin");
        }
    },




    onStyleMouseOver: function(e, idx) {
        var style = core.data.css_styles_list[core.values.styles_manager.key][idx];
        if(this.hover_style_idx == idx) return;

        this.hover_style_idx = idx;
        if(!this.$["style_controls"]) {
            this.displayTpl(document.body, "styles_manager_style_controls");
        }
        if(style.site_id == core.data.site_info.id) {
            this.showElements(["btn_delete_style", "btn_clone_style"]);
        } else {
            this.hideElements(["btn_delete_style", "btn_clone_style"]);
        }
        this.$["style_" + style.id].appendChild(this.$["style_controls"]);
        this.showElement("style_controls");
    },




    onStyleMouseOut: function(e) {
        e = core.browser.event.fix(e);
        if(e && e.toElement) {
            var el = e.toElement;
            while(el && !el.is_style && el.parentNode) {
                el = el.parentNode;
            }
            if(el.is_style) return;
        }

        this.hover_style_idx = null;
        if(this.$["style_controls"]) {
            this.hideElement("style_controls");
            document.body.appendChild(this.$["style_controls"]);
        }
    },


    onStyleMouseClick: function(e, idx) {
        var style = core.data.css_styles_list[core.values.styles_manager.key][idx];
    },



    onStyleClick: function(e, idx) {
        var style = core.data.css_styles_list[core.values.styles_manager.key][idx];
        if(this.selected_style_id && this.$["style_" + this.selected_style_id]) {
            this.$["style_" + this.selected_style_id].className = "item nowrap";
        }
        this.selected_style_id = style.id;
        this.refreshSelectedItem();
    },





// edit/create

    onCreateClick: function() {
        this.skip_on_show_content = true;
        this.editStyle(null);
    },


    onEditStyleClick: function(e) {
        var style = core.data.css_styles_list[core.values.styles_manager.key][this.hover_style_idx];
        this.skip_on_show_content = true;
        this.clone_style_flag = false;
        this.editStyle(style.id);
        core.browser.event.kill(e);
    },


    onCloneStyleClick: function(e) {
        var style = core.data.css_styles_list[core.values.styles_manager.key][this.hover_style_idx];
        this.skip_on_show_content = true;
        this.clone_style_flag = true;
        this.editStyle(style.id);
        core.browser.event.kill(e);
    },


    editStyle: function(id) {
        desktop.setState("loading");
        var p = {
            dialog: "styles_manager",
            act: "get_style_data",
            id: id,
            key: core.values.styles_manager.key
        }
        core.transport.send("/controller.php", p, this.onStyleDataResponse.bind(this));
    },


    onStyleDataResponse: function(r) {
        desktop.setState("normal");
        if(!r || r.status != "ok") {
            desktop.modal_dialog.alert("Error");
            return;
        }

        if(r.data.site_id != core.data.site_info.id) {
            r.data.thumb = "";
            delete(r.data.id);
        }
        core.values.styles_editor = r.data;

        if(this.clone_style_flag) {
            delete(core.values.styles_editor.id);
            core.values.styles_editor.title += " clone";
        }

        core.values.styles_editor.style_title = this.style_title;
        if(!core.values.styles_editor_callback) {
            core.values.styles_editor_callback = this.onStyleEdited.bind(this);
        }
        desktop.showPopupApp("styles_editor");
    },



    onStyleEdited: function() {
        desktop.setState("loading");

        var p = {
            dialog: "styles_manager",
            title: core.values.styles_editor.title,
            thumb: core.values.styles_editor.thumb,
            data: php_serialize(core.values.styles_editor.data),
            key: core.values.styles_editor.key
        }

        if(core.values.styles_editor.id && core.values.styles_editor.site_id == core.data.site_info.id) {
            p.id = core.values.styles_editor.id;
            p.act = "update_style";
        } else {
            delete(p.id);
            p.act = "create_style";
        }
        core.transport.send("/controller.php", p, this.onSaveStyleResponse.bind(this), "POST");
    },


    onSaveStyleResponse: function(r) {
        desktop.setState("normal");
        if(!r || r.status != "ok") {
            desktop.modal_dialog.alert("Error");
            return;
        }
        this.setStylesLists(r.data);

        desktop.reloadThemeCSS();
    },



// delete

    onDeleteStyleClick: function(e) {
        var style = core.data.css_styles_list[core.values.styles_manager.key][this.hover_style_idx];
        if(!style) return;
        desktop.modal_dialog.confirm("Delete style?", this.deleteStyle.bind(this, style));
    },


    deleteStyle: function(style) {
        desktop.setState("loading");
        var p = {
            dialog: "styles_manager",
            act: "delete_style",
            key: core.values.styles_manager.key,
            id: style.id
        }
        if(this.selected_style_id == style.id) {
            this.selected_style_id = null;
        }
        core.transport.send("/controller.php", p, this.onDeleteStyleResponse.bind(this));
        core.browser.event.kill(e);
    },


    onDeleteStyleResponse: function(r) {
        desktop.setState("normal");
        if(!r || r.status != "ok") {
            desktop.modal_dialog.alert("Error");
            return;
        }
        this.setStylesLists(r.data);
        desktop.reloadThemeCSS();
    },


// select

    refreshSelectedItem: function() {
        if(this.selected_style_id && this.$["style_" + this.selected_style_id]) {
            this.$["style_" + this.selected_style_id].className = "item nowrap active";
            this.showElement("btn_apply2");
            if(core.values.styles_manager.callback) {
                this.showElement("btn_apply1");
            }
        } else {
            this.hideElements(["btn_apply1", "btn_apply2"]);
        }
    },


    onApplyToSelected: function() {
        this.useStyle(false);
    },


    onApplyToAll: function() {
        this.useStyle(true);
    },



    useStyle: function(is_default_style) {
        this.call_back_param = is_default_style ? "" : this.selected_style_id;

        desktop.setState("loading");
        var p = {
            dialog: "styles_manager",
            act: "use_style",
            id: this.selected_style_id,
            key: core.values.styles_manager.key,
            is_default_style: is_default_style ? 1 : 0
        }
        core.transport.send("/controller.php", p, this.onUseStyleResponse.bind(this));
    },

    
    onUseStyleResponse: function(r) {
        desktop.setState("normal");
        if(!r || r.status != "ok") {
            desktop.modal_dialog.alert("Error");
            return;
        }

        desktop.reloadThemeCSS();

        if(core.values.styles_manager.callback) {
            core.values.styles_manager.callback(this.call_back_param);
        }
        desktop.hidePopupApp();
    }


}
core.apps.styles_manager.extendPrototype(core.components.html_component);
core.apps.styles_manager.extendPrototype(core.components.popup_app);