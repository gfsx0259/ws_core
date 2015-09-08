core.objects.admin_theme_colors = function(parent_el) {

    this.displayTpl(parent_el, "admin_theme_colors");
    this.colors = core.data.site_version[core.data.layout_mode + "_colors"];

    this.labels = {
        "text-color" :                 "Text",
        "text-color-light" :           "Text light",
        "text-color-dark" :            "Text dark",
        "heading-color" :              "Heading",
        "heading-color-light" :        "Heading light",
        "heading-color-dark" :         "Heading dark",
        "background-color1" :          "Background 1",
        "background-color2" :          "Background 2",
        "background-color-gradient1" : "Background gradient 1",
        "background-color-gradient2" : "Background gradient 2",
        "shadow-color-light" :         "Shadow light",
        "shadow-color-dark" :          "Shadow dark",
        "border-color-light" :         "Border light",         
        "border-color-dark" :          "Border dark",
        "extra-color" :                "Extra",
        "extra-color-light" :          "Extra light",
        "extra-color-dark" :           "Extra dark"
    }

    for(var l in this.labels) {
        this.buildModel(this.$.panel_colors,
            { tag: "div", className: "box",
              childs: [
                { tag: "div", className: "color_preview",
                  id: "preview_" + l,
                  target_key: l,
                  events: { onclick: ["showColorPicker", l]}},
                { tag: "span", innerHTML: this.labels[l] }
              ]}
        );
    }

}


core.objects.admin_theme_colors.prototype = {


    refresh: function() {
        for(var k in this.colors) {
            this.updatePreview(k, this.colors[k]);
        }
    },



    updatePreview: function(k, c) {
        c = "#" + c;
        this.$["preview_" + k].style.background = c;
        this.$["preview_" + k].title = c;
    },


    showColorPicker: function(e, key) {
        this.target_key = key;
        desktop.showColorPicker(this.colors[key], this.onColorPicked.bind(this));
    },


    onColorPicked: function(color) {
        if(this.colors[this.target_key] == color) return;
        this.updatePreview(this.target_key, color);

        desktop.setState("loading");
        this.colors[this.target_key] = color;
        var p = {
            dialog: "site_styles",
            act: "set_colors",
            colors: varToString(this.colors)
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
core.objects.admin_theme_colors.extendPrototype(core.components.html_component);
core.objects.admin_theme_colors.extendPrototype(core.objects.slider_obj_common);