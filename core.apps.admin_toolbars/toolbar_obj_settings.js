core.apps.admin_toolbar_obj_settings = function() {};

core.apps.admin_toolbar_obj_settings.prototype = {

    template: "admin_toolbar_window_list",
    resize_height_element: "settings",


    renderContent: function() {
        this.displayTpl(this.$["content"], "admin_toolbar_obj_settings");
        this.$["window"].className += " admin_toolbar_settings";
    },


// interface
    setParams: function(params) {
        this.params = params;
        this.$["settings"].appendChild(params.element);
        this.setTitle(params.title);
    },


    onSaveClick: function(e) {
        if(this.params.onsave) {
            this.params.onsave();
        }
        this.hideElement("window");
    },


    show: function(skip_session_update) {
        this.setState({ visible: true });
        this.updatePosition();
    },


    onHideClick: function(e) {
        this.hide();
        if(this.params.oncancel) {
            this.params.oncancel();
        }
    }

};
core.apps.admin_toolbar_obj_settings.extendPrototype(core.objects.admin_toolbar);
core.apps.admin_toolbar_obj_settings.extendPrototype(core.components.html_component);