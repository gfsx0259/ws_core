//////////  ///////////////////////////////////////////////
//  Columns layout
/////////////////////////////////////////////////////////
core.apps.layout_columns = function(args) {
    this.pel = args.parentElement;
    this.rows = [];
    this.haveApps = true;
}



core.apps.layout_columns.prototype = {


    run: function() {
        this.callFunction("initLayoutStyles");
        this.callFunction("initAdminControls");

        if(!core.data.page_rows_data) return;
        this.sortRows();
        this.setData(core.data.page_rows_data);
        this.callFunction("initPageControls");
    },





    // layout

    setData: function(d) {
        this.data = d;
        if(core.usertype < USERTYPE_ADMIN || core.values.is_page_preview) {
            this.setViewData();
        } else {
            this.setEditorData();
        }
    },


    setViewData: function() {
        this.cells = [];
        this.profiles = {};

        for(var i=0; i<this.data.rows.length; i++) {
            this.renderRow(i);

            var row = this.data.rows[i];
            if(row.type != "fixed_content") {
                for(var wid in row.data.profiles) {
                    desktop.layout.profiles[wid] = row.data.profiles[wid];
                }
                this.renderNodes(this.$["row"], row.data.layout);
            }
        }
    },


    renderRow: function(i) {
        var row_class = "layout_row_box";

        if(this.data.rows[i].style_id) {
            row_class += " wsts_" + this.data.rows[i].style_id;
        } else {
            if(this.data.rows[i].position == 0) {
                row_class += " layout_first_row";
            } else if(this.data.rows[i].position == 255) {
                row_class += " layout_last_row";
            }
        }



        var r = this.data.rows[i].data;
                           
        var row_style = {};
        if(r.style == "background") {
            row_style.background = "url(" + core.common.getUserFile(r.background, 1) + ") repeat";
        } else {
            row_class += r.style;
        }

        this.buildModel(this.pel,
            { tag: "div", className: row_class,
              id: "row_box",
              childs: [
                r.title ? { tag: "div", className: "row_title",
                  innerHTML: r.title } : null,
                { tag: "div", 
                  className: "layout_row" + i,
                  style: row_style,
                  id: "row" }
              ]}
        );
        this.rows[i] = {
            element: this.$["row"],
            box: this.$["row_box"]
        }
    },



    getMiddleElement: function() {
        return this.rows[1] ? this.rows[1].element : this.pel;
    }


}
core.apps.layout_columns.extendPrototype(core.components.html_component);