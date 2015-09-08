core.apps.desktop.extendPrototype({

    initInterface_contributor: function() {
        this.displayTpl(document.body, "desktop_popup");

        var p = core.data.c_permissions;
        var popups = [];
        if(p["manage_docs"] == 1) {
            popups.push("text_editor");
        }

        if(p["manage_files"] == 1) {
            popups.push("files_upload");
        }
        this.initPopupApps(popups);
    }

});