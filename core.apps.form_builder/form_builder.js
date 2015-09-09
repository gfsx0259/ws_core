core.apps.form_builder = function() {

};


core.apps.form_builder.prototype = {

    window_resize: {
        target: "panels",
        hmargin: 180
    },


    onResize: function(v) {
        this.$["left_panel"].style.height = v.height - 55 + "px";
        this.$["view"].style.height = v.height - 15 + "px";
    },





    // code

    getTitle: function() {
        return "Form builder";
    },


    renderContent: function() {
        this.displayTpl(this.$["content"], "form_builder");

        // init form
        var fp = {
            parent_el: this.$["view"],
            form_builder_mode: true,
            disable_submit: true
        };
        this.form = new core.objects.form(fp);
        this.form.onSectionFocus = this.selectField.bind(this);


        this.buildModel(document.body,
            { tag: "div", className: "item_controls",
              id: "item_controls",
              display: false,
              childs: [
                { tag: "div", className: "mup",
                  title: "Move up",
                  events: { onclick: ["onMoveFieldClick", "up"] } },
                { tag: "div", className: "mdown",
                  title: "Move down",
                  events: { onclick: ["onMoveFieldClick", "down"] } },
                { tag: "div", className: "mclone",
                  title: "Clone",
                  events: { onclick: "onCloneFieldClick" } },
                { tag: "div", className: "mdelete",
                  title: "Delete",
                  events: { onclick: "onDeleteFieldClick" } }
              ]}
        );

        // toolbar
        var toolbarData = [
            { title: "Add element", icon: "/js_apps/core.apps.form_builder/images/plugin.png",
              subitems: []},

            { title: "Add control", icon: "/js_apps/core.apps.form_builder/images/application_form.png",
              subitems: [] }
        ];

        for(var key in this.form_elements) {
            var el = this.form_elements[key];
            var tidx = el.behavior == "element" ? 0 : 1;

            toolbarData[tidx].subitems.push(
                { title: el.title, icon: "/js_apps/core.apps.form_builder/images/plugin.png", id: "add_" + key,
                  onclick: this.onAddField.bind(this, key) }

            );
        }

        this.toolbar = new core.objects.toolbar({
            parentElement: this.$["toolbar"],
            items: toolbarData
        });
    },



    onShowContent: function() {
        if(!core.values.form_builder) {
            return;
        }
        this.initFormData();
    },



    onDocumentKeyUp: function(e) {
        switch(e.keyCode) {
            case 38:
                this.onMoveFieldClick(e, "up");
                break;
            case 40:
                this.onMoveFieldClick(e, "down");
                break;
        }
    },



    // load form struct or create new
    initFormData: function() {
        var fb =  core.values.form_builder;
        switch(fb.tag) {
            // new form
            case "new":
                this.data = {
                    fields: [],
                    title: fb.form_title || "New form",
                    description: "",
                    confirmation: ""
                };
                this.form_id = false;
                this.initEditor();
                break;

            // given data
            case "data":
                this.data = fb.form_data;
                this.form_id = false;
                this.initEditor();
                break;

            // form exists
            case "exists":
                this.form_id = fb.form_id;
                if(core.data.forms[fb.form_id]) {
                    this.data = clone(core.data.forms[fb.form_id]);
                    this.initEditor();
                } else {
                    desktop.setState("loading");
                    var p = {
                        dialog: "forms_manager",
                        act: "get",
                        id: fb.form_id
                    };
                    core.transport.send("/controller.php", p, this.onFormDataResponce.bind(this));
                }
                break;
        }
        core.values.form_builder = null;
    },


    onFormDataResponce: function(r) {
        desktop.setState("normal");
        if(!r || r.status != "ok") {
            desktop.modal_dialog.alert("Loading form error");
            desktop.hidePopupApp();
            return;
        }
        if(!core.data.forms) {
            core.data.forms = {};
        }
        core.data.forms[r.form_id] = r.form;
        this.data = clone(core.data.forms[r.form_id]);
        this.initEditor();
    },




    // init editor
    initEditor: function() {
        this.selected_idx = null;

        this.extendData();

        this.$["inp_form_title"].value = this.data.title;
        this.$["inp_form_description"].value = this.data.description;
        this.$["inp_form_confirmation"].value = this.data.confirmation;

        this.updateInterface();

        this.renderFields();
        if(!this.form_id) {
            this.selectTab("form");
        }

        core.values.form_builder = null;
    },




    extendData: function() {
        for(var i=0; i<this.data.fields.length; i++) {
            var f = this.data.fields[i];
            if(!f) continue;

            var default_props = this.form_elements[f.type].properties;
            for(var k in default_props) {
                if(f.properties[k] == undefined) {
                    f.properties[k] = default_props[k];
                }
            }
        }
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
            this.hideElement("tab_" + this.active_tab);
            this.$["btn_tab_" + this.active_tab].className = "";
        }
        this.active_tab = tab;
        this.showElement("tab_" + this.active_tab);
        this.$["btn_tab_" + this.active_tab].className = "active";
    },






    // list

    renderFields: function() {
        this.updateInterface();

        this.hideElement("item_controls");
        document.body.appendChild(this.$["item_controls"]);

        this.$["view"].innerHTML = "";
        this.form.setStructure(this.data);
        this.form.render();

        if(this.data.fields.length) {
            var idx = this.selected_idx || 0;
            if(this.data.fields[idx]) {
                this.selectField(idx, true);
            }
        }
    },


    selectField: function(idx, force_select) {
        if(!force_select) {
            if(this.selected_idx == idx) return;
            if(!this.processProperties()) return;
        }


        if(this.selected_idx != null) {
            this.form.$["section" + this.selected_idx].style.border = "0";
        }

        this.selected_idx = idx;

        if(idx != null) {
            var el = this.form.$["section" + idx];
            el.style.border = "1px solid #00F";
            el.appendChild(this.$["item_controls"]);

            this.showElement("item_controls");
        } else {
            this.hideElement("item_controls");
        }
        this.fillProperties();
        this.selectTab("field");
    },




    getFieldByIdx: function(idx) {
        if(idx == null) {
            return null;
        } else if(typeof(idx) != "number" && idx.indexOf("-") != -1) {
            var idx_array = idx.split("-");
            idx_array[0] = parseInt(idx_array[0]);
            idx_array[1] = parseInt(idx_array[1]);
            return {
                parent: this.data.fields[idx_array[0]].childs,
                field: this.data.fields[idx_array[0]].childs[idx_array[1]],
                parent_idx: idx_array[0],
                field_idx: idx_array[1]
            }
        } else {
            return {
                parent: this.data.fields,
                field: this.data.fields[idx],
                parent_idx: null,
                field_idx: idx
            }
        }
    },


    formatIdx: function(parent_idx, field_idx) {
        return parent_idx == null ? field_idx : parent_idx + "-" + field_idx;
    },



    // fields

    onAddField: function(type) {
        if(!this.processProperties()) return;
        var d = this.form_elements[type];

        var field = {
            type: type,
            properties: clone(d.properties)
        };


        if(field.properties["name"] && this.isFieldTypeExists(type)) {
            var num = this.getFieldsCount();
            field.properties.name += "" + (num + 1);
        }

        if(this.selected_idx == null) {
            this.data.fields.push(field);
            var new_idx = this.formatIdx(null, this.data.fields.length - 1);
        } else {
            var p = this.getFieldByIdx(this.selected_idx);

            if(p.field.type == "repeater") {
                if(type == "page_break") {
                    desktop.modal_dialog.alert("Sorry, pages breaks not alvailable in repeater control");
                    return;
                } else if(type == "repeater") {
                    desktop.modal_dialog.alert("Sorry, not possible to put repeater control inside another repeater control");
                    return;
                }
                if(!p.field.childs) {
                    p.field.childs = [];
                }
                p.field.childs.push(field);
                var new_idx = this.formatIdx(p.field_idx, p.field.childs.length - 1);
            } else {
                if(p.parent_idx == null) {
                    this.data.fields.splice(p.field_idx + 1, 0, field);
                    var new_idx = this.formatIdx(null, p.field_idx + 1);
                } else {
                    if(type == "page_break") {
                        desktop.modal_dialog.alert("Sorry, pages breaks not alvailable in repeater control");
                        return;
                    } else if(type == "repeater") {
                        desktop.modal_dialog.alert("Sorry, not possible to put repeater control inside another repeater control");
                        return;
                    }
                    if(!p.parent) {
                        p.parent = [];
                    }
                    p.parent.splice(p.field_idx+1, 0, field);
                    var new_idx = this.formatIdx(p.parent_idx, p.field_idx + 1);
                }
            }
        }

        this.renderFields();
        this.selectField(new_idx);
    },



    getFieldsCount: function() {
        var total = 0;
        for(var i=0; i<this.data.fields.length; i++) {
            if(this.data.fields[i].childs) {
                total += this.data.fields[i].childs.length;
            } else {
                total ++;
            }
        }
        return total;
    },


    isFieldTypeExists: function(type) {
        var fl = false;
        for(var i=0; i<this.data.fields.length; i++) {
            if(this.data.fields[i].childs) {
                for(var j=0; j<this.data.fields[i].childs.length; j++) {
                    if(this.data.fields[i].childs[j].type == type) {
                        fl = true;
                        break;
                    }
                }
            } else if(this.data.fields[i].type == type) {
                fl = true;
                break;
            }
        }
        return fl;
    },




    onMoveFieldClick: function(e, dir) {
        if(!this.processProperties()) return;
        core.browser.event.kill(e);

        var p = this.getFieldByIdx(this.selected_idx);
        switch(dir) {
            case "up":
                if(p.field_idx == 0) return false;
                var new_idx = p.field_idx - 1;
                break;
            case "down":
                if(p.field_idx == p.parent.length - 1) return false;
                var new_idx = p.field_idx + 1;
                break;
        }
        swapValues(p.parent, p.field_idx, new_idx);
        this.renderFields();
        this.selectField(this.formatIdx(p.parent_idx, new_idx), true);
        return false;
    },



    onCloneFieldClick: function(e) {
        if(!this.processProperties()) return;
        core.browser.event.kill(e);

        var p = this.getFieldByIdx(this.selected_idx);
        var field = clone(p.field);
        field.properties.name += this.data.fields.length;
        p.parent.splice(p.field_idx, 0, field);
        this.renderFields();

        var new_idx = this.formatIdx(p.parent_idx, p.field_idx);
        this.selectField(new_idx, true);
    },


    onDeleteFieldClick: function(e) {
        core.browser.event.kill(e);

        var p = this.getFieldByIdx(this.selected_idx);
        p.parent.splice(p.field_idx, 1);
        this.renderFields();
        if(this.data.fields.length > 0) {
            this.selectField(0, true);
        } else {
            this.selected_idx = null;
        }
        this.updateInterface();
    },




    // field roperties panel


    onApplyFieldPropertiesClick: function(e) {
        this.processProperties();
        this.renderFields();
        this.selectField(this.selected_idx, true);
    },




    // set select item properties, return true on success, false on wrong values
    processProperties: function() {
        var p = this.getFieldByIdx(this.selected_idx);
        if(!p) return true;
        var fe = this.form_elements[p.field.type];
        for(var pname in p.field.properties) {
            if(fe.properties[pname] == undefined) continue;

            var v = this.getPropertyValue(pname);
            if(v == null) {
                desktop.modal_dialog.alert("Wrong " + pname + " value!");
                this.setPropertyFocus(pname);
                return false;
            }

            if(pname == "name" && p.field.properties.name != v) {
                this.renameEVSrcElements(p.field.properties.name, v);
            }
            //if use_as_subject field was enabled for item
            if(pname == "use_as_subject" && p.field.properties[pname] == false && v == true){
                this.resetUseAsSubject(p);
            }

            p.field.properties[pname] = v;
        }

        p.field.visibility_condition = this.getVisibilityCondition();
        if(this.$["inp_list_field"].checked) {
            this.data.list_field_name = p.field.properties.name;
            this.data.list_field_label = p.field.properties.label;
        }
        return true;
    },

    resetUseAsSubject: function(item){
        var name = item.field.properties.name;
        for(var i in this.data.fields){
            var tmp = this.data.fields[i];
            if(tmp.type=='text' && tmp.properties.name != name){
                tmp.properties.use_as_subject = false;
            }
        }
    },

    fillProperties: function() {
        var p = this.getFieldByIdx(this.selected_idx);

        if(!p) {
            this.hideElement("properties_box");
            return;
        }
        this.showElement("properties_box");

        this.$["lbl_element_type"].innerHTML = this.form_elements[p.field.type].title;

        var fe = this.form_elements[p.field.type];

        // hide all properties
        for(var i=0; i<this.all_field_properties.length; i++) {
            this.hideElement("prop_" + this.all_field_properties[i]);
        }

        // show available properties
        var visible_props_count = 0;
        var props = this.form_elements[p.field.type].properties;
        for(var pname in props) {
            this.showElement("prop_" + pname);
            this.setPropertyValue(pname, p.field.properties[pname]);
            visible_props_count++;
        }

        if(this.form_elements[p.field.type].behavior == "element") {
            this.showVisibilityCondition(p);
            this.showElement("box_list_field");
            this.$["inp_list_field"].setChecked(this.data.list_field_name == p.field.properties.name);
        } else {
            this.hideVisibilityCondition();
            this.hideElement("box_list_field");
            this.$["inp_list_field"].setChecked(false);
        }

        if(visible_props_count > 0) {
            this.showElement("box_apply_field_properties");
        } else {
            this.hideElement("box_apply_field_properties");
        }
    },



    setPropertyValue: function(pname, value) {
        var el = this.$["inp_prop_" + pname];

        switch(pname) {
            case "width":
            case "height":
                v = {};
                v[pname] = value;
                el.setValue(v);
                break;

            case "options":
                this.select_options = value;
                this.renderSelectOptions();
                break;

            case "statements":
                this.statements = value;
                this.renderStatements();
                break;

            case "required":
            case "confirm_email":
            case "new_window":
            case "use_as_subject":
            case "use_as_reply":
                el.setChecked(value);
                break;

            case "document":
                var el = this.$["inp_prop_document"];
                if(value) {
                    el.setValue({ id: value.id, content: value.target });
                } else {
                    el.setValue(null);
                }
                break;

            case "name_format":
            case "time_format":
            case "currency":
            case "qty_input_type":
            case "qty_min":
            case "qty_max":
                el.setValue(value);
                break;


            default:
                el.value = value;
                break;
        }
    },


    getPropertyValue: function(pname) {
        var el = this.$["inp_prop_" + pname];

        switch(pname) {
            case "width":
            case "height":
                return el.value[pname];
                break;

            case "label":
                return el.value;
                break;

            case "name":
                var v = el.value.trim();
                v = v.replace("_", "");
                return (v == "" || v == "dialog") ? null : v;
                break;

            case "options":
                return this.select_options;
                break;

            case "statements":
                return this.statements;
                break;

            case "document":
                var d = this.$["inp_prop_document"].value;
                if(d.id) {
                    var res = {
                        title: "",
                        id: d.id,
                        target: d.content
                    }
                } else {
                    var res = false;
                }
                return res;
                break;

            case "required":
            case "confirm_email":
            case "new_window":
            case "use_as_subject":
            case "use_as_reply":
                return el.checked;
                break;

            default:
                return el.value;
                break;
        }
    },


    setPropertyFocus: function(pname) {
        var el = this.$["inp_prop_" + pname];
        if(el && el["focus"]) {
            el.focus();
        }
    },



    onPropQtyMinChange: function(e) {
        var qty_min = this.$["inp_prop_qty_min"].value;
        if(this.$["inp_prop_qty_max"].value < qty_min) {
            this.$["inp_prop_qty_max"].setValue(qty_min);
        }
    },

    onPropQtyMaxChange: function(e) {
        var qty_max = this.$["inp_prop_qty_max"].value;
        if(this.$["inp_prop_qty_min"].value > qty_max) {
            this.$["inp_prop_qty_min"].setValue(qty_max);
        }
    },



    // statements property

    renderStatements: function() {
        var el = this.$["statements_table"];
        core.browser.element.removeChilds(el, this.$["statements_table_head"]);
        for(var i=0; i<this.statements.length; i++) {
            var o = this.statements[i];
            this.buildModel(el,
                { tag: "tr",
                  childs: [
                    { tag: "td", innerHTML: o.text },
                    { tag: "td", innerHTML: o.value },
                    { tag: "td", className: "ta_center last",
                      childs: [
                        { tag: "img", src: "/static/icons/cross.png",
                          className: "icon",
                          events: { onclick: [ "onRemoveStatementClick", i ] },
                          title: " Remove statement " }
                      ]}
                  ]}
            );
        }
    },


    onAddStatementClick: function() {
        var statement = {
            text: this.$["inp_statement_text"].value.trim(),
            value: this.$["inp_statement_value"].value.trim()
        };
        if(statement.text != "" && statement.value != "") {
            this.$["inp_statement_text"].value = "";
            this.$["inp_statement_value"].value = "";
            this.statements.push(statement);
            this.renderStatements();
        }
    },


    onRemoveStatementClick: function(e, idx) {
        this.statements.splice(idx, 1);
        this.renderStatements();
    },



    // options

    renderSelectOptions: function() {
        var el = this.$["select_options_table"];
        core.browser.element.removeChilds(el, this.$["select_options_table_head"]);
        for(var i=0; i<this.select_options.length; i++) {
            var o = this.select_options[i];
            this.buildModel(el,
                { tag: "tr",
                  childs: [
                    { tag: "td", innerHTML: o.text },
                    { tag: "td", innerHTML: o.value },
                    { tag: "td", className: "last",
                      childs: [
                        { tag: "div", className: "mup",
                          title: "Move up",
                          events: { onclick: ["onMoveOptionClick", [i, "up"]] } },
                        { tag: "div", className: "mdown",
                          title: "Move down",
                          events: { onclick: ["onMoveOptionClick", [i, "down"]] } },
                        { tag: "div", className: "mdelete",
                          title: " Remove option ",
                          events: { onclick: "onRemoveOptionClick" } }
/*
                        { tag: "img", src: "/static/icons/cross.png",
                          className: "icon",
                          events: { onclick: [ "onRemoveOptionClick", i ] },
                          title: " Remove option " }
                          */
                      ]}
                  ]}
            );
        }
    },


    onAddSelectOptionClick: function() {
        var option = {
            text: this.$["inp_option_text"].value.trim(),
            value: this.$["inp_option_value"].value.trim()
        };
        if(option.text != "" && option.value != "") {
            this.$["inp_option_text"].value = "";
            this.$["inp_option_value"].value = "";
            this.select_options.push(option);
            this.renderSelectOptions();
        }
    },


    onMoveOptionClick: function(e, args) {
        var idx = args[0];
        var dir = args[1];

        if(dir == "up" && idx == 0) return;
        if(dir == "down" && idx >= this.select_options.length - 1) return;

        var idx2 = dir == "up" ? idx - 1 : idx + 1;
        swapValues(this.select_options, idx, idx2);

        this.renderSelectOptions();
    },


    onRemoveOptionClick: function(e, idx) {
        this.select_options.splice(idx, 1);
        this.renderSelectOptions();
    },


    // form properties tab

    setFormProperty: function(e) {
        e = core.browser.event.fix(e);
        var p = e.target.prop;
        if(!p) return;
        this.data[p] = this.$["inp_form_" + p].value;
        if(p != "title") {
            this.renderFields();
        }
    },


    // boottom buttons

    updateInterface: function() {
        var disabled = !this.data.fields || this.data.fields.length == 0;
        this.$["btn_save"].disabled = disabled;
        if(disabled) {
            this.hideElement("properties_box");
            for(var i=0; i<this.all_field_properties.length; i++) {
                this.hideElement("prop_" + this.all_field_properties[i]);
            }
        } else {
            this.showElement("properties_box");
        }
    },


    onCancelClick: function() {
        desktop.hidePopupApp();
    },




    onSaveClick: function() {
        if(!this.processProperties()) return;

        desktop.setState("loading");

        this.tmp_form_data = {
            title: this.$["inp_form_title"].value.trim(),
            description: this.$["inp_form_description"].value,
            confirmation: this.$["inp_form_confirmation"].value,
            fields: this.data.fields
        };
        var p = {
            dialog: "forms_manager",
            act: "set",
            id: this.form_id || "",
            title: this.tmp_form_data.title,
            description: this.tmp_form_data.description,
            confirmation: this.tmp_form_data.confirmation,
            fields: varToString(this.tmp_form_data.fields),
            list_field_name: this.data.list_field_name,
            list_field_label: this.data.list_field_label
        };
        core.transport.send("/controller.php", p, this.onSaveFormResponce.bind(this), "POST");
    },


    onSaveFormResponce: function(r) {
        desktop.setState("normal");
        if(!r) {
            desknot.modal_dialog.alert("Saving form error");
            desktop.hidePopupApp();
        } else {
            core.data.forms[r.form_id] = core.values.form_builder;
            core.data.forms_list = r.list;
            this.updateFormApps();
        }
        desktop.hidePopupApp();
    },



    updateFormApps: function() {
        if(!desktop.layout.apps) return;
        for(var id in desktop.layout.apps) {
            var app = desktop.layout.apps[id];
            if(app && app.appName == "form") {
                app.refresh();
                app.callFunction("fillFormSelect");
            }
        }

        var app = desktop.popup_apps["forms_manager"];
        if(app) {
            app.renderMyFormsList();
            app.selectTab("my_forms");
        }
    },


    onFormViewBoxClick: function(e) {
        this.selectField(null);
    },



    formatFieldName: function(name) {
        if(!name) return;
        return name.replace(/[^A-Za-z0-9_\-.:]+/g, "");
    },


    onPropNameChange: function() {
        this.$.inp_prop_name.value = this.formatFieldName(this.$.inp_prop_name.value);
    },

    onOptionValueChange: function() {
        this.$.inp_option_value.value = this.formatFieldName(this.$.inp_option_value.value);
    }

};
core.apps.form_builder.extendPrototype(core.components.html_component);
core.apps.form_builder.extendPrototype(core.components.popup_app);