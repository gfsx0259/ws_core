if(!core.data.forms) core.data.forms = {};


core.apps.form_select = function() {};

core.apps.form_select.prototype = {


    window_resize: {
        height: 400,
        min_height: 400,
        width: 670,
        min_width: 480,
        target: "list"
    },


    getTitle: function() {
        return "Select form";
    },


    renderContent: function() {
        this.displayTpl(this.$["content"], "form_select");
        this.loadList();
    },


    onShowContent: function() {
        this.callback = core.values.form_select;
    },



    // lists requests 

    loadList: function() {
        if(core.data.forms_list) {
            this.renderList();
            return;
        }
        this.$["list"].innerHTML = "Loading...";
        var p = {
            dialog: "forms_manager",
            act: "get_list",
            default_forms: 0
        };
        core.transport.send("/controller.php", p, this.onListResponce.bind(this));
    },


    onListResponce: function(r) {
        if(!r || r.status != "ok") {
            this.$["list"].innerHTML = "<div class='message_error'>Server error.</div>";
            return;
        }
        core.data.forms_list = r.list;
        this.renderList();
    },




    // list

    renderList: function() {
        var el = this.$["list"];
        var l = core.data.forms_list;
        if(l.length) {
            el.innerHTML = "";
            for(var i=0; i<l.length; i++) {
                this.buildModel(el,
                    { tag: "div", className: "item",
                      events: { onclick: ["onSelectClick", i] },
                      innerHTML: l[i].title }
                );
            }
        } else {
            el.innerHTML = "<div class='message_info'>Forms list empty</div>";
        }
    },


    onSelectClick: function(e, idx) {
        this.callback(core.data.forms_list[idx]);
        desktop.hidePopupApp();
    }


};
core.apps.form_select.extendPrototype(core.components.html_component);
core.apps.form_select.extendPrototype(core.components.popup_app);