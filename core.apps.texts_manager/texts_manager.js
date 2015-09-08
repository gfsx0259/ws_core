core.apps.texts_manager = function() {
    this.data = null;

    this.is_preview_visible = true;
    this.preview_width = 0;
}


core.apps.texts_manager.prototype = {


    renderContent: function() {
        this.displayTpl(this.$["content"], "texts_manager");
        desktop.updatePopupPos();
        this.updateInterface();
    },

    window_resize: {
        target: "texts_manager"
    },

    onResize: function(v) {
        var h1 = v.height - 44;
        this.$["list"].style.height = h1 + "px";
        this.$["previews_box"].style.height = v.height - 1 + "px";
        this.$["p_content"].style.height = v.height + "px";
    },



    onShowContent: function() {
        if(this.skip_on_show_content) {
            this.skip_on_show_content = false;
            return;
        }

        var args = core.values.texts_manager_args;
        if(args.callback) {
            this.callback = args.callback;
            this.multiselect = !!args.multiselect;
        } else {
            this.multiselect = false;
            this.callback = false;
        }
        core.values.texts_manager_args = null;
        this.refresh();
    },


    getTitle: function() {
        return "Documents manager";
    },




    // code

    togglePreview: function(e) {
        this.is_preview_visible = !this.is_preview_visible;
        if(this.is_preview_visible) {
            this.$["left_panel"].style.width = this.list_width + "px";
            this.$["previews_box"].style.width = this.preview_width + "px";
            this.showElement("previews_box");
        } else {
            this.preview_width = this.$["previews_box"].offsetWidth;
            this.list_width = this.$["left_panel"].offsetWidth;

            this.hideElement("previews_box");
            this.$["left_panel"].style.width = this.$["left_panel"].offsetWidth + this.preview_width + "px";
        }
    },


    updateInterface: function() {
        this.hideElements(["btn_rename_doc", "btn_edit_doc", "btn_delete_doc", "btn_choose"]);

        if(this.is_loading) {
            this.setPreview(false);
            return;
        }

        var selection = this.getSelection();
        if(selection.length == 1) {
            if(this.callback) {
                this.showElement("btn_choose");
            }
            this.showElements(["btn_rename_doc", "btn_delete_doc", "btn_edit_doc"]);
            core.data.texts.get(selection[0].id, this.setPreview.bind(this));
        } else if(selection.length > 1) {
            this.setPreview(false);
            if(this.callback && this.multiselect) {
                this.showElement("btn_choose");
            }
            this.showElement("btn_delete_doc");
        }
    },



    refresh: function() {
        var p = {
            act: "get_list"
        }
        this.sendRequest(p);
    },


    onList: function(data) {        
        this.is_loading = false;
        this.data = data;
        this.refreshList();
    },



    refreshList: function() {
        this.renderList();
        this.updateInterface();
    },


    renderList: function() {
        this.data = this.data.sort(function(a, b) { return a.title >= b.title ? 1 : -1 });
        this.selection = [];
        this.last_selected_idx = null;

        if(this.data.length) {
            this.$["list"].innerHTML = "";

            var m = [];

            for(var i=0; i<this.data.length; i++) {
                this.selection[i] = false;

                var t = this.data[i];
                var title = t.title;
                var hint = "";
                if(t.pages && t.pages.length) {
                    title += " (" + t.pages.length + ")";
                    hint = "Used at pages:\n" + t.pages.join("\n");
                }


                m.push(
                    { tag: "docitem", 
                      id: "doc" + i,
                      events: { 
                        onclick: ["onItemClick", i],
                        ondblclick: ["onItemDblClick", i]
                      },
                      innerHTML: 
                        "<div class='date'>" + new Date(t.modified * 1000).format() + "</div>" +
                        "<div class='title nowrap' title='" + hint + "'>" + title + "</div>" }
                );
            }
            this.buildModel(this.$.list, m);

/*
            if(this.multiselect) {
                this.updateSelection();
            }
            */
        } else {
            this.$.list.innerHTML = "Empty...";
        }
    },




    updateSelection: function() {
    //dimk
        for(var id in this.selection) {
            this.setDocSelected
            this.$["cb" + id].setChecked(this.selection[id]);
        }
    },



    onItemClick: function(e, idx) {
        e = core.browser.event.fix(e);

        if(e.ctrlKey) {
            this.setDocSelected(idx, !this.selection[idx]);
            this.last_selected_idx = idx;
        } else if(e.shiftKey) {
            var last_selected_idx = this.last_selected_idx || 0;
            if(idx < last_selected_idx) {
                var idx_start = idx, idx_end = last_selected_idx;
                this.last_selected_idx = idx;
            } else {
                var idx_end = idx, idx_start = last_selected_idx;
            }
            for(var i=0; i<this.data.length; i++) {
                this.setDocSelected(i, i >= idx_start && i <= idx_end);
            }
        } else {
            for(var i=0; i<this.data.length; i++) {
                if(i != idx && this.selection[i]) {
                    this.setDocSelected(i, false);
                }
            }
            this.setDocSelected(idx, true);
            this.last_selected_idx = idx;
        }
        this.updateInterface();
    },



    setDocSelected: function(idx, is_selected) {
        if(this.selection[idx] != is_selected) {
            this.selection[idx] = is_selected;
            this.$["doc" + idx].className = is_selected ? "selected" : "";
        }
    },



    getSelection: function() {
        var res = [];
        if(this.data && this.data.length) {
            for(var i=0; i<this.data.length; i++) {
                if(this.selection[i]) {
                    res.push(this.data[i]);
                }
            }
        }
        return res;
    },


    onItemDblClick: function(e, idx) {
        for(var i=0; i<this.data.length; i++) {
            if(i != idx && this.selection[i]) {
                this.setDocSelected(i, false);
            }
        }
        this.setDocSelected(idx, true);
        this.last_selected_idx = idx;

        this.onEditClick(e);
    },


    setPreview: function(text) {
        if(text && text.content) {
            this.$["preview_content"].innerHTML = text.content;
            this.$["preview_content_summary"].innerHTML = text.summary;
        } else {
            this.$["preview_content"].innerHTML = text || "";
            this.$["preview_content_summary"].innerHTML = text || "";
        }
    },



    // search
    onSearchClick: function(e) {
        var str = this.$["input_search_text"].getValue();
        if(str.length) {
            var p = {
                dialog: "texts",
                act: 'get_list',
                text: str
            }
            core.transport.send("/controller.php", p, this.onList.bind(this));
            this.$["list"].innerHTML = "";
        } else if(!this.data.length) {
            this.refresh();
        }
    },


    onSearchClearClick: function(e) {
        this.refresh();
    },



    onRenameClick: function(e) {
        var doc = this.getSelection()[0];

        desktop.modal_dialog.prompt2(
            "Enter new name", 
            doc.title || "", 
            "For ecommerce documents use the following naming convention<br/><strong>$brand$category$product name$tab title$order</strong>",
            this.renameText.bind(this)
        );
    },


    renameText: function(new_name) {
        var doc = this.getSelection()[0];

        new_name = new_name.trim();
        if(new_name == "" || new_name == doc.title) return;

        var p = {
            act: "update", 
            title: new_name, 
            id: doc.id
        }
        this.sendRequest(p);
    },






    onDeleteClick: function(e) {
        var selection = this.getSelection();
        if(selection.length == 1) {
            var str = "Delete " + selection[0].title + " ?";
        } else {
            var str = "Delete " + selection.length + " documents?";
        }
        desktop.modal_dialog.confirm(str, this.deleteText.bind(this, selection));
    },


    deleteText: function(selection) {
        var ids = [];
        for(var i=0; i<selection.length; i++) {
            ids.push(selection[i].id);
            core.data.texts.deleteContent(selection[i].id);
        }
        var p = {
            act: "delete", 
            ids: ids.join("-")
        }
        this.sendRequest(p);
    },


    onCreateClick: function(e) {
        this.skip_on_show_content = true;
        desktop.openTextEditor({ title: "New document"}, this.onNewDocEdited.bind(this));
    },


    onNewDocEdited: function(doc) {
        desktop.modal_dialog.prompt2(
            "Enter title for a new document", 
            "", 
            "For ecommerce documents use the following naming convention<br/><strong>$brand$category$product name$tab title$order</strong>",
            this.createNewDoc.bind(this, doc)
        );
    },


    createNewDoc: function(doc, title) {
        if(!title) return;
        title = title.trim();
        if(title == "") return;

        doc.act = "create";
        doc.title = title;
        this.sendRequest(doc, "POST");
    },


    onEditClick: function(e) {
        var doc = this.getSelection()[0];
        if(doc && doc.id) {
            this.editedTextId = doc.id;
            core.data.texts.get(doc.id, this.editText.bind(this));
        }
    },


    editText: function(text) {
        this.skip_on_show_content = true;
        desktop.openTextEditor(text, this.onDocEdited.bind(this));
    },


    onDocEdited: function(doc) {
        doc.act = "update";
        doc.id = this.editedTextId;
        this.sendRequest(doc, "POST");
        core.data.texts.setData(this.editedTextId, doc);
    },





    // choose doc(s)

    onChooseClick: function(e) {
        desktop.hidePopupApp();
        if(this.callback) {
            var selection = this.getSelection();
            if(this.multiselect) {
                this.callback(selection);
            } else {
                this.callback(selection[0]);
            }
        }
    },





    // requests

    sendRequest: function(p, method) {
        this.selectedIdx = null;
        this.$["list"].innerHTML = "Loading...";
        this.is_loading = true;
        this.updateInterface();
        this.setPreview(false);
        p.dialog = "texts";
        p.get_list = "1";
        var t = this.$["input_search_text"].getValue();
        if(t != "") {
            p.text = t;
        }
        core.transport.send("/controller.php", p, this.onList.bind(this), method);
    }

}

core.apps.texts_manager.extendPrototype(core.components.html_component);
core.apps.texts_manager.extendPrototype(core.components.popup_app);