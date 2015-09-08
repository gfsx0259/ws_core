core.apps.form.extendPrototype({


    onFirstRun: function() {
        this.showSettings();
        this.onSelectFormClick();
    },

    // settings

    settingsBlocks: [
        { title: "Form:",
          controls: [
            { tag: "a", events: { onclick: "onSelectFormClick" },
              innerHTML: "Select form" },
            { tag: "strong", id: "lbl_form",
              style: { marginLeft: "15px" } },
            { tag: "wsc_button", title: "Edit",
              id: "btn_edit",
              className: "float_right" ,
              events: { onclick: "onEditFormClick" } }
          ]},

        { title: "Send to:",
          controls: [
            { tag: "wsc_text", id: "inp_target_url", hint: "Email..." }
          ]}
    ],


    fillSettingsForm: function() {
        this.$["lbl_form"].form_id = this.profile.form_id;
        if(!this.profile.form_id) {
            this.hideElement("btn_edit");
        }
        this.showFormLabel();
        this.$["inp_target_url"].setValue(this.profile["target_url"]);
    },


    processSettingsForm: function() {
        this.profile["form_id"] = this.$["lbl_form"].form_id;
        this.profile["target_url"] = this.$["inp_target_url"].getValue();
    },


    onSettingsUpdated: function() {
        this.refresh();
    },


    // select form
    showFormLabel: function() {
        var el = this.$["lbl_form"];
        var l = core.data.forms_list;
        if(el.form_id == null) {
            el.innerHTML = "None";
        } else if(l) {
            for(var i=0; i<l.length; i++) {
                if(l[i].id == el.form_id) {
                    el.innerHTML = l[i].title
                    return;
                }
            }
            el.form_id = null;
        } else {
            el.innerHTML = "Loading...";
            this.loadFormsList();
        }
    },


    loadFormsList: function() {
        var p = {
            dialog: "forms_manager",
            act: "get_list",
            default_forms: 0
        }
        core.transport.send("/controller.php", p, this.onFormsListResponce.bind(this));
    },


    onFormsListResponce: function(r) {
        if(!r || r.status != "ok") {
            desktop.modal_dialog.alert("Server error");
            return;
        }
        core.data.forms_list = r.list;
        this.showFormLabel();
    },


    onSelectFormClick: function() {
        core.values.form_select = this.onFormSelected.bind(this);
        desktop.showPopupApp("form_select");
    },


    onFormSelected: function(f) {
        this.$["lbl_form"].form_id = f.id;
        this.showElement("btn_edit");
        this.showFormLabel();
    },


    onEditFormClick: function(e) {
        if(!this.$["lbl_form"].form_id) return;
        core.values.form_builder = {
            tag: "exists",
            form_id: this.$["lbl_form"].form_id
        }
        desktop.showPopupApp("form_builder");
    }


});