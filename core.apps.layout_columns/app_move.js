core.objects.app_move = function(args) {};

core.objects.app_move.prototype = {


    move: function(dir, app) {
        if(!app) {
            app = desktop.layout.getActiveApp();
        }
        if(!app || app.profile.locked || core.data.page_settings.apps_locked) return;

        var app_el = app.$["window"];
        var app_parent_el = app_el.parentNode;
        var container_el = app_parent_el.parentNode;


        var moved = false;
        switch(dir) {
            case "up":
                if(app_el.previousSibling) {
                    if(app_el.previousSibling.wid == "container") {
                        app_el.previousSibling.firstChild.appendChild(app_el);
                    } else {
                        app_parent_el.insertBefore(app_el, app_el.previousSibling);
                    }
                    moved = true;
                } else if(!app_parent_el.is_row) {
                    container_el.parentNode.insertBefore(app_el, container_el);
                    moved = true;
                }
                break;
            case "down":
                if(app_el.nextSibling) {
                    if(app_el.nextSibling.wid == "container") {
                        app_el.nextSibling.firstChild.insertBefore(app_el, app_el.nextSibling.firstChild.firstChild);
                    } else {
//                        app_parent_el.insertAfter(app_el, app_el.nextSibling);
                        core.browser.element.insertAfter(app_el, app_el.nextSibling);
                    }
                    moved = true;
                } else if(!app_parent_el.is_row) {
//                    container_el.parentNode.insertAfter(app_el, container_el);
                    core.browser.element.insertAfter(app_el, container_el);
                    moved = true;
                }
                break;

            case "left":
                if(app_parent_el.is_row) return;
                if(app_parent_el.previousSibling) {
                    app_parent_el.previousSibling.insertBefore(app_el, app_parent_el.previousSibling.firstChild);
                    moved = true;
                } else if(!container_el.parentNode.is_row && container_el.parentNode.previousSibling) {
                    var cell2_el = container_el.parentNode.previousSibling;
                    cell2_el.insertBefore(app_el, cell2_el.firstChild);
                    moved = true;
                }
                break;

            case "ctrl_left":
                if(app_parent_el.childNodes.length == 1) return;
                if(app_parent_el.is_row) {
                    app_parent_el = this.wrapChildsByCell(app_parent_el);
                }
                var new_cell = this.addCell(app_parent_el, "left");
                new_cell.appendChild(app_el);
                moved = true;
                break;

            case "right":
                if(app_parent_el.is_row) return;
                if(app_parent_el.nextSibling) {
                    app_parent_el.nextSibling.insertBefore(app_el, app_parent_el.nextSibling.firstChild);
                    moved = true;
                } else if(!container_el.parentNode.is_row && container_el.parentNode.nextSibling) {
                    var cell2_el = container_el.parentNode.nextSibling;
                    cell2_el.insertBefore(app_el, cell2_el.firstChild);
                    moved = true;
                }
                break;

            case "ctrl_right":
                if(app_parent_el.childNodes.length == 1) return;
                if(app_parent_el.is_row) {
                    app_parent_el = this.wrapChildsByCell(app_parent_el);
                }
                var new_cell = this.addCell(app_parent_el, "right");
                new_cell.appendChild(app_el);
                moved = true;
                break;
        }

        if(moved) {
            desktop.layout.hideColumnsResizeControls();
            desktop.layout.showColumnsResizeControls(app);

            desktop.layout.cleanLayout(app_parent_el);
            desktop.layout.log.push("block " + app.appName + " kbd moove");
            desktop.layout.savePage();

            var pos = core.browser.element.getPosition(app_el);
            var scroll = core.browser.getScroll();
            var win_rect = core.browser.getWindowSize();
            if(pos.top > win_rect.height + scroll.top - 20) {
                window.scrollTo(0, pos.top);
            }

            this.resetAppMargin(app_el.parentNode);

            app.sizeChanged();
            app.showDragControl();
        }
    },





    addCell: function(cell_el, direction) {
        var new_cell_el = this.buildModel(desktop.$["tmp_hidden"],
            { tag: "div", 
              className: "layout_cell",
              wid: "cell" }
        );
        if(direction == "left") {
            cell_el.parentNode.insertBefore(new_cell_el, cell_el);
        } else {
//            cell_el.parentNode.insertAfter(new_cell_el, cell_el);
            core.browser.element.insertAfter(new_cell_el, cell_el);
        }

        var cell_width = 100 * (1 / cell_el.parentNode.childNodes.length) + "%"; // formula ;)
        for(var i=0; i<cell_el.parentNode.childNodes.length; i++) {
            cell_el.parentNode.childNodes[i].style.width = cell_width;
        }
        return new_cell_el;
    },



    wrapChildsByCell: function(el) {
        var container_el = this.buildModel(desktop.$["tmp_hidden"],
            { tag: "div", 
              className: "layout_cells_container",
              wid: "container",
              childs: [
                { tag: "div",
                  className: "layout_cell",
                  style: { width: "100%" },
                  wid: "cell" }
              ]}
        );
        while(el.childNodes.length) {
            container_el.firstChild.appendChild(el.firstChild);
        }
        el.appendChild(container_el);
        return container_el.firstChild;
    },




    resetAppMargin: function(container_el) {
        var app = desktop.layout.getActiveApp();
        if(!app.profile.app_css) return;
        if(container_el.offsetWidth < parseInt(app.profile.app_css.margin.left,10) + parseInt(app.profile.app_css.margin.right,10) + 100) {
            app.profile.app_css.margin.left = app.default_app_css.margin.left;
            app.profile.app_css.margin.right = app.default_app_css.margin.right;
            app.applyAppMargin(app.profile.app_css.margin);
        }
    },


};
core.objects.app_move.extendPrototype(core.components.html_component);