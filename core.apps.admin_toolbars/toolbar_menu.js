core.apps.admin_toolbar_menu = function() {};

core.apps.admin_toolbar_menu.prototype = {

    template: "admin_toolbar_window_list",


    renderContent: function() {
        this.setTitle("Settings");
        this.displayTpl(this.$["content"], "admin_toolbar_menu");
    },




    showThemes2: function() {    
        desktop.showPopupApp("themes_manager");
    },

    openTextsManager: function() {
        desktop.openTextsManager();
    },

    openFilesManager: function() {
        desktop.openFilesManager();
    },

    showUsersManager: function() {
        desktop.showPopupApp("users_manager");
    },

    showEmailsManager: function() {
        desktop.showPopupApp("emails_manager");
    },

    showEcommerceManager: function() {
        desktop.openEcommerceManager(false, "standard"); 
    },

    showFormsManager: function() {
        desktop.showPopupApp("forms_manager");
    },

    showEventsManager: function() {
        desktop.showPopupApp("events_manager");
    }

};
core.apps.admin_toolbar_menu.extendPrototype(core.objects.admin_toolbar);
core.apps.admin_toolbar_menu.extendPrototype(core.components.html_component);