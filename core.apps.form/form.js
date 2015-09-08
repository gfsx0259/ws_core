core.apps.form = function(args) {
    
    this.defaultProfile = {
        title: "",
        app_style: "",
        form_id: null,
        target_url: ""
    }



}


core.apps.form.prototype = {


    onOpen: function() {
        var fp = {
            parent_el: this.$["content"]
        }
        this.form = new core.objects.form(fp);

        this.setTitle(this.profile["title"]);
        this.refresh();
    },



    refresh: function() {
        this.$["content"].innerHTML = "";
        var form_id = this.profile["form_id"];
        if(!form_id) return;
        if(!core.data.forms || !core.data.forms[form_id]) {
            this.loadFormData();
            return
        }
        this.renderForm();        
    },


    loadFormData: function() {
        this.$["content"].innerHTML = "Loading...";
        var p = {
            dialog: "forms_manager",
            act: "get",
            id: this.profile["form_id"]
        }
        core.transport.send("/controller.php", p, this.onFormDataResponce.bind(this));
    },


    onFormDataResponce: function(r) {
        if(!r || r.status != "ok") {
            this.$["content"].innerHTML = "Form missed";
            return;
        }
        if(!core.data.forms) {
            core.data.forms = {}
        }
        core.data.forms[r.form_id] = r.form;
        this.renderForm();        
    },


    renderForm: function() {
        this.$["content"].innerHTML = "";
        var form = core.data.forms[this.profile["form_id"]];
        if(!form) {
            return;
        }

        var fp = {
            target_value: this.profile["target_url"],
            target_type: "url"
        }
        this.form.setProperties(fp);
        this.form.setStructure(form, this.profile["form_id"]);
        this.form.render();
    }


}
core.apps.form.extendPrototype(core.components.html_component);
core.apps.form.extendPrototype(core.components.desktop_app);