core.apps.layout_columns.extendPrototype({


    startAppResize: function(e) {
        if(!this.active_app) return;

        if(this.active_app.fixed_mode) return;

        e = core.browser.event.fix(e);
        this.app_resize_dir = e.target.className;

        this.resize_offset = {
            x: e.clientX,
            y: e.clientY
        };


        var resize_cell_idx = this.getAppResizeCellIdx(this.active_app, this.app_resize_dir);
        if(resize_cell_idx != null) {
            this.rows[this.resize_row_idx].initCellsResize(e, resize_cell_idx);
        }


        if((this.app_resize_dir == "bl" || this.app_resize_dir == "br") && this.active_app.resize_params) {
            this.resize_app_height = true;
            this.resize_offset.height = e.clientY - this.active_app.profile.height;
        } else {
            this.resize_app_height = false;
        }


        core.browser.event.push(document, ["onmousemove", "onmouseup"]);
        document.onmousemove = this.onAppResizeMouseMove.bindAsEventListener(this);
        document.onmouseup = this.onAppResizeMouseUp.bindAsEventListener(this);
        core.browser.event.kill(e);
    },




    getAppResizeCellIdx: function(app, app_resize_dir) {
        var app_cell = app.$["window"].parentNode;
        if(app_resize_dir == "bl" || app_resize_dir == "tl") {
            var cell = app_cell.previousSibling;
        } else {
            var cell = app_cell;
        }
        for(var i=0; i<app_cell.parentNode.childNodes.length; i++) {
            if(app_cell.parentNode.childNodes[i] == cell) return i;
        }
        return null;
    },



    getAppResizeCell: function(app, app_resize_dir) {
        var resize_cell = app.$["window"].parentNode;

        if(resize_cell.is_row || resize_cell.parentNode.childNodes.length == 1) {
            resize_cell = false;
        } else {
            if(app_resize_dir == "tl" || app_resize_dir == "bl") {
                if(resize_cell.previousSibling) {
                    resize_cell = resize_cell.previousSibling;
                } else {
                    resize_cell = false;
                }
            } else if(app_resize_dir == "tr" || app_resize_dir == "br") {
                if(!resize_cell.nextSibling) {
                    resize_cell = false;
                }
            }
        }
        return resize_cell;
    },




    onAppResizeMouseMove: function(e) {
        e = core.browser.event.fix(e);

        // resize columns width


        this.rows[this.resize_row_idx].setColumnsResizePos(e.clientX);

        // resize app height
        if(this.resize_app_height) {
            var min_height = this.active_app.resize_params.min_height || 0;
            this.active_app.profile.height = Math.max(e.clientY - this.resize_offset.height, min_height);
            this.active_app._profile.height = this.active_app.profile.height;
            if(this.active_app.$["inp_height"]) {
                this.active_app.$["inp_height"].setValue({ height: this.active_app.profile.height});
            }

            if(this.active_app.resize_params.target_element) {
                this.active_app.$[this.active_app.resize_params.target_element].style.height = this.active_app.profile.height + "px";
            }
            if(this.active_app.resize_params.callback_name) {
                this.active_app[this.active_app.resize_params.callback_name]();
            }
        }
        this.active_app.sizeChanged();
    },


    onAppResizeMouseUp: function(e) {
        e = core.browser.event.fix(e);


        var cell_el = this.active_app.$["window"].parentNode;
        if(cell_el.parentNode.wid == "container") {
            for(var i=0; i<cell_el.parentNode.childNodes.length; i++) {
                this.resizeCellApps(cell_el.parentNode.childNodes[i]);
            }
        } else {
            this.resizeCellApps(cell_el);
        }


        if(this.resize_offset.x != e.clientX || this.resize_offset.y != e.clientY) {
            this.savePage();
        }
        core.browser.event.pop();
    },



    resizeCellApps: function(cell_el) {
        for(var i=0; i<cell_el.childNodes.length; i++) {
            var app = this.getApp(cell_el.childNodes[i].wid);
            if(app && app.resize_params) {
                app.callFunction(app.resize_params.callback_name);
            }
        }
    },



    getPossibleResizeDirections: function(app) {
        var res = {};
        var el = app.$["window"];
        if(el.parentNode.firstChild != el) {
            res["tl"] = 1;
            res["tr"] = 1;
        }
        return res;
    }


});