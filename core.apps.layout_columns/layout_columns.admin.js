/*
layout: {
    rows: [
        { cols: [ { width: "", style: "" }, ... ],
          style: },
        ...
    ],
    apps: [
        id: { name: "", pos: [row, column] }
    ]
}
*/

core.apps.layout_columns.extendPrototype({


    row_box_show_delay: 100,
    row_box_hide_delay: 100,

    cell_box_show_delay: 100,
    cell_box_hide_delay: 100,

    app_box_show_delay: 100,
    app_box_hide_delay: 100,



    initLayoutStyles: function() {
        core.values.app_styles = [
            { title: "None", style: "" },
            { title: "Box 1", style: "la_bxd la_bxd1" },
            { title: "Box 2", style: "la_bxd la_bxd2" },
            { title: "Box 3", style: "la_bxd la_bxd3" },
            { title: "Box 4", style: "la_bxd la_bxd4" },

            { title: "Box 5", style: "la_bxd la_bxd5" },
            { title: "Box 6", style: "la_bxd la_bxd6" },
            { title: "Box 7", style: "la_bxd la_bxd7" },
            { title: "Box 8", style: "la_bxd la_bxd8" },

            { title: "Box 9", style: "la_bxd la_bxd9" },
            { title: "Box 10", style: "la_bxd la_bxd10" },
            { title: "Box 11", style: "la_bxd la_bxd11" },
            { title: "Box 12", style: "la_bxd la_bxd12" },

            { title: "Box 13", style: "la_bxd la_bxd13" },
            { title: "Box 14", style: "la_bxd la_bxd14" },
            { title: "Box 15", style: "la_bxd la_bxd15" },
            { title: "Box 16", style: "la_bxd la_bxd16" }
        ].concat(core.values.app_styles_theme || []);

        core.values.cell_styles = [
            { title: "Box 1", style: "lc_bxd_cell lc_bxd1" },
            { title: "Box 2", style: "lc_bxd_cell lc_bxd2" },
            { title: "Box 3", style: "lc_bxd_cell lc_bxd3" },
            { title: "Box 4", style: "lc_bxd_cell lc_bxd4" },

            { title: "Box 5", style: "lc_bxd_cell lc_bxd5" },
            { title: "Box 6", style: "lc_bxd_cell lc_bxd6" },
            { title: "Box 7", style: "lc_bxd_cell lc_bxd7" },
            { title: "Box 8", style: "lc_bxd_cell lc_bxd8" },

            { title: "Box 9", style: "lc_bxd_cell lc_bxd9" },
            { title: "Box 10", style: "lc_bxd_cell lc_bxd10" },
            { title: "Box 11", style: "lc_bxd_cell lc_bxd11" },
            { title: "Box 12", style: "lc_bxd_cell lc_bxd12" },

            { title: "Box 13", style: "lc_bxd_cell lc_bxd13" },
            { title: "Box 14", style: "lc_bxd_cell lc_bxd14" },
            { title: "Box 15", style: "lc_bxd_cell lc_bxd15" },
            { title: "Box 16", style: "lc_bxd_cell lc_bxd16" },

            { title: "A", style: "layout_cell_a" },
            { title: "B", style: "layout_cell_b" },
            { title: "C", style: "layout_cell_c" }
        ].concat(core.values.cell_styles_theme || []);

        core.values.row_styles = core.values.row_styles_theme || [];
    },


    initAdminControls: function() {
        desktop.$["document_wrapper"].onclick = this.onPageClick.bind(this);
        this.displayTpl(document.body, "admin_app_settings");
        this.layout_parser = new core.objects.layout_parser();
    },


    onPageClick: function(e) {
        if(!this.active_app) return;
        e = core.browser.event.fix(e);
        var el = e.target;
        while(el && el.parentNode) {
            if(el.wid == this.active_app.id) return;
            el = el.parentNode;
        }
        this.setActiveApp(null);
    },


    initPageControls: function() {
        if(!core.values.is_page_preview) {
            this.app_drag = new core.objects.app_drag();
            this.app_move = new core.objects.app_move();
            if(!core.browser.ie) {
                window.onbeforeunload = this.onWindowUnload.bindAsEventListener(this);
            }
        }
        this.isPageSaved = true;
        this.initHistory();
        this.updateClipboardControls();
        this.log = [];
    },

    onWindowUnload: function(e) {
        if(!this.isPageSaved) {
            return "Data saving, please wait.";
        } else if(desktop.files_uploader.is_uploading) {
            return "File(s) upload in process, please wait.";
        }
    },



    // save page data

    savePage: function(skip_history_save_state, need_css_reload) {
        if(core.usertype < USERTYPE_ADMIN) return;
        this.isPageSaved = false;
        desktop.showNotify("Saving...");


        this.data = this.getData();
        var rows_post_data = [];

        for(var i=0; i<this.data.rows.length; i++) {
            var row = this.data.rows[i];
            if(!row) continue;

            var used_apps = {};
            var used_texts = {};
            var used_submenus = {};
            var used_images = {};
            var used_styles_hash = {};
            var style_id;

            for(var id in row.data.apps) {
                var app = this.apps[id];
                used_apps[app.appName] = 1;

                // texts
                if(app.getUsedTexts) {
                    var texts = app.getUsedTexts();
                    if(texts != null) {
                        for(var j=0; j<texts.length; j++) {
                            used_texts[texts[j]] = 1;
                        }
                    }
                }


                // submenus
                if(app.getUsedSubmenus) {
                    var mid = app.getUsedSubmenus();
                    if(mid != null) {
                        used_submenus[mid] = 1;
                    }
                }


                // images
                if(app.getUsedImages) {
                    var images = app.getUsedImages();
                    if(images) {
                        for(var j=0; j<images.length; j++) {
                            var img_html =
                                "<img src='" +
                                core.common.getUserFile(images[j].file) +
                                "' alt='" +
                                images[j].title.addSlashes() +
                                "'/>";
                            used_images[img_html] = 1;
                        }
                    }
                }


                style_id = app.profile["theme2_style_id"];
                if(style_id) {
                    used_styles_hash[style_id] = true;
                }
            }


            var used_styles = [];
            for(var id in used_styles_hash) {
                used_styles.push(id);
            }

            rows_post_data.push({
                id: row.id,
                position: row.position,
                style_id: row.style_id,
                data: varToString(row.data),
                used_apps: array_keys(used_apps).join(";"),
                used_texts: array_keys(used_texts).join(";"),
                used_submenus: array_keys(used_submenus).join(";"),
                used_images: array_keys(used_images).join(""),
                used_styles: used_styles.join(";")
            });
        }


        var r = {
            dialog: "layout_columns",
            act: "save_layout",
            layout_mode: core.data.layout_mode,
            page_id: core.data.page_id,
            rows_data: php_serialize(rows_post_data),
            contact_us_emails: varToString(core.data.contact_us_emails),
            ecom_category_id: core.values.ecom_category_id || 0,
            log: this.log.join("\n")
        };

        core.transport.send("/controller.php", r, this.onPageSaved.bind(this, need_css_reload), "POST");
        this.site_changed = true;

        if(!skip_history_save_state) {
            this.historySaveState();
        }
        this.log = [];

        desktop.admin_toolbars.blinkUndo();
    },



    onPageSaved: function(need_css_reload, msg) {
        this.isPageSaved = true;
        if(need_css_reload) {
            desktop.reloadThemeCSS();
        }
    },







    // history

    history: [],
    history_max_depth: 50,


    initHistory: function() {
        if(core.values.is_page_preview) return;
        this.history = [ { data: clone(this.data), log: [] } ];

        this.history_idx = 0;
        this.updateHistoryButtons();
    },


    historySaveState: function() {
        if(this.isRedoAvailable()) {
            this.historyStop(this.history_idx);
        }
        this.history.push({ data: clone(this.data), log: clone(this.log) });
        if(this.history.length > this.history_max_depth) {
            this.history.shift();
        }
        this.history_idx = this.history.length - 1;
        this.updateHistoryButtons();
    },


    historyStop: function(lastIdx) {
        this.history = this.history.splice(0, lastIdx + 1);
    },


    historyUndo: function() {
        if(this.active_app) {
            this.active_app.blur();
        }
        if(this.history_idx) {
            this.history_idx--;
            this.historyApplyState(this.history[this.history_idx]);
        }
    },


    historyRedo: function() {
        if(this.history_idx < this.history.length - 1) {
            this.history_idx++;
            this.historyApplyState(this.history[this.history_idx]);
        }
    },


    historyApplyState: function(state) {
        this.clearApps();
        this.setData(state.data);
        this.log = state.log;
        this.savePage(true);
        this.updateHistoryButtons();
    },


    updateHistoryButtons: function() {
        if(desktop.admin_toolbars) {
            desktop.admin_toolbars.setElementDisabled("main", "btn_undo", !this.isUndoAvailable());
            desktop.admin_toolbars.setElementDisabled("main", "btn_redo", !this.isRedoAvailable());
        }
    },

    isUndoAvailable: function() {
        return this.history_idx;
    },


    isRedoAvailable: function() {
        return this.history_idx < this.history.length - 1;
    },






    // data

    setEditorData: function() {
        this.clearLayout();

        for(var i=0; i<this.data.rows.length; i++) {
            var r = this.data.rows[i];
            if(r.type == "fixed_content") {
                this.renderRow(i);
            } else {
                this.rows[i] = new core.objects.layout_row({ parent: this.pel, idx: i });
                this.rows[i].setData(r);
            }
        }
        this.active_row_idx = null;
        this.ac_anim_value = 0;
    },




    getData: function() {
        var data = {
            rows: []
        };
        for(var i=0; i<this.rows.length; i++) {
            if(this.rows[i].getData) {
                data.rows[i] = this.rows[i].getData();
            }
        }
        return data;
    },




    clearLayout: function() {
        if(!this.rows || !this.rows.length) return;
        for(var i=0; i<this.rows.length; i++) {
            this.rows[i].remove();
        }
        this.clearApps();
        this.pel.innerHTML = "";
    },





    // active app

    setActiveApp: function(app) {
        if(this.active_app) {
            this.active_app.blur();
        }
        this.active_app = app;
        if(app) {
            app.focus();
            this.updateClipboardControls();
        }
    },


    getActiveApp: function() {
        return this.active_app;
    },



    closeActiveApp: function() {
        if(this.active_app) {
            this.closeApp(this.active_app)
        }
        this.active_app = false;
    },



    closeApp: function(app) {
        this.log.push("block " + app.appName + " deleted");
        var app_cell = app.$["window"].parentNode;
        if(app.close(true)) {
            this.cleanLayout(app_cell);
            this.savePage();
        }
    },


    callActiveApp: function(func_name, args) {
        var app = this.getActiveApp();
        if(app) {
            app[func_name](args);
        }
    },




    // cells
    cleanLayout: function(cell) {
        if(cell.childNodes.length) return; // cell not empty

        if(cell.is_row && !cell.childNodes.length) {
            this.buildModel(cell,
                { tag: "div",
                    className: "layout_cells_container row",
                    wid: "container",
                    childs: [
                        { tag: "div",
                            className: "layout_cell",
                            style: { width: "100%" },
                            wid: "cell" }
                    ]}
            );
            return;
        }

        var container_el = cell.parentNode;

        if(container_el.parentNode.is_row &&
           container_el.childNodes.length == 1 &&
           container_el.parentNode.childNodes.length == 1) return; // last cell in row, we need it


        container_el.removeChild(cell);

        if(container_el.childNodes.length == 0) {
            container_el.parentNode.removeChild(container_el);
        } else if(container_el.childNodes.length == 1) {
            var cell_el = container_el.firstChild;

            while(cell_el.childNodes.length) {
                container_el.parentNode.insertBefore(cell_el.firstChild, container_el);
            }
            container_el.parentNode.removeChild(container_el);

        } else {
            var cell_width = (100 / container_el.childNodes.length) + "%";
            for(var i=0; i<container_el.childNodes.length; i++) {
                container_el.childNodes[i].style.width = cell_width;
            }
        }
    },




    getElementRowIdx: function(el) {
        while(el && el.row_idx == undefined) {
            el = el.parentNode;
        }
        return el ? el.row_idx : null;
    },



    showColumnsResizeControls: function(app) {
        this.resize_row_idx = this.getElementRowIdx(app.$["window"]);

        if(!this.$["layout_row_controls_fixed"]) {
            this.buildModel(document.body,
                { tag: "div",
                  className: "layout_row_controls_fixed",
                  id: "resize_controls",
                  childs: [
                    { tag: "div",
                      className: "row_resize_markers",
                      id: "row_resize_markers" }
                  ]}
            );
        } else {
            this.showElement("resize_controls");
        }
        this.rows[this.resize_row_idx].addResizeMarkers(app.$["window"].parentNode);
    },



    hideColumnsResizeControls: function() {
        var row = this.rows[this.resize_row_idx];
        if(row) {
            this.hideElement("resize_controls");
            this.rows[this.resize_row_idx].removeResizeMarkers();
        }
        this.resize_row_idx = false;
    },




    getAppTitleByName: function(name) {
        for(var i=0; i<core.data.apps_list.length; i++) {
            if(core.data.apps_list[i].name == name) {
                return core.data.apps_list[i].title;
            }
        }
        return false;
    }

});