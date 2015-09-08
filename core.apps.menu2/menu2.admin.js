core.apps.menu2.extendPrototype({

    onFirstRun: function() {
        this.showSettings();
    },

    // settings

    settingsBlocks: [
        { title: "Select node:",
          controls: [
            { tag: "wsc_box",
              childs: [
                { tag: "div", className: "tree_view",
                  id: "tree",
                  style: { width: "auto", height: "150px" } }
              ]}
          ]}
    ],


    onSettingsRendered: function() {
        var menu_tree = [
            { id: "",
              title: "Root",
              childs: core.data.main_menu }
        ]
        this.renderNode(this.$["tree"], menu_tree);
        this.updateNodeClasses(core.data.main_menu);
        this.selected_node_id = null;
    },


    fillSettingsForm: function() {
        this.selectTreeItem(this.profile.node_id);
    },


    processSettingsForm: function() {
        this.profile.node_id = this.selected_node_id;
    },


    onSettingsUpdated: function() {
        this.refresh();
    },





    // menu tree

    selectTreeItem: function(id) {
        var oid = this.selected_node_id;
        if(oid != null && this.$["tree_item" + oid]) {
            this.$["tree_title" + oid].className = "";
        }
        if(this.$["tree_title" + id]) {
            this.$["tree_title" + id].className = "active";
            var title = id == "root" ? "" : this.$["tree_title" + id].innerHTML;
        }
        this.selected_node_id = id;
    },


    renderNode: function(pel, node) {
        var id = null;
        for(var i=0; i<node.length; i++) {
            if(node[i].published == 0) continue;
            var id = node[i].id;

            this.buildModel(pel,
                { tag: "div", className: "item",
                  id: "tree_item" + id,
                  childs: [
                    { tag: "div", className: "caption",
                      childs: [
                        { tag: "img", id: "tree_pic" + id,
                          events: { onclick: ["onPicClick", id ] } },
                        { tag: "a", id: "tree_title" + id,
                          className: this.profile.node_id == id ? "active" : "",
                          innerHTML: node[i].title,
                          href: "void",
                          events: { onclick: ["onSelectItem", id ] } }
                      ]},
                    { tag: "div", className: "childs",
                      isVisible: true,
                      id: "tree_childs" + id }
                  ]}
            );
            if(node[i].childs.length) {
                this.renderNode(this.$["tree_childs" + id], node[i].childs);
            }
        }
    },


    updateNodeClasses: function(node) {
        for(var i=0; i<node.length; i++) {
            if(node[i].published == 0) continue;
            var picSrc = "";
            var childsBg = false;
            if(node[i].childs.length) {
                picSrc = "minus";
                this.updateNodeClasses(node[i].childs);
                childsBg = "line1";
            } else {
                picSrc = "line";
            }

            if(i == node.length - 1) {
                childsBg = "";
                picSrc += "2";
            } else {
                picSrc += "3";
            }
            this.$["tree_pic" + node[i].id].src = "/static/menu_editor/" + picSrc + ".gif";
            this.$["tree_childs" + node[i].id].style.background = childsBg ? "url(/static/menu_editor/" + childsBg + ".gif) repeat-y" : "";
        }
    },


    onPicClick: function(e, id) {
        var c = this.$["tree_childs" + id];
        c.style.display = c.isVisible ? "none" : "block";

        var src = this.$["tree_pic" + id].src;
        if(c.isVisible) {
            this.$["tree_pic" + id].src = src.replace("minus", "plus");
        } else {
            this.$["tree_pic" + id].src = src.replace("plus", "minus");
        }
        c.isVisible = !c.isVisible;
    },



    onSelectItem: function(e, id) {
        this.selectTreeItem(id);
    }


});