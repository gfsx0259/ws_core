core.apps.color_picker = function () {
    this.color = {}
};


core.apps.color_picker.prototype = {


    getTitle: function () {
        return "Color picker";
    },


    renderContent: function () {
        this.displayTpl(this.$["content"], "color_picker");
    },


    onShowContent: function () {
        var d = core.values.color_picker;
        this.callback = d.callback;
        this.setHexColor(this.validateHex(d.color) || "FF0000");
    },


    onPopupOkClick: function (e) {
        if (this.callback) {
            this.callback(this.color.hex);
        }
        desktop.hidePopupApp();
    },


    // map cursor drag

    setMapPos: function (left, top) {
        var cur = this.$["map_cursor"];
        var ofs = {
            left: Math.ceil(cur.offsetWidth * 0.5) - 1,
            top: Math.ceil(cur.offsetHeight * 0.5) - 1
        };
        cur.style.left = left - ofs.left + "px";
        cur.style.top = top - ofs.top + "px";
    },


    onMapDragStart: function (e) {
        if (this.isMapDragging) {
            return;
        }
        this.isMapDragging = true;
        core.browser.event.push(document, ["onmousemove", "onmouseup"]);
        document.onmousemove = this.onMapDrag.bindAsEventListener(this);
        document.onmouseup = this.onMapDragEnd.bindAsEventListener(this);

        this.onMapDrag(e);
        core.browser.event.kill(e);
    },


    onMapDrag: function (e) {
        e = core.browser.event.fix(e);
        var scroll = core.browser.getScroll();
        var el_pos = core.browser.element.getPosition(this.$["map"]);

        var l = e.clientX - el_pos.left;
        var t = e.clientY - el_pos.top + scroll.top;
        if (l < 0) l = 0;
        if (l > 255) l = 255;
        if (t < 0) t = 0;
        if (t > 255) t = 255;

        this.color.hsv.h = Math.round(360 * l / 255);
        this.color.hsv.v = 100 - Math.round(100 * t / 255);
        this.color.rgb = this.hsv2rgb(this.color.hsv);
        this.color.hex = this.rgb2hex(this.color.rgb);
        this.refresh();
    },

    onMapDragEnd: function (e) {
        core.browser.event.kill(e);
        this.isMapDragging = false;
        core.browser.event.pop();
    },


    // bar cursor drag

    setBarPos: function (v) {
        var cur = this.$["bar_cursor"];
        var ofs = Math.floor(cur.offsetHeight * 0.5) - 1;
        cur.style.top = v - ofs + "px";
    },


    onBarStartDrag: function (e) {
        if (this.isBarDragging) {
            return;
        }
        this.isBarDragging = true;
        core.browser.event.push(document, ["onmousemove", "onmouseup"]);
        document.onmousemove = this.onBarDrag.bindAsEventListener(this);
        document.onmouseup = this.onBarDragEnd.bindAsEventListener(this);

        this.onBarDrag(e);
        core.browser.event.kill(e);
    },


    onBarDrag: function (e) {
        e = core.browser.event.fix(e);
        var scroll = core.browser.getScroll();
        var el_pos = core.browser.element.getPosition(this.$["map"]);
        var t = e.clientY - el_pos.top + scroll.top;
        if (t < 0) {
            t = 0;
        } else if (t > 255) {
            t = 255;
        }

        this.color.hsv.s = 100 - Math.round(100 * t / 255);
        this.color.rgb = this.hsv2rgb(this.color.hsv);
        this.color.hex = this.rgb2hex(this.color.rgb);
        this.refresh();
    },

    onBarDragEnd: function (e) {
        core.browser.event.kill(e);
        this.isBarDragging = false;
        core.browser.event.pop();
    },


    // controls & inputs

    updateInputs: function () {
        var c = this.color;
        this.$["inp_rgb_r"].value = c.rgb.r;
        this.$["inp_rgb_g"].value = c.rgb.g;
        this.$["inp_rgb_b"].value = c.rgb.b;

        this.$["inp_hsv_h"].value = c.hsv.h;
        this.$["inp_hsv_s"].value = c.hsv.s;
        this.$["inp_hsv_v"].value = c.hsv.v;
        this.$["inp_hex"].value = c.hex;
    },


    updateControls: function () {
//        this.setElementOpacity("map_overlay", 100 - this.color.hsv.s);
        this.setBarPos(Math.floor(255 * (100 - this.color.hsv.s) / 100));
        this.setMapPos(
            Math.floor(255 * this.color.hsv.h / 360),
            Math.floor(255 * (100 - this.color.hsv.v) / 100)
        );
        this.$["preview"].style.background = "#" + this.color.hex;

        var c2 = clone(this.color.hsv);
        c2.s = 100;
        var c2hex = this.rgb2hex(this.hsv2rgb(c2));
        this.$["bar"].style.background = "#" + c2hex;
    },


    refresh: function () {
        this.updateInputs();
        this.updateControls();
    },

    // sys

    setHexColor: function (c) {
        this.color.rgb = this.hex2rgb(c);
        this.color.hsv = this.rgb2hsv(this.color.rgb);
        this.color.hex = c;

        this.refresh();
    },


    getColor: function () {
        return this.color;
    },


    setHSV: function (c) {
        this.color = {
            hsv: hsv,
            rgb: this.hsv2rgb(c)
        };
        this.color.hex = this.rgb2hex(this.color.rgb);
    },


    // transform

    hsv2rgb: function (hsv) {
        rgb = {r: 0, g: 0, b: 0};

        var h = hsv.h;
        var s = hsv.s;
        var v = hsv.v;

        if (s == 0) {
            if (v == 0) {
                rgb.r = rgb.g = rgb.b = 0;
            } else {
                rgb.r = rgb.g = rgb.b = parseInt(v * 255 / 100);
            }
        } else {
            if (h == 360) {
                h = 0;
            }
            h /= 60;

            // 100 scale
            s = s / 100;
            v = v / 100;

            var i = parseInt(h);
            var f = h - i;
            var p = v * (1 - s);
            var q = v * (1 - (s * f));
            var t = v * (1 - (s * (1 - f)));
            switch (i) {
                case 0:
                    rgb.r = v;
                    rgb.g = t;
                    rgb.b = p;
                    break;
                case 1:
                    rgb.r = q;
                    rgb.g = v;
                    rgb.b = p;
                    break;
                case 2:
                    rgb.r = p;
                    rgb.g = v;
                    rgb.b = t;
                    break;
                case 3:
                    rgb.r = p;
                    rgb.g = q;
                    rgb.b = v;
                    break;
                case 4:
                    rgb.r = t;
                    rgb.g = p;
                    rgb.b = v;
                    break;
                case 5:
                    rgb.r = v;
                    rgb.g = p;
                    rgb.b = q;
                    break;
            }

            rgb.r = parseInt(rgb.r * 255);
            rgb.g = parseInt(rgb.g * 255);
            rgb.b = parseInt(rgb.b * 255);
        }

        return rgb;
    },


    rgb2hsv: function (rgb) {
        var r = rgb.r / 255;
        var g = rgb.g / 255;
        var b = rgb.b / 255;

        hsv = {h: 0, s: 0, v: 0};

        var min = 0;
        var max = 0;

        if (r >= g && r >= b) {
            max = r;
            min = (g > b) ? b : g;
        } else if (g >= b && g >= r) {
            max = g;
            min = (r > b) ? b : r;
        } else {
            max = b;
            min = (g > r) ? r : g;
        }

        hsv.v = max;
        hsv.s = (max) ? ((max - min) / max) : 0;

        if (!hsv.s) {
            hsv.h = 0;
        } else {
            delta = max - min;
            if (r == max) {
                hsv.h = (g - b) / delta;
            } else if (g == max) {
                hsv.h = 2 + (b - r) / delta;
            } else {
                hsv.h = 4 + (r - g) / delta;
            }

            hsv.h = parseInt(hsv.h * 60);
            if (hsv.h < 0) {
                hsv.h += 360;
            }
        }

        hsv.s = parseInt(hsv.s * 100);
        hsv.v = parseInt(hsv.v * 100);

        return hsv;
    },


    rgb2hex: function (c) {
        var r =
            (0x100 | c.r).toString(16).substr(1) +
            (0x100 | c.g).toString(16).substr(1) +
            (0x100 | c.b).toString(16).substr(1);
        return r.toUpperCase();
    },


    hex2rgb: function (hex) {
        hex = this.validateHex(hex);
        var r = '00', g = '00', b = '00';

        if (hex.length == 6) {
            r = hex.substring(0, 2);
            g = hex.substring(2, 4);
            b = hex.substring(4, 6);
        } else {
            if (hex.length > 4) {
                r = hex.substring(4, hex.length);
                hex = hex.substring(0, 4);
            }
            if (hex.length > 2) {
                g = hex.substring(2, hex.length);
                hex = hex.substring(0, 2);
            }
            if (hex.length > 0) {
                b = hex.substring(0, hex.length);
            }
        }

        return {
            r: parseInt(r, 16),
            g: parseInt(g, 16),
            b: parseInt(b, 16)
        }
    },


    validateHex: function (hex) {
        hex = String(hex).toUpperCase();
        hex = hex.replace(/[^A-F0-9]/g, '');
        if (hex.length < 6) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        } else if (hex.length > 6) {
            hex = hex.substring(0, 6);
        }
        return hex;
    },


    onHexChange: function (e) {
        var v = this.$["inp_hex"].value;
        v = this.validateHex(v);
        this.$["inp_hex"].value = v;
        this.setHexColor(v);
    }

};
core.apps.color_picker.extendPrototype(core.components.html_component);
core.apps.color_picker.extendPrototype(core.components.popup_app);