core.apps.site_menu = function(args) {

    this.active_submenu = null;
    this.$ = {};

    var item_num = 0;

    // main menu
    var ul = desktop.$["site_menu"].childNodes[0];
    if(ul && ul.childNodes.length > 1) {
        var max_width = ul.offsetWidth;
        var w = 0;
        var extra_ofs = 0;
        for(var i=0; i<ul.childNodes.length; i++) {
            var li = ul.childNodes[i];

            if(w < max_width) {
                extra_ofs = i;
                w += li.offsetWidth;
            } else {
                var is_need_extra = true;
            }

            var key = "site_submenu" + item_num;
            this.$[key] = document.getElementById(key);
            if(this.$[key]) {
                core.browser.event.attach(li, "onmouseover", this._showSubmenu.bindAsEventListener(this, item_num));
                core.browser.event.attach(li, "onmouseout", this._hideSubmenu.bindAsEventListener(this, item_num));
            }
            item_num++;
        }
    }


    // body menu
    var ul = $("body_menu").childNodes[0];
    if(ul && ul.childNodes.length > 1) {
        for(var i=0; i<ul.childNodes.length; i++) {
            var li = ul.childNodes[i];
            var key = "site_submenu" + item_num;
            this.$[key] = document.getElementById(key);
            if(this.$[key]) {
                core.browser.event.attach(li, "onmouseover", this._showSubmenu.bindAsEventListener(this, item_num));
                core.browser.event.attach(li, "onmouseout", this._hideSubmenu.bindAsEventListener(this, item_num));
            }
            item_num++;
        }
    }



    // main menu extra items
    if(core.values.skip_menu_extra) return;

    if(is_need_extra) {
        item_num++;
        var extra_sub_id = "site_submenu" + item_num;
        this.buildModel(ul,
            { tag: "li",
              events: {
                onmouseover: [ "_showSubmenu", item_num ],
                onmouseout: [ "_hideSubmenu", item_num ]
              },
              childs: [
                { tag: "a", innerHTML: "&gt;&gt;",
                  href: "void" },
                { tag: "div", className: "submenu",
                  display: false,
                  id: extra_sub_id }
              ]}
        );

        var last_num = ul.childNodes.length - 1;
        for(var i=extra_ofs; i<last_num; i++) {
            var li = ul.childNodes[extra_ofs];
            var mi = li.childNodes[0];
            var mi_sub = li.childNodes[1];
            if(mi_sub) {
                this.$["site_submenu" + i] = mi_sub;
                mi_sub.className += " subsubmenu";
                li.removeChild(mi_sub);
                mi.appendChild(mi_sub);
    
                core.browser.event.attach(mi, "onmouseover", this._showSubSubmenu.bindAsEventListener(this, i));
                core.browser.event.attach(mi, "onmouseout", this._hideSubSubmenu.bindAsEventListener(this, i));

            }
            ul.removeChild(li);
            this.$[extra_sub_id].appendChild(mi);
        }
    }


};

core.apps.site_menu.extendPrototype({



    _showSubmenu: function(e, idx) {
        if(core.values.menu_widget_hover) {
            //IE workaraund related to menu widget
            core.values.menu_widget_hover = false;
            return;
        }

        clearTimeout(this.timeout);
        if(this.active_submenu != null && this.active_submenu != idx) {
            this.hideElement("site_submenu" + this.active_submenu);
            this.active_submenu = null;
        }
        var key = "site_submenu" + idx;
        if(this.$[key]) {
            this.setElementOpacity(key, 100);
            this.showElement(key);
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
        var key = "site_submenu" + this.active_submenu;
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
        this.showElement("site_submenu" + idx);
    },

    _hideSubSubmenu: function(e, idx) {
        this.hideElement("site_submenu" + idx);
    }

});

core.apps.site_menu.extendPrototype(core.components.html_component);