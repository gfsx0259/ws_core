core.apps.webnote.extendPrototype({


    onFirstRun: function() {
        this.showSettings();
        desktop.modal_dialog.confirm(
            "Do you want to choose an existing document?",
            this.onUseExistingDoc.bind(this),
            this.onCreateNewDoc.bind(this)
        );
    },


    onUseExistingDoc: function() {
        this.$["inp_doc"].onSelectClick();
    },


    onCreateNewDoc: function() {
        this.$["inp_doc"].onEditClick();
    },


    initAdmin: function() {
        this.$["content_box"].onclick = this.onTextClick.bindAsEventListener(this);
        this.$["summary_box"].onclick = this.onTextClick.bindAsEventListener(this);

        if(this.profile["text_id"]) {
            core.data.texts.addListener(this.profile["text_id"], this.id, this.refresh.bind(this));
        }
    },



    settingsBlocks: [
        { title: "Content:",
          controls: [
            { tag: "wsc_doc_control", id: "inp_doc" }
          ]},
        { title: "Misc:",
          controls: [
            { tag: "wsc_checkbox", title: "Hide \"more...\" link when summary shown", id: "inp_hide_more" },
            { tag: "div", className: "divider" },
            { tag: "wsc_checkbox", title: "Show date of document", id: "inp_show_date" },
            { tag: "div", className: "divider" },
            { tag: "wsc_checkbox", title: "Show author of document", id: "inp_show_author" }
          ]},
        { title: "Hiding:",
            controls: [
                { tag: "wsc_checkbox", title: "Hide by user", id: "inp_hide_user" },
                { tag: "div", className: "divider" },
                { tag: "wsc_checkbox", title: "Hide after certain period  <br/> (please set the delay in seconds below)", id: "inp_hide_timer" },
                { tag: "div", className: "dividerLarge" },
                { tag: "wsc_text", id: "inp_hide_delay"}
            ]}
    ],


    fillSettingsForm: function() {
        this.$["inp_hide_user"].setChecked(this.profile["hide_user"]);
        this.$["inp_hide_timer"].setChecked(this.profile["hide_timer"]);
        this.$["inp_hide_delay"].value = this.profile["hide_delay"];

        this.$["inp_show_date"].setChecked(this.profile["show_date"]);
        this.$["inp_show_author"].setChecked(this.profile["show_author"]);
        this.$["inp_hide_more"].setChecked(this.profile["hide_more"]);
        this.$["inp_doc"].setValue({ id: this.profile.text_id, content: this.profile.webnote_content_type == 0 ? "content" : "summary"});
    },



    processSettingsForm: function() {
        this.profile["show_date"] = this.$["inp_show_date"].checked ? 1 : 0;
        this.profile["show_author"] = this.$["inp_show_author"].checked ? 1 : 0;
        this.profile["hide_more"] = this.$["inp_hide_more"].checked ? 1 : 0;
        this.profile["hide_user"] = this.$["inp_hide_user"].checked ? 1 : 0;
        this.profile["hide_timer"] = this.$["inp_hide_timer"].checked ? 1 : 0;
        if(this.$["inp_hide_delay"].value){
            this.profile["hide_delay"] = this.$["inp_hide_delay"].value;
        }

        core.data.texts.removeListener(this.profile.text_id, this.id);
        var d = this.$["inp_doc"].value;
        this.profile.text_id = d.id;
        core.data.texts.addListener(d.id, this.id, this.refresh.bind(this));
        this.profile.webnote_content_type = d.content == "summary" ? 1 : 0;
    },


    onSettingsUpdated: function() {
        this.refresh();
    },


    onApplySettings: function() {
        var toolbar = desktop.admin_toolbars.get("text_editor");
        if(toolbar) {
            toolbar.onTextEditorSaveClick();
        }
    },


    onBlur: function() {
        var toolbar = desktop.admin_toolbars.get("text_editor");
        if(toolbar) {
            toolbar.onTextEditorSaveClick();
        }
    },

    onClose: function() {
        var toolbar = desktop.admin_toolbars.get("text_editor");
        if(toolbar) {
            toolbar.stopTextEditor();
        }

        if(this.profile["text_id"]) {
            core.data.texts.removeListener(this.profile.text_id, this.id);
        }
    },


    editText: function(text) {
        this.editable_text = text;

        desktop.admin_toolbars.show("text_editor", false);

        var el = this.profile["webnote_content_type"] == 0 ? this.$["content_box"] : this.$["summary_box"];
        desktop.admin_toolbars.get("text_editor").startTextEditor({
            element: el,
            title: text.title,
            onchange: this.onTextEdited.bind(this)
        });
    },


    onTextEdited: function(args) {
        if(!args) args = {};

        var options = {
            edit_html: args.edit_html
        };
        if(this.profile["webnote_content_type"] == 0) {
            this.editable_text["content"] = this.$["content_box"].innerHTML;
            options.tab = "content";
        } else {
            this.editable_text["summary"] = this.$["summary_box"].innerHTML;
            options.tab = "summary";
        }

        if(args.open_advanced_editor) {
            desktop.openTextEditor(this.editable_text, this.updateText.bind(this), options);
        } else {
            this.updateText(this.editable_text);
        }
    },


    updateText: function(doc) {
        desktop.setState("loading");
        doc.id = this.profile["text_id"];
        core.data.texts.updateContent(doc);

        doc.dialog = "texts";
        doc.act = "update";
        core.transport.send("/controller.php", doc, this.onTextUpdated.bind(this), "POST");
        this.tmp = doc;
    },


    onTextUpdated: function(text_id) {
        desktop.setState("normal");
        this.refresh();
    },


    createText: function(doc) {
        doc.dialog = "texts";
        doc.rid = 1;
        doc.act = "create",
        doc.title = "Text block content";
        core.transport.send("/controller.php", doc, this.onTextCreated.bind(this), "POST");
        this.tmp = doc;
    },


    onTextCreated: function(text_id) {
        core.data.texts.setData(text_id, this.tmp);
        this.onTextSelected({ id: text_id });
    },


    onTextSelected: function(text) {
        if(this.profile["text_id"] == text.id) return;

        this.profile["text_id"] = text.id;
        if(this.isSettingsRendered) {
            this.fillSettingsForm();
        }
        this.refresh();
        desktop.layout.savePage();
    },



    onTextClick: function(e) {
        if(this.profile["text_id"] == null) {
            desktop.openTextsManager(this.onTextSelected.bind(this));
        } else {
            core.data.texts.get(this.profile["text_id"], this.editText.bind(this));
        }
    },


    getUsedTexts: function() {
        return this.profile["text_id"] != null ? [this.profile["text_id"]] : null;
    },



    getContent: function() {
        var key = this.profile["webnote_content_type"] == 0 ? "content_box" : "summary_box";
        return this.$[key].innerHTML;
    }


});