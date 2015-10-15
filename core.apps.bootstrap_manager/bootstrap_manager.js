core.apps.bootstrap_manager = function() {};

core.apps.bootstrap_manager.prototype = {


    window_resize: {
        wmargin: 10,
        hmargin: 160,
        target: "lists"
    },

    getTitle: function() {
        return "Bootstrap manager";
    },


    renderContent: function() {
        this.displayTpl(this.$["content"], "bootstrap_manager");
        this.loadList(true);
    },
    
    loadList: function() {
        desktop.setState("loading");
        var p = {
            dialog: "bootstrap_manager",
            act: "get_list"
        };
        core.transport.send("/controller.php", p, this.onListResponce.bind(this));
    },


    onListResponce: function(r) {
        if(!r || r.status != "ok") {
            desktop.setState("normal");
            desktop.modal_dialog.alert("Server error. Can't load data.");
            return;
        }

        desktop.setState("normal");
        if(r.files_list.files) {
            core.data.css_files = r.files_list.files;
            if(core.data.css_files.length) {
                this.renderFilesList();
            }else{
                this.$["css_files_content"].innerHTML = "Empty list";
            }
        }

        if(r.files_list.themes) {
            core.data.bootstrap_css_themes = r.files_list.themes;
            if(!jQuery.isEmptyObject(core.data.bootstrap_css_themes)){
                this.renderThemesList();
            }else{
                this.$["bootstrap_themes_content"].innerHTML = "Empty list";
            }
        }

    },


    renderFilesList: function(){
        for(var i in core.data.css_files){
            var file = core.data.css_files[i];
            this.buildModel(this.$["css_files_content"], [
                { tag: "div",
                    className: "bootstrap_file_section",
                    id: 'bootstrap_file_section_'+i,
                    childs: [
                        {
                            tag: "div", className: "bootstrap_file",
                            innerHTML: file
                        },
                        {
                            tag: "span", className: "bootstrap_file_actions glyphicon glyphicon-chevron-right",
                            events: { onclick: ["onMoveToThemesClick", i]}
                        }
                    ]
                     }
            ]);
        }

    },


    onMoveToThemesClick: function(event,i){
        var value = jQuery(this.$['bootstrap_file_section_'+i]).find('.bootstrap_file').text();
        //insert new themes object if not exists
        if(typeof(core.data.bootstrap_css_themes[value])!='object'){
            core.data.bootstrap_css_themes[value]= {
                is_default:0,
                status:1,
                theme_id: 'empty'
            };
        }else{
            desktop.modal_dialog.alert("This css file exists in themes list already");
        }
        jQuery("#bootstrap_themes_content").empty();
        this.renderThemesList();
    },

    renderThemesList:function(){
        for(var i in core.data.bootstrap_css_themes){
            var file = core.data.bootstrap_css_themes[i];
            if(typeof(file)=='undefined'){
                continue;
            }
            this.buildModel(this.$["bootstrap_themes_content"], [
                { tag: "div",
                    className: "bootstrap_theme_section",
                    id: 'theme_'+file.theme_id,
                    childs: [
                        {
                            tag: "div", className: "bootstrap_theme",
                            innerHTML: i
                        },
                        {
                            tag: "div", className: "bootstrap_file_actions",
                            childs: [
                                {
                                    tag: "input",
                                    value: file.path,
                                    id: 'default_theme_'+file.theme_id,
                                    type: 'radio', name: 'default_theme', className: "bootstrap_theme_default"
                                },
                                {
                                    tag: "span",
                                    className: file.status == 1 ? 'glyphicon glyphicon-ok-sign theme_file_exists' : 'glyphicon glyphicon-info-sign theme_file_not_exists',
                                    innerHtml: ''
                                },
                                {
                                    tag: "span",
                                    className:'glyphicon glyphicon-remove markToDelete',
                                    events: { onclick: ["onMarkToDeleteClick", i]},
                                    innerHtml: 'Remove'
                                }
                            ]
                        }
                    ]
                }
            ]);
            jQuery('#default_theme_'+file.theme_id).attr('checked',file.is_default == '1' ? true : false);
        }
    },

    onMarkToDeleteClick: function(event,i){
        var element = core.browser.event.fix(event).target;
        if(jQuery(element).hasClass('active')){
            core.data.bootstrap_css_themes[i].is_mark_to_delete = 0;
        }else{
            core.data.bootstrap_css_themes[i].is_mark_to_delete = 1;
        }
        jQuery(element).toggleClass('active');
    },

    onLoadClick: function(e) {
        desktop.openFilesManager(this.onThemeFileSelected.bind(this), "themes");
    },

    onSaveClick: function() {
        var themes = {};
        jQuery(this.$["bootstrap_themes_content"]).find('.bootstrap_theme_section').each(function(key,content){
            var value = jQuery(this).find('.bootstrap_theme').text();
            var is_default = jQuery(this).find('.bootstrap_theme_default').is(':checked');
            var is_mark_to_delete = core.data.bootstrap_css_themes[value]['is_mark_to_delete'];
            //if need to delete theme section witch does not exist on server yet, we must not to added it
            if(!(is_mark_to_delete==1 && this.id=="theme_empty")){
                themes[key] = {
                    theme_id: this.id.split('_')[1],
                    path: value,
                    is_default: is_default,
                    is_mark_to_delete: core.data.bootstrap_css_themes[value]['is_mark_to_delete']
                }
            }

            if(is_mark_to_delete==1){
                core.data.bootstrap_css_themes[value] = undefined;
                jQuery('#'+this.id).remove();
            }
        });

        desktop.setState("loading");
        var p = {
            dialog: "bootstrap_manager",
            act: "save",
            data: JSON.stringify(themes)
        };
        core.transport.send("/controller.php", p, this.onSaveResponse.bind(this));

    },

    onSaveResponse:function(data){
        this.refresh();
        desktop.setState("normal");
    },

    refresh: function(){
        jQuery("#bootstrap_themes_content,#css_files_content").empty();
        this.loadList();
    },

    onCancelClick: function() {
        desktop.hidePopupApp();
    }

};
core.apps.bootstrap_manager.extendPrototype(core.components.html_component);
core.apps.bootstrap_manager.extendPrototype(core.components.popup_app);