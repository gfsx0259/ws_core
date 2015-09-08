core.objects.admin_theme_fonts = function(parent_el) {

    this.displayTpl(parent_el, "admin_theme_fonts");

    this.fonts = core.data.site_version[core.data.layout_mode + "_fonts"];

}


core.objects.admin_theme_fonts.prototype = {


    refresh: function() {
        for(var k in this.fonts) {
            var el = this.$["inp_" + k];
            if(el) {
                this.$["inp_" + k].setValue(this.fonts[k]);
            }
        }
    },


    onFontChanged: function(name) {
        var font = this.$["inp_" + name].value;

        if(this.fonts[name] == font) return;
        this.$["inp_" + name].setValue(font);

        desktop.setState("loading");
        this.fonts[name] = font;
        var p = {
            dialog: "site_styles",
            act: "set_fonts",
            fonts: varToString(this.fonts)
        }
        core.transport.send("/controller.php", p, this.onServerResponse.bind(this));
    },



    onServerResponse: function(r) {
        desktop.setState("normal");
        if(!r || r.status != "ok") {
            desktop.modal_dialog.alert("Server error");
            return;
        }
        desktop.reloadThemeCSS();
    }
    
}
core.objects.admin_theme_fonts.extendPrototype(core.components.html_component);
core.objects.admin_theme_fonts.extendPrototype(core.objects.slider_obj_common);
core.objects.admin_theme_fonts.extendPrototype(core.objects.admin_theme_variables);