if(!core.data.css_styles_list) {
    core.data.css_styles_list = {};
}

core.objects.admin_styles_catalog = function(parent_el) {

    this.render(parent_el);

};


core.objects.admin_styles_catalog.prototype = {



    render: function(el) {
        this.displayTpl(el, "admin_styles_catalog");
        if(core.usertype != USERTYPE_WEBSEMBLE_ADMIN) {
            this.hideElement("btn_create");
        }
    },




    // styles lists
    refresh: function() {
        if(!core.values.styles_slider) {
            core.values.styles_slider = {
                key: "page_body",
                style_id: core.data.page_style_id ,
                callback: this.onPageStyleTypeSelected.bind(this)
            }
        }
        //cache here?
//        if(this.params && this.params.key == core.values.styles_slider.key && this.params.style_id == core.values.styles_slider.style_id) return;
        this.params = core.values.styles_slider;
        this.scroll_ofs = 0;
        this.selected_style_id = this.params.style_id || false;
        this.loadData();
        this.onWindowResize();
    },


    onPageStyleTypeSelected: function(style_id) {
        if(style_id == core.data.page_style_id) return;
        core.data.page_style_id = style_id;
        var r = {
            dialog: "layout_columns",
            act: "set_page_style",
            layout_mode: core.data.layout_mode,
            page_id: core.data.page_id,
            style_id: core.data.page_style_id
        };
        core.transport.send("/controller.php", r, this.onSetPageStyleResponse.bind(this), "POST");
        desktop.setState("loading");
        desktop.layout.site_changed = true;
    },


    onSetPageStyleResponse: function(r) {
        desktop.setState("normal");
        desktop.initTheme2();
        desktop.reloadThemeCSS();
    },




    // data

    loadData: function() {
        this.hideElement("scroller");
        this.showElement("msg");

        var p = {
            dialog: "styles_manager",
            act: "get_styles_list",
            key: this.params.key,
            load_theme_styles: core.data.theme_styles ? 0 : 1,
            load_styles_per_pages: core.data.styles_per_pages ? 0 : 1
        };
        core.transport.send("/controller.php", p, this.onDataResponse.bind(this));
    },


    onDataResponse: function(r) {
        this.hideElement("msg");
        this.showElement("scroller");

        if(!r || r.status != "ok") {
            desktop.modal_dialog.alert("Error");
            return;
        }

        if(r.theme_styles) {
            core.data.theme_styles = r.theme_styles;
            this.theme_styles = {};
            for(var i in core.data.theme_styles) {
                this.theme_styles[core.data.theme_styles[i].id] = core.data.theme_styles;
            }
        }

        if(r.styles_per_pages) {
            core.data.styles_per_pages = r.styles_per_pages;
        }

        this.style_title = core.data.theme.title + " style";
        this.$["styles_title"].innerHTML = this.style_title;

        this.setStylesLists(r.data);
    },



    setStylesLists: function(data) {
        core.data.css_styles = false;
        core.data.css_styles_list[this.params.key] = data;
        this.renderStylesList();
        this.refreshSelectedItem();
    },






    renderStylesList: function() {
        this.hideStyleControls();

        var l = core.data.css_styles_list[this.params.key];

        this.$["list_theme"].innerHTML = "";
        this.$["list_user"].innerHTML = "";
        this.$["list_admin"].innerHTML = "";


        this.styles_count = {
            user: 0,
            admin: 0
        };

        var target, m = [], events;
        for(var i=0; i<l.length; i++) {
            if(this.theme_styles[l[i].id]) {
                target = "theme";
            } else {
                target = l[i].is_admin_style ? "admin" : "user";
            }

            this.styles_count[target]++;

            this.buildModel(this.$["list_" + target], 
                { tag: "div", 
                  className: "item",
                  id: "style_" + l[i].id,
                  is_slider_item: 1,
                  events: { 
                    onmouseout: "onStyleMouseOut",
                    onmouseover: ["onStyleMouseOver", i]
                  },
                  childs: [
                    { tag: "div",
                      className: "title",
                      innerHTML: l[i].title,
                      events: { onclick: ["onStyleClick", i] } },
                    { tag: "span",
                      className: "nowrap",
                      events: { 
                        onclick: ["showStyleControls", i]
                      }},
                    { tag: "div", className: "overlay" }
                  ]}
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
        this.updateScrollButtons();
    },




    showStyleControls: function(e, idx) {
        this.hidePreview();

        clearTimeout(this.hide_style_controls_timeout);
        var style = core.data.css_styles_list[this.params.key][idx];
        if(this.active_style_idx == idx) return;

        this.active_style_idx = idx;
        if(!this.$["style_controls"]) {
            this.displayTpl(document.body, "styles_slider_style_controls");
        }

        this.showElements(["btn_delete_style", "btn_clone_style"]);


        var pos = core.browser.element.getPosition(this.$["style_" + style.id]);

        this.showElement("style_controls");
        this.$["style_controls"].style.top = pos.top + this.$["style_" + style.id].offsetHeight + "px";
        this.$["style_controls"].style.left = pos.left + pos.width - this.$.style_controls.offsetWidth + "px";

    },


    hideStyleControls: function(e) {
        this.active_style_idx = null;
        if(this.$["style_controls"]) {
            this.hideElement("style_controls");
        }
    },





    onStyleMouseOver: function(e, idx) {
        if(this.active_style_idx == idx) return;
        var style = core.data.css_styles_list[this.params.key][idx];
        this.showPreview(style);
    },




    onStyleMouseOut: function(e) {
        e = core.browser.event.fix(e);
        var el = e.toElement;
        while(el && el.parentNode && !el.is_slider_item) {
            el = el.parentNode;
        }
        if(!el || !el.is_slider_item) {
            this.hide_style_controls_timeout = setTimeout(this.hideStyleControls.bind(this), 200);
            this.hidePreview();
        }
    },







    onStyleClick: function(e, idx) {
        this.hideStyleControls();
        if(!this.params.callback) return;

        var style = core.data.css_styles_list[this.params.key][idx];
        this.selected_style_id = style.id;

        this.params.callback(style.id, true);

        this.refreshSelectedItem();
    },




// preview
    showPreview: function(style) {
        if(desktop.admin_slider.is_scrolling || !style || this.style_preview == style) return;
        this.style_preview = style;

        if(!this.$["preview"]) {
            this.buildModel(document.body,
                { tag: "div", id: "preview",
                  className: "admin_slider_preview",
                  childs: [
                    { tag: "div", className: "pointer" },
                    { tag: "div", id: "preview_title",
                      className: "title" },
                    { tag: "table",
                      childs: [
                        { tag: "tr",
                          childs: [
                            { tag: "td", 
                              id: "img_box",
                              childs: [
                                { tag: "div", className: "img_box",
                                  childs: [
                                    { tag: "img", id: "preview_img" }
                                  ]}
                              ]},
                            { tag: "td", className: "info",
                              id: "preview_info" }
                          ]}
                      ]}
                  ]}
            );
        } else {
            this.showElement("preview");
        }


        var pos = core.browser.element.getPosition(this.$["style_" + style.id]);
        var rect = core.browser.getWindowSize();
        this.$["preview"].style.top = pos.top + pos.height + 25 + "px";
        this.$["preview"].style.left = pos.left + "px";
        if(style.thumb != "") {
            this.$["preview_img"].src = style.thumb_path;
            this.$["img_box"].style.display = "table-cell";
        } else {
            this.$["img_box"].style.display = "none";
        }
        this.$["preview_title"].innerHTML = style.title;
        this.$["preview_info"].innerHTML = this.formatStyleInfo(style.id);
    },


    hidePreview: function() {
        this.style_preview = false;
        this.hideElement("preview");
    },


    formatStyleInfo: function(style_id) {
        var s = "";
        if(core.data.theme_default_styles && core.data.theme_default_styles[this.params.key] == style_id) {
            return "<div>Default Style</div>";
        } else if(core.data.styles_per_pages[style_id]) {
            var s = "<div>Pages Used:</div><span>";
            for(var page_id in core.data.styles_per_pages[style_id]) {
                s += core.data.styles_per_pages[style_id][page_id] + "<br/>";
            }
            s += "</span>";
        }
        return s;
    },



// edit/create

    onCreateClick: function() {
        this.skip_on_show_content = true;
        this.editStyle(null);
    },


    onEditStyleClick: function(e) {
        var style = core.data.css_styles_list[this.params.key][this.active_style_idx];
        this.skip_on_show_content = true;
        this.clone_style_flag = false;
        this.editStyle(style.id);
        core.browser.event.kill(e);
    },


    onCloneStyleClick: function(e) {
        var style = core.data.css_styles_list[this.params.key][this.active_style_idx];
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
            key: this.params.key
        };
        core.transport.send("/controller.php", p, this.onStyleDataResponse.bind(this));
    },


    onStyleDataResponse: function(r) {
        desktop.setState("normal");
        if(!r || r.status != "ok") {
            desktop.modal_dialog.alert("Error");
            return;
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
        };

        this.reload_theme = false;

        if(core.values.styles_editor.id ) {
            p.id = core.values.styles_editor.id;
            p.act = "update_style";
//            if(this.key_styles[p.id]) {
                this.reload_theme = true;
//            }
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

        if(this.reload_theme) {
            desktop.reloadThemeCSS();
        }
    },



// delete

    onDeleteStyleClick: function(e) {
        var style = core.data.css_styles_list[this.params.key][this.active_style_idx];
        if(!style) return;
        
        desktop.modal_dialog.confirm("Delete style?", this.deleteStyle.bind(this, style));

        core.browser.event.kill(e);
    },



    deleteStyle: function(style) {
        desktop.setState("loading");

        var p = {
            dialog: "styles_manager",
            act: "delete_style",
            key: this.params.key,
            id: style.id
        };
        if(this.selected_style_id == style.id) {
            this.selected_style_id = null;
        }
        core.transport.send("/controller.php", p, this.onDeleteStyleResponse.bind(this));
    },


    onDeleteStyleResponse: function(r) {
        desktop.setState("normal");
        if(!r || r.status != "ok") {
            desktop.modal_dialog.alert("Error");
            return;
        }
        this.setStylesLists(r.data);
    },





// select

    refreshSelectedItem: function() {
        var el = this.$["style_" + this.prev_selected_style_id];
        if(el) {
            el.className = "item";
        }

        var el = this.$["style_" + this.selected_style_id];
        if(el) {
            el.className = "item active";
        }
        this.prev_selected_style_id = this.selected_style_id;
    }

    
};
core.objects.admin_styles_catalog.extendPrototype(core.components.html_component);
core.objects.admin_styles_catalog.extendPrototype(core.objects.slider_obj_common);
core.objects.admin_styles_catalog.extendPrototype(core.objects.slider_obj_scroller);