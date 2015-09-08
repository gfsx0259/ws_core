core.apps.texts = function() {
    this.data = {};
    this.listeners = [];
    this._parsePage();
}



core.apps.texts.prototype = {

    get: function(id, callback, callback_error) {
        if(!id) return;
        if(this.data[id] != undefined && this.data[id].content.length) {
            callback(this.data[id]);
            return true;
        }
        var p = {
            dialog: "texts",
            act: "get_content",
            id: id
        }
        var f = function(res) {
            if(res == null) {
                if(callback_error) callback_error();
            } else {
                core.data.texts.data[res.id] = res;
                callback(res);
            }
        }
        core.transport.send("/controller.php", p, f);
    },


    getTitle: function(id) {
        return this.data[id].title;
    },
   

    _parsePage: function() {
        var el = document.getElementById("html_page_texts");
        var idx = 0;
        if(!el) return;

        for(var i=0; i<el.childNodes.length; i++) {
            var n = el.childNodes[i];
            if(!n.tagName || n.getAttribute("is_text") != "1") continue;
            var id = core.data.texts_info[idx].id;
            this.data[id] = core.data.texts_info[idx];
            this.data[id].summary = n.childNodes[0].innerHTML;
            this.data[id].content = n.childNodes[1].innerHTML;

            idx++;
        }
    }

}