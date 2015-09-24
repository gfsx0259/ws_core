core.apps.image_editor = function() {};


core.apps.image_editor.prototype = {


    max_image_width: 1024,
    max_image_height: 768,

    
    img_sizes: {
        "big": { width: 1024, height: 768 },
        "medium": { width: 800, height: 600 },
        "small": { width: 640, height: 480 }
    },


    actions: {
        "resize": {
            title: "Resize",
            controls: [ "ctrl_rect_size" ]
        },
        "flip": {
            title: "Flip",
            controls: [ "ctrl_direction_vh" ]
        },
        "rotate": {
            title: "Rotate",
            controls: [ "ctrl_angle" ]
        },
        "crop": { 
            title: "Crop",
            controls: [ "ctrl_crop" ]
        },
        "border": {
            title: "Border",
            controls: [ "ctrl_size", "ctrl_color" ]
        },
        "photo": {
            title: "Photo",
            controls: [ ]
        },
        "shadow": {
            title: "Shadow",
            controls: [ ]
        },
        "mirrorshadow": {
            title: "Mirror",
            controls: [ ]
        },
        "perspective": {
            title: "Perspective",
            controls: [ "ctrl_direction_h", "ctrl_quart_angle" ]
        },
        "roundedcorners": {
            title: "Rounded Corners",
            controls: [ "ctrl_radius" ]
        }
    },



    getTitle: function() {
        return "Edit image";
    },



    renderContent: function() {
    
        this.displayTpl(this.$["content"], "image_editor");
        this.$["max_image_size"].innerHTML = this.max_image_width + "x" + this.max_image_height + " px";
        core.browser.element.disableSelection(this.$["preview"]);

        for(var c in this.actions) {
            var a = this.actions[c];
            this.buildModel(this.$["tools"],
                { tag: "a",
                  id: "btn_action" + c,
                  events: { onclick: [ "setAction", c ] },
                  childs: [
                    { tag: "img", src: "/static/image_editor/" + c + ".png" },
                    { tag: "text", innerHTML: a.title }
                  ]}
            );
        }
    },


    onShowContent: function() {
        var d = core.values.image_editor;
        if(d) {
            this.callback = d.callback;
            this.editFile(d.file);
            core.values.image_editor = null;
        }
    },


    onHideContent: function() {
        this.clearTmp();
    },

    // tools

    setAction: function(e, action) {
        if(this.activeAction == action) return;
        if(this.activeAction) {
            this.hideActionConrols(this.activeAction);
            this.$["btn_action" + this.activeAction].className = "";
            this.hideElements(this.actions[this.activeAction].controls);
        }
        this.activeAction = action;
        this.$["btn_action" + action].className = "active";
        this.$["btn_action" + action].blur();
        if(action != "resize" && (this.data.width > this.max_image_width || this.data.height > this.max_image_height)) {
            this.showElement("msg_need_resize");
            this.hideElements(["btn_apply_settings", "btn_reset_settings"]);
        } else {
            this.hideElement("msg_need_resize");
            this.showElements(this.actions[this.activeAction].controls);
            this.showActionConrols(action);
            this.showElements(["btn_apply_settings", "btn_reset_settings"]);
        }
    },


    showActionConrols: function(action) {
        if(action == "crop") {
            this.showCropControls();
        }
    },

    hideActionConrols: function(action) {
        if(action == "crop") {
            this.hideCropControls();
        }
    },



    // settings

    setAngle: function(e) {
        e = core.browser.event.fix(e);
        this.$["inp_angle"].value = e.target.value;
        e.target.blur();
    },

    setQAngle: function(e) {
        e = core.browser.event.fix(e);
        this.$["inp_quart_angle"].value = e.target.value;
        e.target.blur();
    },


    setPercentageSize: function(e) {
        e = core.browser.event.fix(e);
        var p = e.target.value;
        this.$["inp_width"].value = Math.floor(this.data.width * p / 100);
        this.$["inp_height"].value = Math.floor(this.data.height * p / 100);
    },

    setValueSize: function(e) {
        e = core.browser.event.fix(e);
        var s = this.img_sizes[e.target.value];
        this.$["inp_width"].value = s.width;
        this.$["inp_height"].value = s.height;
    },


    // editor

    editFile: function(d) {
        this.isTmpClean = false;
        this.zoom = 100;
        this.isOriginal = true;
        this.$["btn_save"].disabled = true;
        this.hideElement("msg_error");
        this.setAction(null, "resize");

        this.initial_data = d;
        this.setFileInfo(d);
    },


    // d: { file, width, height }
    setFileInfo: function(d) {
        this.data = d;

        this.$["original_image_size"].innerHTML = d.width + "x" + d.height + " px";

        this.$["inp_width"].value = d.width;
        this.$["inp_height"].value = d.height;
        this.$["inp_left"].value = 0;
        this.$["inp_top"].value = 0;

        this.$["inp_crop_width"].value = d.width;
        this.$["inp_crop_height"].value = d.height;
        this.$["inp_crop_left"].value = 0;
        this.$["inp_crop_top"].value = 0;

        this.$["inp_size"].value = 10;

        this.$["inp_angle"].value = 90;
        this.$["inp_color"].value = "007EFC";
        this.$["inp_color"].style.background = "#007EFC";

        this.$["inp_quart_angle"].value = 45;
        this.$["inp_radius"].value = 10;

        this.$["inp_new_file"].value = this.getNewFileName(d.file);

        this.updatePreview();
    },



    onApplyClick: function() {
        this.hideElement("msg_error");

        var p = {};

        switch(this.activeAction) {

            case "resize":
                p.width = parseInt(this.$["inp_width"].value, 10) || 0;
                this.$["inp_width"].value = p.width;
                p.height = parseInt(this.$["inp_height"].value, 10) || 0;
                this.$["inp_height"].value = p.height;
                if(p.width <= 0 || p.width > this.max_image_width || p.height <= 0 || p.height > this.max_image_height) {
                    this.showError("Incorrect new image size");
                    return;
                }
                break;

            case "flip":
                p.direction = this.$["inp_direction_vh"].value;
                break;

            case "rotate":
                p.angle = parseInt(this.$["inp_angle"].value, 10) || 0;
                this.$["inp_angle"].value = p.angle;
                if(p.angle == 0) {
                    this.showError("Angle can't be equal to zero");
                    return;
                }
                break;

            case "crop":
                p.left = parseInt(this.$["inp_crop_left"].value, 10);
                p.top = parseInt(this.$["inp_crop_top"].value, 10);

                p.width = parseInt(this.$["inp_crop_width"].value, 10);
                p.height = parseInt(this.$["inp_crop_height"].value, 10);

                if(p.top == 0 && p.left == 0 && p.width == this.data.width && p.height == this.data.height) {
                    this.showError("The image size has not changed");
                    return;
                } 
                break;

            case "border":
            case "shadow":
                p.size = parseInt(this.$["inp_size"].value, 10) || 0;
                this.$["inp_size"].value = p.size;
                if(!p.size) {
                    this.showError("Size should be more than zero");
                    return;
                }
                p.color = this.$["inp_color"].value.trim().toUpperCase();
                this.$["inp_color"].value = p.color;
                break;

            case "perspective":
                p.angle = parseInt(this.$["inp_quart_angle"].value, 10) || 0;
                this.$["inp_quart_angle"].value = p.angle;
                if(p.angle < 0 || p.angle > 90) {
                    this.showError("Angle should be between 0 and 90 degrees");
                    return;
                }
                p.direction = this.$["inp_direction_h"].value;
                break;

            case "mirrorshadow":
            case "photo":
                break;

            case "roundedcorners":
                p.radius = parseInt(this.$["inp_radius"].value, 10) || 10;
                this.$["inp_radius"].value = p.radius;
                break;

            default:
                this.showError("Unknown action");
                return;
        }
        if(this.isOriginal) {
            p.file = this.initial_data.file;
        } else {
            p.tmp_file = this.data.file;
        }
        p.act = this.activeAction;
        p.dialog = "image_editor";
        desktop.setState("loading");

        core.transport.send("/controller.php", p, this.onImageChangedResponce.bind(this));
    },


    onResetClick: function(r) {
        this.hideElement("msg_error");
        this.$["btn_save"].disabled = true;
        this.isOriginal = true;
        this.setFileInfo(this.initial_data);
    },


    onImageChangedResponce: function(r) {
        desktop.setState("normal");
        if(!r || !r.status) {
            this.showError("Server error");
            return;
        } else if(r.status == "error") {
            this.showError(r.msg);
            return;
        }

        switch(r.status) {
            case "error":
                this.showError(r.msg);
                break;

            case "effect_ok":
                this.isOriginal = false;
                this.$["btn_save"].disabled = false;
                this.setFileInfo(r.data);
                break;
        }
    },



    clearTmp: function() {
        if(this.isTmpClean) return;
        if(!this.isOriginal) {
            var p = {
                dialog: "image_editor",
                act: "delete_tmp",
                tmp_file: this.data.file
            };
            core.transport.send("/controller.php", p);
            this.isTmpClean = true;
        }
    },



    onSaveClick: function(e) {
        if(this.isOriginal) return;

        var new_file = this.$["inp_new_file"].value.trim();
        if(!new_file.length) {
            this.$["inp_new_file"].focus();
            this.showError("Wrong file name");

        } else {
            desktop.setState("loading");
            var p = {
                dialog: "image_editor",
                act: "move_tmp",
                tmp_file: this.data.file,
                new_file: new_file,
                type: this.$["inp_new_file_type"].value,
                quality: this.$["inp_jpg_quality"].value
            };
            core.transport.send("/controller.php", p, this.onFileMoveResponce.bind(this));
        }
    },


    onFileMoveResponce: function(r) {
        this.isTmpClean = true;

        desktop.refreshFilesManager();

        desktop.setState("normal");
        desktop.hidePopupApp();
        if(r) {
            var tmp = new Image();
            tmp.src = core.common.getUserFile(r);

            if(this.callback) {
                this.callback(r);
            }
        }
    },


    // controls

    showColorPicker: function(e) {
        this.isTmpClean = true;
        desktop.showColorPicker(this.$["inp_color"].value, this.onColorSelected.bind(this));
    },


    onColorSelected: function(c) {
        this.$["inp_color"].value = "#" + c;
        this.$["inp_color"].style.background = "#" + c;
    },




    // preview

    onZoomInClick: function(e) {
        this.zoom += this.zoom < 25 ? 5 : 25;
        if(this.zoom > 300) this.zoom = 300;
        this.updateZoom();
    },

    onZoomOutClick: function(e) {
        this.zoom -= this.zoom <= 25 ? 5 : 25;
        if(this.zoom < 5) this.zoom = 5;
        this.updateZoom();
    },

    updateZoom: function() {
        this.$["zoom_value"].innerHTML = this.zoom + "%";

        var imgH = Math.floor(this.data.height * this.zoom / 100);
        var imgW = Math.floor(this.data.width * this.zoom / 100);

        var ph = this.$["preview_box"].offsetHeight;
        var mTop = ph > imgH ? Math.floor((ph - imgH) * 0.5) : 0;

        var es = this.$["preview"].style;
        es.width = imgW + "px";
        es.height = imgH + "px";
        es.marginTop = mTop + "px";

        if(this.activeAction == "crop") {
            this.updateCropControls();
        }
    },


    updatePreview: function() {
        this.$["preview"].src = 
            this.isOriginal ?
            core.common.getUserFile(this.data.file)
            :
            "http://" + core.data.base_host + "/var/image_editor/" + core.data.site_info.id + "/" + this.data.file + "?rnd=" + Math.random();
        this.updateZoom();
    },



    // sys

    showError: function(str) {
        this.showElement("msg_error");
        this.$["msg_error"].innerHTML = str;
    },



    getNewFileName: function(file) {
        var f = file.split(".");
        f.pop();
        var name = f.join(".") + "_";

        var n = 1;
        var new_name = "";

        do {
            n++;
            new_name = name + n;
        } while (this.isFileExists(new_name));
        return new_name;
    },


    isFileExists: function(file) {
        var l = core.data.user_files;
        if(!l) return false;
        for(var i=0; i<l.length; i++) {
            if(l[i].name == file) return true;
        }
        return false;
    },

    onFileTypeChanged: function() {
        this.$["inp_jpg_quality"].style.display = this.$["inp_new_file_type"].value == "jpg" ? "inline" : "none";
    },




    // crop

    min_crop: {
        width: 8,
        height: 8
    },

    processCropForm: function(e) {
        var l = parseInt(this.$["inp_crop_left"].value, 10);
        if(!l) {
            l = 0
        } else if(l > this.data.width - this.min_crop.width) {
            l = this.data.width - this.min_crop.width;
        }
        this.$["inp_crop_left"].value = l;

        var t = parseInt(this.$["inp_crop_top"].value, 10);
        if(!t) {
            t = 0
        } else if(t > this.data.height - this.min_crop.height) {
            t = this.data.height - this.min_crop.height;
        }
        this.$["inp_crop_top"].value = t;

        var w = parseInt(this.$["inp_crop_width"].value, 10);
        if(!w || w < this.min_crop.width) {
            w = this.min_crop.width;
        } else if(w + l > this.data.width) {
            w = this.data.width - l;
        }
        this.$["inp_crop_width"].value = w;

        var h = parseInt(this.$["inp_crop_height"].value, 10);
        if(!h || h < this.min_crop.height) {
            h = this.min_crop.height;
        } else if(h + t > this.data.height) {
            h = this.data.height - t;
        }
        this.$["inp_crop_height"].value = h;

        this.crop_data = {
            left: l,
            top: t,
            width: w,
            height: h
        };
        this.updateCropControls();
        this.hideElement("msg_error");
    },


    showCropControls: function() {
        this.showElement("crop_control");
        this.processCropForm();
    },


    updateCropControls: function() {
        var es = this.$["crop_control"].style;
        var d = this.crop_data;

        var p = this.$["preview"];
        es.left = p.offsetLeft + Math.floor(this.zoom * d.left / 100) - 1 + "px";
        es.top = p.offsetTop + Math.floor(this.zoom * d.top / 100) - 1 + "px";

        es.width = Math.floor(this.zoom * d.width / 100) + "px";
        es.height = Math.floor(this.zoom * d.height / 100) + "px";
    },


    hideCropControls: function() {
        this.hideElement("crop_control");
    },


    onCropDragStart: function(e) {
        e = core.browser.event.fix(e);
        var el = e.target;
        this.drag_mode = el.mode;

        this.drag_ofs = {
            left: e.clientX,
            top: e.clientY
        };
        this.drag_data = clone(this.crop_data);

        core.browser.element.disableSelection(document.body);
        document.body.focus();

        this.old_mm = document.onmousemove;
        document.onmousemove = this.onCropDragMove.bindAsEventListener(this);
        document.onmouseup = this.onCropDragEnd.bindAsEventListener(this);
        core.browser.event.kill(e);
    },

    onCropDragMove: function(e) {
        document.tile = this.drag_dir;
        e = core.browser.event.fix(e);

        var dl = Math.floor(100 * (e.clientX - this.drag_ofs.left) / this.zoom);
        var dt = Math.floor(100 * (e.clientY - this.drag_ofs.top) / this.zoom);

        var dd = this.drag_data;
        var cd = this.crop_data;

        switch(this.drag_mode) {
            case "move":
                var l = dd.left + dl;
                if(l < 0) { 
                    l = 0;
                } else if(l + cd.width > this.data.width) {
                    l = this.data.width - cd.width;
                }
                var t = dd.top + dt;
                if(t < 0) { 
                    t = 0;
                } else if(t + cd.height > this.data.height) {
                    t = this.data.height - cd.height;
                }

                this.crop_data.left = l;
                this.crop_data.top = t;
                break;


            case "left":
                var d = dd.left + dd.width;
                var w = dd.width - dl;
                if(w < this.min_crop.width) {
                    w = this.min_crop.width;
                } else if(w > d) {
                    w = d;
                }
                this.crop_data.left = d - w;
                this.crop_data.width = w;
                break;


            case "right":
                var w = dd.width + dl;
                if(w < this.min_crop.width) {
                    w = this.min_crop.width;
                } else if(cd.left + w > this.data.width) {
                    w = this.data.width - cd.left;
                }
                this.crop_data.width = w;
                break;

            case "top":
                var d = dd.top + dd.height;
                var h = dd.height - dt;
                if(h < this.min_crop.height) {
                    h = this.min_crop.height;
                } else if(h > d) {
                    h = d;
                }
                this.crop_data.top = d - h;
                this.crop_data.height = h;
                break;

            case "bottom":
                var h = dd.height + dt;
                if(h < this.min_crop.height) {
                    h = this.min_crop.height;
                } else if(cd.top + h > this.data.height) {
                    h = this.data.height - cd.top;
                }
                this.crop_data.height = h;
                break;

            default:
                this.onCropDragEnd();
                return;
                break;
        }
        this.updateCropControls();

        var cd = this.crop_data;

        this.$["inp_crop_left"].value = cd.left;
        this.$["inp_crop_top"].value = cd.top;
        this.$["inp_crop_width"].value = cd.width;
        this.$["inp_crop_height"].value = cd.height;
    },

    onCropDragEnd: function(e) {
        core.browser.element.enableSelection(document.body);
        document.onmousemove = this.old_mm;
        document.onmouseup = null;
    }

    
};
core.apps.image_editor.extendPrototype(core.components.html_component);
core.apps.image_editor.extendPrototype(core.components.popup_app);