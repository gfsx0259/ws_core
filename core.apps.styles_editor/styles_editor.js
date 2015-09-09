core.apps.styles_editor = function() {

    this.sections = [
        "width",
        "margin",
        "padding",
        "background",
        "border",
        "font",
        "text"
    ];
    this.caps = {};
    this.clipboard_data = null;
};

core.apps.styles_editor.prototype = {


    window_resize: {
        hmargin: 180,
        min_height: 400,
        min_width: 800,
        target: "resize_box",
        hmargin: 180
    },


    onResize: function(v) {
        this.$["elements_list"].style.height = v.height - 30 + "px";
        this.$["inp_css"].style.height = v.height - 30 + "px";
//        this.$["variables_list"].style.height = v.height - 30 + "px";
    },



    // code

    getTitle: function() {
        return "Styles editor";
    },


    renderContent: function() {
        this.displayTpl(this.$["content"], "styles_editor");


        this.renderColorVariablesList();
        this.renderFontVariablesList();
    },




    // init menu/pages elements_list
    onShowContent: function() {
        if(this.skip_on_show_content) {
            this.skip_on_show_content = false;
            return;
        }
        this.refreshVariables();
        this.refresh();
    },


// data


    refresh: function() {
        this.active_element_key = false;

        this.$["inp_title"].value = core.values.styles_editor.title || "";
        this.$["inp_thumb"].setValue(core.values.styles_editor.thumb || "");
        this.renderElementsList();

        this.selectFirstElement();
    },


// elements list
    renderElementsList: function() {
        this.$["elements_list"].innerHTML = "";
        for(var element_key in core.values.styles_editor.data) {
            this.renderElement(element_key, core.values.styles_editor.element_classes[element_key]);
        }
    },



    renderElement: function(element_key, element_title) {
        this.buildModel(this.$.elements_list, {
            tag: "div", 
            className: "item nowrap",
            id: "element_" + element_key,
            events: { onclick: [ "onElementClick", element_key ] },
            innerHTML: element_title
        });
    },



    onElementClick: function(e, element_key) {
        this.selectElement(element_key);
    },




    selectFirstElement: function() {
        var first_element = false;
        for(var k in core.values.styles_editor.data) {
            first_element = k;
            break;
        }

        if(first_element) {
            this.showElement("btn_delete");
            this.selectElement(first_element);
        } else {
            this.hideElement("btn_delete");
        }
    },



    selectElement: function(element_key) {
        if(this.active_element_key == element_key) return;

        if(this.active_element_key) {
            this.processForm();
            this.$["element_" + this.active_element_key].className = "item nowrap";
        }

        this.active_element_key = element_key;
        this.$["element_" + this.active_element_key].className = "item nowrap active";

        this.$["inp_css"].value = core.values.styles_editor.data[element_key];
    },



    processForm: function() {
        if(this.active_element_key == null) return;
        core.values.styles_editor.data[this.active_element_key] = this.$["inp_css"].value;
    },





// interface
    onInputClick: function() {
        this.skip_on_show_content = true;
    },




// css variables
    renderFontVariablesList: function() {
        var list = [
            "main-font",
            "heading-font",
            "fancy-font"
        ];

        var m = [], v;
        for(var i=0; i<list.length; i++) {
            v = "[" + list[i] + "]";
            m.push(
                { tag: "span",
                  id: "font_" + list[i],
                  innerHTML: v,
                  events: { onclick: ["insertVariable", v] } }
            );
        }
        this.buildModel(this.$["fonts_list"], m);
    },


    renderColorVariablesList: function() {
        var labels = {
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
        };
        var m = [], v;
        for(var l in labels) {
            v = "[" + l + "]";
            m.push(
                { tag: "span",
                  innerHTML: v,
                  title: labels[l],
                  childs: [
                    { tag: "div", className: "color_preview",
                      id: "color_" + l }
                  ],
                  events: { onclick: ["insertVariable", v] } }
            );
        }
        this.buildModel(this.$["colors_list"], m);
    },



    insertVariable: function(e, variable_name) {
        e = core.browser.event.fix(e);
        e.target.blur();
        var el = this.$["inp_css"];
        if(document.all && document.selection) {          
            el.focus();
            var range = document.selection.createRange();
            if(typeof range.text == 'string')
                document.selection.createRange().text = document.selection.createRange().text + variable_name;
        } else {
            if(el.setSelectionRange) {
                var rangeStart = el.selectionStart;
                var rangeEnd = el.selectionEnd;
                var tempStr1 = el.value.substring(0,rangeStart);
                var tempStr2 = el.value.substring(rangeEnd);
                el.value = tempStr1 + variable_name + tempStr2;
            }
        }
        el.focus();
    },

    

    refreshVariables: function() {
        var el;
        var colors = core.data.site_version[core.data.layout_mode + "_colors"];
        for(var k in colors) {
            el = this.$["color_" + k];
            if(el) {
                el.style.background = "#" + colors[k];
            }
        }

        var fonts = core.data.site_version[core.data.layout_mode + "_fonts"];
        for(var k in fonts) {
            el = this.$["font_" + k];
            if(el) {
                el.style.fontFamily = fonts[k];
            }
        }
    },




// elements
    onAddElementClick: function() {
        desktop.modal_dialog.prompt("Enter CSS class", "", this.addElement.bind(this));
    },


    addElement: function(element_key) {
        element_key = element_key.trim();
        for(var k in core.values.styles_editor.element_classes) {
            if(core.values.styles_editor.element_classes[k] == element_key) {
                desktop.modal_dialog.alert("CSS class exists");
                return;
            }
        }

        core.values.styles_editor.data[element_key] = "";
        core.values.styles_editor.element_classes[element_key] = element_key;

        this.renderElement(element_key, element_key);
        this.selectElement(element_key);
    },



    onDeleteElementClick: function() {
        delete(core.values.styles_editor.data[this.active_element_key]);
        delete(core.values.styles_editor.element_classes[this.active_element_key]);        
        core.browser.element.remove(this.$["element_" + this.active_element_key]);
        this.active_element_key = null;
        this.selectFirstElement();
    },



// save & cancel

    onSaveClick: function() {
        desktop.hidePopupApp();
        if(core.values.styles_editor_callback) {
            this.processForm();
            core.values.styles_editor.title = this.$["inp_title"].value.trim();
            core.values.styles_editor.thumb = this.$["inp_thumb"].value;
            core.values.styles_editor_callback();
        }
    },


    onCloseClick: function() {
        desktop.hidePopupApp();
    }

};
core.apps.styles_editor.extendPrototype(core.components.html_component);
core.apps.styles_editor.extendPrototype(core.components.popup_app);