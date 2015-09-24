core.objects.app_drag = function(args) {

    this.placeholder_size = 32;


    this.buildModel(desktop.$["tmp_hidden"], 
        { tag: "div", 
          className: "app_drag_area",
          wid: "placeholder",
          id: "placeholder",
          childs: [
            { tag: "div",
              className: "inner",
              id: "placeholder_inner",
              childs: [
                { tag: "div", className: "border" },
                { tag: "div", className: "expand_left",
                  id: "placeholder_expand_left",
                  wid: "placeholder_expand_left" },
                { tag: "div", className: "expand_right",
                  id: "placeholder_expand_right",
                  wid: "placeholder_expand_right" }
              ]}
          ]}
    );

};


core.objects.app_drag.prototype = {



    onAppMouseDown: function(e, args) {
        this.init(args);
        e = core.browser.event.fix(e);
        
        core.browser.event.kill(e);
    },



    init: function(args) {
        this.args = args;
        desktop.layout.setActiveApp(null);
        this.app_drag_started = false;
        core.browser.event.push(document, ["onmousemove", "onmouseup"]);
        document.onmousemove = this.onDocumentMouseMove.bindAsEventListener(this);
        document.onmouseup = this.stopDrag.bindAsEventListener(this);
    },



    onDocumentMouseMove: function(e) {
        e = core.browser.event.fix(e);

        if(!this.app_drag_started) {
            this.app_drag_started = true;
            this.startAppDrag(e);
        }
        this.setAppDragIconPos(e);
        this.processDragArea(e);

        if(this.hover_app && this.hover_app.apps_container) {
            if(this.hover_app.isContentEmpty && this.hover_app.isContentEmpty()) {
                this.enableDrop(this.hover_app);
            } else {
                clearTimeout(this.allow_drop_timeout);
                this.allow_drop_timeout = setTimeout(this.enableDrop.bind(this, this.hover_app), 1500);
                this.hover_app.showDropOverlay();
            }
        }
    },





    startAppDrag: function(e) {
        core.browser.element.disableSelection(document.body);
        this.pos_found = false;


        if(!this.$["drag_container"]) {
            this.buildModel(document.body,
                { tag: "div", id: "drag_container", className: "app_drag_container" }
            );
        } else {
            this.showElement("drag_container");
            this.$["drag_container"].innerHTML = "";
        }


        if(this.$["bookmark"]) {
            core.browser.element.remove(this.$["bookmark"]);
            this.$["bookmark"] = false;
        }
        this.saved_layout_data = false;

        if(this.args.app) {
            var app_cell = this.args.app.$["window"].parentNode;
            if(app_cell.childNodes.length == 1) {
                this.saved_layout_data = clone(desktop.layout.data);
                this.removeCell(app_cell);
            } else {
                this.buildModel(desktop.$["tmp_hidden"], { tag: "div", id: "bookmark", display: false });
                app_cell.insertBefore(this.$["bookmark"], this.args.app.$["window"]);
            } 
            desktop.$["tmp_hidden"].appendChild(this.args.app.$["window"]);
        } 
        
        
        if(this.args.clipboard) {
            var icon = "/static/site_toolbar/icons/paste.png", title = "";
        } else {
            var l = core.data.apps_list;
            var app_name = this.args.app_name || this.args.app.appName;
            for(var i=0; i<l.length; i++) {
                if(l[i].name == app_name) {
                    var icon = l[i].icon, title = l[i].title;
                    break;
                }                                     
            }
        }
        this.$["drag_container"].innerHTML = 
            "<div class='app_thumb_box'>" +
            "<img src='" + icon + "'/>" + 
            "<span class='nowrap'>" + title + "</span>" + 
            "</div>";
       
        this.setAppDragIconPos(e);
//        document.body.focus();
        core.browser.event.kill(e);
        return false;
    },



///////////////////////////////////////////
// process drag
///////////////////////////////////////////


    setAppDragIconPos: function(e) {
        var scroll = core.browser.getScroll();
        this.$["drag_container"].style.left = e.pageX - scroll.left + 16 + "px";
        this.$["drag_container"].style.top = e.pageY - scroll.top + 16 + "px";
    },



    processDragArea: function(e) {
        var t = e.target;

        while(!t.wid && t.parentNode) {
            t = t.parentNode;
        }


        if(t.wid == "cell") {
            if(t.childNodes.length == 0) {
                this.hover_app = false;
                this.showPlaceholder({ parent_el: t });
            }
        } if(t.wid == "placeholder_expand_left" || t.wid == "placeholder_expand_right") {
            if(this.placeholder_expand_mode == "before") {
                this.hover_app = false;
                this.showPlaceholder({ before_el: this.$["placeholder"].parentNode.parentNode });
            } else if(this.placeholder_expand_mode == "after") {
                this.hover_app = false;
                this.showPlaceholder({ after_el: this.$["placeholder"].parentNode.parentNode });
            }
//        } else if(t.wid == "container_overlay") {
            
        } else if(t.wid != "placeholder") {
            var app = desktop.layout.getApp(t.wid);
            if(app) {
                this.showAppPlaceholder(e, app);
            }
        }
    },




    // args: { parent_el: | before_el: | after_el: | false }
    showPlaceholder: function(args) {
        if(!args) {
            this.is_placeholder_visible = false;
            document.body.appendChild(this.$["placeholder"]);
            this.hideElement("placeholder");
            clearTimeout(this.animation_timeout);
            if(this.tmp_cell) {
                this.removeCell(this.tmp_cell);
                this.tmp_cell = null;
            }
        } else {
            this.is_placeholder_visible = true;
            this.$["placeholder"].style.height = "";

            if(args.before_el) {
                args.before_el.parentNode.insertBefore(this.$["placeholder"], args.before_el);
                this.$["placeholder"].style.height = this.placeholder_size + "px";
            } else if(args.after_el) {
                core.browser.element.insertAfter(this.$["placeholder"], args.after_el);
                this.$["placeholder"].style.height = this.placeholder_size + "px";
            } else if(args.parent_el) {
                args.parent_el.appendChild(this.$["placeholder"]);
                this.$["placeholder"].style.height = args.parent_el.offsetHeight + "px";
            } else {
                return;
            }

            this.showElement("placeholder");
            this.scrollToPlaceholder();
            this.animatePlaceholder();


            this.placeholder_expand_mode = false;
            this.hideElement("placeholder_expand_right");
            this.hideElement("placeholder_expand_left");

            var placeholder_parent = this.$["placeholder"].parentNode;

            if(placeholder_parent.childNodes.length > 1 && 
               placeholder_parent.parentNode.wid == "container" && 
               placeholder_parent.parentNode.childNodes.length > 1) {


                if(this.$["bookmark"] == placeholder_parent.firstChild) {
                    var first_el = placeholder_parent.firstChild.nextSibling;
                } else {
                    var first_el = placeholder_parent.firstChild;
                }
                if(this.$["placeholder"] == first_el) {
                    this.placeholder_expand_mode = "before";
                }


                if(this.$["bookmark"] == placeholder_parent.lastChild) {
                    var last_el = placeholder_parent.lastChild.prevSibling;
                } else {
                    var last_el = placeholder_parent.lastChild;
                }                
                if(this.$["placeholder"] == last_el) {
                    this.placeholder_expand_mode = "after";
                }
            }

            if(this.placeholder_expand_mode) {
                this.showElements(["placeholder_expand_left", "placeholder_expand_right"]);
            }
        }
    },





    showAppPlaceholder: function(e, app) {
        if(app.app_drop_allowable) return;


        var app_pos = this.getAppMousePosition(e, app);
        var dir = this.getAppMouseDirection(app_pos);
        if(this.args.app && this.args.app == app) return;
        if(app == this.hover_app && this.hover_app_dir == dir) return;

        if(this.hover_app && this.hover_app.hideDropOverlay) {
            clearTimeout(this.allow_drop_timeout);
            this.hover_app.hideDropOverlay();
        }



        this.showPlaceholder(false);

        if(this.tmp_cell) {
            this.removeCell(this.tmp_cell);
            this.tmp_cell = null;
        }

        this.hover_app = app;
        this.hover_app_dir = dir;

        var app_el = app.$["window"];

        switch(dir) {
            case "top":
                this.scrollToElement(app_el);
                this.showPlaceholder({ before_el: app_el });
                break;
            case "bottom":
                this.scrollToElement(app_el);
                this.showPlaceholder({ after_el: app_el });
                break;
            case "left":
                this.tmp_cell = this.createCell(app_el, "left");
                this.showPlaceholder({ parent_el: this.tmp_cell });
                break;
            case "right":
                this.tmp_cell = this.createCell(app_el, "right");
                this.showPlaceholder({ parent_el: this.tmp_cell });
                break;
        }

    },


    enableDrop: function(app) {
        clearTimeout(this.show_allow_drop_timer_timeout);

        if(this.tmp_cell) {
            this.removeCell(this.tmp_cell);
            this.tmp_cell = null;
        }

        this.container_app = app;
        this.hover_app = false;
        app.hideDropOverlay();
        app.enableDrop();
    },


    getAppMousePosition: function(e, app) {
        var app_el = app.$.admin_overlay;

        var app_pos = core.browser.element.getPosition(app_el);
        var scroll = core.browser.getScroll();
        
        return {
            x: e.clientX - app_pos.left + scroll.left,
            y: e.clientY - app_pos.top + scroll.top,
            width: app_el.offsetWidth,
            height: app_el.offsetHeight
        }
    },


    // return: top|bottom|left|right
    getAppMouseDirection: function(pos) {
        if(pos.x < pos.width * 0.2) {
            return "left"
        } else if(pos.x > pos.width * 0.8) {
            return "right";
        } else if(pos.y < pos.height*0.5) {
            return "top";
        } else {
            return "bottom";
        }
    },





    animatePlaceholder: function() {
        clearTimeout(this.animation_timeout);
        this.$["placeholder_inner"].style.width = "1px";
        this.$["placeholder_inner"].style.height = "1px";
        this.animation_timeout = setTimeout(this.animationFrame.bind(this), 10);
    },


    animationFrame: function() {
        var pl = this.$["placeholder"], 
            inner = this.$["placeholder_inner"];
            dx = pl.offsetWidth - inner.offsetWidth,
            dy = pl.offsetHeight - inner.offsetHeight,
            fl = false;
        if(dx <= 2) {
            inner.style.width = "auto";
        } else {
            inner.style.width = inner.offsetWidth + dx * 0.4 + "px";
            fl = true;
        }

        if(dy <= 2) {
            inner.style.height = pl.offsetHeight + "px";
            inner.style.marginTop = 0;
        } else {
            var h = inner.offsetHeight + dy * 0.4;
            inner.style.height = h + "px";
            inner.style.marginTop = (pl.offsetHeight - h) *0.5 + "px";
            fl = true;
        }

        if(fl) {
            this.animation_timeout = setTimeout(this.animationFrame.bind(this), 10);
        }
    },




////////////////////////////////////////////////
// finish drag
////////////////////////////////////////////////



    stopDrag: function(e) {
        if(!this.app_drag_started) return;

        e = core.browser.event.fix(e);



        if(this.is_placeholder_visible) {
            // drop 
            if(this.tmp_cell) {
                this.tmp_cell.style.height = "";
                this.setColumnsAutoWidth(this.tmp_cell.parentNode);
                this.tmp_cell = false;
            }
            this.dropApp(this.$["placeholder"], "after");
        } else {
            // revert changes if needded
            if(this.saved_layout_data) {
                desktop.layout.setData(this.saved_layout_data);
                this.saved_layout_data = null;
            } else if(this.$["bookmark"]) {
                this.$["bookmark"].parentNode.insertBefore(this.args.app.$["window"], this.$["bookmark"]);
                if(this.tmp_cell) {
                    this.removeCell(this.tmp_cell);
                    this.tmp_cell = null;
                }
            }
        }

        if(this.container_app) {
            this.container_app.disableDrop();
            this.container_app = null;
        }

        core.browser.element.remove(this.$["bookmark"]);
        this.hideElement("drag_container");
        this.tmp_cell = null;

        core.browser.element.enableSelection(document.body);
        core.browser.event.pop();
        this.app_drag_started = false;
    },



    // mode: "before" | "after" | "append" 
    dropApp: function(el, mode) {
        if(!el) return;

        if(!mode) {
            mode = "append";
        }

        if(this.args.app) {
            // move app
            switch(mode) {
                case "before":
                    el.parentNode.insertBefore(this.args.app.$["window"], el);
                    break;
                case "after":
                    core.browser.element.insertAfter(this.args.app.$["window"], el);
                    break;
                default:
                    el.appendChild(this.args.app.$["window"]);
                    break;
            }
            this.resetAppMargin(this.args.app.$["window"].parentNode);
            this.showPlaceholder(false);
            desktop.layout.log.push("block " + this.args.app.appName + " drag&drop");
            desktop.layout.savePage();
        } else if(this.args.clipboard) {
            // render data from clipboard
            desktop.layout.paste(this.onPaste.bind(this, el, mode));
        } else {
            // run new app
            var p = {
                appName: this.args.app_name
            };

            switch(mode) {
                case "before":
                    p.beforeElement = el;
                    break;
                case "after":
                    p.afterElement = el;
                    break;
                default:
                    p.parentElement = el;
                    break;
            }
            desktop.layout.log.push("block " + this.args.app_name + " added");
            desktop.layout.runColumnApp(p);

            this.showPlaceholder(false);
        }
    },



    onPaste: function(el, mode, data) {
        var row_idx = desktop.layout.getElementRowIdx(el);

        switch(mode) {
            case "before":
                el.parentNode.insertBefore(data.el, el);
                break;
            case "after":
//                el.parentNode.insertAfter(data.el, el);
                core.browser.element.insertAfter(data.el, el);
                break;
            default:
                el.appendChild(data.el);
                break;
        }

        this.showPlaceholder(false);
        desktop.layout.savePage();
    },



    createCell: function(el, direction) {
        var app = desktop.layout.getApp(el.wid);

        if(app) {
            var app_parent_el = app.$["window"].parentNode;
            if(app_parent_el.childNodes.length == 1 && !app_parent_el.is_row) {
                el = app_parent_el;
            }
        }

        if(el.wid == "cell" && el.parentNode.wid == "container") {
            // add new cell to existing cells container

            var container_el = el.parentNode,
                container_w = container_el.offsetWidth,
                new_cell_w = 100 * this.placeholder_size / container_w,
                ex_cells_sub = this.placeholder_size / container_el.childNodes.length,
                new_cell_el = this.buildModel(desktop.$["tmp_hidden"],
                    { tag: "div", 
                      className: "layout_cell",
                      style: { width: 0 },
                      wid: "cell" }
                );

            if(direction == "left") {
                container_el.insertBefore(new_cell_el, el);
            } else {
//                container_el.insertAfter(new_cell_el, el);
                core.browser.element.insertAfter(new_cell_el, el);
            }

            var cells_w = [], total_w_pc = 0, total_w_px = 0, cell;
            for(var i=0; i<container_el.childNodes.length; i++) {
                cell = container_el.childNodes[i];
                
                if(i != container_el.childNodes.length - 1) {
                    if(cell == new_cell_el) {
                        cells_w[i] = new_cell_w;
                    } else {
                        cells_w[i] = 100 * (cell.offsetWidth - ex_cells_sub) / container_w;
                    }
                    total_w_pc += cells_w[i];
                    total_w_px += cell.offsetWidth;
                    cell.old_width = (100 * cell.offsetWidth / container_w) + "%";
                } else {
                    // last cell
                    cells_w[i] = 100 - total_w_pc;  
                    cell.old_width = (100 * (container_w - total_w_px) / container_w) + "%";
                }
            }


            for(var i=0; i<container_el.childNodes.length; i++) {
                container_el.childNodes[i].style.width = cells_w[i] + "%";
            }
            new_cell_el.style.height = el.offsetHeight + "px";
            return new_cell_el;
        } else {
            // add new container with cells
            var container_el = this.buildModel(desktop.$["tmp_hidden"],
                { tag: "div", 
                  className: "layout_cells_container",
                  wid: "container",
                  childs: [
                    { tag: "div",
                      className: "layout_cell",
                      style: { width: "50%" },
                      wid: "cell" },

                    { tag: "div",
                      className: "layout_cell",
                      style: { width: "50%" },
                      wid: "cell" }
                  ]}
            );

            var new_cell_height = el.offsetHeight;
            el.parentNode.insertBefore(container_el, el);

            var w1 = 100 * this.placeholder_size/container_el.offsetWidth + "%",
                w2 = 100 * (container_el.offsetWidth - this.placeholder_size) / container_el.offsetWidth + "%";
            switch(direction) {
                case "left":
                    container_el.lastChild.appendChild(el);
                    container_el.firstChild.style.height = new_cell_height + "px";

                    container_el.firstChild.style.width = w1;
                    container_el.lastChild.style.width = w2; 

                    return container_el.firstChild;
                    break;
                case "right":
                    container_el.firstChild.appendChild(el);
                    container_el.lastChild.style.height = new_cell_height + "px";

                    container_el.firstChild.style.width = w2;
                    container_el.lastChild.style.width = w1; 

                    return container_el.lastChild;
                    break;
            }
        }

    },



    removeCell: function(cell_el) {
        if(!cell_el) return;

        var container_el = cell_el.parentNode;
        if(container_el.parentNode.is_row && container_el.childNodes.length == 1 && container_el.parentNode.childNodes.length == 1) return;

        container_el.removeChild(cell_el);

        if(container_el.childNodes.length == 1) {
            var cell_el = container_el.firstChild;
            while(cell_el.childNodes.length) {
                container_el.parentNode.insertBefore(cell_el.firstChild, container_el);
            }
            container_el.parentNode.removeChild(container_el);
        } else {
            // update cells width
            if(container_el.firstChild.old_width) {
                // revert width
                for(var i=0; i<container_el.childNodes.length; i++) {
                    var cell = container_el.childNodes[i];
                    cell.style.width = cell.old_width;
                    delete(cell.old_width);
                }
            } else {
                // recalculate width
                this.setColumnsAutoWidth(container_el);
            }
        }
    },



    setColumnsAutoWidth: function(container_el) {
        var cell_width = 100 * (1 / container_el.childNodes.length) + "%";
        for(var i=0; i<container_el.childNodes.length; i++) {
            container_el.childNodes[i].style.width = cell_width;
        }
    },


    resetAppMargin: function(container_el) {
        if(!this.args.app.profile.app_css) return;
        if(container_el.offsetWidth < parseInt(this.args.app.profile.app_css.margin.left,10) + parseInt(this.args.app.profile.app_css.margin.right,10) + 100) {
            this.args.app.profile.app_css.margin.left = this.args.app.default_app_css.margin.left;
            this.args.app.profile.app_css.margin.right = this.args.app.default_app_css.margin.right;
            this.args.app.applyAppMargin(this.args.app.profile.app_css.margin);
        }
    },



    scrollToPlaceholder: function() {
        var pos = core.browser.element.getPosition(this.$["placeholder"]),
            win_size = core.browser.getWindowSize(),
            scroll = core.browser.getScroll();
        if(pos.top > scroll.top + win_size.height) {
//            window.scroll(scroll.left, pos.top - win_size.height + this.$["placeholder"].offsetHeight);
        } 
    },


    scrollToElement: function(el) {
        var pos = core.browser.element.getPosition(el),
            win_size = core.browser.getWindowSize(),
            scroll = core.browser.getScroll();
        if(scroll.top + win_size.height < pos.top + pos.height) {
//            window.scroll(scroll.left, pos.top + pos.height);
        }
    }


};
core.objects.app_drag.extendPrototype(core.components.html_component);