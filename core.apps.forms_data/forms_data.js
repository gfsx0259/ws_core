core.apps.forms_data = function() {};

core.apps.forms_data.prototype = {

    window_resize: {
        height: 400,
        min_height: 400,
        width: 670,
        min_width: 480,
        target: "forms_data"
    },


    onResize: function(v) {
        this.$["list"].style.height = v.height + "px";
        this.$["box_data"].style.height = (v.height - 138) + "px";
    },


    getTitle: function() {
        return core.values.forms_data_title;
    },


    renderContent: function() {
        this.displayTpl(this.$["content"], "forms_data");
        this.setMode("list");
    },


    onShowContent: function() {
        this.loadList();
    },


    setMode: function(mode) {
        switch(mode) {
            case "loading":
                desktop.setState("loading");
                break;

            case "error":
                desktop.setState("normal");
                desktop.modal_dialog.alert("Server error.");
                break;

            case "list":
                this.showElement("list");
                this.hideElements(["data", "btn_send"]);
                desktop.setState("normal");
                break;

            case "data":
                this.showElements(["data", "btn_send"]);
                this.hideElement("list");
                desktop.setState("normal");
                break;
        }
        this.mode = mode;
    },



// list

    loadList: function() {
        this.setMode("loading");
        var p = {
            dialog: "forms_manager",
            act: "get_form_data_list",
            form_id: core.values.forms_data_id
        };
        core.transport.send("/controller.php", p, this.onListResponce.bind(this));
    },


    onListResponce: function(r) {
        if(!r || r.status != "ok") {
            this.setMode("error");
            return;
        }
        this.list_field_label = r.list_field_label;
        this.list = r.list;
        this.renderList();
    },




    renderList: function() {
        this.setMode("list");

        this.$["list_field_label"].innerHTML = this.list_field_label || "";

        var el = this.$["table_list"];
        core.browser.element.removeChilds(el, this.$["table_list_head"]);

        for(var i=0; i<this.list.length; i++) {
            var f = this.list[i];
            this.buildModel(el, 
                { tag: "tr",
                  childs: [
                    { tag: "td", innerHTML: f.date },
                    { tag: "td", innerHTML: f.list_field_value || ""},
                    { tag: "td", 
                      className: "ta_center last",
                      childs: [
                        { tag: "img", src: "/vendor/generdyn/core/images/page_edit.png",
                          className: "icon",
                          events: { onclick: [ "onViewDataClick", f.id ] },
                          title: " View " },
                        { tag: "img", src: "/static/icons/cross.png",
                          className: "icon",
                          events: { onclick: [ "onDeleteDataClick", f.id ] },
                          title: " Delete " }
                      ]}
                  ]}
            );
        }
    },


    onDeleteDataClick: function(e, id) {
        desktop.modal_dialog.confirm("Delete?", this.deleteDate.bind(this, id));
    },


    deleteDate: function(id) {
        this.setMode("loading");
        var p = {
            dialog: "forms_manager",
            act: "get_form_data_list",
            form_id: core.values.forms_data_id,
            delete_data_id: id
        };
        core.transport.send("/controller.php", p, this.onListResponce.bind(this));
    },




// data

    onViewDataClick: function(e, id) {
        this.form_data_id = id;
        this.setMode("loading");
        var p = {
            dialog: "forms_manager",
            act: "get_form_data",
            id: id
        };
        core.transport.send("/controller.php", p, this.onDataResponce.bind(this));
    },


    onDataResponce: function(r) {
        if(!r || r.status != "ok") {
            this.setMode("error");
            return;
        }
        this.data = r.data;
        this.files = r.files;
        this.renderData();
    },


    renderData: function() {
        this.setMode("data");
        //TODO
        this.$["inp_email"].value = this.data.email;
        this.$["box_data"].innerHTML = this.data.data;

        var files_html = [];
        for(var i=0; i<this.files.length; i++) {
            var f = this.files[i];
            files_html.push(
                "<a target='forms_data_popup_iframe' href='/controller.php?dialog=file_download"+
                "&id=" + f.id + 
                "'>" + f.name +
                "</a>"
            );
        }
        this.$["box_files"].innerHTML = files_html.join("; ");
    },





    // bottom buttons
    onBtnSendClick: function() {
        var email = this.$["inp_email"].value.trim();
        if(!email) return;
        desktop.setState("loading");
        var p = {
            dialog: "forms_manager",
            act: "send_form_data",
            email: email,
            id: this.form_data_id
        };
        core.transport.send("/controller.php", p, this.onSendResponce.bind(this));        
    },


    onSendResponce: function(r) {
        desktop.setState("normal");
    },


    onBtnCloseClick: function() {
        if(this.mode == "data") {
            this.setMode("list");
        } else {
            desktop.hidePopupApp();
        }
    }

};
core.apps.forms_data.extendPrototype(core.components.html_component);
core.apps.forms_data.extendPrototype(core.components.popup_app);