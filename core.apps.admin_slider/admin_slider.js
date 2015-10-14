core.apps.admin_slider = function() {

//    if(core.data.fixed_page) return;

    this.is_visible = false;
    this.content_objects = {};
    this.render();

    desktop.$["document_wrapper"].style.marginTop = this.$.header.offsetHeight + this.$.slider.offsetHeight - this.$["content"].offsetHeight + "px";

    this.updateBoltsPosition();

};


core.apps.admin_slider.prototype = {


    render: function() {
        this.displayTpl(document.body, "admin_slider");
        if(core.data.site_info.is_paid == 0) {
            this.showElement("btn_save_site");
        }


        this.$["btn_mode_" + core.data.layout_mode].className += " selected";
        this.setElementVisible("header_left", core.data.layout_mode == "mobile");


        var m = [
            "apps_catalog",
//            "styles_catalog",
            "theme_colors",
            "theme_fonts"
        ];
        for(var i in m) {
            m[i] =
                { tag: "div", 
                  draggable: false,
                  className: "bolt",
                  id: "bolt" + m[i],
                  childs: [
                    { tag: "div", className: "shadow" },
                    { tag: "div", className: "icon icon_" + m[i],
                      id: "bolt_icon" + m[i] },
                    { tag: "div", className: "clickable_zone",
                      events: { onmousedown: ["onBoltMouseDown", m[i]] } }
                  ]};
        }
        this.buildModel(this.$["bolts_wrapper"], m);
    },



    updateBoltsPosition: function() {
        var bwidth = this.$["bolts_wrapper"].offsetWidth,
            win_size = core.browser.getWindowSize();

        core.data.admin_slider_pos = parseInt(core.data.admin_slider_pos, 10);
        if(isNaN(core.data.admin_slider_pos)) {
            core.data.admin_slider_pos = Math.round(0.5*(win_size.width - bwidth));
        } else {
            core.data.admin_slider_pos = Math.max(core.data.admin_slider_pos, 0);
            if(core.data.admin_slider_pos + bwidth > win_size.width) {
                core.data.admin_slider_pos = win_size.width - bwidth;
            }
        }
        this.$["bolts_wrapper"].style.marginLeft = core.data.admin_slider_pos + "px";
    },



    onBoltMouseDown: function(e, name) {
        core.browser.event.push(document, ["onmousemove", "onmouseup"]);
        document.onmousemove = this.processDrag.bindAsEventListener(this);
        document.onmouseup = this.onBoltMouseUp.bindAsEventListener(this, name);
        this.start_clientX = e.clientX;
        this.drag_ofs = core.data.admin_slider_pos - e.clientX;
        this.dragging = false;
        core.browser.event.kill(e);
    },



    processDrag: function(e) {
        e = core.browser.event.fix(e);
        if(Math.abs(e.clientX - this.start_clientX) > 5) {
            this.dragging = true;
            core.data.admin_slider_pos = this.drag_ofs + e.clientX;
            this.updateBoltsPosition();
        }
    },


    onBoltMouseUp: function(e, name) {
        core.browser.event.pop();        
        if(this.dragging) {
            var r = {
                dialog: "desktop",
                act: "set",
                key: "admin_slider_pos",
                data: varToString(core.data.admin_slider_pos)
            };
            core.transport.send("/controller.php", r, null, "POST");            
        } else {
            this.toggleSection(name);
        }
        this.dragging = false;
    },



    toggleSection: function(name, skip_collapse) {
        var fl = this.initSectionContent(name);
        if(fl && this.is_expanded) return;

        if(!this.is_expanded) {
            this.is_expanded = true;
            this.slide(this.$["content"].offsetHeight, 0);
        } else if(!skip_collapse) {
            this.is_expanded = false;
            this.slide(0, this.$["content"].offsetHeight);
        }
    },



    hide: function() {
        if(this.is_expanded) {
            this.is_expanded = false;
            this.slide(0, this.$["content"].offsetHeight);
            if(this.content_objects[this.active_section]) {
//                this.content_objects[this.active_section].callFunction("onCollapse");
            }
        }
    },


    initSectionContent: function(name) {
        if(this.active_section != name) {
            if(this.active_section) {
                this.$["bolt" + this.active_section].className = "bolt";
                this.content_objects[this.active_section].hide();
            }
            this.active_section = name;
            this.$["bolt" + name].className = "bolt bolt_active";
            if(!this.content_objects[name]) {
                this.content_objects[name] = new core.objects["admin_" + name](this.$["content"]);
                this.content_objects[name].name = name;
            }
            this.content_objects[name].show();
            if(this.content_objects[name].refresh) {
                this.content_objects[name].refresh();
            }
            return true;
        } else {
            if(this.content_objects[name].refresh) {
                this.content_objects[name].refresh();
            }
            return false;
        }
    },



    get: function(name) {
        return this.content_objects[name];
    },


    // window onresize events
    onWindowResize: function() {
        if(this.is_expanded && this.active_section && this.content_objects[this.active_section].onWindowResize) {
            this.content_objects[this.active_section].onWindowResize();
        }
    },



    // slide
    slide: function(start_height, end_height) {
        this.is_scrolling = true;
        this.$["slider"].style.top = "-" + start_height + "px";
        for(var i=1; i<=10; i++) {
            if(i == 10) {
                var h = end_height;
            } else {
                var h = start_height + (end_height - start_height) * i / 10;
            }
            setTimeout(this.setSlidePosition.bind(this, h, i == 10), i * 20);
        }
    },


    setSlidePosition: function(h, is_final) {
        if(is_final) {
            this.is_scrolling = false;
        }

        this.$["slider"].style.top = "-" + h + "px";

        var sh = this.$["slider"].offsetHeight,
            scroll = core.browser.getScroll(),
            margin = sh - this.$["content"].offsetHeight;

            
        if(scroll.top < sh) {
            margin = this.$["slider"].offsetHeight - h;
        }
        desktop.$["document_wrapper"].style.marginTop = this.$.header.offsetHeight + margin + "px";

        var app = desktop.layout.getActiveApp();
        if(app && app.focused) {
            app.updateOuterOverlayPosition();
        }
    },



    refresh: function() {
        if(!this.is_expanded) return;
        if(this.active_section == "styles_catalog") {
            this.content_objects[this.active_section].refresh();
        }
    },




    // mobile data cleaner

    onClearMobileDataClick: function() {
        desktop.modal_dialog.confirm(
            "Are you sure?", 
            this.clearMobileData.bind(this)
        );
    },


    clearMobileData: function() {
        desktop.setState("loading");
        var p = {
            dialog: "layout_columns",
            act: "clear_mobile_data"
        };
        core.transport.send("/controller.php", p, this.onClearMobileDataResponse.bind(this));
    },


    onClearMobileDataResponse: function(r) {
        desktop.setState("normal");
        if(!r || r.status != "ok") {
            desktop.modal_dialog.alert("Server error");
            return;
        }
        desktop.loadURL(location.href);
    },



    // header
    onPreviewClick: function() {
        if(this.preview_window) {
            this.preview_window.close();
        }
        this.preview_window = window.open(location.href.split("#")[0] + "#preview", "page_preview");
    },

    onRunImportClick:function(){
        desktop.setState("loading");
        var p = {
            dialog: "import"
        };
        core.transport.send("/controller.php", p, this.onRunImportClickResponse.bind(this));
        return false;
    },

    onRunImportClickResponse:function(data){
        desktop.setState("normal");
        var p = {
            title: "Import result",
            message: data,
            disable_close: true,
            buttons: [
                {
                    title: "Ok",
                    ok_button: true
                }
            ]
        }
            desktop.modal_dialog.open(p);
    },

    onExitClick: function(e) {
        desktop.admin_toolbars.exitEditor();
    },


    onSaveClick: function(e) {
        desktop.modal_dialog.confirm(
            "Do you want others to see your site?",
            this.onSaveYes.bind(this),
            this.onSaveNo.bind(this)
        );
    },


    onSaveYes: function() {
        desktop.loadURL("http://" + core.data.home_domain + "/?dialog=plan_wizard");
    },


    onSaveNo: function() {
        desktop.loadURL("http://" + core.data.home_domain + "/?dialog=close_account");
    },



    setMode: function(e) {
        e = core.browser.event.fix(e);
        if(e.target.mode == core.data.layout_mode) return;
        desktop.setState("loading");
        var p = {
            dialog: "layout_columns",
            act: "set",
            mode: e.target.mode
        };
        core.transport.send("/controller.php", p, this.onSetLayoutModeResponse.bind(this,e.target.mode));
    },


    onSetLayoutModeResponse: function(mode,r) {
        if(r && r.status == "ok") {
            if(mode == 'mobile'){
                desktop.loadURL("?dialog=mobile");
            }else{
                core.browser.cookies.set('is_mobile_viewer',1,0);
                desktop.loadURL();
            }
        }
    }




};
core.apps.admin_slider.extendPrototype(core.components.html_component);