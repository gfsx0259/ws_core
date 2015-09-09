core.apps.desktop = function(args) {

    window.desktop = this;

    this.simpleApps = [];
    this.isLoading = false;

    if(core.values.is_page_preview) {
        this.displayTpl(document.body, "preview_panel");
        window.onunload = function(e) {
            window.close();
        }
    }

    this.render();
    this.initLayoutElements();

    switch(core.usertype) {
        case USERTYPE_ADMIN:
        case USERTYPE_WEBSEMBLE_ADMIN:
            this.callFunction("initInterface_admin");
            break;
        case USERTYPE_CONTRIBUTOR:
            this.callFunction("initInterface_contributor");
            break;
    }


    if(core.data.page_settings.header_visible == 1) {    
        this.site_menu = new core.apps.site_menu({parentElement: this.$["site_menu"]});
    }
    if(core.data.page_settings.footer_visible == 1) {    
        this.site_footer = new core.apps.site_footer({parentElement: this.$["site_footer"]});
    }

    this.layout = new core.apps.layout_columns({parentElement: this.$["page_content"]});
    this.layout.callFunction("run");


    if(core.data.js_layout_app) {
//        this.layout_app = new core.apps[core.data.js_layout_app]({parentElement: this.layout.getMiddleElement()});
        this.layout_app = new core.apps[core.data.js_layout_app]({parentElement: $("fixed_page_content")});
        this.layout_app.callFunction("run");
        this.layout.getMiddleElement().appendChild($("fixed_page_content"));
    }
    if(core.data.site_info.breadcrumbs_visible == 1 && core.data.page_settings.header_visible == 1) {
        this.breadcrumbs = new core.apps.breadcrumbs_old({parentElement: this.$["site_breadcrumbs"]});
    } else {
        this.hideElement("site_breadcrumbs");
    }
    this.setTitle(core.data.site_info.title);
    this.initPageComments();

    this.callFunction("updateAuthControls");
    this.callFunction("initTheme");

    this.ecom_cart.onCartUpdated();
    
    if(location.href.indexOf("#upgrade_browser") != -1) {
        core.launcher.run({ appName: "upgrade_browser", parentElement: this.$["tmp_hidden"] });
    }


// debug
//this.openEcommerceManager(false, false, "products");
//this.openTextsManager();
//    this.setState("loading");
//    this.showPopupApp("themes_manager");

//    this.openFilesManager();

//   this.openFilesManager(false, "pictures");
//    this.openFilesManager({ onselect: function(a){varp(a)}, onselect_multiple: function(a){varp(a)}}, "pictures");


//        this.modal_dialog.confirm("Are you sure?", function() { alert("yes")} );

//        this.modal_dialog.progress("Title here", 0, "Message text here");
//        this.modal_dialog.alert("Alert text");
//        this.modal_dialog.close();
//        setTimeout(function() { desktop.modal_dialog.progress("Title here 2", 6, "Message text here 2"); }, 1000);


//this.admin_toolbars.show("theme_variables");

//    this.openTextEditor({ content: "gwerge rgwer gwer gwerg "}, function(e){});

//        desktop.admin_toolbars.show("theme_fonts");
//        desktop.admin_toolbars.get("theme_fonts").setData({});

//    desktop.openTextsManager();


};




core.apps.desktop.prototype = {


    render: function() {
        this.displayTpl(document.body, "desktop_loading");
        this.buildModel(document.body, [
            { tag: "div", id: "tmp_hidden",
              display: false }
        ]);
    },


    initPageComments: function() {
        if(!core.data.page_id || core.data.page_has_comments != 1) return;
        this.page_comments = core.launcher.run({ appName: "comments", parentElement: this.$["page_comments"]});
        this.page_comments.open(
            { profile: {
                title: ""
              },
              fixed_mode: true,
              parentElement: this.$["page_comments"],
              id: core.data.page_id }
        );
    },



    // Common

    loadURL: function(url) {
        url = url.trim();
        if(url == "" || url == "http://" || url == "http:///") return;

        if(url.indexOf("http") == -1) {
            url = "http://" + core.data.http_host + url;
        }
        window.location.href = url;
    },


    closeBrowser: function(e) {
        window.close();
    },


    openImageBox: function(images, active_image) {
        if(!this.imagebox) {
            this.imagebox = new core.apps.imagebox();
        }
        this.imagebox.open(images, active_image);
    },


    // desktop loading state

    // v: "loading" || "normal"
    setState: function(v) {
        if(v == "loading") {
            this.isLoading = true;
            this.showElement("document_overlay");
            this.showElement("desktop_loading");
            this.updatePopupPos("document");
        } else {
            this.isLoading = false;
            this.hideElement("document_overlay");
            this.hideElement("desktop_loading");
            if(this.popup_stack.length) {
                this.updatePopupPos();
            }
        }
    },



    objects_list: {},
    getObject: function(name) {
        if(!this.objects_list[name]) {
            this.objects_list[name] = new core.objects[name]();
        }
        return this.objects_list[name];
    }

 
};
core.apps.desktop.extendPrototype(core.components.html_component);