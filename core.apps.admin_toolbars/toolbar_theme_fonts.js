core.apps.admin_toolbar_theme_fonts = function() {}

core.apps.admin_toolbar_theme_fonts.prototype = {

    template: "admin_toolbar_window_list",

    renderContent: function() {
        this.setTitle("Font settings");
        this.displayTpl(this.$["content"], "admin_toolbar_theme_fonts");
    },


    setData: function(data) {
        this.id = data.id;
        this.$.inp_font1.setValue(data["main-font"]);
        this.$.inp_font2.setValue(data["heading-font"]);
        this.$.inp_font3.setValue(data["fancy-font"]);
    },


    getData: function() {
        var res = {
            id: this.id,
            "main-font": this.$["inp_font1"].value.trim(),
            "heading-font": this.$["inp_font2"].value.trim(),
            "fancy-font": this.$["inp_font3"].value.trim()
        }
        return res;
    },


    onSaveClick: function() {
        var data = this.getData();
        for(var k in data) {
            if(data[k] == "") {
                desktop.modal_dialog.alert("Empty values not allowed");
                return
            }
        }
        desktop.admin_slider.get("theme_fonts").onVariablesEdited(data);
        this.hideElement("window");
    }

}
core.apps.admin_toolbar_theme_fonts.extendPrototype(core.objects.admin_toolbar);
core.apps.admin_toolbar_theme_fonts.extendPrototype(core.components.html_component);