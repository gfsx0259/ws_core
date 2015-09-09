core.objects.slider_obj_common = {

    show: function() {
        this.showElement("window");
        this.callFunction("onWindowResize");
    },


    hide: function() {
        this.hideElement("window");
    }

};

core.objects.slider_obj_scroller = {


    onScrollLeftClick: function(e) {
        this.scroll(1);
    },

    onScrollRightClick: function(e) {
        this.scroll(-1);
    },



    scroll: function(dir) {
        if(this.is_scrolling) return;

        var new_ofs = this.scroll_ofs + dir * this.$["viewport"].offsetWidth;
        var thumbs_el = this.$["lists_box"];

        if(new_ofs > 0) {
            new_ofs = 0;
        } else if(new_ofs + thumbs_el.offsetWidth < this.$["viewport"].offsetWidth) {
            new_ofs = this.$["viewport"].offsetWidth - thumbs_el.offsetWidth;
        }

        if(new_ofs != this.scroll_target_ofs) {
            this.scroll_target_ofs = new_ofs;
            this.processScroll();
        }
    },



    processScroll: function() {
        this.is_scrolling = true;
        var ofs = this.scroll_target_ofs - this.scroll_ofs;

        if(Math.abs(ofs) < 3) {
            this.scroll_ofs = this.scroll_target_ofs;
            this.is_scrolling = false;
            this.scroll_target_ofs = null;
            this.updateScrollButtons();
        } else {
            this.scroll_ofs = this.scroll_ofs + ofs * 0.15;
            this.scroll_timeout = setTimeout(this.processScroll.bind(this), 10);
        }
        this.$["scroller_content"].style.left = this.scroll_ofs + "px";
    },



    updateScrollButtons: function() {
        if(this.scroll_ofs >= 0) {
            this.hideElement("btn_scroll_left");
        } else {
            this.showElement("btn_scroll_left");
        }

        var thumbs_el = this.$["lists_box"];
        if(this.scroll_ofs + thumbs_el.offsetWidth <= this.$["viewport"].offsetWidth) {
            this.hideElement("btn_scroll_right");
        } else {
            this.showElement("btn_scroll_right");
        }
    },



    onWindowResize: function() {
        clearTimeout(this.scroll_timeout);
        this.is_scrolling = false;
        var thumbs_el = this.$["lists_box"];
        if(this.scroll_ofs + thumbs_el.offsetWidth < this.$["viewport"].offsetWidth) {
            this.scroll_ofs = this.$["viewport"].offsetWidth - thumbs_el.offsetWidth;
            if(this.scroll_ofs > 0) this.scroll_ofs = 0;
            this.$["scroller_content"].style.left = this.scroll_ofs + "px";
        }
        this.updateScrollButtons();
    }    

};