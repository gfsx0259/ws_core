core.apps.texts.extendPrototype({


    setContent: function(id, html) {
        if(!this.data[id] || this.data[id]==undefined) {
            this.data[id]= {}
        }
        this.data[id].content = html;
        var d = new Date();
        this.data[id].modified = d.getUnixTime();
        this.callListeners(this.data[id]);
    },

    updateContent: function(doc) {
        if(!this.data[doc.id] || this.data[doc.id] == undefined) {
            this.data[doc.id]= {}
        }
        if(!doc.modified) {
            var d = new Date();
            doc.modified = d.getUnixTime();
        }
        this.data[doc.id] = doc;
        this.callListeners(this.data[doc.id]);
    },

    setData: function(id, data) {
        if(!this.data[id]) {
            this.data[id] = {};
        }
        if(!data["modified"]) {
            var d = new Date();
            this.data[id].modified = d.getUnixTime();
        }
        for(var k in data) {
            this.data[id][k] = data[k];
        }
        this.callListeners(this.data[id]);
    },

    deleteContent: function(id) {
        this.data[id] = undefined;
        this.callListeners({ id: id, content: null });
        this.listeners[id] = [];
    },


    addListener: function(text_id, app_id, callback) {
        if(!this.listeners[text_id]) this.listeners[text_id] = {};
        this.listeners[text_id][app_id] = callback;
    },


    removeListener: function(text_id, app_id) {
        if(!this.listeners[text_id]) return;
        delete(this.listeners[text_id][app_id]);
    },


    callListeners: function(text) {
        var l = this.listeners[text.id];
        if(!l) return;
        for(var i in l) {
            if(l[i]) l[i](text);
        }
    }


});