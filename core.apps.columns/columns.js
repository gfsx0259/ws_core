core.apps.columns = function(args) {

    this.defaultProfile = {
        title: "",
        app_style: "",
        count: 2,
        width: [50,50]
    }

}

core.apps.columns.prototype = {


    buildContent: function(el) {
        this.buildModel(this.$["content"],
            { tag: "div", className: "app_columns_row",
              id: "row" }
        );
        this.renderCells();
        if(core.usertype >= USERTYPE_ADMIN) {
            this.initRowControls();
        }
    },


    onOpen: function() {
        this.setTitle(this.profile["title"]);
    },


    renderCells: function() {
        this.$["row"].innerHTML = "";
        var c = this.profile["count"];
        var w = this.profile["width"];

        for(var i=0; i<c; i++) {
            this.buildModel(this.$["row"],
                { tag: "div", className: "app_columns_cell",
                  id: "cell" + i,
                  wid: "cell",
                  is_app_cell: true,
                  style: { width: w[i] + "%" }}
            );
        }
        if(core.usertype >= USERTYPE_ADMIN) {
            this.renderRowControls();
        }
    },


    getCell: function(c) {
        return this.$["cell" + c];
    }

}

core.apps.columns.extendPrototype(core.components.html_component);
core.apps.columns.extendPrototype(core.components.desktop_app);