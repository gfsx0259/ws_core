core.apps.emails_manager = function() {
    if(!core.data.email_templates) {
        core.data.email_templates = {};
    }
};


core.apps.emails_manager.prototype = {


    window_resize: {
        height: 400,
        min_height: 400,
        width: 670,
        min_width: 670,
        target: "emails_manager"
    },



    getTitle: function() {
        return "Emails manager";
    },


    onResize: function(v) {
        var h1 = v.height - 92;
        this.$["inp_email_body"].style.height = h1 + "px";
    },


    renderContent: function() {
        this.displayTpl(this.$["content"], "emails_manager");
        this.loadInfos();
        this.mode = "list";
    },



    // infos list
    showInfosList: function() {
        this.mode = "list";
        this.hideElements(["editor", "btn_save_email"]);
        this.showElement("list");
    },


    loadInfos: function() {
        this.$["list"].innerHTML = "Loading...";
        var p = {
            dialog: "emails_manager",
            act: "get_infos"
        };
        core.transport.send("/controller.php", p, this.onInfosResponce.bind(this));
    },


    onInfosResponce: function(r) {
        if(!r || r.status != "ok") {
            this.$["list"].innerHTML = "Server error";
            return;
        }
        this.infos = r.data;
        this.$["list"].innerHTML = "";
        for(var i=0; i<this.infos.length; i++) {
            var info = this.infos[i];
            this.buildModel(this.$["list"], 
                { tag: "div", className: "email_info",
                  childs: [
                    { tag: "strong", innerHTML: info.name + " - "},
                    { tag: "a", innerHTML: "edit",
                      events: { onclick: [ "onEditTemplateClick", i ] } },
                    { tag: "p", innerHTML: info.description }
                  ]}
            );
        }
    },



    // templates

    onEditTemplateClick: function(e, info_idx) {
        this.active_info = this.infos[info_idx];

        if(!core.data.email_templates[this.active_info.key]) {
            desktop.setState("loading");
            var p = {
                dialog: "emails_manager",
                act: "get_template",
                key: this.active_info.key
            };
            core.transport.send("/controller.php", p, this.onGetTemplateResponce.bind(this));
        } else {
            this.editTemplate();
        }
    },


    onGetTemplateResponce: function(r) {
        desktop.setState("normal");
        if(!r || r.status != "ok") {
            this.$["list"].innerHTML = "Server error";
            return;
        }

        core.data.email_templates[r.key] = r.data;
        this.editTemplate(r.key);
    },



    editTemplate: function() {
        this.mode = "editor";
        this.hideElement("list");
        this.showElements(["editor","btn_save_email"]);

        var tpl = core.data.email_templates[this.active_info.key];
        this.$["inp_email_subject"].value = tpl.subject || "";
        this.$["inp_email_body"].value = tpl.body || "";
        this.$["inp_email_subject"].focus();
        // render placeholders list
        this.$["email_keys"].innerHTML = "";
        var plist = this.active_info.placeholders.split(",");
        for(var i=0; i<plist.length; i++) {
            var pname = "{" + plist[i] + "}";
            this.buildModel(this.$["email_keys"],
                { tag: "div", className: "key",
                  events: { onclick: [ "insertPlaceholder", pname ] },
                  title: "Click to add",
                  innerHTML: pname }
            );
        }
    },



    // template editor

    setActiveInput: function(e) {
        e = core.browser.event.fix(e);
        this.active_input = e.target;
    },


    insertPlaceholder: function(e, key) {
        e = core.browser.event.fix(e);
        e.target.blur();
        if(!this.active_input) return;
        var o = this.active_input;
        if(document.all&&document.selection) {          
            o.focus();
            var range = document.selection.createRange();
            if(typeof range.text == 'string')
                document.selection.createRange().text =document.selection.createRange().text+key;
        } else {
            if(o.setSelectionRange) {
                var rangeStart = o.selectionStart;
                var rangeEnd = o.selectionEnd;
                var tempStr1 = o.value.substring(0,rangeStart);
                var tempStr2 = o.value.substring(rangeEnd);
                o.value = tempStr1 + key + tempStr2;
            }
        }
    },

    onEditorCancelClick: function() {   
        if(this.mode == "list") {
            desktop.hidePopupApp();
        } else {
            this.showInfosList();
        }
    },


    onEditorSaveClick: function() {
        desktop.setState("loading");
        this.tmp = {
            subject: this.$["inp_email_subject"].value,
            body: this.$["inp_email_body"].value
        };
        var p = {
            dialog: "emails_manager",
            act: "set_template",
            email_info_id: this.active_info.id,
            subject: this.tmp.subject,
            body: this.tmp.body
        };
        core.transport.send("/controller.php", p, this.onSetTemplateResponce.bind(this));        
    },


    onSetTemplateResponce: function(r) {
        desktop.setState("normal");
        this.showInfosList();
        if(!r || r.status != "ok") {
            this.$["list"].innerHTML = "Server error";
        } else {
            core.data.email_templates[this.active_info.key] = this.tmp;
        }
    }


};
core.apps.emails_manager.extendPrototype(core.components.html_component);
core.apps.emails_manager.extendPrototype(core.components.popup_app);