core.apps.apps_manager = function() {};

core.apps.apps_manager.prototype = {

    showInstalledOnly: false,

    window_resize: {
        wmargin: 50,
        hmargin: 160,
        target: "apps_manager"
    },

    getTitle: function() {
        return "Apps manager";
    },


    renderContent: function() {
        this.displayTpl(this.$["content"], "apps_manager");
        jQuery('.apps_manager .left').resizable({
            handles: 'e, w',
            maxWidth: 300,
            minWidth: 160,
            resize: function( event, ui ) {
                core.apps.apps_manager.prototype.setRightWidth();
            }
        });
        this.loadList(true);
    },

    onShowInstalledChanged:function(){
        if(this.$["inp_cb_installed"].checked) {
            this.showInstalledOnly = true;
            this.showApps(true,this.$["inp_select_category"].value);
        } else {
            this.showInstalledOnly = false;
            this.showApps(false,this.$["inp_select_category"].value);
        }
    },

    onCategoryChanged: function(){
            this.showApps(this.showInstalledOnly,this.$["inp_select_category"].value);
    },

    setRightWidth: function(){
        var el = jQuery('.apps_manager .left').get(0);
        var parent = jQuery(el).parent();
        jQuery(parent).find('.right').width(jQuery(parent).width()-jQuery(el).width()-5);
    },
    
    loadList: function() {
        desktop.setState("loading");
        var p = {
            dialog: "apps_manager",
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

        core.data.apps_categories = [{text:'All',value:-1}];
        for(var i in r.data.categories){
            core.data.apps_categories.push(r.data.categories[i]);
        }
        core.data.apps_config = r.data.list;
        this.$['custom_vendors'].value = r.data.vendors;
        this.$['inp_select_category'].setOptions(core.data.apps_categories);
        //for(var i in core.data.apps_categories){
        //    var category = core.data.apps_categories[i];
        //
        //}
        this.showApps();
        this.setRightWidth();
        desktop.setState("normal");
    },

    cleanAppsList:function(){
        this.$['apps_list'].innerHTML = '';
    },

    showApps: function(onlyInstalled,filter){
        this.cleanAppsList();
        onlyInstalled = onlyInstalled || false;
        if(filter == -1){
            filter = false;
        }
        for(var i in core.data.apps_config){
            var app = core.data.apps_config[i];
            if((onlyInstalled && !app.installedData)||(filter && app.category!=filter)){
                continue;
            }
            var installedClass = app.installedData ?  'installed':  '';
                this.buildModel(this.$['apps_list'],{
                 tag: "div", className: "app_section " +installedClass,
                    innerHTML: app.title,
                    id: 'app_'+app.name,
                    events: {onclick: ["showInfo", app.name]},
                    childs: [
                        { tag: "div", className: "btn" }
                        ]
                });
        }
    this.showInfo(null,core.data.apps_config[Object.keys(core.data.apps_config)[0]].name);
    },

    showInfo: function(event,app){
        app = core.data.apps_config[app];
        var buttons = {
            install:{
                active: false,
                className: 'btn-success'
            },
            update:{
                active: false,
                className: 'btn-warning'
            },
            remove:{
                active: false,
                className: 'btn-danger'
            }
        };

        if(!app.installedData){
            buttons.install.active = true;
        }

        if(app.installedData){
            buttons.remove.active = true;
            if(app.isUpdateAllowed){
                buttons.update.active = true;
            }
        }

        var depends = this.getDependsModel(app.configData.depends);

        jQuery(this.$['app_info']).empty();
        this.buildModel(this.$['app_info'],[
                {
            tag: "h2",
            //because we have not actual titles for not existed widgets (generate from php from name)
            innerHTML: typeof(app.configData.title)!='undefined' ? app.configData.title : app.title,
            id: 'info_'+app.name
        //    events: {onclick: ["showInfo", app.name]},

    },
                { tag: "div",
                    className: 'content',
            childs: [
                { tag: "span", className: app.installedData && typeof(app.installedData.version) != 'undefined' && app.installedData.version ? "version" : 'hide_btn', innerHTML: 'Installed version is: '+app.installedData.version },
                { tag: "span", className: typeof(app.configData.version) != 'undefined' ? "version" : 'hide_btn', innerHTML: 'Available version is: '+app.configData.version },
                {tag : "div", childs:[
                    {tag: "span",  className: !app.packageAvailable ? "" : 'hide_btn', innerHTML: "Package with this widget is not available and will be downloaded before installation."}
                ]},
                { tag: "table", className: "depends table", childs:depends.model},
                { tag: "div", className: "actions", childs:[
                    { tag: "button", events: {onclick: ["runCommand", {type:'install', app:app}]}, disabled:depends.isUnavailableAppsExist, className: buttons.install.active ? ['btn',buttons.install.className].join(' ') : 'hide_btn', innerHTML: "Install", id: "btn_install" },
                    { tag: "button", events: {onclick: ["runCommand", {type:'remove', app:app}]}, className: buttons.remove.active ? ['btn',buttons.remove.className].join(' ') : 'hide_btn', innerHTML: "Remove", id: "btn_update" },
                    { tag: "button", events: {onclick: ["runCommand", {type:'update', app:app}]}, className: buttons.update.active ? ['btn',buttons.update.className].join(' ') : 'hide_btn', innerHTML: "Update", id: "btn_remove" },
                ] },



            { tag: "div", className: "descr", innerHTML: typeof(app.configData.description) != 'undefined' && app.configData.description.length ? app.configData.description : 'Description is empty.' }
        ]}

    ]
        );

    },

    getDependsModel: function(list){
        if(!list){
            return false;
        }
        var model = [{tag:"tr",childs:[{tag:"th",innerHTML:"Depends:"}]}];
        var isUnavailableAppsExist = false;
        for(var i in list){
            var item = list[i];
            var status = '';
            if(item.indexOf('/')!=-1){
                item = item.split('/')[1];
            }
            var depApp = core.data.apps_config[item];
            //if installed
            if(depApp.installedData){
                status = 'installed';
            }else{
                //if not installed, but can be installed
                if(depApp.packageAvailable){
                   status = 'available';
                }else{
                    //if package unavailable
                    isUnavailableAppsExist = true;
                    status = 'unavailable';
                }
            }
            model.push(
                {tag:"tr",childs:[{tag:"td",innerHTML:item+' ('+status+')', className: "depends_status_"+status}]}
                );
        }
        if(isUnavailableAppsExist){
            model.push({tag:"tr",childs:[{tag:"td",innerHTML:"Some of depends apps are not available, please install them before"}]});
        }

        return {model:model,isUnavailableAppsExist:isUnavailableAppsExist};
    },

    runCommand:function(e,data){
        desktop.setState("loading");
        var p = {
            dialog: "apps_manager",
            act: "run_command",
            data: JSON.stringify(data)
        };
        core.transport.send("/controller.php", p, this.onRunCommandResponse.bind(this));
    },

    onRunCommandResponse:function(r){
        desktop.setState("normal");
        if(!r || r.status != "ok") {
            desktop.modal_dialog.alert("Server error. Can't load data.");
            return;
        }
        desktop.modal_dialog.prompt4("Complete successfully","<div class=\"apps_manager_log\">"+r.data+"</div>",function(){
            desktop.loadURL();
        });

        //  this.loadList();
    },

    onSaveClick: function() {
        desktop.setState("loading");
        var p = {
            dialog: "apps_manager",
            act: "save",
            data: JSON.stringify({test:123})
        };
        core.transport.send("/controller.php", p, this.onSaveResponse.bind(this));

    },

    onSaveVendorsListClick:function(){
        desktop.setState("loading");
        var p = {
            dialog: "apps_manager",
            act: "save_vendors_list",
            vendors: this.$['custom_vendors'].value
        };
        core.transport.send("/controller.php", p, this.onSaveResponse.bind(this));
    },

    onSaveResponse:function(data){
        desktop.setState("normal");
    },

    onCancelClick: function() {
        desktop.hidePopupApp();
    }

};
core.apps.apps_manager.extendPrototype(core.components.html_component);
core.apps.apps_manager.extendPrototype(core.components.popup_app);