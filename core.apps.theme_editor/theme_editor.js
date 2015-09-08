core.apps.theme_editor = function() {}


core.apps.theme_editor.prototype = {


    window_resize: {
        target: "objects_list",
        hmargin: 210
    },

    // code
    getTitle: function() {
        return "Theme properties";
    },


    renderContent: function() {
        this.displayTpl(this.$["content"], "theme_editor");
        this.renderObjects();
    },




    renderObjects: function() {
        this.initObjectsList();

        this.displayTpl(this.$.objects_list, "theme_editor_colors");
        var labels = {
            "text-color" :                 "Text",
            "text-color-light" :           "Text light",
            "text-color-dark" :            "Text dark",
            "heading-color" :              "Heading",
            "heading-color-light" :        "Heading light",
            "heading-color-dark" :         "Heading dark",
            "background-color1" :          "Background 1",
            "background-color2" :          "Background 2",
            "background-color-gradient1" : "Background gradient 1",
            "background-color-gradient2" : "Background gradient 2",
            "shadow-color-light" :         "Shadow light",
            "shadow-color-dark" :          "Shadow dark",
            "border-color-light" :         "Border light",         
            "border-color-dark" :          "Border dark",
            "extra-color" :                "Extra",
            "extra-color-light" :          "Extra light",
            "extra-color-dark" :           "Extra dark"
        }

        for(var l in labels) {
            this.buildModel(this.$.theme_colors,
                { tag: "div", className: "form_row",
                  childs: [
                    { tag: "label", innerHTML: labels[l] },
                    { tag: "wsc_color", 
                      id: "inp_" + l,
                      events: { onclick: "onInputClick"}},
                  ]}
            );
        }



        this.displayTpl(this.$.objects_list, "theme_editor_fonts");

        var m = [];
        for(var i=0; i<this.objects_list.length; i++) {
            a = this.objects_list[i];
            m.push(
                { tag: "wsc_fieldset",
                  group: "theme_editor",
                  title: a.title,
                  childs: [
                    { tag: "div", id: "admin_styles_" + a.name,
                      childs: [
                        { tag: "div", className: "styles_header",
                          innerHTML: "System styles" },
                        { tag: "div", id: "admin_styles_list_" + a.name,
                          className: "list" }
                      ]},
                    { tag: "div", id: "site_styles_" + a.name,
                      childs: [
                        { tag: "div", className: "styles_header",
                          childs: [
                            { tag: "span",
                              html: "My styles " },
                            { tag: "a",
                              display: core.usertype == USERTYPE_WEBSEMBLE_ADMIN,
                              html: "Add new",
                              events: { onclick: ["onCreateClick", a.name] }}
                          ]},
                        { tag: "div", id: "site_styles_list_" + a.name,
                          className: "list" }
                      ]},
                    { tag: "div", id: "no_styles_msg_" + a.name,
                      className: "no_styles_msg",
                      display: false,
                      innerHTML: "No styles" }

                  ]}
            );
        }        
        this.buildModel(this.$.objects_list, m);
        core.browser.element.disableSelection(this.$.objects_list);
    },





    single_styles: {
        "imagebox": "Image box",
        "pager": "Pager",
        "typo": "HTML text",
        "custom_code": "Custom code",
        "ecom_subscribe_dlg": "Ecommerce subscribe dialog",
        "ecom_cart_popup": "Shopping cart popup"
    },


    initObjectsList: function() {
        this.objects_list = core.data.apps_list.sort(function(a,b) { return a.category_id > b.category_id });
        for(var name in this.single_styles) {
            this.objects_list.unshift({ name: name, title: this.single_styles[name]});
        }
        this.objects_list.unshift({ name: "layout_row255", title: "Footer row"});
        this.objects_list.unshift({ name: "layout_row1", title: "Body row"});
        this.objects_list.unshift({ name: "layout_row0", title: "Header row"});
        this.objects_list.unshift({ name: "page_body", title: "Page body"});
    },



    // init menu/pages elements_list
    onShowContent: function() {
        if(this.skip_on_show_content) {
            this.skip_on_show_content = false;
            return;
        }

        this.theme = core.values.theme_editor.theme;
        this.$["inp_title"].value = this.theme.title;
        this.$["inp_thumb"].setValue(this.theme.thumb || "");

        this.loadData();
    },



    loadData: function() {
        desktop.setState("loading");
        var r = {
            dialog: "theme_editor",
            act: "get_data"
        }

        if(!core.data.css_styles) r.load_all_css_styles = 1;

        if(this.theme.id) {
            r.theme_id = this.theme.id;
        }

        core.transport.send("/controller.php", r, this.onDataResponse.bind(this));    
    },


    onDataResponse: function(r) {
        desktop.setState("normal");
        if(r && r.status == "ok") {
            if(r.theme) {
                this.theme = r.theme;
            }
            if(r.css_styles) {
                this.all_css_styles = {};
                for(var i=0; i<r.css_styles.length; i++) {
                    this.all_css_styles[r.css_styles[i].id] = r.css_styles[i];
                }
                core.data.css_styles = r.css_styles;
            }
            this.renderStyles();
            this.initStylesSelection(r.styles_selection);

            for(var k in this.theme.colors) {
                this.$["inp_" + k].setValue(this.theme.colors[k]);
            }

            for(var k in this.theme.fonts) {
                this.$["inp_" + k].setValue(this.theme.fonts[k]);
            }
        } else {
            desktop.modal_dialog.alert("Server error");
        }
    },




// styles

    renderStyles: function() {
        var list_el, style, has_styles = {}, src;

        for(var i=0; i<this.objects_list.length; i++) {
            var a = this.objects_list[i];
            this.$["admin_styles_list_" + a.name].innerHTML = "";
            this.$["site_styles_list_" + a.name].innerHTML = "";
        }


        var m;

        for(var i=0; i<core.data.css_styles.length; i++) {
            style = core.data.css_styles[i];
            src = style.is_admin_style ? "admin" : "site";
            list_el = this.$[src + "_styles_list_" + style.key];

            m =
                { tag: "div", 
                  className: "item",
                  id: "style_" + style.id,
                  title: style.title,
                  events: { onmouseout: "onStyleMouseOut" },
                  childs: [
                    { tag: "div",
                      className: "title",
                      id: "style_title" + style.id,
                      events: { onclick: ["showStyleControls", i] },
                      innerHTML: style.title },
                    { tag: "div",
                      className: "style_buttons" }
                  ]}



            if(this.single_styles[style.key]) {
                m.childs[1].childs = [
                    { tag: "div",
                      className: "btn_default btn_single",
                      html: "Include in theme",
                      events: { onclick: ["onSelectStyleClick", [i, 0]] }}
                ]
            } else {
                m.childs[1].childs = [
                    { tag: "div",
                      className: "btn_included",
                      html: "Include in theme",
                      events: { onclick: ["onSelectStyleClick", [i, 0]] }},
                    { tag: "div",
                      html: "as default",
                      className: "btn_default",
                      events: { onclick: ["onSelectStyleClick", [i, 1]] }}
                ]
            }
            this.buildModel(list_el, m);

            if(!has_styles[style.key]) {
                has_styles[style.key] = {};
            }
            has_styles[style.key][src] = true;
        }



        for(var i=0; i<this.objects_list.length; i++) {
            var a = this.objects_list[i];

            if(core.usertype == USERTYPE_WEBSEMBLE_ADMIN) {
                this.showElements(["site_styles_" + a.name, "admin_styles_" + a.name]);
                this.hideElement("no_styles_msg_" + a.name);
            } else if(has_styles[a.name]) {
                this.$["site_styles_" + a.name].style.display = has_styles[a.name].site ? "" : "none";
                this.$["admin_styles_" + a.name].style.display = has_styles[a.name].admin ? "" : "none";
                this.hideElement("no_styles_msg_" + a.name);
            } else {
                this.hideElements(["site_styles_" + a.name, "admin_styles_" + a.name]);
                this.showElement("no_styles_msg_" + a.name);
            }
        }
    },



    onSelectStyleClick: function(e, args) {
        var style = core.data.css_styles[args[0]],
            is_default =  args[1];
        this.toggleStyleSelection(style, is_default);
    },





    showStyleControls: function(e, idx) {
        clearTimeout(this.hide_style_controls_timeout);
        if(this.active_style_idx == idx) return;

        var style = core.data.css_styles[idx];

        this.active_style_idx = idx;
        if(!this.$["style_controls"]) {
            this.displayTpl(document.body, "theme_editor_style_controls");
        }


        if(style.site_id == core.data.site_info.id) {
            this.showElements(["btn_delete_style", "btn_clone_style"]);
        } else {
            this.hideElements(["btn_delete_style", "btn_clone_style"]);
        }

        this.showElement("style_controls");
        var pos = core.browser.element.getPosition(this.$["style_title" + style.id]);
        this.$["style_controls"].style.top = pos.top - this.$.style_controls.offsetHeight - 2 + "px";//pos.height + "px";
        this.$["style_controls"].style.left = pos.left + "px";


        core.browser.event.kill(e);
    },


    onStyleMouseOver: function() {
        clearTimeout(this.hide_style_controls_timeout);
    },


    onStyleMouseOut: function(e) {
        e = core.browser.event.fix(e);
        var el = e.toElement;
        while(el && el.parentNode && !el.is_style_controls) {
            el = el.parentNode;
        }
        if(!el || !el.is_style_controls) {
            this.hide_style_controls_timeout = setTimeout(this.hideStyleControls.bind(this), 200);
        }
    },


    hideStyleControls: function(e) {
        this.active_style_idx = null;
        if(this.$["style_controls"]) {
            this.hideElement("style_controls");
        }
    },






// styles selection

    initStylesSelection: function(selection) {
        this.styles_selection = {};
        this.default_styles = {};

        if(selection) {
            for(var i=0; i<selection.length; i++) {
                var style = this.all_css_styles[selection[i].id];
                this.toggleStyleSelection(style, selection[i].is_default);
            }
        }
    },







    toggleStyleSelection: function(style, is_default) {
        if(!style) return;


        if(this.single_styles[style.key]) {
            if(this.default_styles[style.key] == style.id) return;

            if(this.default_styles[style.key]) {
                var old_style_id = this.default_styles[style.key];
                this.updateStyleSelection(old_style_id, null);
                delete(this.default_styles[style.key]);;
                delete(this.styles_selection[old_style_id]);
            }
            this.default_styles[style.key] = style.id;
            this.styles_selection[style.id] = 1;
            this.updateStyleSelection(style.id, 1);
        } else {
            if(is_default == 1) {
                var id = this.default_styles[style.key];
                if(id == style.id) return;

                this.styles_selection[id] = 0;
                this.updateStyleSelection(id, 0);

                this.default_styles[style.key] = style.id;
                this.styles_selection[style.id] = 1;
                this.updateStyleSelection(style.id, 1);
            } else {
                if(this.styles_selection[style.id] != undefined) {
                    delete(this.default_styles[style.key]);
                    delete(this.styles_selection[style.id]);
                    this.updateStyleSelection(style.id, null);
                } else {
                    this.styles_selection[style.id] = 0;
                    this.updateStyleSelection(style.id, this.default_styles[style.key] == style.id ? 1 : 0);
                }
            }
        }
    },





    updateStyleSelection: function(id, selection_type) {
        if(!this.$["style_" + id]) return;
        var c = "item";
        if(selection_type == 0) {
            c += " style_included";
        } else if(selection_type == 1) {
            c += " style_default";
        }
        this.$["style_" + id].className = c;
    },



    getSelectedStyles: function() {
        var res = [], s;
        for(var id in this.styles_selection) {
            res.push({ id: id, is_default: this.styles_selection[id]});
        }
        return res;
    },


// inputs

    onInputClick: function() {
        this.skip_on_show_content = true;
    },
    



// save

    onSaveClick: function() {
        var res = {
            id: core.values.theme_editor.theme.id || "",
            title: this.$["inp_title"].value.trim(),
            thumb: this.$["inp_thumb"].value,
            colors: {},
            fonts: {}
        }
        for(var k in this.theme.colors) {
            res.colors[k] = this.$["inp_" + k].value;
        }
        res.colors = varToString(res.colors);

        for(var k in this.theme.fonts) {
            res.fonts[k] = this.$["inp_" + k].value;
        }
        res.fonts = varToString(res.fonts);

        if(res.title == "") {
            desktop.modal_dialog.alert("Theme name can't be empty");
            return;
        }

        res.styles = this.getSelectedStyles();


        var id = core.values.used_themes_titles[res.title];
        if(!id || res.id == id) {
            desktop.hidePopupApp();
            if(core.values.theme_editor.callback) {
                core.values.theme_editor.callback(res);
            }
        } else {
            desktop.modal_dialog.alert("Theme name already used");
        }
    },


    onCancelClick: function() {
        desktop.hidePopupApp();
    },





// edit/create styles
    onCreateClick: function(e, key) {
        this.key = key;
        this.skip_on_show_content = true;
        this.editStyle(null, key);
        this.hideStyleControls();
    },


    onEditStyleClick: function(e) {
        var style = core.data.css_styles[this.active_style_idx];
        this.skip_on_show_content = true;
        this.clone_style_flag = false;
        this.editStyle(style.id, style.key);
        this.hideStyleControls();
    },


    onCloneStyleClick: function(e) {
        var style = core.data.css_styles[this.active_style_idx];
        this.skip_on_show_content = true;
        this.clone_style_flag = true;
        this.editStyle(style.id, style.key);
        this.hideStyleControls();
    },


    editStyle: function(id, key) {
        desktop.setState("loading");
        var p = {
            dialog: "styles_manager",
            act: "get_style_data",
            id: id,
            key: key
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
        this.reloadStyles();
    },



// delete

    onDeleteStyleClick: function(e) {
        var style = core.data.css_styles[this.active_style_idx];
        this.hideStyleControls();
        if(!style) return;
        desktop.modal_dialog.confirm("Delete style?", this.deleteStyle.bind(this, style));
    },



    deleteStyle: function(style) {
        desktop.setState("loading");

        var p = {
            dialog: "styles_manager",
            act: "delete_style",
            key: style.key,
            id: style.id
        }
        core.transport.send("/controller.php", p, this.onDeleteStyleResponse.bind(this));
    },


    onDeleteStyleResponse: function(r) {
        desktop.setState("normal");
        if(!r || r.status != "ok") {
            desktop.modal_dialog.alert("Error");
            return;
        }
        this.reloadStyles();
    },



    reloadStyles: function() {
        //TODO: optimize
        core.data.css_styles = false;
        this.loadData();
    }


}
core.apps.theme_editor.extendPrototype(core.components.html_component);
core.apps.theme_editor.extendPrototype(core.components.popup_app);