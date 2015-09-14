core.objects.layout_row = function(args) {

    this.idx = args.idx;
    this.parentElement = args.parent;
    this.fixed_position = args.fixed_position; // "top" || "bottom" || null
    this.data = null;
    this.flag = 0;

};


core.objects.layout_row.extendPrototype({

    // in px
    minColumnWidth: 150,
    

    setData: function(row) {
        this.id = row.id;
        this.style_id = row.style_id;
        this.position = row.position;
        this.data = row.data;
        if(!this.data.layout || !this.data.layout.length) {
            this.data.layout = [
                { type: "container",
                  childs: [
                    { type: "cell",
                      width: 100,
                      childs: [] }
                  ]}
            ];
        }


        for(var wid in row.data.profiles) {
            desktop.layout.profiles[wid] = row.data.profiles[wid];
        }
        this.render();
        desktop.layout.renderNodes(this.$["row"], this.data.layout);
    },




    getData: function() {
        this.data.profiles = {};
        this.data.apps = {};
        this.data.layout = [];


        for(var i=0; i<this.$["row"].childNodes.length; i++) {
            desktop.layout.layout_parser.parse(this.$["row"].childNodes[i], this.data, false);
        }

        var res = {
            id: this.id,
            style_id: this.style_id,
            position: this.position,
            data: this.data
        };
        return res;
    },


   

    // render
    row_names: {
        0: "Header",
        1: "Body",
        255: "Footer"
    },

    render: function() {
        var row_class = "layout_row_box";
        var row_style = {};

        if(core.data.bootstrap_supported){
            row_style.clear = 'both';
        }

        if(this.position == 0) {
            row_class += " layout_first_row";
        } else if(this.position == 255) {
            row_class += " layout_last_row";
        }



        if(this.data.style == "background") {
            row_style.background = "url(" + core.common.getUserFile(this.data.background, 1) + ") repeat";
        } else {
            row_class += this.data.style;
        }


        this.buildModel(this.parentElement, 
            { tag: "div", 
              className: row_class,
              style: row_style,
              id: "row_box",
              row_idx: this.idx,
              childs: [
                { tag: "div",
                  className: "layout_row_controls_wrapper",
                  id: "layout_row_controls_wrapper",
                  childs: [
                    { tag: "div",
                      className: "layout_row_controls",
                      id: "controls",
                      events: { onclick: "onSelectStyleClick" },
                      childs: [
                        (core.data.theme ?
                         { tag: "span", 
                           id: "controls_title",
                           title: "Click to select row style",
                           innerHTML: this.row_names[this.position] }
                         :
                         { tag: "span", id: "controls_title",
                           innerHTML: this.row_names[this.position] })
                      ]}
                  ]},

                // row title
                { tag: "div", className: "row_title",
                  innerHTML: this.data.title || "",
                  id: "row_title" },

                // row content
                { tag: "div", id: "row",
                  className: "layout_row" + this.position,
                  is_row: true,
                  childs: [] }
              ]}
        );


        this.refreshStyle();
    },


    // theme2 style
    refreshStyle: function() {
        if(!this.style_id) return;
        this.$["row_box"].className = "layout_row_box wsts_" + this.style_id;
    },




    // remove row

    remove: function() {
        this.removeRowApps(this.$["row"]);
        core.browser.element.remove(this.$["row_box"]);
    },


    removeRowApps: function(el) {
        for(var i=0; i<el.childNodes.length; i++) {
            var child = el.childNodes[i];
            if(child.wid == "cell" || child.wid == "container") {
                this.removeRowApps(child);
            } else {
                var app = desktop.layout.getApp(child.wid);
                if(app) {
                    app.close(true);
                }
            }
        }
    },



    getLayoutContainerPos: function(el) {
        var res = {
            left: 0,
            width: el.offsetWidth
        };
        do {    
            res.left += el.offsetLeft;
            el = el.parentNode;
        } while(el.parentNode && !el.is_row);
        return res;
    },




    // row style
    onSelectStyleClick: function() {
        if(!core.data.theme) return;

        core.values.layout_row_settings = {
            key: "layout_row" + this.position, 
            style_id: this.style_id, 
            callback: this.onStyleSelected.bind(this)
        };
        desktop.showPopupApp("layout_row_settings");
    },


    onStyleSelected: function(style_id) {
        if(this.style_id != style_id) {
            this.style_id = style_id;
            this.refreshStyle();

            var r = {
                dialog: "layout_columns",
                act: "set_row_style",
                layout_mode: core.data.layout_mode,
                row_id: this.id,
                style_id: this.style_id
            };
            core.transport.send("/controller.php", r, this.onSetRowStyleResponse.bind(this), "POST");
            desktop.setState("loading");
            this.site_changed = true;
        }
    },


    onSetRowStyleResponse: function(r) {
        if(r && r.status == "updated") {
            desktop.setState("normal");
        }
        desktop.reloadThemeCSS();
    }

});
core.objects.layout_row.extendPrototype(core.components.html_component);