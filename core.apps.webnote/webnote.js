core.apps.webnote = function(args) {

    this.defaultProfile = {
        title: "",
        app_style: "",
        show_date: 0,
        show_author: 0,
        webnote_content_type: '0',
        text_id: null,
        hide_more: 0,
        hide_delay: "5",
        hide_user: 0,
        hide_timer: 0
    }


}

core.apps.webnote.prototype = {


    buildContent: function(el) {
        this.buildModel(el, [
            { tag: "div", 
              display: false,
              className: "summary_box",
              id: "summary_box" },

            { tag: "div",
              display: false,
              id: "link_more",
              className: "link_more_box",
              childs: [
                { tag: "a", innerHTML: "more...",
                  events: { onclick: "onMoreClick" }}
              ]},

            { tag: "div", 
              display: false,
              className: "content_box",
              id: "content_box" },

           { tag:"a", className: "webnote_btn_close", id: "btn_close",
             events: { onclick: "onBtnCloseClick" },
             display: false
            },

            { tag:"div", id: this.id,
                display: false
            },

            { tag: "div", id: "date_box",
              className: "date_box",
              display: false,
              innerHTML: "Posted on: ",
              childs: [
                { tag: "span", id: "date" }
              ]},

            { tag: "div", id: "author_box",
              className: "author_box",
              display: false,
              innerHTML: "Posted by: ",
              childs: [
                { tag: "span", id: "author" }
              ]}
        ]);
        this.callFunction("initAdmin");
        this.callFunction("initContributor");
    },


    onOpen: function() {
        this.setTitle(this.profile["title"]);
        this.refresh();
    },



    refresh: function() {
        if(this.profile["text_id"]) {
            core.data.texts.get(this.profile["text_id"], this.setContent.bind(this));
        } else {
            this.setContent(null);
        }
    },


    setContent: function(text) {
        if(this.profile["text_id"] != null) {
            var data = text;
        } else if(core.usertype >= USERTYPE_ADMIN) {
            var data = {
                summary: "Click here to select document",
                content: "Click here to select document"
            }
        } else {
            var data = {
                summary: "",
                content: ""
            }
        }

        if(this.profile["show_date"] && data.modified) {
            this.showElement("date_box");
            var d = new Date(data.modified * 1000);
            this.$["date"].innerHTML = d.format("l d M Y");
        } else {
            this.hideElement("date_box");
        }

        if(this.profile["hide_user"]==1) {
            this.showElement("btn_close");
        }

        if(this.profile["hide_timer"]==1) {
            this.onDelayTimeOut(this.id,this.profile["hide_delay"]);
        }

        if(this.profile["show_author"] && data.author) {
            this.showElement("author_box");
            this.$["author"].innerHTML = data.author;
        } else {
            this.hideElement("author_box");
        }

        if(this.profile["webnote_content_type"] == 0) {
            this.hideElements(["summary_box", "link_more"]);
            this.showElement("content_box");
        } else {
            this.showElement("summary_box");
            if(this.profile["hide_more"]) {
                this.hideElement("link_more");
            } else {
                this.showElement("link_more");
            }
            this.hideElement("content_box");
        }
        this.$["summary_box"].innerHTML = data.summary;
        this.$["content_box"].innerHTML = data.content;
    },



    onMoreClick: function(e) {
        this.hideElements(["link_more", "summary_box"]);
        this.showElement("content_box");
    },

     getParentByClassName:function (el,className){
         if(el.className === className){
             return el;
         }else{
             return this.getParentByClassName(el.parentNode,className);
         }
     },

    onBtnCloseClick: function(e){
        if(this.profile["hide_user"]!=1) return false;
        var parent = this.getParentByClassName(e.target,'app_mc');
        parent.style.display = "none";
    },

    onDelayTimeOut: function(id,time){
        if(core.usertype != USERTYPE_ADMIN){
            window.setTimeout(function(first){
                var currentElement = document.getElementById(first);
                var parent = core.apps.webnote.prototype.getParentByClassName(currentElement,'app_mc');
                parent.style.display = "none";
            },time*1000,this.id);
        }

    }


}
core.apps.webnote.extendPrototype(core.components.html_component);
core.apps.webnote.extendPrototype(core.components.desktop_app);