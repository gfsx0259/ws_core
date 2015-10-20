core.apps.layout_columns.extendPrototype({


    sortRows: function() {
        if(core.data.page_rows_data) {
            var func = function(a, b) { return a.position > b.position };
            core.data.page_rows_data.rows = core.data.page_rows_data.rows.sort(func);
        }
    },



    apps: {},
    profiles: {},

    // apps kernel

    getApp: function(id) {
        return this.apps[id] ? this.apps[id] : null;
    },


    freeApp: function(id) {
        delete(this.apps[id]);
    },


    clearApps: function() {
        for(var id in this.apps) {
            var app = this.apps[id];
            if(app) {
                app.close(true);
            }
        }
        this.apps = [];
    },


    callApps: function(app_name, function_name) {
        for(var id in this.apps) {
            var app = this.apps[id];
            if(app && app.appName == app_name) {
                app[function_name]();
            }
        }
    },

    getFreeAppId: function() {
        var d = new Date();
        var id = d.getTime() + d.getTimezoneOffset()*60000;
        return id;
    },


    // args: appName, [appArgs], parentElement, id
    runColumnApp: function(args) {
        if(args.id == undefined) {
            var needSave = true;
            args.id = this.getFreeAppId();
            args.first_run = true;
        } else {
            args.profile = this.profiles[args.id];
        }
        args.onrun = function(app) {
            app.open(args);
//            app.appName = args.appName;
            desktop.layout.apps[app.id] = app;

            if(args.onplaced) {
                args.onplaced(app);
            }

            if(needSave) {
                desktop.layout.savePage();
            }

            if(args.first_run) {
                desktop.layout.setActiveApp(app);
                app.callFunction("onFirstRun");
            }
        };
        core.launcher.run(args);
    },




    replaceActiveApp: function(new_app_name) {
        desktop.setState("loading");
        var old_app = desktop.layout.getActiveApp();
        this.log.push("block " + old_app.appName + " converted to " + new_app_name);

//        old_app.$["window"].style.display = "none";
        var p = {
            id: this.getFreeAppId(),
            appName: new_app_name,
            beforeElement: old_app.$["window"],
            onrun: function(new_app) {
                desktop.layout.setActiveApp(null);
                new_app.open(p);
                desktop.layout.apps[new_app.id] = new_app;

                var data = old_app.getCompatibleData();
                old_app.close();

                data.theme2_style_id = core.data.theme_default_styles[new_app_name] || 0;
                new_app.setCompatibleData(data);

                new_app._onSettingsUpdated();
                desktop.setState("normal");
                desktop.layout.setActiveApp(new_app);
            }
        };
        core.launcher.run(p);
    },




    renderNodes: function(parent_element, nodes_list) {
        if(!nodes_list) return;
        for(var i=0; i<nodes_list.length; i++) {
            var node = nodes_list[i];
            switch(node.type) {
                case "container":
                    new_element = this.buildModel(parent_element,
                        { tag: "div",
                          wid: "container",
                          className: "layout_cells_container" }
                    );
                    if(node.childs.length == 0) {
                        node.childs = [
                            { type: "cell",
                              width: 100,
                                bootstrap: node.bootstrap,
                              childs: []}
                        ];
                    }
                    this.renderNodes(new_element, node.childs);
                    break;

                case "cell":
                    var cell = {
                        tag: "div",
                        wid: "cell",
                        style: { width: node.width + "%" },
                        className: "layout_cell"
                    };

                    if(node.bootstrap instanceof Object){
                        cell.data_bootstrap = node.bootstrap;
                        cell.className= cell.className+' '+core.components.desktop_app.getBootstrapClasses(node.bootstrap);
                        cell.style.width = '';
                    }

                    new_element = this.buildModel(parent_element,
                        cell
                    );
                    this.renderNodes(new_element, node.childs);
                    break;

                case "app":
                    var bootstrapClasses = false;
                    if(typeof(desktop.layout.profiles[node.id])!='undefined' && typeof(desktop.layout.profiles[node.id].bootstrap)!='undefined'){
                        bootstrapClasses = core.components.desktop_app.getBootstrapClasses(desktop.layout.profiles[node.id].bootstrap);
                    }

                    if(node.app_name == 'menu'){
                        if(bootstrapClasses){
                            bootstrapClasses = bootstrapClasses.split(' ');
                            bootstrapClasses.push('menu_priority');
                            bootstrapClasses = bootstrapClasses.join(' ');
                        }else{
                            bootstrapClasses = 'menu_priority';
                        }
                    }

                    var p = {
                        appName: node.app_name,
                        parentElement: parent_element,
                        id: node.id,
                        isTarget: bootstrapClasses
                    };
                    if(node.childs) {
                        if(node.multiple_childs) {
                            p.onplaced = function(app) {
                                for(var j=0; j<node.childs.length; j++) {
                                    desktop.layout.renderNodes(app.getContentElement(j), node.childs[j]);
                                }
                            }
                        } else {
                            p.onplaced = function(app) {
                                desktop.layout.renderNodes(app.$["content"], node.childs);
                            }
                        }
                    }
                    this.runColumnApp(p);
                    break;
            }
        }
    }

});