core.objects.admin_toolbar =  {


    init: function(name) {
        this.name = name;
        this.displayTpl(document.body, this.template);
        this.$["window"].className += " admin_toolbar_" + this.name;
        this.callFunction("renderContent");
        if(this.resize_height_element) {
            this.buildModel(this.$["content"], 
                { tag: "div", 
                  id: "resize_bottom",
                  events: { onmousedown: ["startDrag", "resize"]},
                  className: "bottom_gripper" }
            );
        }
    },


    onWindowMouseOver: function() {
        desktop.admin_toolbars.bringToFront(this.name);
    },


    setTitle: function(str) {
        if(this.$["title"]) {
            this.$["title"].innerHTML = str;
        }
    },


    setElementDisabled: function(id, flag) {
        if(flag) {
            if(this.$[id].className.indexOf("disabled") == -1) {
                this.$[id].className += " disabled";
            }
        } else {
            this.$[id].className = this.$[id].className.replace("disabled", "");
        }
    },





// show/hide
    show: function(skip_session_update) {
        this.setState({ visible: true });
        this.updatePosition();
        if(!skip_session_update) {
            this.saveState();
        }
    },


    hide: function(skip_session_update) {
        this.setState({ visible: false });
        this.updatePosition();
        if(!skip_session_update) {
            this.saveState();
        }
    },


    onHideClick: function(e) {
        this.hide();
    },


// drag&drop
    updatePosition: function() {
        var state = this.getState();
        if(state.visible) {
            this.showElement("window");

            var win_size = core.browser.getWindowSize();
            if(state.left + this.$["window"].offsetWidth > win_size.width) {
                state.left = win_size.width - this.$["window"].offsetWidth;
            }
            state.left = Math.max(0, state.left);
            if(state.top + this.$["window"].offsetHeight > win_size.height) {
                state.top = win_size.height - this.$["window"].offsetHeight;
            }
            state.top = Math.max(0, state.top);


            this.$["inner"].className = state.left > 0.5 * win_size.width ? "admin_toolbar_right_position" : "";

            this.$["window"].style.left = state.left + "px";
            this.$["window"].style.top = state.top + "px";

            if(this.resize_height_element) {
                this.$[this.resize_height_element].style.height = state.height + "px";
                if(state.top + this.$["window"].offsetHeight > win_size.height) {
                    state.height -= (state.top + this.$["window"].offsetHeight - win_size.height);
                    if(state.height < 40) state.height = 40;
                    this.$[this.resize_height_element].style.height = state.height + "px";
                }
            }
        } else {
            this.hideElement("window");
        }
    },



   
    startDrag: function(e, resize_mode) {
        e = core.browser.event.fix(e);

        this.drag_resize_mode = resize_mode;
        var pos = this.getState();
        if(this.drag_resize_mode) {
            pos.height = pos.height || this.$[this.resize_height_element].offsetHeight;
            this.drag_offset = pos.height - e.clientY;
        } else {
            this.drag_offset = {
                x: pos.left - e.clientX,
                y: pos.top - e.clientY
            }
        }
        core.browser.event.push(document, ["onmousemove", "onmouseup"]);
        document.onmousemove = this.processDrag.bindAsEventListener(this);
        document.onmouseup = this.stopDrag.bindAsEventListener(this);
        core.browser.event.kill(e);
    },



    processDrag: function(e) {
        e = core.browser.event.fix(e);
        if(this.drag_resize_mode) {
            var pos = {
                height: this.drag_offset + e.clientY
            }
            pos.height = Math.max(0, pos.height);
        } else {
            var pos = {
                left: this.drag_offset.x + e.clientX,
                top: this.drag_offset.y + e.clientY
            }
            pos.left = Math.max(0, pos.left);
            pos.top = Math.max(0, pos.top);
        }
        this.setState(pos);
        this.updatePosition();
    },


    stopDrag: function(e) {
        core.browser.event.pop();
        this.saveState();
    },




// state
    getState: function() {
        return core.data.admin_toolbars_state[this.name];
    },


    setState: function(data) {
        if(!core.data.admin_toolbars_state[this.name]) {
            core.data.admin_toolbars_state[this.name] = {};
        }
        for(var k in data) {
            core.data.admin_toolbars_state[this.name][k] = data[k];
        }
        this.callFunction("onStateChanged", core.data.admin_toolbars_state[this.name]);
    },


    saveState: function() {
        var r = {
            dialog: "session_data",
            act: "set",
            key: "admin_toolbars_state",
            data: varToString(core.data.admin_toolbars_state)
        }
        core.transport.send("/controller.php", r, null, "POST");
    }

}