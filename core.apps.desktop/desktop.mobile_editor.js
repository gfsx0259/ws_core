core.apps.desktop.extendPrototype({


    mobile_viewframes: {
        iphone4: {
            title: "iPhone 4",
            width: "640",
            height: "960"
        }
    },


    initMobileEditor: function() {
        this.mobile_key = "iphone4";
        this.mobile_landscape = false;
        this.displayTpl(document.body, "mobile_wrapper");

        this.$.document_wrapper.style.marginLeft = "auto";
        this.$.document_wrapper.style.marginRight = "auto";
        this.$.document_wrapper.style.zIndex = "10";
//        this.$.document_wrapper.style.transform="scale(0.5)";
        this.updateMobileEditorViewPort();
    },



    updateMobileEditorViewPort: function() {
        this.$.mobile_wrapper_top.className = "mobile_wrapper_top mobile_top_" + this.mobile_key;
        this.$.mobile_wrapper_middle.className = "mobile_wrapper_middle mobile_middle_" + this.mobile_key;
        this.$.mobile_wrapper_bottom.className = "mobile_wrapper_bottom mobile_bottom_" + this.mobile_key;

        with(this.$.document_wrapper.style) {
            alert(this.mobile_viewframes[this.mobile_key][(this.landscape ? "height" : "width")] + "px");
            width = this.mobile_viewframes[this.mobile_key][(this.landscape ? "height" : "width")] + "px";
            paddingTop = this.$.mobile_wrapper_top.offsetHeight;
            paddingBottom = this.$.mobile_wrapper_bottom.offsetHeight;
        }
/*
        this.$.mobile_wrapper_left.firstChild.style.display = this.landscape ? "none" : "";
        this.$.mobile_wrapper_right.firstChild.style.display = this.landscape ? "none" : "";

        this.$.mobile_wrapper_top.firstChild.style.display = this.landscape ? "" : "none";
        this.$.mobile_wrapper_bottom.firstChild.style.display = this.landscape ? "" : "none";
        */
    },


    rotateMobileEditor: function() {
        this.mobile_landscape = !this.mobile_landscape;
        this.updateMobileEditorViewPort();
    }

});