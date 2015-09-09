core.apps.admin_toolbar_text_editor = function() {};

core.apps.admin_toolbar_text_editor.prototype = {

    template: "admin_toolbar_window_buttons",


    renderContent: function() {
        this.setTitle("Settings");
        this.displayTpl(this.$["content"], "admin_toolbar_text_editor");
    },


    onTextEditorSaveClick: function(e) {
        if(this.text_editor_tmp_html != this.text_editor_element.innerHTML) {
            this.text_editor_onchange();
        }
        this.text_editor_tmp_html = "";
        this.stopTextEditor();
    },


    onTextEditorAdvancedClick: function(e) {
        this.stopTextEditor();
        var p = {
            open_advanced_editor: true
        };
        this.text_editor_onchange(p);
    },



    onTextEditorHTMLClick: function(e) {
        this.stopTextEditor();
        var p = {
            open_advanced_editor: true,
            edit_html: true
        };
        this.text_editor_onchange(p);
    },


    startTextEditor: function(args) {
        if(this.text_editor_element == args.element) return;
        this.text_editor_element = args.element;
        this.text_editor_onchange = args.onchange;

        if(!this.text_editor) {
            this.text_editor = new core.objects.text_editor({
                toolbar_element: this.$["buttons"]
            });
        }

        var el_pos = core.browser.element.getPosition(args.element);
        var scroll = core.browser.getScroll();
        var pos = {
            top: el_pos.top - scroll.top - this.$["window"].offsetHeight - 4,
            left: el_pos.left - scroll.left
        };
        this.setState(pos);
        this.updatePosition();

        this.text_editor.addEditor(args.element);
        this.text_editor_tmp_html = args.element.innerHTML;

        core.browser.event.push(desktop.$["document_wrapper"], [ "onclick" ]);
        desktop.$["document_wrapper"].onclick = this.onTextEditorDocWrapperClick.bind(this);
    },



    stopTextEditor: function(e) {
        if(this.text_editor_element) {
            core.browser.event.pop();
            this.text_editor_element = false;
            this.text_editor.removeEditor(this.text_editor_element);
            this.hide();
        }
    },



    onTextEditorDocWrapperClick: function(e) {
        e = core.browser.event.fix(e);
        var el = e.target;
        do {
            if(el == this.text_editor_element) return;
        } while(el = el.parentNode);
        this.onTextEditorSaveClick();
    },



    hide: function(e) {
        this.hideElement("window");
    }

};
core.apps.admin_toolbar_text_editor.extendPrototype(core.objects.admin_toolbar);
core.apps.admin_toolbar_text_editor.extendPrototype(core.components.html_component);