core.apps.bootstrap_manager = function() {};

core.apps.bootstrap_manager.prototype = {


    window_resize: {
        wmargin: 10,
        hmargin: 160,
        target: "lists"
    },

    themes_sections:new Array(),

    getTitle: function() {
        return "Bootstrap manager";
    },


    renderContent: function() {
        this.displayTpl(this.$["content"], "bootstrap_manager");
        //this.selectTab("user_themes");
        this.loadList(true);
    },



    setMode: function(mode) {
        switch(mode) {
            case "loading":
                desktop.setState("loading");
                break;

            case "error":
                desktop.setState("normal");
                desktop.modal_dialog.alert("Server error. Can't load data.");
                break;

            case "lists":
                desktop.setState("normal");
                break;
        }
        desktop.updatePopupPos();
    },










    // lists requests 

    loadList: function(first_load) {
        if(core.data.themes_list) {
            this.renderUserThemesList();
            return;
        }
        this.setMode("loading");
        var p = {
            dialog: "bootstrap_manager",
            act: "get_posted_css",
            admin_themes: first_load ? 1 : 0
        };
        core.transport.send("/controller.php", p, this.onListResponce.bind(this));
    },


    onListResponce: function(r) {
        if(!r || r.status != "ok") {
            this.setMode("error");
            return;
        }

        this.setMode("lists");
        if(r.files_list) {
            core.data.bootstrap_css_files = r.files_list;
            this.renderFilesList();
        }
        core.data.themes_list = r.themes_list;
       // this.renderUserThemesList();
    },


    renderFilesList: function(){
        for(var i in core.data.bootstrap_css_files){
            var file = core.data.bootstrap_css_files[i];
            this.buildModel(this.$["css_files"], [
                { tag: "div",
                    className: "bootstrap_file_section",
                    childs: [
                        {
                            tag: "div", className: "bootstrap_file",
                            innerHTML: file
                        },
                        {
                            tag: "div", className: "bootstrap_file_actions",
                            events: { onclick: ["onMoveToThemesClick", file]},
                            innerHTML: ">"
                        }
                    ]
                     }
            ]);
        }

    },


    onMoveToThemesClick: function(event,file){
        this.themes_sections.push(file);
        this.themes_sections = jQuery.unique(this.themes_sections);
        jQuery("#bootstrap_themes").empty();
console.log(this.themes_sections);
        for(var i in this.themes_sections){
            this.buildModel(this.$["bootstrap_themes"], [
                { tag: "div",
                    className: "bootstrap_theme_section",
                    childs: [
                        {
                            tag: "div", className: "bootstrap_theme",
                            innerHTML: this.themes_sections[i]
                        }
                    ]
                }
            ]);
        }

    },
    // my themes list

















    // load
    onLoadClick: function(e) {
        desktop.openFilesManager(this.onThemeFileSelected.bind(this), "themes");
    },


    // popup bootom btns

    onCreateClick: function() {
        this.createTheme();
    },

    onCancelClick: function() {
        desktop.hidePopupApp();
    }

};
core.apps.bootstrap_manager.extendPrototype(core.components.html_component);
core.apps.bootstrap_manager.extendPrototype(core.components.popup_app);