core.apps.page_settings = function() {


}

core.apps.page_settings.prototype = {


    window_resize: {
        height: 400,
        width: 670,
        target: "page_settings"
    },



    // default values
    default_page_data: {
        std: {
            ads_visible: 0,
            title: "Page",
            description: "",
            meta_code: "",
            published: 1,
            show_on_sitemap: 1,
            ads_visible: 0,
            footer_code: "",
            access_mode: "",
            pwd: "",
            rss_title: "",
            is_rss_available: 0,
            header_visible: 0,
            footer_visible: 0,
            style_id: 1,
            analytics_code: "",
            use_home_analytics_code: 1
        }

    },


    // code

    renderContent: function() {
        this.displayTpl(this.$["content"], "page_settings");

        if(core.data.theme) {
            this.hideElement("sec_style");
        } else {
            this.showElement("sec_style");
            var l = core.values.page_styles_theme;
            var opts = [{ text: "Default", value: ""}];
            for(var i=0; i<l.length; i++) {
                opts.push({ text: l[i].title, value: l[i].style });
            }
            this.$["inp_style"].setOptions(opts);
        }
    },



    // init menu/pages tree
    onShowContent: function() {
        if(this.skip_on_show_content) {
            this.skip_on_show_content = false;
            return;
        }

        if(!core.values.page_settings.menu_item_data) {
            desktop.hidePopupApp();            
            desktop.showPopupApp("page_templates_list");
        } else {
            this.menu_item_data = core.values.page_settings.menu_item_data;
            this.page_data = core.values.page_settings.page_data;
            this.page_tpl_id = core.values.page_settings.page_tpl_id;
            this.showTab("properties");
            this.initInputs();
        }
    },




    initInputs: function() {
        this.setTitle("Page settings");

        if(!this.loadData()) return;

        if(this.page_data) {
            for(var k in this.default_page_data[this.page_data.type]) {
                if(this.page_data[k] == undefined) {
                    this.page_data[k] = this.default_page_data[this.page_data.type][k];
                }
            }
            this.updateRowSrcControls();
        }

        var opts = [{ text: "...", value: ""}];
        for(var p,i=0; i<core.data.pages_list.length; i++) {
            p = core.data.pages_list[i];
            if(p.type == "std") {
                opts.push({ text: p.name, value: p.url });
            }
        }
        this.$["inp_page"].setOptions(opts);


        var l = this.getNodesWithChilds(core.data.main_menu);
        var opts = [{ text: "...", value: null }];
        for(var i=0; i<l.length; i++) {
            opts.push({ text: l[i].title, value: l[i].id});
        }
        this.$["inp_body_menu"].setOptions(opts);

        
        this.refreshPropertiesVsibility();
        this.fillFormValues();

        this.$.sec_menu.expand();
    },




    getNodesWithChilds: function(node) {
        var res = [];
        if(node && node.length) {
            for(var i=0; i<node.length; i++) {
                var n = node[i];
                if(!n.childs.length) continue;
                res.push({ title: n.title, id: n.id });
                
                var cres = this.getNodesWithChilds(n.childs);
                if(cres.length) res = res.concat(cres);
            }
        }
        return res;
    },



    loadData: function() {
        if(this.is_data_loaded) return true;

        desktop.setState("loading");
        var p = {
            dialog: "pages_manager2",
            act: "get_data"
        };
        core.transport.send("/controller.php", p, this.onDataResponse.bind(this));
        return false;
    },


    onDataResponse: function(r) {
        if(!r || r.status != "ok") {
            desktop.modal_dialog.alert("Server error");
            return;
        }
        core.data.page_rows_list = r.data.page_rows_list;
        this.is_data_loaded = true;
        desktop.setState("normal");
        this.initInputs();
    },





    refreshPropertiesVsibility: function() {
        this.hideElements(["sec_ws_admin", "sec_page_tpl"]);

        if(this.menu_item_data.type == "external") {
            this.hideElements(["sec_header_footer", "sec_rss", "sec_advanced", "sec_title", "sec_security", "sec_ws_admin", "sec_body_doc"]);
            this.showElements(["box_inp_page"]);
        } else {
            this.hideElements(["box_inp_page"]);

            if(this.menu_item_data.id) {
                this.showElement("sec_menu");
            } else {
                this.hideElement("sec_menu");
            }

            this.hideElement("sec_ws_admin");
            this.showElements(["sec_reduntant", "sec_rss", "sec_security", "box_visible"]);
            if(!this.page_data.src_page_id) {
                if(this.page_data.id) {
                    if(core.usertype == USERTYPE_WEBSEMBLE_ADMIN && this.menu_item_data.type == "std") {
                        this.showElement("sec_ws_admin");
                    }
                } else {
                    this.showElement("sec_page_tpl");
                }
            }
            this.showElements(["sec_header_footer", "sec_advanced", "sec_title"]);
        }
    },






    fillFormValues: function() {
        this.$["inp_item_title"].value = this.menu_item_data.title;
        this.$["inp_item_hint"].value = this.menu_item_data.hint || "";

        this.$["inp_item_url"].value = this.menu_item_data.url;
        this.$["inp_item_url"].readOnly = this.menu_item_data.url == "index";


        this.$["inp_visible"].setValue(this.menu_item_data.visible);


        if(this.menu_item_data.type == "external") return;


        // title & desc
        this.$["inp_title"].value = this.page_data.title;
        this.$["inp_description"].value = this.page_data.description;
        this.$["inp_meta_code"].value = this.page_data.meta_code;

        this.$["inp_published"].setChecked(this.page_data.published == 1);
        this.$["inp_apps_locked"].setChecked(this.page_data.apps_locked == 1);
        this.$["inp_show_on_sitemap"].setChecked(this.page_data.show_on_sitemap == 1);

        // header/footer rows
        var hsrc = false,
            fsrc = false; 
            pr = core.data.page_rows_list[this.page_data.src_page_id ? this.page_data.src_page_id : this.page_data.id];
        if(pr) {
            hsrc = pr[0];
            fsrc = pr[255];
        } else {
            if(this.page_data.header_row_page_id) {
                hsrc = this.page_data.header_row_page_id;
            }
            if(this.page_data.footer_row_page_id) {
                fsrc = this.page_data.footer_row_page_id;
            }
        }
        this.$["inp_header_row_src"].setValue(hsrc || "none");
        this.$["inp_footer_row_src"].setValue(fsrc || "none");


        if(this.page_data.header_visible == 2) {
            this.page_data.header_visible = 0;
        }
        if(this.page_data.footer_visible == 2) {
            this.page_data.footer_visible = 0;
        }

        this.$["inp_header_visible"].setValue(this.page_data.header_visible);
        this.$["inp_footer_visible"].setValue(this.page_data.footer_visible);



        // rss
        this.$["inp_rss_title"].value = this.page_data.rss_title;
        this.$["inp_rss_available"].setChecked(this.page_data.is_rss_available == 1);
                    
        // reduntant
        this.$["inp_footer_link"].setValue(this.menu_item_data.footer_link);
        this.$["inp_style"].setValue(this.page_data.style || "");
        this.$["inp_body_menu"].setValue(this.menu_item_data.body_menu);

        // security
        this.$["inp_pwd"].value = this.page_data.pwd || "";
        this.setAccessMode(this.page_data.access_mode || "");

        if(!this.page_data.id) {
            this.onTitleChanged();
        } else {
            this.onURLChanged();
        }


        // page tpl src
        if(core.usertype == USERTYPE_WEBSEMBLE_ADMIN) {
            this.$["inp_is_page_tpl"].setChecked(this.page_data.is_page_tpl == 1);
            this.hideElement("box_thumb");
            this.$.inp_thumb.setValue(this.page_data.thumb || "");
        }

        this.$["inp_analytics_code"].value = this.page_data.analytics_code;
        this.$["inp_use_home_analytics_code"].setChecked(this.page_data.use_home_analytics_code == 1);
        this.updateAnalyticsCodeControls();
    },



    collectFormValues: function() {
        var url = this.$["inp_item_url"].value;
        for(var i=0; i<core.data.pages_list.length; i++) {
            var p = core.data.pages_list[i];
            if(p.url == url && this.page_data && this.page_data.id != p.id) {
                desktop.modal_dialog.alert("Duplicate page URL");
                return false;
            }
        }

        this.menu_item_data.url = url;

        this.menu_item_data.title = this.$["inp_item_title"].value;
        this.menu_item_data.hint = this.$["inp_item_hint"].value;

        if(this.page_data) {
            this.page_data.url = this.menu_item_data.url;
        }
        if(this.menu_item_data.url == "") {
            desktop.modal_dialog.alert("Empty URL value");
            return false;
        }

        this.menu_item_data.visible = this.$["inp_visible"].value;


        if(this.menu_item_data.type != "external") {
            this.page_data.header_row_page_id = this.$["inp_header_row_src"].value;
            this.page_data.footer_row_page_id = this.$["inp_footer_row_src"].value;
            this.page_data.header_visible = this.$["inp_header_visible"].value;
            this.page_data.footer_visible = this.$["inp_footer_visible"].value;

            this.page_data.title = this.$["inp_title"].value;
            this.page_data.name = this.page_data.title; // ??
            this.page_data.description = this.$["inp_description"].value;
            this.page_data.meta_code = this.$["inp_meta_code"].value;

            this.page_data.published = this.$["inp_published"].checked ? 1 : 0;
            this.page_data.apps_locked = this.$["inp_apps_locked"].checked ? 1 : 0;

            this.page_data.show_on_sitemap = this.$["inp_show_on_sitemap"].checked ? 1 : 0;

            // rss
            this.page_data.rss_title = this.$["inp_rss_title"].value;
            this.page_data.is_rss_available = this.$["inp_rss_available"].checked ? 1 : 0;

            // reduntant
            this.menu_item_data.footer_link = this.$["inp_footer_link"].value;
            this.page_data.style = this.$["inp_style"].value;
            this.menu_item_data.body_menu = this.$["inp_body_menu"].value;

            // security
            this.page_data.pwd = this.$["inp_pwd"].value;
            this.page_data.access_mode = this.$["inp_access"].value;
            this.menu_item_data.access_mode = this.$["inp_access"].value;


            this.page_data.is_page_tpl = this.$["inp_is_page_tpl"].checked ? 1 : 0;
            this.page_data.thumb = this.$["inp_thumb"].value;
            this.page_data.page_tpl_id = this.page_tpl_id;

            this.page_data.analytics_code = this.$["inp_analytics_code"].value;
            this.page_data.use_home_analytics_code = this.$["inp_use_home_analytics_code"].checked ? 1 : 0;
        }
        return true;
    },



// page rows

    updateRowSrcControls: function() {
        var opts_header = [
            { text: "[None]", value: "none" },
            { text: "[Own]", value: this.page_data.id ? this.page_data.id : "new" }
        ];

        var opts_footer = clone(opts_header);

        for(var i=0; i<core.data.pages_list.length; i++) {
            var p = core.data.pages_list[i];
            if(p.id != this.page_data.id) {
                var pr = core.data.page_rows_list[p.id];
                if(!pr) continue;
                if(pr[0] == p.id) {
                    opts_header.push({ text: p.name, value: p.id });
                }
                if(pr[255] == p.id) {
                    opts_footer.push({ text: p.name, value: p.id });
                }
            }
        }
        this.$["inp_header_row_src"].setOptions(opts_header);
        this.$["inp_footer_row_src"].setOptions(opts_footer);
    },





    // form helpers
    onTitleChanged: function(e) {
        if(this.menu_item_data.url == "index") return;

        switch(this.menu_item_data.type) {
            case "std":
                this.$["inp_title"].value = this.$["inp_item_title"].value;
                break;

            default:
                return;
                break;
        }
        this.$["inp_item_url"].value = this.formatURL(this.$["inp_item_title"].value);
        this.onURLChanged();
    },



    onURLChanged: function() {
        switch(this.menu_item_data.type) {
            case "std":
                this.$["inp_item_url"].value = this.formatURL(this.$["inp_item_url"].value);
                this.updateFullURL();
                break;
            case "external":
                var url = this.$["inp_item_url"].value.trim();
                this.$["full_item_url"].innerHTML = url;
                break;
        }
    },

    updateFullURL: function() {
        this.$["full_item_url"].innerHTML = this.getItemFullURL(this.$["inp_item_url"].value.trim());
    },



    updateAnalyticsCodeControls: function() {
        if(this.menu_item_data.url == "index") {
            this.hideElement("box_analytics_cb");
            this.showElement("box_analytics_code");
        } else {
            this.showElement("box_analytics_cb");

            if(this.$["inp_use_home_analytics_code"].checked) {
                this.hideElement("box_analytics_code");
            } else {
                this.showElement("box_analytics_code");
            }
        }
    },


    // urls

    getItemFullURL: function(url) {
        if(url.indexOf(".") != -1 || url.indexOf(":") != -1) {
            return url;
        } else if(url.charAt(url.length - 1) == "/") {
            return "http://" + core.data.http_host + "/" + url;
        } else if(url.indexOf("://") == -1) {
            url = "http://" + core.data.http_host + (url != "" ? "/" + url + ".html" : "");
        } 
        return url;
    },

    formatURL: function(t) {
        t = t.toLowerCase();
        var t = t.replace(/^\s*(.+?)\s*$/, "$1");
        if(t != "") {
            t = t.replace(/[\s]+/g, "-").replace(/[^\d\w\-]+/g, "");
        }
        return t;
    },




    onAccessChanged: function() {
        this.setAccessMode(this.$["inp_access"].value, 1);
    },



    setAccessMode: function(v, skip_select) {
        if(!skip_select) {
            this.$["inp_access"].setValue(v);
        }
        if(v == "pwd") {
            this.showElement("inp_pwd_box");
        } else {
            this.hideElement("inp_pwd_box");
        }
    },



    onPageSelectChange: function() {
        this.$["inp_item_url"].value = "/" + this.$["inp_page"].value + ".html";
        this.updateFullURL();
    },








// tabs
    showProperties: function(e) {
        this.showTab("properties");
    },


    showStyles: function(e) {
        this.showTab("styles");
    },



    showTab: function(tab) {
        if(this.active_tab) {
            this.hideElement(this.active_tab);
            this.$["tab_" + this.active_tab].className = "";
        }

        this.active_tab = tab;
        this.showElement(tab);
        this.$["tab_" + tab].className = "active";

        if(tab == "styles") {
            if(!this.style_select) {
                this.style_select = new core.objects.style_select({
                    parent_el: this.$.styles,
                    callback: this.onStyleSelected.bind(this)
                });
            }
            this.style_select.setParams({
                key: "page_body",
                selected_style_id: this.page_data[core.data.layout_mode + "_style_id"]
            });
        }
    },



    onStyleSelected: function(id) {
        this.page_data[core.data.layout_mode + "_style_id"] = id;
    },






// nav
    onCancelClick: function() {
        desktop.hidePopupApp();
    },


    onOkClick: function() {
        if(this.collectFormValues() && core.values.page_settings.callback) {
            core.values.page_settings.callback(this.menu_item_data, this.page_data);
            desktop.hidePopupApp();
        }
    }


}
core.apps.page_settings.extendPrototype(core.components.html_component);
core.apps.page_settings.extendPrototype(core.components.popup_app);