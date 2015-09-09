core.apps.admin_toolbar_theme_colors = function() {};

core.apps.admin_toolbar_theme_colors.prototype = {

    template: "admin_toolbar_window_list",

    renderContent: function() {
        this.setTitle("Color settings");
        this.displayTpl(this.$["content"], "admin_toolbar_theme_colors");
    },


    setData: function(data) {
        this.id = data.id;
        this.$["inp_color1"].setValue(data["text-color"]);
        this.$["inp_color2"].setValue(data["heading-color"]);
        this.$["inp_color3"].setValue(data["background-color1"]);
        this.$["inp_color4"].setValue(data["background-color2"]);
        this.$["inp_color5"].setValue(data["extra-color"]);
    },


    getData: function() {
        var res = {
            id: this.id,
            "text-color": this.$["inp_color1"].value,
            "heading-color": this.$["inp_color2"].value,
            "background-color1": this.$["inp_color3"].value,
            "background-color2": this.$["inp_color4"].value,
            "extra-color": this.$["inp_color5"].value
        };
        return res;
    },


    onSaveClick: function() {
        desktop.admin_slider.get("theme_colors").onVariablesEdited(this.getData());
        this.hideElement("window");
    }

};
core.apps.admin_toolbar_theme_colors.extendPrototype(core.objects.admin_toolbar);
core.apps.admin_toolbar_theme_colors.extendPrototype(core.components.html_component);