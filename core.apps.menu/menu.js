core.apps.menu = function(args) {

    this.defaultProfile = {
        title: "",
        app_style: "",
        buttton_text: "Menu"
    }

}


core.apps.menu.prototype = {


    onOpen: function() {
        this.setTitle(this.profile["title"]);

        if(core.data.layout_mode == "pc") {
            this.initPC();
        } else {
            this.initMobile();
        }
    },




    onAppStyleChanged: function() {
        if(this.$["submenus_wrapper"]) {
            this.$["submenus_wrapper"].className = this.getAppStyleSelector();
        }
    },




    initPC: function() {
        this.buildModel(
            document.body, 
            { tag: "div", id: "submenus_wrapper",
              className: this.getAppStyleSelector() }
        );


        var menu = $("site_menu").cloneNode(true);
        menu.id = "menu" + this.id;
        menu.style.position = "relative";
        menu.style.left = "auto";
        menu.style.top = "auto";
        menu.style.width = "auto";
        menu.style.display = "block";

        this.active_submenu = null;

        var ul = menu.childNodes[0];
        var item_num = 0;
        if(ul && ul.childNodes.length > 1) {
            for(var i=0; i<ul.childNodes.length; i++) {
                var li = ul.childNodes[i];
                var submenu = li.childNodes[1];
                if(!submenu) continue;
                submenu.id = this.id + item_num;

//                var key = "submenu" + item_num;
                this.$["submenu" + item_num] = submenu;
                this.$["item" + item_num] = li;
                core.browser.event.attach(li, "onmouseover", this._showSubmenu.bindAsEventListener(this, item_num));
                core.browser.event.attach(li, "onmouseout", this._hideSubmenu.bindAsEventListener(this, item_num));

                core.browser.event.attach(submenu, "onmouseover", this._showSubmenu.bindAsEventListener(this, item_num));
                core.browser.event.attach(submenu, "onmouseout", this._hideSubmenu.bindAsEventListener(this, item_num));

                item_num++;
            }
        }

        this.$["content"].appendChild(menu);
//        menu.style.height = menu.firstChild.offsetHeight + "px";
//        this.$["content"].style.overflow = "visible";
//        this.$["window"].style.zIndex = 100;
        this.submenu_pos_fixed = {};
    },






    _showSubmenu: function(e, idx) {
        //IE workaraund related to site_menu widget
        core.values.menu_widget_hover = true;

        clearTimeout(this.timeout);
        if(this.active_submenu != null && this.active_submenu != idx) {
            this.hideElement("submenu" + this.active_submenu);
            this.active_submenu = null;
        }
        var key = "submenu" + idx;
        if(this.$[key]) {
            this.setElementOpacity(key, 100);
            this.showElement(key);
            if(!this.submenu_pos_fixed[key]) {
                this.submenu_pos_fixed[key] = true;
                this.$["submenus_wrapper"].appendChild(this.$[key]);
//                document.body.appendChild(this.$[key]);
                this.$[key].className += " site_menu_dropdown";
                this.$[key].style.zIndex = 100;
                this.$[key].style.position = "absolute";
            }
            if(core.data.site_info.theme2_id != 0) {
                var pos = core.browser.element.getPosition(this.$["item" + idx].firstChild);
                pos.top = pos.top + pos.height;
                delete(pos.height);
                delete(pos.width);
            } else {
                var pos = core.browser.element.getPosition(this.$[key]);
            }
            core.browser.element.setPosition(this.$[key], pos);

            this.active_submenu = idx;
        }
    },



    _hideSubmenu: function(e) {
        this.timeout = setTimeout(this._hideSubmenuEl.bind(this), 300);
    },


    _hideSubmenuEl: function() {
        if(this.active_submenu != null) {
            this.fxValue = 5;
            this._fadeOut();
        }
    },


    _fadeOut: function() {
        var key = "submenu" + this.active_submenu;
        if(this.fxValue <= 0) {
            this.hideElement(key);
            this.active_submenu = null;
        } else {
            this.fxValue--;
            this.setElementOpacity(key, this.fxValue * 20);
            this.timeout = setTimeout(this._fadeOut.bind(this), 30);
        }
    },



    _showSubSubmenu: function(e, idx) {
        this.showElement("submenu" + idx);
    },

    _hideSubSubmenu: function(e, idx) {
        this.hideElement("submenu" + idx);
    },







    initMobile: function() {
        var menu = $("site_menu").cloneNode(true);
        menu.style.display = "";
        var ul = menu.childNodes[0];
        if(ul && ul.childNodes.length > 1) {
            for(var i=0; i<ul.childNodes.length; i++) {
                var li = ul.childNodes[i];
                var submenu = li.childNodes[1];
                if(submenu) {
                    submenu.style.display = "";
                }
            }
        }

        this.buildModel(this.$.content, [
            { tag: "div",
              className: "button_box",
              childs: [
                { tag: "button",
                  id: "button",
                  events: { onclick: "toggleMobileMenu" },
                  innerHTML: this.profile.buttton_text }
              ]},
            { tag: "div", 
              display: false,
              id: "mobile_menu" }
        ]);
        this.mobile_menu_visible = false;

        
        this.$["mobile_menu"].appendChild(menu);
    },


    toggleMobileMenu: function() {
        this.mobile_menu_visible = !this.mobile_menu_visible;
        this.setElementVisible("mobile_menu", this.mobile_menu_visible);
    }

}
core.apps.menu.extendPrototype(core.components.html_component);
core.apps.menu.extendPrototype(core.components.desktop_app);