core.apps.text_editor = function(args) {

}


core.apps.text_editor.prototype = {

    window_resize: {
        min_height: 1,
        hmargin: 210,
        min_width: 808,
        target: "tabs_content"
    },


    onResize: function(v) {
        if(this.editor) {
            var h = this.$.tabs_content.offsetHeight;
            this.editor.body.setHeight(h);
            this.editor.summary.setHeight(h);
        }
    },


    onHideContent: function() {
//        this.editor.body.hide();
//        this.editor.summary.hide();
    },



    onContentVisible: function() {
        this.onResize();
    },



    getTitle: function() {
        return "Text editor";
    },



    onDocCalSelected: function(cal) {
        var d = cal.date;
        var el = this.$["doc_date"];
        el.value = d.format();
        el.time = d.getUnixTime();
    },


    onAutoGenrate: function() {
        var p = {
            dialog: "wordcount",
            act: "parse",
            content: this.editor.body.getHTML() + this.editor.summary.getHTML()
        };
        core.transport.send("/controller.php", p, this.onSetTags.bind(this), "POST");
    },


    onSetTags:function(wordcount){
        var tagCounter=0;
        this.$["inp_doc_tags"].value="";
        for(var t in wordcount)
        {
            if(tagCounter>=10)
                break;
            if(this.$["inp_doc_tags"].value=='')
                this.$["inp_doc_tags"].value=t;
            else
                this.$["inp_doc_tags"].value+=","+t;
            tagCounter++;
        }
    },



    renderContent: function() {
        this.displayTpl(this.$["content"], "text_editor");
        this.editor = {
            body: new core.objects.text_editor_ex({parent_el: this.$.editor_body}),
            summary: new core.objects.text_editor_ex({parent_el: this.$.editor_summary})
        }

        this.tabs = new core.objects.tabs({
            parent_el: this.$.tabs,
            callback: this.onTabSelected.bind(this),
            tabs: [
                "Main body",
                "Summary",
                "Extra"
            ]
        });

        core.externals.datepicker({
            button: this.$["btn_doc_calendar"],
            showsTime: false,
            singleClick: true,
            onUpdate: this.onDocCalSelected.bind(this)
        });
    },




    onTabSelected: function(idx) {
        var keys = ["editor_body", "editor_summary", "extra"];
        this.hideElements(keys);
        this.showElement(keys[idx]);
        if(this.editor) {
            if(idx == 0) {
                this.editor.body.updateContentHeight();
            } else if(idx == 1) {
                this.editor.summary.updateContentHeight();
            }
        }
    },




    setData: function(doc, options) {
        this.initial_doc = doc;

        if(!options) options = {}

        this.editor.body.hide();
        this.editor.body.setHTML(doc.content);
        this.editor.body.initHistory();
        if(options.edit_html) {
            this.editor.body.setHTMLMode();
        } else {
            this.editor.body.setWYZMode();
        }

        this.editor.summary.hide();
        this.editor.summary.setHTML(doc.summary);
        this.editor.summary.initHistory();
        if(options.edit_html) {
            this.editor.summary.setHTMLMode();
        } else {
            this.editor.summary.setWYZMode();
        }


        this.setTitle(doc.title);
        this.doc_title = doc.title;


        var el = this.$["doc_date"];
        var d = doc.modified ? new Date(doc.modified * 1000) : new Date();
        el.time = d.getUnixTime();
        el.value = d.format();
        this.$["inp_doc_author"].value = doc.author || "";
        this.$["inp_doc_tags"].value = doc.tags || "";

        if(!options) options = {}
        if(options.tab == "content") {
            this.tabs.selectTab(0);
        } else if(options.tab == "summary") {
            this.tabs.selectTab(1);            
        }
    },




    isChanged: function() {
        return 
            this.editor.body.is_changed || 
            this.editor.summary.is_changed ||
            this.initial_doc.tags != this.$["inp_doc_tags"].value.trim() ||
            this.initial_doc.author != this.$["inp_doc_tags"].value.trim() ||
            this.initial_doc.modified != this.$["doc_date"].time;
    },  


    // buttons clicks

    onSaveClick: function(e) {
        desktop.hidePopupApp();
        if(!this.onsave) return;

        var doc = {
            title: this.doc_title,
            content: this.editor.body.getHTML(),
            summary: this.editor.summary.getHTML(),
            tags: this.$["inp_doc_tags"].value.trim(),
            modified: this.$["doc_date"].time,
            author: this.$["inp_doc_author"].value.trim()
        }
        this.onsave(doc);
    },


    onCancelClick: function(e) {
        desktop.hidePopupApp();
    }


}
core.apps.text_editor.extendPrototype(core.components.html_component);
core.apps.text_editor.extendPrototype(core.components.popup_app);