core.apps.help_center = function() {};
                                    

core.apps.help_center.prototype = {


    window_resize: {
        target: "help_center"
    },


    onResize: function(v) {
        this.$["help_menu"].style.height = v.height - 20 + "px";
        this.$["help_body"].style.height = v.height - 20 + "px";
    },


    files: {},
    file: null,
    index_file: "index.html",
    history: [],
    history_pos: -1,


    renderContent: function() {
        this.displayTpl(this.$["content"], "help_center");

        var toolbarData = [
            { title: "Home", icon: "/js_apps/core.apps.help_center/images/house.png", id: "nav_home",
              onclick: this.navHome.bind(this) },
            { title: "Backward", icon: "/js_apps/core.apps.help_center/images/arrow_left.png", id: "nav_prev",
              onclick: this.navPrev.bind(this) }, 
            { title: "Forward", icon: "/js_apps/core.apps.help_center/images/arrow_right.png", id: "nav_next",
              onclick: this.navNext.bind(this) }
        ];

        this.toolbar = new core.objects.toolbar({
            parentElement: this.$["toolbar"],
            items: toolbarData
        });
    },



    getTitle: function() {
        return "Help Center";
    },



    onShowContent: function() {
        this.setFile(core.values.help_center_file);
    },


    onHideContent: function() {
        if(core.data.site_info.show_help == 1){
            core.data.site_info.show_help = 0;
            var p = {
                dialog: "help_center",
                act: "set_status",
                status: 0
            };
            core.transport.send("/controller.php", p);
        }
    },


    setFile: function(file) {
        var f = file || this.index_file;
        if(this.file == f) return;
        this.file = f;

        this.historyPush(f);

        if(this.files[f] == undefined) {
            this.$["help_body"].innerHTML = "Loading...";

            var p = {
                act: "get_file",
                name: f,
                load_menu: this.menu_loaded ? 0 : 1,
                dialog: "help_center"
            };
            core.transport.send("/controller.php", p, this.onServerResponce.bind(this));
            this.isLoading = true;
            this.updateToolbar();
        } else {
            this.showActiveFile();
        }
    },


    onServerResponce: function(res) {
        this.isLoading = false;
        if(!res) {
            desktop.modal_dialog.alert("Server error");
            return;
        }
        this.files[this.file] = this.processFileContent(res.content);
        if(res.menu_content) {
            this.menu_loaded = true;
            this.$["help_menu"].innerHTML = this.processFileContent(res.menu_content);
        }
        this.showActiveFile();
    },


    processFileContent: function(c) {
        return c.replace(/((href\s*=\s*)("|')(.*?)("|'))/gi, "href='javascript:void(0)' onclick='desktop.showHelp(\"$4\")' url=\"$4\"");
    },


    showActiveFile: function() {
        this.$["help_body"].innerHTML = this.files[this.file];
        this.processMenuLinks();
        this.updateToolbar();
//        desktop.updatePopupPos();
    },



    // navigation

    historyPush: function(n) {
        if(n == "menu.html") return;
        this.history = this.history.splice(0, this.history_pos + 1);
        this.history.push(n);
        if(this.history.length > 100) this.history.unshift();
        this.history_pos = this.history.length - 1;
    },


    updateToolbar: function() {
        this.toolbar.setItemDisabled("nav_home", this.isLoading || this.file == this.index_file);
        this.toolbar.setItemDisabled("nav_next", this.isLoading || this.history_pos >= this.history.length - 1);
        this.toolbar.setItemDisabled("nav_prev", this.isLoading || !this.history_pos);
    },



    navHome: function() {
        this.setFile(this.index_file);
    },

    navPrev: function() {
        this.history_pos--;
        this.file = this.history[this.history_pos];
        this.showActiveFile();
    },

    navNext: function() {
        this.history_pos++;
        this.file = this.history[this.history_pos];
        this.showActiveFile();
    },



    // menu

    processMenuLinks: function() {
        var els = this.$.help_menu.childNodes;
        for(var i=0; i<els.length; i++) {
            if(els[i].tagName != "A") continue;
            els[i].className = els[i].getAttribute("url") == this.file ? "active" : "";
        }
    }

};
core.apps.help_center.extendPrototype(core.components.html_component);
core.apps.help_center.extendPrototype(core.components.popup_app);