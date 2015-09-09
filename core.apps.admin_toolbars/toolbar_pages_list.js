if(!core.data.main_menu) {
    core.data.main_menu = [];
}

core.apps.admin_toolbar_pages_list = function() {};

core.apps.admin_toolbar_pages_list.prototype = {

    template: "admin_toolbar_window_list",
    resize_height_element: "pages_list",


    renderContent: function() {
        this.setTitle("Pages");
        this.displayTpl(this.$["content"], "admin_toolbar_pages_list");

        this.initLastId();
        this.extendMenuData();
        this.renderTree();
    },




    // tree
    renderTree: function() {
        this.$["pages_list"].innerHTML = "";
        this.renderNode(this.$["pages_list"], core.data.main_menu, 0);
    },
    


    renderNode: function(pel, node, node_depth) {
        var id = null;
        for(var i=0; i<node.length; i++) {
            var id = node[i].id;

            this.buildModel(pel,
                { tag: "div", className: "item",
                  id: "item" + id,
                  node_depth: node_depth,
                  pages_list_item_id: id,
                  childs: [
                    { tag: "a",
                      id: "link" + id,
                      events: { 
                        onmouseover: ["onItemMouseOver", id],
                        onmouseout: ["onItemMouseOut", id],
                        onclick: ["onItemClick", id]
                      },
                      childs: [
                        { tag: "span", 
                          className: "nowrap item_title" + (node[i].url == core.data.page_file ? " active" : ""),
                          id: "item_title" + id,
                          style: { paddingLeft: node_depth * 10 + "px" },
                          childs: [
                            { tag: "img", src: "/vendor/generdyn/core/images/page_icons/" + node[i].type + ".png" },
                            { tag: "span", 
                              id: "title" + id,
                              innerHTML: node[i].title }
                          ]}
                      ]},
                    { tag: "div", className: "childs",
                      id: "childs" + id }
                  ]}
            );
            if(node[i].childs.length) {
                this.renderNode(this.$["childs" + id], node[i].childs, node_depth + 1);
            }
        }
    },





// item events

    onItemMouseOver: function(e, id) {
        if(this.drag_item) return;

        if(!this.$["page_control"]) {
            this.displayTpl(document.body, "admin_toolbar_pages_controls");
        }
        this.$["link" + id].appendChild(this.$["page_control"]);
        this.$["link" + id].appendChild(this.$["drag_control"]);
        this.showElements(["page_control", "drag_control"]);
        this.active_item_id = id;
    },


    onItemMouseOut: function(e, id) {
        e = core.browser.event.fix(e);
        var el = e.toElement, link_el = this.$["link" + id];
        while(el && el.parentNode) {
            el = el.parentNode;
            if(el == link_el) return;
        }
        this.hideItemControls();
    },


    hideItemControls: function() {
        this.active_item_id = null;
        this.hideElements(["page_control", "drag_control"]);
        document.body.appendChild(this.$["page_control"]);
        document.body.appendChild(this.$["drag_control"]);
    },



    onItemClick: function(e, id) {
        var url, mi = this.findItem(id);
        switch(mi.type) {
            case "std":
                url = "/" + mi.url + ".html";
                break;
            case "external":
                url = mi.url;
                break;
        }
        desktop.loadURL(url);
    },





// drag&drop
    startItemDrag: function(e) {
        e = core.browser.event.fix(e);
        core.browser.event.stopPropagation(e);
        core.browser.event.preventDefault(e);

        this.drag_target_item_id = false;
        this.drag_item = this.findItem(this.active_item_id);
        if(this.drag_item.url == "index") return;

        // calculate content height
        this.list_content_height = 0;
        for(var i=0; i<this.$.pages_list.childNodes.length; i++) {
            this.list_content_height += this.$.pages_list.childNodes[i].offsetHeight;
        }
        this.list_pos = core.browser.element.getPosition(this.$.pages_list);
        if(this.list_pos.height < this.list_content_height) {
            this.autoscroll_interval = setInterval(this.autoscrollList.bind(this), 10);
        }


        // init drag
        this.$.pages_list.className = "pages_list drag_zone";
        this.hideItemControls();


        this.drag_el = this.$["item" + this.drag_item.id];
        this.buildModel(this.drag_el,
            { tag: "div", className: "item_overlay" }
        );

        core.browser.event.push(document, ["onmousemove", "onmouseup"]);
        document.onmousemove = this.processItemDrag.bindAsEventListener(this);
        document.onmouseup = this.stopItemDrag.bindAsEventListener(this);
    },



    updateDragItemPaddings: function(padding, node) {
        if(!node) { 
            node = this.drag_item;
        }
        this.$["item_title" + node.id].style.paddingLeft = 10 * padding + "px";
        if(node.childs) {
            for(var i=0; i<node.childs.length; i++) {
                this.updateDragItemPaddings(padding + 1, node.childs[i]);
            }
        }
    },


    autoscrollList: function() {
        if(this.autoscroll_dir == "up") {
            this.$.pages_list.scrollTop -= 1;
        } else if(this.autoscroll_dir == "down") {
            this.$.pages_list.scrollTop += 1;
        }
    },


    processItemDrag: function(e) {
        core.browser.event.fix(e);

        var t = e.target, hover_item_el = false;
        while(t && t != this.$.pages_list) {
            if(t == this.drag_el) return;
            if(!hover_item_el && t.pages_list_item_id) {
                hover_item_el = t;
            }
            t = t.parentNode;
        }

        var prev_el, padding;
        
        if(hover_item_el) {
            var pos = core.browser.element.getPosition(hover_item_el.firstChild);
            if(e.clientY < pos.top + 0.5 * pos.height) {
                this.drop_mode = "child";
                prev_el = this.$["childs" + hover_item_el.pages_list_item_id];
                this.updateDragItemPaddings(hover_item_el.node_depth + 1);
            } else {
                this.drop_mode = "next";
                prev_el = this.$["item" + hover_item_el.pages_list_item_id];
                this.updateDragItemPaddings(hover_item_el.node_depth);
            }

            if(prev_el.nextSibling != this.drag_el) {
                core.browser.element.insertAfter(this.drag_el, prev_el);
            }
            this.drag_target_item_id = hover_item_el.pages_list_item_id;
        }


        if(e.clientX >= this.list_pos.left && e.clientX <= this.list_pos.left + this.list_pos.width) {
            if(e.clientY < this.list_pos.top) {
                this.autoscroll_dir = "up";
            } else if(e.clientY > this.list_pos.top + this.list_pos.height) {
                this.autoscroll_dir = "down";
            } else {
                this.autoscroll_dir = false;
            }
        }
    },




    stopItemDrag: function(e) {
        clearInterval(this.autoscroll_interval);

        core.browser.event.stopPropagation(e);
        core.browser.event.preventDefault(e);

        this.$["pages_list"].className = "pages_list";

        core.browser.event.pop();

        core.browser.element.remove(this.drag_el);
        if(this.drag_target_item_id) {
            switch(this.drop_mode) {
                case "next":
                    var target_item_place = this.findItemPlace(this.drag_target_item_id);
                    var p = this.findItemPlace(this.drag_item.id);
                    var drag_item_clone = clone(p.node[p.idx]);
                    p.node.splice(p.idx, 1);
                    target_item_place.node.splice(target_item_place.idx + 1, 0, drag_item_clone);
                    break;
                case "child":
                    var target_item = this.findItem(this.drag_target_item_id);
                    var p = this.findItemPlace(this.drag_item.id);
                    var drag_item_clone = clone(p.node[p.idx]);
                    p.node.splice(p.idx, 1);
                    target_item.childs.push(drag_item_clone);
                    break;
            }


            var p = {
                dialog: "pages_manager",
                act: "save_menu_struct",
                menu_data: varToString(core.data.main_menu)
            };
            desktop.setState("loading");
            core.transport.send("/controller.php", p, this.onServerResponse.bind(this), "POST");
        }
        this.renderTree();

        this.drag_target_item_id = null;
        this.drag_item = null;
    },




// item controls

    onCloneItemClick: function(e) {
        core.browser.event.kill(e);
        this.cloneItem(this.active_item_id);
        this.hideItemControls();
    },


    onEditItemClick: function(e) {
        core.browser.event.kill(e);
        this.editItem(this.active_item_id);
        this.hideItemControls();
    },


    onDeleteItemClick: function(e) {
        core.browser.event.kill(e);
        this.deleteItem(this.active_item_id);
        this.hideItemControls();
    },




// add item

    onAddItemClick: function() {
        this.addItem("std");
    },
    



// items data

    findItem: function(id, node, level) {
        if(!level) level = 0;
        if(!node) node = core.data.main_menu;
        var res = null;
        for(var i=0; i<node.length; i++) {
            if(node[i].id == id) {
                res = node[i];
                res["level"] = level;
            } else {
                res = this.findItem(id, node[i].childs, level + 1);
            }
            if(res) return res;
        }
        return null;
    },


    findItemPlace: function(id, parent) {
        var node = parent ? parent.childs : core.data.main_menu;
        var res = null;
        for(var i=0; i<node.length; i++) {
            if(node[i].id == id) {
                res = { node: node, idx: i, parent: parent };
            } else {
                res = this.findItemPlace(id, node[i]);
            }
            if(res) return res;
        }
        return null;
    },



    editItem: function(id) {
        this.item_position = this.findItemPlace(id);
        var page_data = this.getPageData(this.item_position.node[this.item_position.idx].url);
        this.openItemEditor(this.item_position.node[this.item_position.idx], page_data);
        this.edit_item_act = "edit";
    },




    cloneItem: function(id) {
        this.item_position = this.findItemPlace(id);
        menu_item_data = clone(this.item_position.node[this.item_position.idx]);
        menu_item_data.id = this.getNewId();

        menu_item_data.childs = [];
//        this.updateClonedItemData(menu_item_data.childs);
        menu_item_data.title += " " + menu_item_data.id;
        
        var page_data = this.getPageData(menu_item_data.url);
        page_data = clone(page_data);
        page_data.src_page_id = page_data.id;
        delete(page_data.id);
        if(page_data.url == "index") {
            var tmp = this.getMenuItemDataDefault(menu_item_data.type);
            page_data.url = tmp.url;
            menu_item_data.url = tmp.url;
        }


        this.edit_item_act = "clone";
        this.openItemEditor(menu_item_data, page_data);
    },


/*
    updateClonedItemData: function(node) {
        if(!node || !node.length) return;
        for(var i=0; i<node.length; i++) {
            node[i].id = this.getNewId();
            this.updateClonedItemData(node[i].childs);
        }
    },
*/


    addItem: function(type) {
        this.edit_item_act = "add";
        /*
        var menu_item_data = this.getMenuItemDataDefault(type);
        var page_data = this.getPageDataDefault(type);
        page_data.url = menu_item_data.url;
        page_data.meta_title = menu_item_data.title;
        */
        this.openItemEditor(false, false);
    },




    openItemEditor: function(menu_item_data, page_data) {
        core.values.page_settings = {
            menu_item_data: menu_item_data,
            page_data: page_data,
            callback: this.onItemEdited.bind(this)
        };
        desktop.showPopupApp("page_settings");
    },


    

    onItemEdited: function(menu_item_data, page_data) {
        switch(this.edit_item_act) {
            case "add":
                core.data.main_menu.push(menu_item_data);
                break;
            case "clone":
                this.item_position.node.splice(this.item_position.idx + 1, 0, menu_item_data);
                break;
            case "edit":
                break;
        }

        this.load_url = "/";
        if(menu_item_data.type == "std") {
            this.load_url += menu_item_data.url + ".html";
        }


        var p = {
            dialog: "pages_manager",
            act: this.edit_item_act,
            type: menu_item_data.type,
            page_data: varToString(page_data),
            menu_data: varToString(core.data.main_menu)
        };                    

        desktop.setState("loading");
        core.transport.send("/controller.php", p, this.onServerResponse.bind(this), "POST");
    },



    deleteItem: function(id) {
        var mi = this.findItem(id);
        if(!mi) return;

        if(mi.url == "index") {
            desktop.modal_dialog.alert("You can't delete home page");
            return;
        }
        var t = "Delete page " + mi.title + " ?";

        desktop.modal_dialog.confirm(t, this.deleteItemRequest.bind(this, id, mi));
    },


    deleteItemRequest: function(id, mi) {
        var urls = this.collectItemUrls(mi);
        var ids = [], page_data;
        for(var i=0; i<urls.length; i++) {
            page_data = this.getPageData(urls[i]);
            if(page_data) {
                ids.push(page_data.id)
            }
        }

        var p = this.findItemPlace(id);
        p.node.splice(p.idx, 1);

        this.renderTree();
        var p = {
            dialog: "pages_manager",
            act: "delete",
            page_ids: ids.join(";"),
            menu_data: varToString(core.data.main_menu)
        };
        desktop.setState("loading");
        if(mi.url == core.data.page_file) {
            this.load_url = "/";
        }
        core.transport.send("/controller.php", p, this.onServerResponse.bind(this), "POST");
    },



    collectItemUrls: function(mi) {
        var res = [];
        if(mi.type == "std") {
            res.push(mi.url);
        }
        if(mi.childs && mi.childs.length) {
            for(var i=0; i<mi.childs.length; i++) {
                res = res.concat(this.collectItemUrls(mi.childs[i]));
            }
        }
        return res;
    },



    onServerResponse: function(r) {
        if(!r || r.status != "ok") {
            desktop.modal_dialog.alert("Server error");
            return;
        }
        if(this.load_url) {
            desktop.loadURL(this.load_url);
        } else {
            desktop.loadURL(location.href);
        }
    },



// stuff


    getNewId: function() {
        return ++this.last_id;
    },



    initLastId: function(node) {
        if(!node) {
            this.last_id = 1;
            node = core.data.main_menu;
            this.used_ids = {};
        }
        var id;
        for(var i=0; i<node.length; i++) {
            id = node[i].id;
            if(this.used_ids[id]) {
                this.used_ids[id]++;
            } else {
                this.used_ids[id] = 1;
            }

            if(id > this.last_id) {
                this.last_id = id;
            }
            this.initLastId(node[i].childs);
        }
    },



    extendMenuData: function(node) {
        if(!node) {
            node = core.data.main_menu;
        }

        var page;

        for(var i=0; i<node.length; i++) {
            // check id
            if(this.used_ids[node[i].id] > 1) {
                node[i].id = this.getNewId();
            }
            this.extendMenuData(node[i].childs);
        }
    },




    getHomePageId: function() {
        for(var i=0; i<core.data.pages_list.length; i++) {
            var p = core.data.pages_list[i];
            if(p.url == "index") return p.id;
        }
        return false;
    },




    getPageData: function(url) {
        if(!this.url2page) {
            this.url2page = {};
            for(var i=0; i<core.data.pages_list.length; i++) {
                this.url2page[core.data.pages_list[i].url] = core.data.pages_list[i];
            }
        }
        return this.url2page[url];
        /*
        for(var i=0; i<core.data.pages_list.length; i++) {
            var p = core.data.pages_list[i];
            if(p.url == url) {
                return p;
            }
        }
        */
    },



// default item values
    getPageDataDefault: function(type) {
        var res = {
            type: type
        };
        if(type != "external") {
            if(core.data.pages_list.length > 0) {
                var home_page_id = this.getHomePageId();
                if(home_page_id) {
                    res.header_row_page_id = home_page_id;
                    res.footer_row_page_id = home_page_id;
                }
            } else {
                res.header_row_page_id = "new";
                res.footer_row_page_id = "new";
            }
        }
        return res;
    },



    getMenuItemDataDefault: function(type) {
        var res = this.default_menu_item_data[type];
        res.type = type;
        res.childs = [];
        res.id = this.getNewId();

        if(type != "external") {
            if(core.data.pages_list.length == 0) {
                res.url = "index";
                res.title = "Home";
            } else if(type == "std") {
                res.url += " " + res.id;
                res.title += " " + res.id;
            }
        }
        return res;
    },



    default_menu_item_data: {
        std: {
            title: "Page", 
            hint: "",
            url: "page", 
            blank_page: 0,
            published: 1,
            visible: "1",
            footer_link: ""

        },

        external: {
            title: "Link",
            hint: "",
            url: "http://",
            blank_page: 0,
            visible: "1",
            footer_link: ""
        }
    }


};
core.apps.admin_toolbar_pages_list.extendPrototype(core.objects.admin_toolbar);
core.apps.admin_toolbar_pages_list.extendPrototype(core.components.html_component);