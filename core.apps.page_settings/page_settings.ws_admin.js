core.apps.page_settings.extendPrototype({


    onSelectThumbClick: function() {
        this.skip_on_show_content = true;
    },


    onThumbChanged: function() {
        if(!this.$.inp_thumb) return;
        if(this.$.inp_thumb.value == "") {
            this.hideElement("box_thumb");
        } else {
            this.$.img_thumb.src = core.common.getUserFile(this.$.inp_thumb.value + "?r=" + Math.random());
            this.showElement("box_thumb");
        }
    }
    
});