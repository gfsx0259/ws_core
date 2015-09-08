core.apps.page_title = function(args) {

    this.defaultProfile = {
        title: "",
        app_style: "",
        content: "%MENU-NAME%"
    }

}

core.apps.page_title.prototype = {


    onOpen: function() {
        this.setTitle(this.profile["title"]);
        this.refresh();
    },

    refresh: function() {
        var s = this.profile["content"];

        var mi = core.data.main_menu_item || this.findItem();

        if(mi) {
            s = s.replace("%MENU-NAME%", mi.title);
            s = s.replace("%MENU-BYLINE%", mi.hint);
        } else {
            s = s.replace("%MENU-NAME%", "");
            s = s.replace("%MENU-BYLINE%", "");
        }
        s = s.replace("%PAGE-TITLE%", core.data.page_title);
        this.$["content"].innerHTML = "<h1>" + s + "</h1>";
    },



    findItem: function(node) {
        if(!node) node = core.data.main_menu;
        var res = null;
        for(var i=0; i<node.length; i++) {
            if(node[i].url == core.data.page_file) {
                res = node[i];
            } else {
                res = this.findItem(node[i].childs);
            }
            if(res) return res;
        }
        return null;
    }

}
core.apps.page_title.extendPrototype(core.components.html_component);
core.apps.page_title.extendPrototype(core.components.desktop_app);