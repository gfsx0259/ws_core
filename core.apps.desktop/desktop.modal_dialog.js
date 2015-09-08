core.apps.desktop.prototype.modal_dialog = {

// interface

    alert: function(title) {
        var p = {
            title: title,
            buttons: [
                { title: "Ok", ok_button: true }
            ]
        }
        this.open(p);
    },


    confirm: function(title, callback_yes, callback_no) {
        var p = {
            title: title,
            buttons: [
                { title: "Yes", 
                  callback: callback_yes, 
                  ok_button: true },
                { title: "No", callback: callback_no }
            ]
        }
        this.open(p);
    },


    prompt: function(title, initial_value, callback) {
        var p = {
            title: title,
            form: [
                { name: "text", type: "text", value: initial_value }
            ],
            buttons: [
                { title: "Ok", 
                  ok_button: true, 
                  callback: this.onPromptOkClick.bind(this, callback) },
                { title: "Cancel" }
            ]
        }
        this.open(p);
    },


    prompt2: function(title, initial_value, message, callback) {
        var p = {
            title: title,
            form: [
                { name: "text", type: "text", value: initial_value }
            ],
            message: message,
            buttons: [
                { title: "Ok", 
                  ok_button: true, 
                  callback: this.onPromptOkClick.bind(this, callback) },
                { title: "Cancel" }
            ]
        }
        this.open(p);
    },



    progress: function(title, percents, message) {
        var p = {
            title: title,
            disable_close: true,
            progress_bar: true,
            message: message
        }
        this.open(p);
        this.$.message.innerHTML = message;
        var el = this.$.progress_bar.firstChild;
        percents = percents + "%"
        el.style.width = percents;
        el.innerHTML = percents + "&nbsp;";
    },

    progressDynamic: function(title) {
        var p = {
            title: title,
            disable_close: true,
            progress_bar: false,
            message: 'gif_loader'
        }
        this.open(p);
    },


// interface code


    onPromptOkClick: function(callback, data) {
        if(callback) {
            callback(data.text);
        }
    },



// sys
    open: function(params) {
        if(this.visible) return;

        this.visible = true;

        this.params = params;
       
        this.render();
        this.$["message"].innerHTML = '';
        if(this.params.disable_close) {
            this.hideElement("btn_close");
        } else {
            this.showElement("btn_close");
        }

        this.$["title"].innerHTML = params.title || "";
        if(params.message) {
            if(params.message == "gif_loader"){
                this.$["message"].className = "gif_load";
            }else{
                this.$["message"].innerHTML = params.message;
                this.showElement("message");
            }

        } else {
            this.hideElement("message");
        }
        if(params.progress_bar) {
            this.showElement("progress_bar");
        } else {
            this.hideElement("progress_bar");
        }
        if(params.buttons && params.buttons.length) {
            this.$["footer"].innerHTML = "";
            var m = [], bm;
            for(var i=params.buttons.length-1; i>=0; i--) {
                if(params.buttons[i].type == "link") {
                    bm = 
                        { tag: "a", 
                          html: params.buttons[i].title,
                          events: { onclick: ["onButtonClick", i] } }
                } else {
                    bm =
                        { tag: "wsc_button", 
                          title: params.buttons[i].title,
                          events: { onclick: ["onButtonClick", i] } }
                }
                if(params.buttons[i].className) {
                    bm.className += " " + params.buttons[i].className;
                }
                m.push(bm);
            }
            this.buildModel(this.$["footer"], m);
            this.showElement("footer");
        } else {
            this.hideElement("footer");
        }

        this.renderForm();

        this.showElements(["overlay", "wrapper"]);
//        this.$["window"].style.marginTop = -0.5 * this.$["window"].offsetHeight + "px";
    },



    close: function() {
        this.visible = false;
        this.hideElements(["overlay", "wrapper"]);
    },


    render: function() {
        if(this.is_rendered) return;
        this.is_rendered = true;
        this.displayTpl(document.body, "modal_dialog");
    },


    // form

    renderForm: function() {
        if(this.params.form && this.params.form.length) {
            this.$["form"].innerHTML = "";
            var m = [], fi;
            for(var i=0; i<this.params.form.length; i++) {
                fi = this.params.form[i];
                m = { tag: "form_row", childs: [] };
                if(fi.label) {
                    m.childs.push({ tag: "label", innerHTML: fi.label });
                }
                m.childs.push(
                    { tag: "wsc_" + fi.type,
                      id: "inp_" + fi.name }
                );
                this.buildModel(this.$["form"], m);
                this.setFormElementValue(fi);
            }
            this.showElement("form");
            if(this.params.form[0].type == "text") {
                this.$["inp_" + this.params.form[0].name].focus();
            }
        } else {
            this.hideElement("form");
        }
    },



    getFormData: function() {
        var res = {}, fi;
        for(var i=0; i<this.params.form.length; i++) {
            fi = this.params.form[i];
            res[fi.name] = this.getFormElementValue(fi);
        }
        return res;
    },


    getFormElementValue: function(fi) {
        if(fi.type == "checkbox") {
            return this.$["inp_" + fi.name].checked;
        } else {
            return this.$["inp_" + fi.name].value;
        }
    },


    setFormElementValue: function(fi) {
        switch(fi.type) {
            case "checkbox":
                this.$["inp_" + fi.name].setChecked(fi.value);
                break;
            case "text":
                this.$["inp_" + fi.name].value = fi.value;
                break;
            default:
                this.$["inp_" + fi.name].setValue(fi.value);
        }
    },

    // events

    onButtonClick: function(e, idx) {
        this.close();
        if(!this.params) return;
        if(this.params.buttons[idx].callback) {
            if(this.params.form) {
                var res = this.getFormData();
            } else {
                var res = e;
            }
            var cb = this.params.buttons[idx].callback;
            setTimeout(function() { cb(res) }, 10);
        }
        this.params = null;
    },



    getOkButtonIdx: function() {
        if(this.params && this.params.buttons) {
            for(var i=0; i<this.params.buttons.length; i++) {
                if(this.params.buttons[i].ok_button) return i;
            }
        }
        return null;
    },


    onDocumentKeyUp: function(key_code) {
        if(!this.visible) return;
        if(key_code == 27) {
            this.close();
            return true;
        } else if(key_code == 13) {
            var idx = this.getOkButtonIdx();
            if(idx != null) {
                this.onButtonClick(null, idx);
                return true;
            }
        }
    }



}
extendObject(core.apps.desktop.prototype.modal_dialog, core.components.html_component);