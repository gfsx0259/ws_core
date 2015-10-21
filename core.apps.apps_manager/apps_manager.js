core.apps.apps_manager = function() {};

core.apps.apps_manager.prototype = {


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
            handles: 'e, w'
        });
        this.loadList(true);
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

        core.data.apps_categories = r.data.categories;
        core.data.apps_config = r.data.list;
        this.$['control_category'].setOptions(core.data.apps_categories);
        //for(var i in core.data.apps_categories){
        //    var category = core.data.apps_categories[i];
        //
        //}
        this.showApps();
        desktop.setState("normal");
    },

    showApps: function(){
        for(var i in core.data.apps_config){
            var package = core.data.apps_config[i];
            for(var i in package){
                var app = package[i];
                this.buildModel(this.$['apps_list'],{
                 tag: "div", className: "app_section ",
                    innerHTML: app.name,
                    childs: [
                        { tag: "div", className: "btn" }
                        ]
                });
            }
        }
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

    onSaveResponse:function(data){

        desktop.setState("normal");
    },

    onCancelClick: function() {
        desktop.hidePopupApp();
    }

};
core.apps.apps_manager.extendPrototype(core.components.html_component);
core.apps.apps_manager.extendPrototype(core.components.popup_app);