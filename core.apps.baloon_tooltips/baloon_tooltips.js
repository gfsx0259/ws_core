core.apps.baloon_tooltips = function() {
    

    core.browser.event.attach(
        document,
        "onmousemove",
        this.onDocMouseMove.bindAsEventListener(this)
    );

    this.data = {};
    this.load_queue = {};
    this.load_delay = 100;
    this.hover_el = null;

    this.show_delay = 1000;

    this.animation = {
        opacity: 0,
        delay: 10
    }
}



core.apps.baloon_tooltips.prototype = {


// visual

    onDocMouseMove: function(e) {
        e = core.browser.event.fix(e);
        var el = e.target;

        while(el && !el.baloon_tooltip_id && el.parentNode) {
            el = el.parentNode;
        }
        if(!el.baloon_tooltip_id || !this.data[el.baloon_tooltip_id]) {
            this.hover_el = null;
            this.fadeOut();
        } else {
            if(el == this.hover_el) return;
            this.hover_el = el;
            clearTimeout(this.show_timeout);
            if(this.is_visible) {
                this.show();
            } else {
                this.show_timeout = setTimeout(this.show.bind(this), this.show_delay);
            }
        }
    },



    show: function() {
        if(!this.hover_el) return;
        clearTimeout(this.blink_timeout);

        if(!this.is_rendered) {
            this.displayTpl(document.body, "baloon_tooltip");
            this.is_rendered = true;
        }

        this.is_visible = true;
        this.$["title"].innerHTML = this.data[this.hover_el.baloon_tooltip_id].title;
        this.$["description"].innerHTML = this.data[this.hover_el.baloon_tooltip_id].description;
        this.fadeIn();
        this.showElement("window");

        var pos = core.browser.element.getPosition(this.hover_el);
        pos.left = pos.left + pos.width * 0.5;

        var scroll = core.browser.getScroll();
        var win_size = core.browser.getWindowSize();

        var baloon_pos = {};
        this.hideElements(["pointer_tl", "pointer_tr", "pointer_bl", "pointer_br"]);

        if(pos.top < scroll.top + win_size.height * 0.7) {
            if(pos.left > scroll.left + win_size.width * 0.7) {
                this.showElement("pointer_tr");
                var padding = this.$["pointer_tr"].offsetHeight - 1;
                baloon_pos.left = pos.left - (this.$["pointer_tr"].offsetLeft + this.$["pointer_tr"].offsetWidth);
            } else {
                this.showElement("pointer_tl");
                var padding = this.$["pointer_tl"].offsetHeight - 1;
                baloon_pos.left = pos.left - this.$["pointer_tl"].offsetLeft
            }
            baloon_pos.top = pos.top + pos.height + 2;
            this.$["inner"].style.paddingTop = padding + "px";
            this.$["inner"].style.paddingBottom = 0;
        } else {
            if(pos.left > scroll.left + win_size.width * 0.7) {
                this.showElement("pointer_br");
                var padding = this.$["pointer_br"].offsetHeight - 1;
                baloon_pos.left = pos.left - (this.$["pointer_br"].offsetLeft + this.$["pointer_br"].offsetWidth);
            } else {
                this.showElement("pointer_bl");
                var padding = this.$["pointer_bl"].offsetHeight - 1;
                baloon_pos.left = pos.left - this.$["pointer_bl"].offsetLeft
            }
            baloon_pos.top = pos.top - this.$["window"].offsetHeight - 2;
            this.$["inner"].style.paddingBottom = padding + "px";
            this.$["inner"].style.paddingTop = 0;
        }
        core.browser.element.setPosition(this.$["window"], baloon_pos);
    },


    hide: function() {
        clearTimeout(this.show_timeout);
        if(!this.is_rendered || !this.is_visible) return;
        this.is_visible = false;
        this.hideElement("window");
    },



    blink: function(el) {
        this.hover_el = el;
        this.show();
        this.blink_timeout = setTimeout(this.hide.bind(this), 3000);
    },


// animation


    fadeOut: function() {
        clearTimeout(this.show_timeout);
        if(!this.is_rendered || !this.is_visible || this.animation.step == -10) return;
        clearTimeout(this.animation_timeout);
        this.animation.step = -10;
        this.animate();
    },

    fadeIn: function() {
        clearTimeout(this.animation_timeout);
        this.animation.step = 10;
        this.animate();
    },



    animate: function() {
        this.animation.opacity += this.animation.step;
        if(this.animation.opacity < 0) {
            this.animation.opacity = 0;
            this.animation.step = 0;
            this.hide();
        } else if(this.animation.opacity > 100) {
            this.animation.opacity = 100;
            this.animation.step = 0;
        } else {
            this.setElementOpacity("window", this.animation.opacity);
            this.animation_timeout = setTimeout(this.animate.bind(this), this.animation.delay);
        }
    },





// data
    load: function(id) {
        if(this.data[id] || this.load_queue[id]) return;
        clearTimeout(this.load_timeout);
        this.load_queue[id] = true;
        this.load_timeout = setTimeout(this.sendRequest.bind(this), this.load_delay);
    },


    sendRequest: function() {
        var ids = [];
        for(var id in this.load_queue) {
            ids.push(id);
        }
        var p = {
            dialog: "baloon_tooltips",
            ids: ids.join("-")
        }
        core.transport.send("/controller.php", p, this.onServerResponse.bind(this), "POST");
    },


    onServerResponse: function(r) {
        if(!r || r.status != "ok") return;
        for(var id in r.data) {
            this.data[id] = r.data[id];
        }
    }


}
core.apps.baloon_tooltips.extendPrototype(core.components.html_component);