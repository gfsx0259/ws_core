core.apps.pages_manager = function() {

    this.active_item_id = null;
    this.active_item = null;
    this.default_body_menu = null;

}

core.apps.pages_manager.prototype = {


    window_resize: {
        hmargin: 180,
        target: "manager"
    },


    onResize: function(v) {
        this.$["tree"].style.height = v.height - 29 + "px";
        this.$["item_form"].style.height = v.height - 31 + "px";
    },


    // data
    type_labels: {
        std: "Standard",
        forum: "Forum",
        blog: "Blog",
        store: "Store",
        external: "External link",
        doc: "Document page"
    },


    // default values
    default_item: {
        std: {
            title: "Page", 
            hint: "",
            url: "page", 
            blank_page: 0,
            ads_visible: 0,
            meta_title: "Page",
            description: "",
            meta_code: "",
            published: 1,
            ads_visible: 0,
            visible: "1",
            header_doc_id: "",
            footer_code: "",
            footer_link: "",
            access_mode: "",
            pwd: "",
            rss_title: "",
            is_rss_available: 0,
            header_visible: 2,
            footer_visible: 2,
            style_id: 1
//            ecom_category_id: 0
        },

        forum: {
            title: "Forum",
            hint: "",
            url: "forum/",
            blank_page: 0,
            ads_visible: 0,
            visible: "1",
            header_doc_id: "",
            footer_code: "",
            footer_link: ""
        },

        store: {
            title: "Store",
            hint: "",
            url: "store/",
            blank_page: 0,
            ads_visible: 0,
            visible: "1",
            header_doc_id: "",
            footer_code: "",
            footer_link: ""
        },

        blog: {
            title: "Blog",
            hint: "",
            url: "blog/",
            blank_page: 0,
            ads_visible: 0,
            visible: "1",
            header_doc_id: "",
            footer_code: "",
            footer_link: ""
        },

        external: {
            title: "Link",
            hint: "",
            url: "http://",
            blank_page: 0,
            visible: "1",
            footer_link: ""
        },


        doc: {
            title: "Document",
            hint: "",
            url: "document-",
            blank_page: 0,
            body_doc_id: "",
            visible: "1",
            ads_visible: 0,
            meta_title: "Document",
            description: "",
            meta_code: "",
            published: 1,
            ads_visible: 0,
            header_doc_id: "",
            footer_code: "",
            footer_link: "",
            access_mode: "",
            pwd: "",
            rss_title: "",
            is_rss_available: 0,
            header_visible: 2,
            footer_visible: 2,
            style_id: 1
        }
    },




    // code

    getTitle: function() {
        return "Pages manager";
    },


    renderContent: function() {
        this.displayTpl(this.$["content"], "pages_manager");

        if(core.data.scheme["seo_custom_meta"] == "1") {
            this.showElement("sec_meta");
        }

        this.buildModel(document.body,
            { tag: "div", className: "mi_controls",
              id: "mi_controls",
              display: false,
              childs: [
                { tag: "div", className: "mup",
                  title: "Move page up",
                  events: { onclick: ["onMoveItem", "up"] } },
                { tag: "div", className: "mdown",
                  title: "Move page down",
                  events: { onclick: ["onMoveItem", "down"] } },
                { tag: "div", className: "mclone",
                  title: "Clone page",
                  events: { onclick: "onCloneItem" } },
                { tag: "div", className: "mdelete",
                  title: "Delete page",
                  events: { onclick: "onDeleteItem" } }

              ]}
        );

        // toolbar
        var toolbarData = [
            { title: "Add Page", icon: "/static/icons/page_add.png",
              subitems: [
                { title: "Standard", icon: "/static/icons/page.png", id: "add_std",
                  onclick: this.onAddItem.bind(this, "std") },


//                { title: "Forum", icon: "/static/icons/page.png", id: "add_forum",
//                  onclick: this.onAddItem.bind(this, "forum") },

//                { title: "Store", icon: "/static/icons/page.png", id: "add_store",
//                  onclick: this.onAddItem.bind(this, "store") },

//                { title: "Blog", icon: "/static/icons/page.png", id: "add_blog",
//                  onclick: this.onAddItem.bind(this, "blog") },

                { title: "Document", icon: "/static/icons/document.png", id: "add_document",
                  onclick: this.onAddItem.bind(this, "doc") },

                { title: "External", icon: "/static/icons/page_link.png", id: "add_external",
                  onclick: this.onAddItem.bind(this, "external") }
              ]}
        ]


        this.toolbar = new core.objects.toolbar({
            parentElement: this.$["toolbar"],
            items: toolbarData
        });


        if(core.data.theme) {
            this.showElement("sec_style2");
        } else {
            this.showElement("sec_style");
            var l = core.values.page_styles_theme;
            var opts = [{ text: "Default", value: ""}];
            for(var i=0; i<l.length; i++) {
                opts.push({ text: l[i].title, value: l[i].style });
            }
            this.$["inp_style"].setOptions(opts);
        }


//        this.initEcomCategories();
    },



    // init menu/pages tree

    onShowContent: function() {
        if(this.skip_on_show_content) {
            this.skip_on_show_content = false;
            return;
        }


        if(!this.data_loaded) {
            this.loadData();
            return;
        }

        this.active_item_id = null;

        this.deleted_pages = [];
        this.used_page_types = {};

        this.data = core.data.main_menu ? clone(core.data.main_menu) : [];

        this.loaded_item_id = false;
        this.default_body_menu = null;
        this.extendData(this.data);
        this.last_id = 0;
        this.updateLastId();
        this.last_id++;


        var l = this.getNodesWithChilds(this.data);
        var opts = [{ text: "...", value: null }];
        for(var i=0; i<l.length; i++) {
            opts.push({ text: l[i].title, value: l[i].id});
        }
        this.$["inp_body_menu"].setOptions(opts);


        this.renderTree();
        this.updateInterface();
        if(this.data.length) {
            this.selectItem(this.loaded_item_id || this.data[0].id);
        }

        if(core.values.pages_manager_new_page) {
            this.onAddItem(core.values.pages_manager_new_page.type, core.values.pages_manager_new_page.values);
            core.values.pages_manager_new_page = null;
        }
    },




    loadData: function() {
        var p = {
            dialog: "pages_manager",
            act: "get_data"
        };
        desktop.setState("loading");
        core.transport.send("/controller.php", p, this.onDataResponse.bind(this));
    },


    onDataResponse: function(r) {
        if(!r || r.status != "ok") {
            desktop.modal_dialog.alert("Server error");
            return;
        }
        core.data.page_rows_list = r.page_rows_list;
        this.data_loaded = true;
        desktop.setState("normal");

        this.onShowContent();
    },




// page rows

    updateRowSrcControls: function() {
        if(this.active_item.type != "std") {
            this.hideElement("sec_row_src");
            return;
        }
        this.showElement("sec_row_src");

        var r;
        var opts_header = [
            { text: "[None]", value: "none" },
            { text: "[Own]", value: this.active_item.page_id ? this.active_item.page_id : "new" }
        ];
        var opts_footer = clone(opts_header);

        for(var i=0; i<core.data.pages_list.length; i++) {
            var p = core.data.pages_list[i];
            if(p.id != this.active_item.page_id) {
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
        this.$["inp_header_row_src"].setValue(this.active_item.header_row_page_id);

        this.$["inp_footer_row_src"].setOptions(opts_footer);
        this.$["inp_footer_row_src"].setValue(this.active_item.footer_row_page_id);
    },




    checkRowsInheritance: function() {
        // TODO:
return true;
        if(this.active_item.type != "std") return true;
        //if(!confirm("Some other pages inherit rows from this page, delete anyway?")) return false;
    },






    updateInterface: function() {
        this.updateToolbar();
        this.fillForm();
    },



    // toolbar code

    updateToolbar: function() {
        this.toolbar.setItemDisabled("delete_item", this.active_item_id == null);
        var fl = !this.data.length;
        this.toolbar.setItemDisabled("add_forum", fl || this.used_page_types["forum"]);
        this.toolbar.setItemDisabled("add_store", fl || this.used_page_types["store"]);
        this.toolbar.setItemDisabled("add_blog", fl || this.used_page_types["blog"]);
        this.toolbar.setItemDisabled("add_external", fl);
    },


    onAddItem: function(type, new_item_values) {
        this.collectFormValues();

        if(!this.used_page_types[type]) {
            this.used_page_types[type] = 1;
        } else {
            this.used_page_types[type]++;
        }

        var new_item = clone(this.default_item[type]);
        new_item.type = type;
        new_item.childs = [];
        new_item.page_id = "";
        var parent_node = this.findItem(this.active_item_id);
        if(!parent_node) {
            new_item.url = "index";
            new_item.title = "Home";
            new_item.meta_title = new_item.title;
        } else if(type == "std" || type == "doc") {
            new_item.title += " " + this.last_id;
            new_item.meta_title = new_item.title;
            new_item.url += this.last_id;

            var home_page_id = this.getHomePageId();
            if(home_page_id) {
                new_item.header_row_page_id = home_page_id;
                new_item.footer_row_page_id = home_page_id;
            }
            
        }
        if(new_item_values) {
            for(var key in new_item_values) {
                new_item[key] = new_item_values[key];
                if(key == "title") {
                    new_item["url"] = this.formatURL(new_item_values[key]);
                }
            }
        }
        var id = this.addItem(this.data, new_item);
        this.renderTree();
        this.updateInterface();
        this.selectItem(id);
    },



    onDeleteItem: function() {
        if(!this.active_item) return;

        if(this.active_item.url == "index") {
            desktop.modal_dialog.alert("You can't delete home page");
            return;
        }
        var t = this.active_item.childs.length ? "Delete item and all subitems?" : "Delete item?";
        if(confirm(t)) {
            if(!this.checkRowsInheritance()) return;

            if(this.used_page_types[this.active_item.type]) {
                this.used_page_types[this.active_item.type]--;
            }
            if(this.active_item.page_id) {
                this.deleted_pages.push(this.active_item.page_id);
            }
            this.deleteItem(this.active_item_id);
            this.active_item_id = null;
            this.active_item = null;
            this.renderTree();
            this.updateInterface();
            if(this.data && this.data[0]) {
                this.selectItem(this.data[0].id);
            }
        }
    },


    onCloneItem: function() {
        if(!this.active_item || this.active_item.type != "std") return;
        this.collectFormValues();

        var parent_data = this.findItemPlace(this.active_item_id);

        var new_item = {};
        for(var k in this.active_item) {
            if(k == "childs" || k == "page_id" || k == "id") continue;
            new_item[k] = this.active_item[k];
        }
        new_item.page_id = "";
        if(this.active_item.page_id) {
            new_item.src_page_id = this.active_item.page_id;
            if(this.active_item.page_id == this.active_item.header_row_page_id) {
                new_item.header_row_page_id = "new";
            }
            if(this.active_item.page_id == this.active_item.footer_row_page_id) {
                new_item.footer_row_page_id = "new";
            }
        } else {
            new_item.src_page_id = "new";
        }

        var t = new_item.title.split(" ");
        if(t.length > 0 && parseInt(t[t.length-1])) {
            t[t.length-1] = this.last_id;
            new_item.title = t.join(" ");
        } else {
            new_item.title = new_item.title + " " + this.last_id;
        }

        new_item.childs = [];

        if(new_item.url == "index") {
            new_item.url = "page";
        } else {
            var u = new_item.url.split("-");
            if(u.length > 0 && parseInt(u[u.length-1])) {
                u[u.length-1] = this.last_id;
                new_item.url = u.join("-");
            } else {
                new_item.url = new_item.url + "-" + this.last_id;
            }
        }

        var id = this.addItem(parent_data.node, new_item);
        swapValues(parent_data.idx + 1, parent_data.node.length - 1);
        this.renderTree();
        this.updateInterface();
        this.selectItem(id);
    },









    fillForm: function() {
        var mi = this.active_item;

        if(!mi) {
            this.hideElement("item_form");
            return;
        }

        this.showElement("item_form");

        this.$["properties_box_title"].innerHTML = "Page type: " + this.type_labels[mi.type];

        this.hideElements(["error_title", "error_url", "sec_body_doc"]);

        // common values
        this.$["inp_item_title"].value = mi.title;
        this.$["inp_item_hint"].value = mi.hint || "";
        this.$["inp_blank_page"].setChecked(mi.blank_page == 1);
        this.$["inp_visible"].setValue(mi.visible);
        this.$["inp_footer_link"].setValue(mi.footer_link || "");

        this.$["inp_item_url"].value = mi.url;
        this.$["inp_item_url"].readOnly = mi.type == "forum" || mi.type == "blog" || mi.type == "store";
        this.updateFullURL();

        this.$["inp_footer_code"].value = mi.footer_code || "";


        var el = this.$["header_doc_preview"];
        if(mi.header_doc_id && mi.header_doc_id != 0) {
            el.innerHTML = "Loading...";
            core.data.texts.get(mi.header_doc_id, this.setHeaderDocPreview.bind(this));
        } else {
            el.innerHTML = "";
            el.doc_id = "";
        }




        if(mi.type == "external") {
            this.hideElements(["sec_footer_code", "sec_header_doc"]);
        } else {
            this.showElement("sec_footer_code");
            if(desktop.theme && desktop.theme.has_header_doc) {
                this.showElement("sec_header_doc");
            }
        }

        // show/hide sections
        var std_elements_list = [
            "sec_published",
//            "sec_ecom_category_id",
            "sec_access",
            "sec_visible",
            "sec_style",
            "sec_style2",
            "sec_rss",
            "sec_comments"
        ];


        if(core.data.scheme["seo_custom_meta"] == 1) {
            std_elements_list.push("sec_meta");

        }

        if(mi.type == "std" || mi.type == "doc") {
            this.showElements(std_elements_list);
        } else {
            this.hideElements(std_elements_list);
        }


        if(mi.type == "external") {
            this.hideElement("sec_ads_visible");
            this.showElement("sec_inp_page");
            this.fillPageSelectOptions();
            this.$["inp_page"].value = mi.url + ".html";
        } else {
            this.hideElement("sec_inp_page");
            this.$["inp_ads_visible"].setChecked(mi.ads_visible == 1);
            this.showElements(["sec_ads_visible"]);
        }

        this.hideElements(["sec_default_body_menu", "sec_body_menu"]);


        if(mi.type == "std" || mi.type == "doc") {
            if(mi.url == "index") {
                this.$["inp_item_url"].readOnly = true;
//                this.$["inp_item_title"].readOnly = true;
//                this.$["inp_meta_title"].readOnly = true;
                this.hideElements(["sec_published", "sec_blank_page", "sec_access", "sec_visible"]);
                this.$["inp_published"].setChecked(true);
            } else {
//                this.$["inp_item_url"].readOnly = false;
//                this.$["inp_item_title"].readOnly = false;
                this.$["inp_meta_title"].readOnly = false;
                this.showElements(["sec_published", "sec_blank_page", "sec_access", "sec_visible"]);
                this.$["inp_published"].setChecked(mi.published == 1);
            }
            this.setAccessMode(mi.access_mode);
            this.$["inp_pwd"].value = mi.pwd;
            this.$["inp_meta_title"].value = mi.meta_title;
            this.$["inp_description"].value = mi.description;
            this.$["inp_meta_code"].value = mi.meta_code;
            this.$["inp_style"].setValue(mi.style || "");
//                this.$["inp_ecom_category_id"].value = mi.ecom_category_id;
            this.$["inp_rss_title"].value = mi.rss_title;
            this.$["inp_rss_available"].setChecked(mi.is_rss_available == 1);

            this.$["inp_has_comments"].setChecked(mi.has_comments == 1);
            this.$["inp_header_visible"].setValue(mi.header_visible);
            this.$["inp_footer_visible"].setValue(mi.footer_visible);
            this.$["inp_style_id"].value = mi.style_id;

            // body menu
            if(this.active_item.level == 0) {
                this.showElement("sec_default_body_menu");
                this.$["inp_default_body_menu"].setChecked(this.default_body_menu == mi.id);
            }
            this.showElement("sec_body_menu");

            this.$["inp_body_menu"].setValue(mi.body_menu);
        }

        var el = this.$["body_doc_preview"];
        if(mi.type == "doc") {
            el.doc_id = mi.body_doc_id || "";
            this.showElement("sec_body_doc");

            if(mi.body_doc_id && mi.body_doc_id != 0) {
                el.innerHTML = "Loading...";
                core.data.texts.get(mi.body_doc_id, this.setBodyDocPreview.bind(this));
            } else {
                el.innerHTML = "";
                el.body_id = "";
            }
        } else {
            el.doc_id = "";
        }
    },





    collectFormValues: function() {
        if(!this.active_item) return;

        var v = this.active_item;
        v.title = this.$["inp_item_title"].value.trim();
        v.hint = this.$["inp_item_hint"].value.trim();
        v.url = this.$["inp_item_url"].value.trim();
        v.blank_page = this.$["inp_blank_page"].checked ? 1 : 0;

        v.pwd = this.$["inp_pwd"].value;
        v.access_mode = this.$["inp_access"].value;


        if(v.type != "external") {
            v.visible = this.$["inp_visible"].value;
            v.footer_link = this.$["inp_footer_link"].value;
            v.footer_code = this.$["inp_footer_code"].value;
            v.header_doc_id = this.$["header_doc_preview"].doc_id;
            v.body_doc_id = this.$["body_doc_preview"].doc_id || "";
            v.ads_visible = this.$["inp_ads_visible"].checked ? 1 : 0;
        }

        if(v.type == "std" || v.type == "doc") {
            v.published = this.$["inp_published"].checked ? 1 : 0;
//            v.ecom_category_id = this.$["inp_ecom_category_id"].value;
            v.meta_title = this.$["inp_meta_title"].value;
            v.description = this.$["inp_description"].value;
            v.meta_code = this.$["inp_meta_code"].value;
            v.style = this.$["inp_style"].value;

            v.body_menu = this.$["inp_body_menu"].value;
            if(this.active_item.level == 0) {
                if(this.$["inp_default_body_menu"].checked) {
                    this.default_body_menu = v.id;
                } else if(this.default_body_menu == v.id) {
                    this.default_body_menu = null;
                }
            }

            v.rss_title = this.$["inp_rss_title"].value.trim();
            v.is_rss_available = this.$["inp_rss_available"].checked ? 1 : 0;
            v.has_comments = this.$["inp_has_comments"].checked ? 1 : 0;
            v.header_visible = this.$["inp_header_visible"].value;
            v.footer_visible  = this.$["inp_footer_visible"].value;

            if(v.type == "std" || v.type == "doc") {
                v.header_row_page_id = this.$["inp_header_row_src"].value;
                v.footer_row_page_id = this.$["inp_footer_row_src"].value;
                v.style_id = this.$["inp_style_id"].value;
            }
        }
    },




    // form helpers
    onTitleChanged: function(e) {
        if(this.active_item.url == "index") return;

        switch(this.active_item.type) {
            case "std":
            case "doc":
                if(!this.active_item.is_meta_title_changed) {
                    this.$["inp_meta_title"].value = this.$["inp_item_title"].value;
                }
                break;

            default:
                return;
                break;
        }
        this.$["inp_item_url"].value = this.formatURL(this.$["inp_item_title"].value);
        this.onURLChanged();
    },

    onMetaTitleChanged: function(e) {
        this.active_item.is_meta_title_changed = true;
    },



    onURLChanged: function() {
        switch(this.active_item.type) {
            case "std":
            case "doc":
                this.$["inp_item_url"].value = this.formatURL(this.$["inp_item_url"].value);
                this.updateFullURL();
                break;
            case "external":
                var url = this.$["inp_item_url"].value.trim();
                this.$["full_item_url"].innerHTML = url;
                this.$["inp_page"].value = url;
                break;
        }
    },

    updateFullURL: function() {
        this.$["full_item_url"].innerHTML = this.getItemFullURL(this.$["inp_item_url"].value.trim());
    },





    // pages select drop down

    fillPageSelectOptions: function() {
        var opts = this.$["inp_page"].options;
        opts.length = 1;
        var pages = this.getPagesList(this.data);
        for(var i=0; i<pages.length; i++) {
            opts.add(new Option(pages[i].name, pages[i].url + ".html"));
        }
    },


    onPageSelectChange: function() {
        this.$["inp_item_url"].value = this.$["inp_page"].value;
        this.$["full_item_url"].innerHTML = this.$["inp_page"].value;
    },





    // used for body menu select

    getNodesWithChilds: function(node) {
        var res = [];
        for(var i=0; i<node.length; i++) {
            var n = node[i];
            if(!n.childs.length) continue;
            res.push({ title: n.title, id: n.id });
            
            var cres = this.getNodesWithChilds(n.childs);
            if(cres.length) res = res.concat(cres);
        }
        return res;
    },




    onAccessChanged: function(e) {
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




    // RSS


    onSelectHeaderDocClick: function() {
        this.skip_on_show_content = true;
        desktop.openTextsManager(this.onHeaderDocSelected.bind(this));
    },

    onHeaderDocSelected: function(doc) {
        if(this.$["header_doc_preview"].doc_id == doc.id) return;
        core.data.texts.get(doc.id, this.setHeaderDocPreview.bind(this));
    },

    setHeaderDocPreview: function(doc) {
        var el = this.$["header_doc_preview"];
        el.innerHTML = doc.content;
        el.doc_id = doc.id;
    },

    onRemoveHeaderDocClick: function() {
        var el = this.$["header_doc_preview"];
        el.innerHTML = "";
        el.doc_id = "";
    },




    // body doc

    onSelectBodyDocClick: function() {
        this.skip_on_show_content = true;
        desktop.openTextsManager(this.onBodyDocSelected.bind(this));
    },

    onBodyDocSelected: function(doc) {
        if(this.$["body_doc_preview"].doc_id == doc.id) return;

        // update item title if needs
        var mi = this.active_item;
        if(mi) {
            var def_title = this.default_item[mi.type].title + " " + mi.id;
            if(def_title == mi.title) {
                this.$["inp_item_title"].value = doc.title;
                this.onTitleChanged();
            }
        }

        // show doc preview
        core.data.texts.get(doc.id, this.setBodyDocPreview.bind(this));
    },

    setBodyDocPreview: function(doc) {
        var el = this.$["body_doc_preview"];
        el.innerHTML = doc.content;
        el.doc_id = doc.id;
    },








// Tree code

  


    // tree items code

    getNewId: function() {
        return ++this.last_id;
    },

    updateLastId: function(node) {
        if(!node) node = this.data;
        for(var i=0; i<node.length; i++) {
            if(node[i].id > this.last_id) {
                this.last_id = node[i].id;
            }
            this.updateLastId(node[i].childs);
        }
    },


    
    // return item
    findItem: function(id, node, level) {
        if(!level) level = 0;
        if(!node) node = this.data;
        var res = null;
        for(var i=0; i<node.length; i++) {
            if(node[i].id == id) {
                res = node[i];
                res["level"] = level;
            } else {
                res = this.findItem(id, node[i].childs, level + 1);
            }
            if(res) return res;
        }
        return null;
    },


    // return item node, item idx

    findItemPlace: function(id, parent) {
        var node = parent ? parent.childs : this.data;
        var res = null;
        for(var i=0; i<node.length; i++) {
            if(node[i].id == id) {
                res = { node: node, idx: i, parent: parent };
            } else {
                res = this.findItemPlace(id, node[i]);
            }
            if(res) return res;
        }
        return null;
    },



    deleteItem: function(id, node) {
        if(!node) node = this.data;
        for(var i=0; i<node.length; i++) {
            if(node[i].id == id) {
                node.splice(i, 1);
                return;
            } else {
                this.deleteItem(id, node[i].childs);
            }
        }
    },


    addItem: function(node, item_data) {
//        itemData = itemData ? itemData : clone(this.default_item);
        if(!item_data.id) {
            item_data.id = this.last_id;
            this.last_id++;
        }
        node.push(item_data);
        return this.last_id-1;
    },



    getHomePageId: function() {
        for(var i=0; i<core.data.pages_list.length; i++) {
            var p = core.data.pages_list[i];
            if(p.url == "index") return p.id;
        }
        return false;
    },




    // clicks

    onItemClick: function(e, id) {
        this.selectItem(id);
    },


    onPicClick: function(e, id) {
        var c = this.$["childs" + id];
        c.style.display = c.isVisible ? "none" : "block";

        var el = this.$["pic" + id];
        if(c.isVisible) {
            el.src = el.src.replace("minus", "plus");
        } else {
            el.src = el.src.replace("plus", "minus");
        }
        c.isVisible = !c.isVisible;
    },




    onMoveItem: function(e, dir) {
        var p = this.findItemPlace(this.active_item_id);
        var fl = false;
        switch(dir) {
            case "up":
                if(p.idx > 0) {
                    if(!p.parent && p.idx == 1) return;
                    swapValues(p.node, p.idx, p.idx - 1);
                    fl = true;
                } else if(p.parent) {
                    var pp = this.findItemPlace(p.parent.id);
                    if(!pp.parent && pp.idx == 0) return;
                    if(pp) {
                        var mi = p.node.splice(p.idx, 1)[0];
                        pp.node.splice(pp.idx, 0, mi);
                        fl = true;
                    }
                }
                break;

            case "down":
                if(!p.parent && p.idx == 0) return;
                if(p.idx < p.node.length - 1) {
                    swapValues(p.node, p.idx, p.idx + 1);
                    fl = true;
                } else if(p.parent) {
                    var pp = this.findItemPlace(p.parent.id);
                    if(pp) {
                        var mi = p.node.splice(p.idx, 1)[0];
                        pp.node.splice(pp.idx + 1, 0, mi);
                        fl = true;
                    }
                }
                break;

            default:
                return;
        }

        if(fl) {
            this.renderTree();
            this.updateInterface();
            this.selectItem(this.active_item_id);
        }
    },






    // tree UI code

    renderTree: function() {
        document.body.appendChild(this.$["mi_controls"]);
        this.$["tree"].innerHTML = "";
        this.renderNode(this.$["tree"], this.data);
        this.updateNodeClasses(this.data);
    },
    


    renderNode: function(pel, node) {
        var id = null;
        for(var i=0; i<node.length; i++) {
            var id = node[i].id;

            this.buildModel(pel,
                { tag: "div", className: "item",
                  id: "item" + id,
                  itemId: id,
                  childs: [
                    { tag: "div", className: "caption",
                      childs: [
                        { tag: "img", id: "pic" + id,
                          events: { onclick: ["onPicClick", id ] } },
                        { tag: "a", id: "title" + id,
                          innerHTML: node[i].title,
                          href: "void",
                          events: { 
                            onmousedown: ["onItemMouseDown", id ],
                            onmouseup: ["onItemMouseUp", id ]
                          } }
                      ]},
                    { tag: "div", className: "childs",
                      isVisible: true,
                      id: "childs" + id }
                  ]}
            );
            if(node[i].childs.length) {
                this.renderNode(this.$["childs" + id], node[i].childs);
            }
        }
    },


    updateNodeClasses: function(node) {
        for(var i=0; i<node.length; i++) {
            var picSrc = "";
            var childsBg = false;
            if(node[i].childs.length) {
                picSrc = "minus";
                this.updateNodeClasses(node[i].childs);
                childsBg = "line1";
            } else {
                picSrc = "line";
            }

            if(i == node.length - 1) {
                childsBg = "";
                picSrc += "2";
            } else {
                picSrc += "3";
            }

            this.$["pic" + node[i].id].src = "/static/menu_editor/" + picSrc + ".gif";
            this.$["childs" + node[i].id].style.background = childsBg ? "transparent url(/static/menu_editor/" + childsBg + ".gif) repeat-y" : "";
        }
    },



    selectItem: function(id) {
        this.hideElements(["error_title", "error_url"]);
        if(this.active_item_id != null) {
            this.collectFormValues();
            var el = this.$["title" + this.active_item_id];
            el.className = "";
            el.innerHTML = this.active_item.title;
        }
        this.$["title" + id].className = "active";
        this.$["title" + id].blur();
        this.active_item_id = id;
        this.active_item = this.findItem(id);
        this.updateInterface();
        try {
            this.$["inp_item_title"].focus();
            this.$["inp_item_title"].select();
        } catch(e) {}

        this.$["item" + id].appendChild(this.$["mi_controls"]);
        this.showElement("mi_controls");

        this.updateRowSrcControls();
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
            t = t.replace(/[\s]+/g, "-").replace(/[^\d\w\-]+/g, "");//.replace(/[\-]+/g, "_");
//            t = t.replace(/^[0-9\-]*(.*?)[\-]*$/, "$1");
        }
        return t;
    },



    // items drag & drop


    onItemMouseDown: function(e, id) {
        core.browser.event.preventDefault(e);
        this.dragItemId = null;
        if(id != 1) {
            this.tmpItemId = id;
            this.startMousePos = 
                { x: e.clientX,
                  y: e.clientY };

            this.oldMouseMove = document.onmousemove;
            document.onmousemove = this.onDocumentMouseMove.bindAsEventListener(this);
        }
        return true;
    },


    onItemMouseUp: function(e, id) {
        if(this.dragItemId == null) {
            this.startMousePos = null;
            if(this.oldMouseMove) {
                document.onmousemove = this.oldMouseMove;
            }
            this.selectItem(id);
        }
    },


    onDocumentMouseMove: function(e) {
        e = core.browser.event.fix(e);
        if(this.dragItemId != null) {
            this.updateDragElPos(e);

            var t = e.target;
            while(!t.itemId && t.parentNode) t = t.parentNode;
            this.targetItemId = t.itemId ? t.itemId : null;
        } else if(this.startMousePos && (Math.abs(e.clientX - this.startMousePos.x) > 2 || Math.abs(e.clientY - this.startMousePos.y) > 2)) {
            this.dragItemId = this.tmpItemId;

            var el = this.$["item" + this.dragItemId];

            // dragclone
            var elClone = el.cloneNode(true);            
            this.dragEl = core.browser.element.create("div", { className: "tree_view" });
            this.dragEl.appendChild(elClone);
            var es = this.dragEl.style;
            es.overflow = "visible";
            es.position = "absolute";
            es.background = "none";

            // el overlay
            this.dragOverlay = core.browser.element.create("div", { className: "tree_view_item_overlay" });
            this.dragOverlay.itemId = "overlay";
            el.appendChild(this.dragOverlay);

            // pos
            document.body.appendChild(this.dragEl);
            this.dragEl.style.zIndex = 100000;

            this.updateDragElPos(e);
            core.browser.event.attach(document, "onmouseup", this.onDocumentMouseUp.bindAsEventListener(this));
        }
        return false;
    },


    onDocumentMouseUp: function(e) {
        document.onmouseup = null;
        document.onmousemove = this.oldMouseMove;
        core.browser.element.remove(this.dragOverlay);
        core.browser.element.remove(this.dragEl);
        if(this.targetItemId != null && this.targetItemId != "overlay") {
            var targetItem = this.findItem(this.targetItemId);
            if(targetItem.type == "std" || targetItem.type == "doc" || targetItem.type == "external") {
                var tmp = clone(this.findItem(this.dragItemId));
                this.deleteItem(this.dragItemId);
                targetItem.childs.push(tmp);
            }

            this.renderTree();
            this.updateInterface();
            this.selectItem(this.dragItemId);
        }
        this.targetItemId = null;
        this.dragItemId = null;
        this.startMousePos = null;
    },


    updateDragElPos: function(e) {
        var ofs = core.browser.getScroll();
        this.dragEl.style.left = ofs.left + e.clientX + 4 + "px";
        this.dragEl.style.top = ofs.top + e.clientY + 4 + "px";
    },






    // structure processing
    
    extendData: function(node) {
        for(var i=0; i<node.length; i++) {
            var type = node[i].type;
            if(type == "std" || type == "doc") {
                var page = this.getPageData(node[i].url);
                if(page) {
                    node[i].page_id = page.id;
                    node[i].access_mode = page.access_mode;
                    node[i].pwd = page.pwd;
                    node[i].published = page.published;
//                    node[i].ecom_category_id = page.ecom_category_id;
                    node[i].meta_title = page.title;
                    node[i].description = page.description;
                    node[i].meta_code = page.meta_code;
                    node[i].header_doc_id = page.header_doc_id;
                    node[i].body_doc_id = page.body_doc_id;
                    node[i].footer_code = page.footer_code;
                    node[i].ads_visible = page.ads_visible;
                    node[i].is_meta_title_changed = node[i].meta_title != node[i].title;
                    node[i].style = page.style || "";
                    node[i].rss_title = page.rss_title;
                    node[i].is_rss_available = page.is_rss_available;
                    node[i].has_comments = page.has_comments;
                    node[i].header_visible = page.header_visible;
                    node[i].footer_visible = page.footer_visible;
                    node[i].style_id = page.style_id;


                    if(type == "std" || type == "doc") {
                        var pr = core.data.page_rows_list[page.id];
                        if(pr) {
                            node[i].header_row_page_id = pr[0] || "none";
                            node[i].footer_row_page_id = pr[255] || "none";
                        } else {
                            node[i].header_row_page_id = "none";
                            node[i].footer_row_page_id = "none";
                        }
                    }
                }
            } else if(type == "forum" || type == "store") {
                var page = this.getPageData(node[i].url);
                if(page) {
                    node[i].page_id = page.id;
                    node[i].header_doc_id = page.header_doc_id;
                    node[i].footer_code = page.footer_code;
                    node[i].ads_visible = page.ads_visible;
                }
            }
            if(!this.used_page_types[type]) {
                this.used_page_types[type] = 1;
            } else {
                this.used_page_types[type]++;
            }
            if(core.data.page_file == node[i].url) {
                this.loaded_item_id = node[i].id;
            }
            if(node[i].default_body_menu) {
                this.default_body_menu = node[i].id;
                delete(node[i].default_body_menu);
            }
            this.extendData(node[i].childs);
        }
    },


    getPageData: function(url) {
        for(var i=0; i<core.data.pages_list.length; i++) {
            var p = core.data.pages_list[i];
            if(p.url == url) {
                return p;
            }
        }
    },

    
    
    // save

    onSaveClick: function() {
        this.collectFormValues();
        this.have_forum = false;
        this.have_store = false;

        this.used_urls = {};
        this.pages_data = [];
        this.menu_data = [];

        var flags = "";
        this.active_page_url = null;
        if(this.processTree(this.data, this.menu_data)) {
            desktop.setState("loading");

            if(this.have_forum) {
                flags = "f";
            }
            if(this.have_store) {
                flags += "s";
            }
            var r = {
                dialog: "pages_manager",
                act: "save",
                menu_data: php_serialize(this.menu_data),
                pages_data: php_serialize(this.pages_data),
                deleted_pages: php_serialize(this.deleted_pages),
                flags: flags
            }
            core.transport.send("/controller.php", r, this.onDataSaved.bind(this), "POST");
        }
        
    },




    onDataSaved: function(msg) {
   
        for(var i=0; i<this.deleted_pages.length; i++) {
            if(this.deleted_pages[i] == core.data.page_id) {
                this.active_page_url = "index";
                break;
            }
        }
        var url = this.active_page_url ? "/" + this.active_page_url + ".html" : location.href;
        desktop.loadURL(url);
    },



    processTree: function(node, menu_node) {
        var is_error = false;
        for(var i=0; i<node.length; i++) {
            var v = node[i];
            if(v.title == "") {
                this.selectItem(v.id);
                this.showElement("error_title");
                return false;
            } else if(v.url == "" || this.used_urls[v.url]) {
                this.selectItem(v.id);
                this.showElement("error_url");
                return false;
            }             

            menu_node[i] = {
                id: v.id,
                title: v.title,
                hint: v.hint,
                url: v.url,
                blank_page: v.blank_page,
                type: v.type,
                visible: v.visible,
                footer_link: v.footer_link,
                published: 1,
                body_menu: v.body_menu,
                childs: []
            }

            if(this.default_body_menu == v.id) {
                menu_node[i]["default_body_menu"] = 1;
            }
            switch(v.type) {
                case "std":
                case "doc":
                    if(v.page_id == core.data.page_id) this.active_page_url = v.url;


                    var pd = {
                        id: v.page_id,
                        type: v.type,
                        url: v.url,
                        name: v.title,
                        title: v.meta_title,
                        description: v.description,
                        meta_code: v.meta_code,
                        ads_visible: v.ads_visible,
                        published: v.published,
//                        ecom_category_id: v.ecom_category_id,
                        access_mode: v.access_mode,
                        pwd: v.pwd,
                        footer_code: v.footer_code,
                        header_doc_id: v.header_doc_id,
                        body_doc_id: v.body_doc_id,
                        src_page_id: v.src_page_id,
                        style: v.style,
                        rss_title: v.rss_title,
                        is_rss_available: v.is_rss_available,
                        has_comments: v.has_comments,
                        header_visible: v.header_visible,
                        footer_visible: v.footer_visible,
                        style_id: v.style_id
                    }
                    if(v.type == "std" || v.type == "doc") {
                        pd.header_row_page_id = v.header_row_page_id;
                        pd.footer_row_page_id = v.footer_row_page_id;
                    }
                    this.pages_data.push(pd);

                    this.used_urls[v.url] = 1;
                    menu_node[i].published = v.published;
                    break;

                case "forum":
                    this.pages_data.push({
                        id: v.page_id,
                        type: v.type,
                        url: v.url,
                        name: v.title,
                        title: v.title,
                        description: "",
                        meta_code: "",
                        ads_visible: v.ads_visible,
                        published: 1,
                        pwd: "",
                        footer_code: v.footer_code,
                        header_doc_id: v.header_doc_id
                    });
                    this.have_forum = true;
                    break;

                case "store":
                    this.pages_data.push({
                        id: v.page_id,
                        type: v.type,
                        url: v.url,
                        name: v.title,
                        title: v.title,
                        description: "",
                        meta_code: "",
                        ads_visible: v.ads_visible,
                        published: 1,
                        pwd: "",
                        footer_code: v.footer_code,
                        header_doc_id: v.header_doc_id
                    });
                    this.have_store = true;
                    break;


                default:
                    break;
            }

            if(!this.processTree(v.childs, menu_node[i].childs)) {
                return false;
            }
        }
        return true;
    },





    getPagesList: function(node) {
        var res = [];
        for(var i=0; i<node.length; i++) {
            var v = node[i];

            if(v.type == "std" || v.type == "doc") {
                res.push({ name: v.title, url: v.url });
            }

            var subs = this.getPagesList(v.childs);
            if(subs.length) {
                res = res.concat(subs);
            }
        }
        return res;
    },




    // styles v2

    onPageStyleClick: function(e) {
        this.skip_on_show_content = true;
        desktop.openStylesManager("page_body", this.$["inp_style_id"].value, this.onPageStyleSelected.bind(this));
    },


    onPageStyleSelected: function(style_id) {
        this.$["inp_style_id"].value = style_id;
    }


}
core.apps.pages_manager.extendPrototype(core.components.html_component);
core.apps.pages_manager.extendPrototype(core.components.popup_app);