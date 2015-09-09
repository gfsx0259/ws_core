core.apps.themes = function() {};


core.apps.themes.prototype = {

    window_resize: {
        hmargin: 230,
        wmargin: 30,
        target: "themes_list"
    },


    getTitle: function() {
        return "Themes";
    },


    renderContent: function() {
        this.displayTpl(this.$["content"], "themes_list");
        core.data.themes = [];
        this.loadCategories();
    },



    loadCategories: function() {
        var p = {
            dialog: "themes", 
            act: "get_categories"
        };
        core.transport.send("/controller.php", p, this.onCategoriesResponce.bind(this));
    },


    onCategoriesResponce: function(res) {
        if(res) {
            this.categories = { };
            for(var i=0; i<res.length; i++) {
                var tc = res[i];
                if(!this.categories[tc.type]) {
                    this.categories[tc.type] = [];
                }
                this.categories[tc.type].push({ id: tc.id, title: tc.title });
            }
            if(this.categories["custom"] && this.categories["custom"][0]) {
                this.showElement("btn_install");
            } else {
                this.hideElement("btn_install");
            }
            this.initContent();
        } else {
            this.$["content"].innerHTML = "Error. Categories not loaded.";
        }
    },


    initContent: function() {
        var first_type = false;
        for(var k in this.categories) {
            if(!first_type) {
                first_type = k;
            }
            var t = k.substr(0, 1).toUpperCase() + k.substr(1);
            this.buildModel(this.$["types_tabs"],
                { tag: "a", 
                  id: "themes_type_" + k,
                  theme_type: k,
                  events: { onclick: "onThemeTypeClick" },
                  innerHTML: t }
            );
        }
        this.themesType = null;
        this.themesCategory = null;

        if(first_type) {
            this.setThemesType(first_type);
        }
    },


    onThemeTypeClick: function(e, t) {
        e = core.browser.event.fix(e);
        e.target.blur();
        var t = e.target.theme_type;
        if(t == this.themesType) return;
        this.setThemesType(t);
    },


    setThemesType: function(t) {
        if(this.themesType) {
            this.$["themes_type_" + this.themesType].className = "";
        }
        this.$["themes_type_" + t].className = "active";
 

        this.themesType = t;
        this.renderThemeCategories();
    },



    renderThemeCategories: function() {
        this.$["tcategories_tabs"].innerHTML = "";
        var cats = this.categories[this.themesType];
        for(var i=0; i<cats.length; i++) {
            this.buildModel(this.$["tcategories_tabs"],
                { tag: "a", href: "void", 
                  events: { onclick: ["onCategoryClick", cats[i].id ] },
                  id: "theme_category" + cats[i].id,
                  innerHTML: cats[i].title }
            );
        }
        var cid = cats.length ? cats[0].id : null;
        this.themesCategory = null;
        this.setThemesCategory(cid);
    },


    onCategoryClick: function(e, c) {
        e = core.browser.event.fix(e);
        e.target.blur();
        this.setThemesCategory(c);
    },

    setThemesCategory: function(c) {
        if(this.themesCategory) {
            this.$["theme_category" + this.themesCategory].className = "";
        }
        if(c != null) {
            this.$["theme_category" + c].className = "active";
        }
        this.themesCategory = c;
        this.showThemesCategory();
    },


    showThemesCategory: function() {
        if(this.themesType && this.themesCategory != null) {
            if(core.data.themes[this.themesCategory]) {
                this.renderThemes(this.themesCategory);
            } else {
                core.transport.send(
                    "/controller.php", 
                    { dialog: "themes", 
                      act: "get_themes",
                      category: this.themesCategory,
                      type: this.themesType }, 
                    this.onThemesResponse.bind(this)
                );
                this.$["themes_list"].innerHTML = "Loading...";
            }
        } else {
            this.$["themes_list"].innerHTML = "Empty category...";
        }
    },


    onThemesResponse: function(res) {   
        core.data.themes[res.category] = res.data;
        if(res.category == this.themesCategory) {
            this.renderThemes(res.category);
        }
    },


    renderThemes: function(category) {
        var list = core.data.themes[category], is_active;
        this.themes = list;

        if(list.length) {
            this.$["themes_list"].innerHTML = "";
            for(var i=0; i<list.length; i++) {

                if(this.themesType == "custom") {
                    var thumb_src = "/custom_themes/" + list[i].name + "/thumb.jpg";
                    var is_custom = 1;
                } else {
                    var thumb_src = "/themes/" + list[i].name + "/thumb.jpg";
                    var is_custom = 0;
                }

                var m = {
                    tag: "div", className: "item",
                    childs: [
                      { tag: "img", src: thumb_src },
                      { tag: "br"},
                      { tag: "text", innerHTML: list[i].title }
                    ],
                    events: {
                      onclick: ["setTheme", [list[i].id, is_custom] ]
                    }
                };

                is_active = false;
                if(core.data.site_info.custom_theme_id) {
                    if(is_custom && core.data.site_info.custom_theme_id == list[i].id) is_active = true;
                } else {
                    if(!is_custom && core.data.site_info.theme_id == list[i].id) is_active = true;
                }

                if(is_active) {
                    m.className += " active";
                    m.childs.push({
                        tag: "img", 
                        src: "/static/images/selected.png",
                        className: "active_icon"
                    });
                }
                if(is_custom) {
                    m.childs.push({
                        tag: "div", className: "delete_icon",
                        title: "Delete theme",
                        events: { onclick: [ "onDeleteClick", list[i].id ] }
                    });
                }

                this.buildModel(this.$["themes_list"], m);
            }
        } else { 
            this.$["themes_list"].innerHTML = "Empty category...";
        }
    },



    setTheme: function(e, args) {
        var p = {
            dialog: "themes", 
            act: "set_theme", 
            theme_id: args[0],
            is_custom: args[1]
        };
        if(p.is_custom && core.data.site_info.custom_theme_id == args[0]) return;
        if(!core.data.site_info.custom_theme_id && !p.is_custom && core.data.site_info.theme_id == args[0]) return;
        core.transport.send("/controller.php", p, this.onThemeSaved.bind(this));
    },


    onThemeSaved: function(e) {
        if(!e) {
            desktop.modal_dialog.alert("Server error");
            return;
        }
        var url = location.href;
        desktop.loadURL(url.replace("#", ""));
    },




    // theme install

    onInstallClick: function() {
        if(this.$["btn_install"].disabled) return;
        desktop.openFilesManager(this.onFileSelected.bind(this), "dat");
    },


    onFileSelected: function(file) {
        desktop.setState("loading");

        var p = {
            dialog: "themes",
            act: "install",
            file: file
        };
        core.transport.send("/controller.php", p, this.onThemeInstalled.bind(this));
    },


    onThemeInstalled: function(r) {
        desktop.setState("normal");
        if(!r || r.status == "error") {
            desktop.modal_dialog.alert(r["msg"] || "Server error");
            return;
        } 
        core.data.themes[r.category] = r.data;
        this.setThemesType("custom");
    },




    // delete theme

    onDeleteClick: function(e, theme_id) {
        core.browser.event.kill(e);
        desktop.modal_dialog.confirm("Delete theme?", this.deleteTheme.bind(this, theme_id));
    },


    deleteTheme: function(theme_id) {
        desktop.setState("loading");

        this.reload_after_delete = core.data.site_info.custom_theme_id == theme_id;

        var p = {
            dialog: "themes",
            act: "delete",
            theme_id: theme_id,
            load_list: this.reload_after_delete ? 0 : 1
        };
        core.transport.send("/controller.php", p, this.onDeleteResponce.bind(this));
    },


    onDeleteResponce: function(r) {
        if(!r || r.status == "error") {
            desktop.setState("normal");
            desktop.modal_dialog.alert(r["msg"] || "Server error");
            return;
        }
        
        if(this.reload_after_delete) {
            var url = location.href;
            desktop.loadURL(url.replace("#", ""));
            return;
        }

        desktop.setState("normal");
        core.data.themes[r.category] = r.data;
        this.setThemesType("custom");
    }


};

core.apps.themes.extendPrototype(core.components.html_component);
core.apps.themes.extendPrototype(core.components.popup_app);