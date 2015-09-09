core.apps.site_footer = function(args) {

    this.displayTpl(args.parentElement, "site_footer");

    this.cols = [];
    this.walkMenuNode(0, core.data.main_menu);
    if(this.cols.length) {
        var col_width = Math.round(100 / this.cols.length) + "%";
        var html = "<table style='border: 0'><tr>";
        for(var i=0; i<this.cols.length; i++) {
            var chtml = "<strong>" + this.cols[i].shift() + "</strong>" + this.cols[i].join("<br/>");
            html += "<td style='width: " + col_width + "'>" + chtml + "</td>";
        }
        html += "</tr></table>";
        this.$["links"].innerHTML = html;
    }

    this.refresh();

};



core.apps.site_footer.prototype = {


    // text

    refresh: function() {
        this.$["info"].innerHTML = core.data.page_footer_code || core.data.site_info.footer_code;
    },




    // links 

    walkMenuNode: function(col_num, node, skip_new_col) {
        for(var i=0; i<node.length; i++) {
            var fl = node[i].footer_link;
            if(fl == "p") {
                this.addColItem(col_num, node[i]);
                this.walkMenuNode(col_num, node[i].childs, 1);
                if(!skip_new_col) {
                    col_num = this.cols.length;
                }
                continue;
            } else if(fl == "s") {
                var c = this.cols.length;
                this.addColItem(c, node[i]);
                this.walkMenuNode(c, node[i].childs, 1);
                continue;
            }
            this.walkMenuNode(col_num, node[i].childs, skip_new_col);
        }
    },


    addColItem: function(col_num, mi) {
        if(!this.cols[col_num]) this.cols[col_num] = [];
        this.cols[col_num].push(this.formatLink(mi));
    },


    formatLink: function(mi) {
        var url = mi.url;
        if(url == "") {
            url = "javascript:void(0)";
        } else if(mi.type == "std" || mi.type == "doc") {
            url = "/"  + url + ".html";
        }
        var t = mi.title.replace(/\s+/g,"&nbsp;");

        return "<a href='" + url + "' " + (mi.blank_page == "1" ? "target='_new'" : "") + ">" + t + "</a>"
    }

};
core.apps.site_footer.extendPrototype(core.components.html_component);