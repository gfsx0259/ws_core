core.values.default_forms = {};
if(!core.data.forms) core.data.forms = {};


core.apps.forms_manager = function() {};

core.apps.forms_manager.prototype = {


    window_resize: {
        wmargin: 10,
        hmargin: 160,
        target: "lists"
    },


    getTitle: function() {
        return "Forms manager";
    },


    renderContent: function() {
        this.displayTpl(this.$["content"], "forms_manager");
        this.selectTab("my_forms");
        this.loadList(true);
    },



    setMode: function(mode) {
        switch(mode) {
            case "loading":
                desktop.setState("loading");
                break;

            case "error":
                desktop.setState("normal");
                desktop.modal_dialog.alert("Server error. Can't load form.");
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
    },




    // lists requests 

    loadList: function(first_load) {
        if(core.data.forms_list) {
            this.renderMyFormsList();
            return;
        }
        this.setMode("loading");
        var p = {
            dialog: "forms_manager",
            act: "get_list",
            default_forms: first_load ? 1 : 0,
            submits_count: 1
        };
        core.transport.send("/controller.php", p, this.onListResponce.bind(this));
    },


    onListResponce: function(r) {
        if(!r || r.status != "ok") {
            this.setMode("error");
            return;
        }
        if(r.default_forms_list) {
            core.data.default_forms_list = r.default_forms_list;
            this.renderTemplatesList();
        }
        core.data.forms_list = r.list;
        core.data.forms_submits_count = r.submits_count;
        this.renderMyFormsList();
    },




    // my forms list

    renderMyFormsList: function() {
        this.setMode("lists");

        var el = this.$["table_my_forms"];
        core.browser.element.removeChilds(el, this.$["table_my_forms_head"]);


        var i, f, td;

        for(i=0; i<core.data.forms_list.length; i++) {
            f = core.data.forms_list[i];

            if(core.data.forms_submits_count && core.data.forms_submits_count[f.id]) {
                td = 
                    { tag: "td",
                      childs: [
                        { tag: "text", innerHTML: f.title + " "},
                        { tag: "a", 
                          events: { onclick: [ "onViewFormDataClick", i ] },
                          innerHTML: "(" + core.data.forms_submits_count[f.id].count + " replies)"}
                      ]};
            } else {
                td = { tag: "td", innerHTML: f.title };
            }
            this.buildModel(el, 
                { tag: "tr",
                  childs: [
                    td,
                    { tag: "td", 
                      className: "ta_center last",
                      childs: [
                        { tag: "img", src: "/static/icons/list.png",
                          className: "icon",
                          events: { onclick: [ "onViewFormDataClick", i ] },
                          title: " View submitted data " },
                        { tag: "img", src: "/static/icons/page_edit.png",
                          className: "icon",
                          events: { onclick: [ "onEditFormClick", f.id ] },
                          title: " Edit form " },
                        { tag: "img", src: "/static/icons/cross.png",
                          className: "icon",
                          events: { onclick: [ "onRemoveFormClick", f.id ] },
                          title: " Delete form " }
                      ]}
                  ]}
            );
        }
    },


    onViewFormDataClick: function(e, idx) {
        var form = core.data.forms_list[idx];
        core.values.forms_data_id = form.id;
        core.values.forms_data_title = form.title;
        desktop.showPopupApp("forms_data");
    },


    onEditFormClick: function(e, id) {
        this.form_id = id;
        this.editForm();
    },


    onRemoveFormClick: function(e, id) {
        desktop.modal_dialog.confirm("Delete form?", this.deleteForm.bind(this, id));
    },

    deleteForm: function(id) {
        this.setMode("loading");
        var p = {
            dialog: "forms_manager",
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
        core.data.forms_list = r.list;
        this.updateFormApps();
        this.renderMyFormsList();
        this.setMode("lists");
    },




    // templates list

    renderTemplatesList: function() {
        this.setMode("lists");
        var el = this.$["table_templates"];
        core.browser.element.removeChilds(el, this.$["table_templates_head"]);

        for(var i=0; i<core.data.default_forms_list.length; i++) {
            var f = core.data.default_forms_list[i];
            this.buildModel(el, 
                { tag: "tr",
                  childs: [
                    { tag: "td", innerHTML: f.title },
                    { tag: "td", 
                      className: "ta_center last",
                      childs: [
                        { tag: "img", src: "/static/icons/page_edit.png",
                          className: "icon",
                          events: { onclick: [ "onOpenTemplateClick", f.id ] },
                          title: " Open this template " }
                      ]}
                  ]}
            );
        }
    },


    onOpenTemplateClick: function(e, id) {
        this.setMode("loading");
        if(!core.values.default_forms[id]) {
            var p = {
                dialog: "forms_manager",
                act: "get",
                id: id
            };
            core.transport.send("/controller.php", p, this.onDefaultFormDataResponce.bind(this));
        } else {
            this.useDefaultForm(id);
        }
    },


    onDefaultFormDataResponce: function(r) {
        if(!r || r.status != "ok") {
            this.setMode("error");
            return;
        }
        core.values.default_forms[r.form_id] = r.form;
        this.useDefaultForm(r.form_id);
    },


    useDefaultForm: function(id) {
        this.setMode("lists");
        core.values.form_builder = {
            tag: "data",
            form_data: core.values.default_forms[id]
        };
        desktop.showPopupApp("form_builder");
    },


    // popup bottom buttons

    onCreateClick: function() {
        this.form_id = null;
        this.editForm();
    },


    onCancelClick: function() {
        desktop.hidePopupApp();
    },




    // save/load form

    editForm: function() {
        if(this.form_id == null) {
            core.values.form_builder = {
                tag: "new",
                title: "Form " + (core.data.forms_list.length + 1)
            }
        } else {
            core.values.form_builder = {
                tag: "exists",
                form_id: this.form_id
            }
        }
        desktop.showPopupApp("form_builder");
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
    }


};
core.apps.forms_manager.extendPrototype(core.components.html_component);
core.apps.forms_manager.extendPrototype(core.components.popup_app);