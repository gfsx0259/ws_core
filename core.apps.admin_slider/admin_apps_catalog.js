core.objects.admin_apps_catalog = function (parent_el) {

    this.render(parent_el);

};


core.objects.admin_apps_catalog.prototype = {


    render: function (el) {
        this.displayTpl(el, "admin_apps_catalog");
        this.renderTabs();

        if (core.data.apps_categories.length) {
            this.showTab(core.data.apps_categories[0].id);
        }

        setTimeout(this.onWindowResize.bind(this), 20);
    },


    // tabs
    renderTabs: function () {
        var m = [];
        for (var i = 0; i < core.data.apps_categories.length; i++) {
            var ap = core.data.apps_categories[i];
            m.push(
                {
                    tag: "a",
                    id: "tab" + ap.id,
                    innerHTML: ap.title,
                    events: {onclick: ["onTabClick", ap.id]}
                }
            );
        }
        m.push({tag: "div", className: "spacer"});
        this.buildModel(this.$["tabs"], m);
    },


    onTabClick: function (e, id) {
        this.showTab(id);
    },


    showTab: function (id) {
        if (this.active_category_id == id) return;

        if (this.active_category_id) {
            this.$["tab" + this.active_category_id].className = "";
            this.hideElement("items_list" + this.active_category_id);
        }

        this.$["scroller_content"].style.left = 0;
        this.scroll_ofs = 0;

        if (!this.$["items_list" + id]) {
            this.renderAppsList(id);
        }

        this.$["tab" + id].className = "active";
        this.showElement("items_list" + id);

        this.active_category_id = id;


        this.updateScrollButtons();
    },


    // apps list

    renderAppsList: function (category_id) {
        var a, m = [];

        for (var i = 0; i < core.data.apps_list.length; i++) {
            a = core.data.apps_list[i];
            if (a.category_id != category_id) continue;
            var iconHtml = '';
            console.log(a);
            if (a.icon && a.icon != '') {
                iconHtml = "<img src='/" + a.icon+".png' /></div>";
            } else {
                iconHtml = "<img src='" + '/vendor/'+a.vendor+'/'+ a.package +'/core.apps.'+ a.name +"/icon"+".png' /></div>";
                //iconHtml = "<img src='/static/app_icons/default.png'/></div>";
            }
            m.push(
                {
                    tag: "div",
                    id: "app_" + i,
                    className: "thumb",
                    title: "Drag to page to add " + a.title,
                    innerHTML: "<div>" + iconHtml + "<span class='nowrap'>" + a.title + "</span>",
                    events: {
                        onmousedown: ["onAppDrag", a.name],
                        onmouseover: ["onAppMouseOver", i],
                        onmouseout: ["hidePreview"]

                    }
                }
            );
        }


        this.buildModel(this.$["scroller_content"],
            {
                tag: "div", id: "items_list" + category_id,
                className: "thumbs_wrapper",
                display: false,
                childs: m
            });
    },


    onAppDrag: function (e, app_name) {
        desktop.layout.app_drag.onAppMouseDown(e, {app_name: app_name});
    },


    // apps scroller

    onScrollLeftClick: function (e) {
        this.scroll(1);
    },

    onScrollRightClick: function (e) {
        this.scroll(-1);
    },


    scroll: function (dir) {
        if (this.is_scrolling || !this.active_category_id) return;

        var new_ofs = this.scroll_ofs + dir * this.$["viewport"].offsetWidth;
        var thumbs_el = this.$["items_list" + this.active_category_id];

        if (new_ofs > 0) {
            new_ofs = 0;
        } else if (new_ofs + thumbs_el.offsetWidth < this.$["viewport"].offsetWidth) {
            new_ofs = this.$["viewport"].offsetWidth - thumbs_el.offsetWidth;
        }

        if (new_ofs != this.scroll_target_ofs) {
            this.scroll_target_ofs = new_ofs;
            this.processScroll();
        }
    },


    processScroll: function () {
        this.is_scrolling = true;
        var ofs = this.scroll_target_ofs - this.scroll_ofs;

        if (Math.abs(ofs) < 3) {
            this.scroll_ofs = this.scroll_target_ofs;
            this.is_scrolling = false;
            this.scroll_target_ofs = null;
            this.updateScrollButtons();
        } else {
            this.scroll_ofs = this.scroll_ofs + ofs * 0.15;
            this.scroll_timeout = setTimeout(this.processScroll.bind(this), 10);
        }
        this.$["scroller_content"].style.left = this.scroll_ofs + "px";
    },


    updateScrollButtons: function () {
        if (!this.active_category_id) return;

        if (this.scroll_ofs >= 0) {
            this.hideElement("btn_scroll_left");
        } else {
            this.showElement("btn_scroll_left");
        }

        var thumbs_el = this.$["items_list" + this.active_category_id];
        if (this.scroll_ofs + thumbs_el.offsetWidth <= this.$["viewport"].offsetWidth) {
            this.hideElement("btn_scroll_right");
        } else {
            this.showElement("btn_scroll_right");
        }
    },


    onAppMouseOver: function (e, idx) {
        this.showPreview(idx);
    },


// preview
    showPreview: function (idx) {
        if (desktop.admin_slider.is_scrolling || this.preview_app_idx == idx) return;
        this.preview_app_idx = idx;

        var app = core.data.apps_list[idx];

        if (!this.$["preview"]) {
            this.buildModel(document.body,
                {
                    tag: "div", id: "preview",
                    className: "admin_slider_preview",
                    childs: [
                        {tag: "div", className: "pointer"},
                        {
                            tag: "div", id: "preview_title",
                            className: "title"
                        },
                        {
                            tag: "table",
                            childs: [
                                {
                                    tag: "tr",
                                    childs: [
                                        {
                                            tag: "td",
                                            id: "img_box",
                                            childs: [
                                                {
                                                    tag: "div", className: "img_box",
                                                    childs: [
                                                        {tag: "img", id: "preview_img"}
                                                    ]
                                                }
                                            ]
                                        },
                                        {
                                            tag: "td", className: "info",
                                            id: "preview_info"
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            );
        } else {
            this.showElement("preview");
        }


        var app = core.data.apps_list[idx];
        this.$["preview_title"].innerHTML = app.title;
        this.$["preview_info"].innerHTML = app.description;

        var pos = core.browser.element.getPosition(this.$["app_" + idx]);
        var rect = core.browser.getWindowSize();
        this.$["preview"].style.top = pos.top + pos.height + 20 + "px";
        this.$["preview"].style.left = pos.left + "px";
        if (app.picture != "") {
            this.$["preview_img"].src = "/js_apps/core.apps.admin_slider/images/toolbar_apps_pictures/" + app.picture;
            this.$["img_box"].style.display = "table-cell";
        } else {
            this.$["img_box"].style.display = "none";
        }
    },


    hidePreview: function () {
        this.preview_app_idx = false;
        this.hideElement("preview");
    },


    onWindowResize: function () {
        clearTimeout(this.scroll_timeout);
        this.is_scrolling = false;

        var thumbs_el = this.$["items_list" + this.active_category_id];
        if (this.scroll_ofs + thumbs_el.offsetWidth < this.$["viewport"].offsetWidth) {
            this.scroll_ofs = this.$["viewport"].offsetWidth - thumbs_el.offsetWidth;
            if (this.scroll_ofs > 0) this.scroll_ofs = 0;
            this.$["scroller_content"].style.left = this.scroll_ofs + "px";
        }

        this.updateScrollButtons();
    }

};
core.objects.admin_apps_catalog.extendPrototype(core.components.html_component);
core.objects.admin_apps_catalog.extendPrototype(core.objects.slider_obj_common);