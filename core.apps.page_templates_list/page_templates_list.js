core.apps.page_templates_list = function() {};


core.apps.page_templates_list.prototype = {

    window_resize: {
        height: 400,
        width: 670,
        target: "list"
    },


    renderContent: function() {
        this.displayTpl(this.$["content"], "page_templates_list");
    },



    onShowContent: function() {
        this.setTitle("Select page template");
        this.loadPageTemplates();
    },



// page templates list
    loadPageTemplates: function() {
        if(this.is_page_templates_loaded) {
            return;
        }
        this.is_page_templates_loaded = true;
        var p = {
            dialog: "pages_manager",
            act: "get_page_templates"
        };
        core.transport.send("/controller.php", p, this.onPageTemplatesResponse.bind(this));
        return false;
    },


    onPageTemplatesResponse: function(r) {
        if(!r || r.status != "ok") {
            desktop.modal_dialog.alert("Server error");
            return;
        }
        core.data.page_templates_list = r.data;
        this.renderPageTemplates();
    },



    renderPageTemplates: function() {
        this.$.list.innerHTML = "";
        this.buildModel(this.$.list, [
            { tag: "div",
              className: "page_tpl",
              events: { onclick: ["onPageTplClick", 'blank'] },
              html: 
                "<div class='title'><span class='nowrap'>Blank page</span><div></div></div>" },

            { tag: "div",
              className: "page_tpl",
              events: { onclick: ["onPageTplClick", 'ext'] },
              html: 
                "<div class='title'><span class='nowrap'>External page</span><div></div></div><img class='thumb' src='/static/page_settings/ext_page_thumb.png'/>" }
        ]);

        var ptpl;
        for(var i=0; i<core.data.page_templates_list.length; i++) {
            ptpl = core.data.page_templates_list[i];
            this.buildModel(this.$.list,
                { tag: "div",
                  id: "page_tpl" + ptpl.id,
                  className: "page_tpl",
                  events: { onclick: ["onPageTplClick", i] },
                  html: 
                    "<div class='title'><span class='nowrap'>" + ptpl.title + "</span><div></div></div><img class='thumb' src='" + ptpl.thumb_path + "'/>" }
            );
        }
    },



    onPageTplClick: function(e, v) {
        var obj = desktop.admin_toolbars.get("pages_list");
        if(v == 'ext') {
            
            core.values.page_settings.menu_item_data = obj.getMenuItemDataDefault("external");
            core.values.page_settings.page_data = obj.getPageDataDefault("external");
            core.values.page_settings.page_tpl_id = null;
        } else if(v == 'blank') {
            core.values.page_settings.menu_item_data = obj.getMenuItemDataDefault("std");
            core.values.page_settings.page_data = obj.getPageDataDefault("std");
            core.values.page_settings.page_data.url = core.values.page_settings.menu_item_data.url;
        } else {
            core.values.page_settings.menu_item_data = obj.getMenuItemDataDefault("std");
            core.values.page_settings.page_data = obj.getPageDataDefault("std");
            core.values.page_settings.page_data.url = core.values.page_settings.menu_item_data.url;

            var ptpl = core.data.page_templates_list[v];
            core.values.page_settings.page_tpl_id = ptpl.id;
            core.values.page_settings.menu_item_data.title = ptpl.title;
            core.values.page_settings.page_data.meta_title = ptpl.title;
        }

        desktop.hidePopupApp();
        desktop.showPopupApp("page_settings");
    },



    onCancelClick: function() {
        desktop.hidePopupApp();
    }

};
core.apps.page_templates_list.extendPrototype(core.components.html_component);
core.apps.page_templates_list.extendPrototype(core.components.popup_app);