core.apps.admin_toolbar_main = function() {


};

core.apps.admin_toolbar_main.prototype = {

    template: "admin_toolbar_window_buttons",


    renderContent: function() {
        this.buildModel(this.$["content"], [
            { tag: "a", 
              baloon_tooltip_id: 2,
              events: { onclick: "onMenuClick" },
              innerHTML: "<span><img src='/js_apps/core.apps.admin_toolbars/images/icons/settings.png'/></span>" },
            { tag: "a", 
              events: { onclick: "onPagesManagerClick" },
              innerHTML: "<span><img src='/js_apps/core.apps.admin_toolbars/images/icons/pages.png'/></span>" },
            { tag: "a", className: "paste_btn_bg",
              baloon_tooltip_id: 4,
              id: "btn_paste",
              events: { onmousedown: "onPasteMouseDown" },
              innerHTML: "<span><img src='/js_apps/core.apps.admin_toolbars/images/icons/clipboard.png'/></span>" },
            { tag: "a", 
              baloon_tooltip_id: 5,
              id: "btn_undo",
              events: { onclick: "onUndoClick" },
              innerHTML: "<span><img src='/js_apps/core.apps.admin_toolbars/images/icons/undo.png'/></span>" },
            { tag: "a", 
              baloon_tooltip_id: 6,
              id: "btn_redo",
              events: { onclick: "onRedoClick" },
              innerHTML: "<span><img src='/js_apps/core.apps.admin_toolbars/images/icons/redo.png'/></span>" },
            { tag: "a", 
              id: "upload",
              events: { onclick: "onUploadClick" },
              innerHTML: "<span><img src='/js_apps/core.apps.admin_toolbars/images/icons/upload.png'/></span>",
              childs: [
                { tag: "div", className: "dropdown",
                  childs: [
                    { tag: "a",
                      baloon_tooltip_id: 7,
                      id: "btn_upload_local",
                      innerHTML: "<span><img src='/js_apps/core.apps.admin_toolbars/images/icons/pc_small.png'/> From your computer</span>" },
                    { tag: "a",
                      baloon_tooltip_id: 8,
                      id: "btn_upload_by_url",
                      events: { onclick: "onUploadByURLClick" },
                      innerHTML: "<span><img src='/js_apps/core.apps.admin_toolbars/images/icons/download.png'/> From the internet</span>" }
                  ]}
              ]},
            { tag: "a", 
              baloon_tooltip_id: 10,
              events: { onclick: "onHelpClick" },
              innerHTML: "<span><img src='/js_apps/core.apps.admin_toolbars/images/icons/help.png'/></span>" }
        ]);

        desktop.files_uploader.addButton(this.$.btn_upload_local);
    },



    onMenuClick: function(e) {
        desktop.admin_toolbars.toggle("menu");
    },

    onPagesManagerClick: function(e) {
        desktop.admin_toolbars.toggle("pages_list");
    },

    onPasteMouseDown: function(e) {
        if(core.data.apps_clipboard) {
            desktop.layout.app_drag.onAppMouseDown(e, { clipboard: 1 });
        }
    },


    onUndoClick: function(e) {
        desktop.layout.historyUndo();
    },

    onRedoClick: function(e) {
        desktop.layout.historyRedo();
    },



    onHelpClick: function(e) {
        desktop.showHelp();
    },




// upload
    onUploadClick: function(e) {
        desktop.showPopupApp("files_upload");
    },


    onUploadByURLClick: function(e) {
        core.browser.event.fix(e);
        core.browser.event.stopPropagation(e);
//        desktop.modal_dialog.prompt("Enter file URL", "http://6.dimkin.z8.ru/hrenota/roxbury2.gif", this.onURLEntered.bind(this));
        desktop.modal_dialog.prompt("Enter file URL", "", this.onURLEntered.bind(this));
    },


    onURLEntered: function(url) {
        url = url.trim();
        if(url == "" || url == "http://") return;
        desktop.files_uploader.addUploadItem(
            { type: "url",
              data: url }
        );
    },



    updateUploadBar: function(percent) {
        if(!this.$["upload_bar"]) {
            this.buildModel(this.$["upload"],
                { tag: "div", className: "upload_bar",
                  id: "upload_bar" }
            );
        } else {
            this.showElement("upload_bar");
        }
        this.$["upload_bar"].style.height = (this.$["upload_bar"].parentNode.offsetHeight - 1)* percent * 0.01 + "px";
    },


    hideUploadBar: function() {
        this.hideElement("upload_bar");
    }

    
};
core.apps.admin_toolbar_main.extendPrototype(core.objects.admin_toolbar);
core.apps.admin_toolbar_main.extendPrototype(core.components.html_component);