core.apps.list_editor = function() {}

core.apps.list_editor.prototype = {


    window_resize: {
        hmargin: 190,
        wmargin: 425,
        min_height: 400,
        min_width: 500,
        target: "properties"
    },

    onResize: function(v) {
        this.$["list"].style.height = v.height + "px";
        this.$["properties"].style.height = v.height + "px";
    },


    getTitle: function() {
        return "List editor";
    },

    renderContent: function() {
        this.displayTpl(this.$["content"], "list_editor");
    },


    // all sections from template must be defined here
    sections: [ "sec_file", "sec_title", "sec_doc", "sec_url", "sec_alt", "sec_code", "sec_html" ],

    default_labels: {
        "code": "Embed code",
        "html": "HTML"
    },


    // core.values.list_editor: { popup_title, callback, list: [], add_action, files_filter, default_item: {}, auto_add: bool }
    // important: default_item and items must have title property! 

    onShowContent: function() {
        var d = core.values.list_editor;
        if(!d) return;

        this.hideElements(this.sections);

        this.setTitle(d.popup_title);
        this.callback = d.callback;
        this.list = d.list;

        this.auto_add = d.auto_add;
        this.add_action = d.add_action;

        this.default_item = d.default_item;

        this.list_item_title_key = d.list_item_title_key;


        if(this.default_item.file != undefined) {
            this.files_filter = d.files_filter;
            if(this.files_filter == "pictures") {
                this.showElement("pic_preview");
            } else {
                this.hideElement("pic_preview");
            }
            this.$["inp_item_file"].type = d.files_filter;
        }

        for(var k in this.default_item) {
            this.$["lbl_item_" + k].innerHTML = d.labels && d.labels[k] ? d.labels[k] : default_labels[k]
            this.showElement("sec_" + k);
        }

        this.active_item_idx = null;
        this.renderList();

        if(this.list[d.selected_item_idx]) {
            this.editItem(d.selected_item_idx);
        } else {
            this.editItem(0);
        }

        core.values.list_editor = null;

        this.autoAdd();
    },




    // bottom buttons

    onCancelClick: function() {
        desktop.hidePopupApp();
    },


    onSaveClick: function() {
        if(this.callback) {
            this.collectItemValues();
            this.callback(this.list);
        }
        desktop.hidePopupApp();
    },




    // add new item
    autoAdd: function() {
        if(this.auto_add && this.add_action) {
            this.onAddItemClick();
        }
    },


    onAddItemClick: function() {
        this.collectItemValues();
        switch(this.add_action) {
            case "select_file":
                var callbacks = {
                    onselect: this.onItemFileSelected.bind(this),
                    onselect_multiple: this.onItemFileSelectedMultiple.bind(this)
                }
                desktop.openFilesManager(callbacks, this.files_filter);
                break;

            case "select_doc":
                desktop.openTextsManager(this.onItemDocSelected.bind(this), true);
                break;


            case "select_file&doc":
                desktop.openFilesManager(this.onItemFileSelectedEx.bind(this), this.files_filter);
                break;

            default:
                this.new_item = clone(this.default_item);
                this.new_item.title += " " + (this.list.length + 1);
                this.addNewItem();
                break;
        }
    },


    onItemFileSelected: function(f) {
        this.new_item = clone(this.default_item);
        this.new_item.title = f;
        this.new_item.file = f;
        this.addNewItem();
    },


    onItemFileSelectedEx: function(f) {
        this.tmp_file = f;
        desktop.openTextsManager(this.onDocSelectedEx.bind(this));
    },


    onDocSelectedEx: function(doc) {
        this.new_item = clone(this.default_item);
        this.new_item.title = doc.title;
        this.new_item.file = this.tmp_file;
        this.new_item.doc = {
            id: doc.id,
            content: "content"
        }
        this.addNewItem();

        this.onAddItemClick();
    },



    onItemFileSelectedMultiple: function(files) {
        for(var i=0; i<files.length; i++) {
            this.new_item = clone(this.default_item);
            this.new_item.title = "";//files[i];
            this.new_item.file = files[i];
            this.addNewItem(i != files.length - 1);
        }
    },


    onItemDocSelected: function(list) {
        if(list && list.length) {
            for(var i=0; i<list.length; i++) {
                this.new_item = clone(this.default_item);
                this.new_item.title = list[i].title;
                this.new_item.doc = {
                    id: list[i].id,
                    content: "content" 
                };
                this.addNewItem();
            }
        }
    },


    addNewItem: function(silent) {
        this.list.push(this.new_item);
        if(silent) return;
        this.renderList();
        this.editItem(this.list.length - 1);
    },



    // delete item

    onItemDelete: function(e, idx) {
        desktop.modal_dialog.confirm("Delete item?", this.deleteItem.bind(this, idx));
    },

    deleteItem: function(idx) {
        this.collectItemValues();
        this.list.splice(idx, 1);
        this.renderList();
        this.editItem(idx - 1 || 0);
    },



    // items list

    renderList: function() {
        var el = this.$["list"];
        el.innerHTML = "";
        for(var i=0; i<this.list.length; i++) {
            this.buildModel(el, 
                { tag: "div", className: "item",
                  id: "item" + i,
                  item_idx: i,
                  childs: [
                    { tag: "div", className: "icon_move",
                      title: "Drag item",
                      events: { onmousedown: ["onDragStart", i] },
                     },
                    { tag: "div",
                      title: "Delete item",
                      events: { onmousedown: ["onItemDelete", i] },
                      className: "icon_delete" },
                    { tag: "span", 
                      id: "ititle" + i,
                      html: this.getItemTitle(i),
                      events: { onclick: [ "onItemClick", i ]} }
                  ]}
            );
        }
    },



    onItemClick: function(e, idx) {
        this.collectItemValues();
        this.editItem(idx);
    },


    collectItemValues: function() {
        if(this.active_item_idx == null) return;

        var li = this.list[this.active_item_idx];
        for(var k in this.default_item) {
            li[k] = this.$["inp_item_" + k].value;
        }
//        if(li.title == "") li.title = this.default_item.title;
        this.$["ititle" + this.active_item_idx].innerHTML = this.getItemTitle(this.active_item_idx);
    },


    editItem: function(idx) {
        if(this.list[this.active_item_idx] && this.active_item_idx != idx) {
            this.$["item" + this.active_item_idx].className = "item";
        }
        var li = this.list[idx];
        if(!li) {
            this.active_item_idx = null;
            this.hideElement("properties_list");
            return;
        }

        // fill properties
        for(var k in this.default_item) {
            switch(k) {
                case "url":
                case "alt":
                case "title":
                case "code":
                case "html":
                    this.$["inp_item_" + k].value = li[k] || "";
                    break;

                case "file":
                    this.$["inp_item_" + k].setValue(li[k]);
                    this.updatePicPreview();
                    break;
                case "doc":
                    this.$["inp_item_" + k].setValue(li[k]);
                    break;
            }
        }

        // show properties
        this.showElement("properties_list");
        this.$["item" + idx].className = "item active";
        this.active_item_idx = idx;
    },


    // properties funcs
    onTitleBlur: function() {
        var t = this.$["inp_item_title"].value.trim();
        this.$["inp_item_title"].value = t;
        this.$["ititle" + this.active_item_idx].innerHTML = this.getItemTitle(this.active_item_idx);
    },


    onUrlBlur: function() {
        var url = this.$["inp_item_url"].value.trim();
        this.$["inp_item_url"].value = url;
    },


    onFileChanged: function(file) {
        if(this.files_filter != "pictures") return;
        this.updatePicPreview();
    },


    updatePicPreview: function() {
        var file = this.$.inp_item_file.value;
        file = file ? core.common.getUserFile(file): "/static/blank.gif";
        this.$["pic_preview"].innerHTML = "<img src='" + file + "'/>";
    },


    onDocChanged: function(doc) {
        if(doc.id) {
            core.data.texts.get(doc.id, this.showDocPreview.bind(this));
        } else {
            this.showDocPreview({ content: "", summary: "" });
        }
    },


    showDocPreview: function(doc) {
        if(!this.$["inp_item_doc"]) return;
        var content = this.$["inp_item_doc"].value.content;
        var html = doc[content] ? doc[content] : "";
        this.$["doc_preview"].innerHTML = html;
    },


    // drag list item

    onDragStart: function(e, idx) {
        e = core.browser.event.fix(e);

        this.drag_target = null;
        this.collectItemValues();
        this.editItem(idx);

        if(!this.$["drag_el"]) {
            this.buildModel(document.body,
                { tag: "div", className: "list_editor_list_dragable",
                  id: "drag_el",
                  innerHTML: this.getItemTitle(idx) }
            );
            this.buildModel(this.$["list"],
                { tag: "div", className: "placeholder",
                  display: false,
                  id: "drag_placeholder" }
            );
        } else {
            this.$["drag_el"].innerHTML = this.getItemTitle(idx);
            this.showElement("drag_el");
            this.$["list"].appendChild(this.$["drag_placeholder"]);
        }

        this.$["drag_el"].style.width = this.$["ititle" + idx].offsetWidth + "px";
        this.drag_target = idx;
        this.need_placeholder_update = true;
        this.updateDragPos(e);
        this.drag_target = null;
        core.browser.element.remove(this.$["item" + idx]);

        core.browser.event.push(document, ["onmousemove", "onmouseup"]);
        document.onmousemove = this.onDragMove.bindAsEventListener(this);
        document.onmouseup = this.onDragEnd.bindAsEventListener(this);
        core.browser.event.kill(e);
    },


    onDragMove: function(e) {
        e = core.browser.event.fix(e);
        this.updateDragPos(e);
        var t = e.target;
        if(t) {
            do {
                if(t.item_idx != undefined) {
                    this.drag_target = t.item_idx;
                    this.tmp_mouse_y = e.clientY;
                    this.need_placeholder_update = true;
                    return;
                }
                t = t.parentNode;
            } while(t && t.is_list != 1);
        }
    },


    onDragEnd: function(e) {
        this.hideElements(["drag_el", "drag_placeholder"]);
        document.body.appendChild(this.$["drag_placeholder"]);

        core.browser.event.pop();

        if(this.drag_target != null) {
            var tmp = clone(this.list[this.active_item_idx]);
            this.list.splice(this.active_item_idx, 1);
            this.list.splice(this.drag_target, 0, tmp);
        }

        this.renderList();
        this.editItem(this.drag_target);
    },


    updateDragPos: function(e) {
        var els = this.$["drag_el"].style;
        els.left = e.clientX + 2 + "px";
        els.top = e.clientY + 2 + "px";


        if(this.need_placeholder_update && this.drag_target != null) {
            this.showElement("drag_placeholder");

            var target = this.$["item" + this.drag_target];
            var list = this.$["list"];
            var placeholder = this.$["drag_placeholder"];

            if(e.clientY < this.tmp_mouse_y) {
                // moving up
                list.insertBefore(placeholder, target);
            } else {
                // moving down
                if(target.nextSibling) {
                    list.insertBefore(placeholder, target.nextSibling);
                } else {
                    list.appendChild(placeholder);
                }
            }
            this.need_placeholder_update = false;
        }
    },



    getItemTitle: function(idx) {
        if(this.list_item_title_key) {
            var res = this.list[idx][this.list_item_title_key];
        } else {
            var res = this.default_item.file == undefined ? this.list[idx].title : this.list[idx].file;
        }
        return res ? res : "#" + (idx + 1);
    }

}
core.apps.list_editor.extendPrototype(core.components.html_component);
core.apps.list_editor.extendPrototype(core.components.popup_app);