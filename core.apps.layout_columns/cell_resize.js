core.objects.layout_row.extendPrototype({


    min_cell_width: 50,
    
    // cells resize markers

    addResizeMarkers: function(container_el) {
        if(container_el.is_row) return;

        this.resize_container = container_el.parentNode;

        if(this.resize_container.parentNode.is_row && this.resize_container.childNodes.length == 1) return;
        

        var container_pos = this.getLayoutContainerPos(this.resize_container);

        this.resize_markers_dx = parseInt(container_pos.left, 10) - 6; // app padding
        this.resize_markers = [];

        var row_pos = core.browser.element.getPosition(this.$["row"]);
        var el = desktop.layout.$.row_resize_markers;
      
//        el.style.top = controls_pos.top + "px";
        el.style.left = row_pos.left + "px";
        el.style.width = row_pos.width + "px";

        for(var i=0; i<this.resize_container.childNodes.length; i++) {  
            var c = i == 0 ? "" : " marker_dragable";
            this.resize_markers[i] = this.buildModel(el,
                { tag: "div", className: "bar",
                  childs: [
                      { tag: "wsc_button",
                          title: "Apply bootstrap",
                          id: 'bootstrapOption_'+i,
                          events: { onclick: ["onBootstrapSelectChange", i] },
                          style: { float:"left",  margin: "0 0 0 10px"},
                          className: 'content-box'
                },
                    { tag: "div", className: "marker" + c,
                      events: { onmousedown: ["onCellsResizeMouseDown", i] }},
                    { tag: "span",
                      events: { onclick: ["onCellsResizeSetValue", i] }},

                  ]}
//                  innerHTML: "<div class='marker'></div><span></span>" }
            );
        }

        this.resize_markers[i] = this.buildModel(el,
            { tag: "div", className: "marker",
              style: { left: container_pos.left + container_pos.width + "px"} }

        );
        this.updateResizeMarkers();
    },

                                                                             
    updateResizeMarkers: function() {
        var left = this.resize_markers_dx;
        for(var i=0; i<this.resize_container.childNodes.length; i++) {
            var cell_width = parseInt(this.resize_container.childNodes[i].offsetWidth, 10);
            var marker_el = this.resize_markers[i];
            marker_el.style.left = left + "px";
            marker_el.style.width = cell_width + "px";
            marker_el.lastChild.innerHTML = cell_width + "px";
            left += cell_width;
        }
        desktop.layout.active_app.sizeChanged();
    },


    removeResizeMarkers: function() {
        if(!this.resize_container || !this.resize_markers) return;

        this.resize_container = null;
        for(var i=0; i<this.resize_markers.length; i++) {
            core.browser.element.remove(this.resize_markers[i]);
        }
        this.resize_markers = [];
    },



    onCellsResizeMouseDown: function(e, idx) {
        if(!idx || !this.resize_container) return;

        e = core.browser.event.fix(e);

        this.initCellsResize(e, idx - 1);

        core.browser.event.push(document, ["onmousemove", "onmouseup"]);
        document.onmousemove = this.onCellsResizeMouseMove.bindAsEventListener(this);
        document.onmouseup = this.onCellsResizeMouseUp.bindAsEventListener(this);
        core.browser.event.kill(e);
    },



    initCellsResize: function(e, idx) {
        this.resize_offset = e.clientX;
        this.resize_cell_idx = idx;

        this.setCellsWidth("px");
    },



    onCellsResizeMouseMove: function(e) {
        e = core.browser.event.fix(e);
        this.setColumnsResizePos(e.clientX);
    },



    setColumnsResizePos: function(x) {
        if(!this.resize_container) return;

        if(this.resize_container.childNodes.length == 1) return;

        var dx = this.resize_offset - x;
        var resize_cell = this.resize_container.childNodes[this.resize_cell_idx];

        var leftW = resize_cell.startWidth - dx;
        var rightW = resize_cell.nextSibling.startWidth + dx;

        if(leftW < this.min_cell_width) {
            rightW -= this.min_cell_width - leftW;
            leftW = this.min_cell_width;
        } else if(rightW < this.min_cell_width) {
            leftW -= this.min_cell_width - rightW;
            rightW = this.min_cell_width;
        }
        resize_cell.style.width = leftW + "px";
        resize_cell.nextSibling.style.width = rightW + "px";
        this.updateResizeMarkers();
    },


    onCellsResizeMouseUp: function() {
        core.browser.event.pop();
        this.setCellsWidth("%");

        desktop.layout.savePage();
    },


    setCellsWidth: function(mode) {
        if(!this.resize_container) return;

        if(mode == "px") {
            var w = this.resize_container.offsetWidth;

            for(var i=0; i<this.resize_container.childNodes.length; i++) {
                var cell_el = this.resize_container.childNodes[i];

                if(cell_el == this.resize_container.lastChild) {
                    var cell_width = w;
                } else {
                    w -= cell_el.offsetWidth;
                    var cell_width = cell_el.offsetWidth;
                }

                cell_el.style.width = cell_width + "px";
                cell_el.startWidth = cell_width;
            }
        } else if(mode == "%") {
            for(var i=0; i<this.resize_container.childNodes.length; i++) {
                var cell_el = this.resize_container.childNodes[i];
                cell_el.style.width = 100 * (cell_el.offsetWidth / this.resize_container.offsetWidth) + "%"; // formula ;)
                delete(cell_el.startWidth);
            }
        }
    },


    onBootstrapSelectChange: function(e,idx){
        var selects = [];
        var labels = core.components.desktop_app.bootstrapLabels;
        var options = core.components.desktop_app.getBootstrapGridOptions();

        for(var i in core.components.desktop_app.bootstrapDevices){
            var device = core.components.desktop_app.bootstrapDevices[i];
            selects.push(
                {name: "bootstrap-" + device + "-option", type: "select",
                    label: 'Please set specific width for '+labels[i]+' devices',
                options: options
            }
            );
        }

        desktop.modal_dialog.prompt3(
            "Bootstrap grid dialog",
            selects,
            this.onBootstrapSaveSettings.bind(this, idx)

        );
    },

    onBootstrapSaveSettings:function(idx){
        var values = {};
        for(var i in core.components.desktop_app.bootstrapDevices){
            var device = core.components.desktop_app.bootstrapDevices[i];
            values[device] = parseInt($("inp_bootstrap-" + device + "-option").value);
        }

        for(var i=0; i<this.resize_container.childNodes.length; i++) {
            var cell = this.resize_container.childNodes[i];
            if(i == idx) {
                console.log("set to dom new bootstrap value");
                cell.setAttribute('data-bootstrap',JSON.stringify(values));
            }
        }

        desktop.layout.savePage();

    },

    onCellsResizeSetValue: function(e, cell_idx) {
        if(this.resize_container.childNodes.length == 1) return;

        var w = this.resize_container.childNodes[cell_idx].offsetWidth;
        var max_w = this.resize_container.offsetWidth - (this.resize_container.childNodes.length - 1) * this.min_cell_width;

        desktop.modal_dialog.prompt(
            "Enter cell width in pixels (" + this.min_cell_width + "..." + max_w + ")", 
            w,
            this.cellsResizeSetValue.bind(this, cell_idx)
        );
    },


    cellsResizeSetValue: function(cell_idx, new_w) {
        var w = this.resize_container.childNodes[cell_idx].offsetWidth;
        var max_w = this.resize_container.offsetWidth - (this.resize_container.childNodes.length - 1) * this.min_cell_width;

        new_w = parseInt(new_w, 10) || 0;
        if(new_w < this.min_cell_width || new_w > max_w) return;

        var k = (w - new_w) / (this.resize_container.childNodes.length - 1);

        for(var i=0; i<this.resize_container.childNodes.length; i++) {
            var cell = this.resize_container.childNodes[i];
            if(i == cell_idx) {
                cell.style.width = new_w + "px";
            } else {
                cell.style.width = cell.offsetWidth + k + "px";
            }
        }

        this.updateResizeMarkers();

        desktop.layout.savePage();
    }


});