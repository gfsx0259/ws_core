core.objects.layout_parser = function() {};



core.objects.layout_parser.prototype = {


    parse: function(el, data, is_virtual_ids) {
        this.is_virtual_ids = is_virtual_ids;
        this.virtual_id = 0;

        this.data = data;
        this.parseLayoutElement(el, this.data.layout);
    },


    parseLayoutElement: function(el, layout) {
        switch(el.wid) {
            case "cell":
                this.parseLayoutCell(el, layout);
                break;
            case "container":
                this.parseLayoutContainer(el, layout);
                break;
            default:
                this.parseLayoutApp(el, layout);
                break;
        }
    },



    parseLayoutContainer: function(container_el, layout) {
        var container_data = {
            type: "container",
            childs: [] 
        };


        var w = container_el.offsetWidth;

        for(var i=0; i<container_el.childNodes.length; i++) {
            var cell_el = container_el.childNodes[i];

            if(cell_el == container_el.lastChild) {
                var cell_width = w;
            } else {
                w -= cell_el.offsetWidth;
                var cell_width = cell_el.offsetWidth;
            }


            var cell = {
                type: "cell",
                width: 100 * (cell_width / container_el.offsetWidth), // formula ;)
                bootstrap: '',
                childs: [] 
            };

            if(cell_el.getAttribute('data-bootstrap')){
                cell.bootstrap = JSON.parse(cell_el.getAttribute('data-bootstrap'));
                console.log("set attribute from dom before saving in layout_parser.js");
            }

            container_data.childs[i] = cell;

                this.parseLayoutCell(cell_el, container_data.childs[i].childs);
        }
        layout.push(container_data);
    },




    parseLayoutCell: function(cell_el, layout) {
        for(var i=0; i<cell_el.childNodes.length; i++) {
            var el = cell_el.childNodes[i];
            this.parseLayoutElement(el, layout);
        }
    },


    parseLayoutApp: function(el, layout) {
        var app = desktop.layout.getApp(el.wid);
        if(app) {
            var id = this.is_virtual_ids ? this.virtual_id : app.id;
            this.virtual_id++;

            var d = { 
                type: "app",
                id: "" + id,
                app_name: app.appName
            };
            if(app.apps_container) {
                d.childs = [];

                if(app.getContentElements) {
                    var content_els = app.getContentElements();
                    d.multiple_childs = true;
                    for(var i=0; i<content_els.length; i++) {
                        d.childs[i] = [];
                        this.parseLayoutElement(content_els[i], d.childs[i]);
                    }
                } else {
                    this.parseLayoutElement(app.$["content"], d.childs);
                }
            }

            layout.push(d);
            this.data.profiles[id] = app.profile;
            this.data.apps[id] = {
                name: app.appName
            }
        }
    }

};