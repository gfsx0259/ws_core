core.apps.columns.extendPrototype({

    // in px
    minColumnWidth: 150,

    // in %
    defaultColsWidth: { 
        1: [100],
        2: [50, 50],
        3: [33, 33, 34 ],
        4: [25, 25, 25, 25 ]
    },
    

    settingsBlocks: [
        { title: "Columns count:",
          controls: [
            { tag: "wsc_slider", id: "inp_count",
              range: { min: 1, max: 4 } }
          ]}
    ],


    fillSettingsForm: function() {
        this.tmpCount = this.profile["count"];
        this.$["inp_count"].setValue(this.profile["count"]);
    },


    processSettingsForm: function() {
        this.profile["count"] = parseInt(this.$["inp_count"].value, 10);
    },


    onSettingsUpdated: function() {
        var nc = this.profile["count"];
        if(this.tmpCount != nc) {
            this.profile["width"] = clone(this.defaultColsWidth[nc]);
            this.setCellsCount(this.tmpCount, nc);
            this.tmpCount = nc;
        }
    },



    // grippers etc

    initRowControls: function() {
        this.$["row"].onmouseover = this.showRowControls.bind(this);
        this.$["row"].onmouseout = this.hideRowControls.bind(this);
    },


    renderRowControls: function() {
        var c = this.profile["count"] - 1;
        for(var i=0; i<c; i++) {
            this.buildModel(this.$["cell" + i],
                { tag: "div", id: "gripper" + i,
                  display: false,
                  className: "layout_gripper",
                  wid: "gripper",
                  events: { onmousedown: ["onGripperDragStart", i] } }
            );
        }
    },


    showRowControls: function(e) {
        var c = this.profile["count"] - 1;
        for(var i=0; i<c; i++) {
            this.showElement("gripper" + i);
        }
    },


    hideRowControls: function() {
        var c = this.profile["count"] - 1;
        for(var i=0; i<c; i++) {
            this.hideElement("gripper" + i);
        }
    },


    onGripperDragStart: function(e, col) {
        e = core.browser.event.fix(e);

        this.updateCellsWidth("px");
        
        this.gripperOffsetX = e.clientX;
        var args = { col: col, el: e.target };
        this.isGripperDrag = true;

        core.browser.event.push(document, ["onmousemove", "onmouseup"]);
        document.onmousemove = this.onGripperMove.bindAsEventListener(this, args);
        document.onmouseup = this.onGripperDragEnd.bindAsEventListener(this, args);
        core.browser.event.kill(e);
    },


    onGripperMove: function(e, args) {
        e = core.browser.event.fix(e);
        var dx = this.gripperOffsetX - e.clientX;

        var cell = this.$["cell" + args.col];
        var cell2 = this.$["cell" + (args.col + 1)];

        var leftW = cell.startWidth - dx;
        var rightW = cell2.startWidth + dx;

        if(leftW < this.minColumnWidth) {
            rightW -= this.minColumnWidth - leftW;
            leftW = this.minColumnWidth;
            args.el.className = "layout_gripper_max";
        } else if(rightW < this.minColumnWidth) {
            leftW -= this.minColumnWidth - rightW;
            rightW = this.minColumnWidth;
            args.el.className = "layout_gripper_max";
        } else {
            args.el.className = "layout_gripper";
        }
        cell.style.width = leftW + "px";
        cell2.style.width = rightW + "px";
    },


    onGripperDragEnd: function(e, args) {
        core.browser.event.pop();

        args.el.className = "layout_gripper";
        this.updateCellsWidth("%");

        this.isGripperDrag = false;

        desktop.layout.savePage();
    },


    updateCellsWidth: function(mode) {
        var l = this.profile["count"];
        switch(mode) {
            case "px":
                var sum = 0;
                var rw = this.$["row"].offsetWidth;
                for(var i=0; i<l; i++) {
                    var el = this.$["cell" + i];
                    var w = el.offsetWidth;
                    if(sum + w > rw) {
                        w = rw - sum;
                    }
                    sum +=w;
                    el.style.width = w + "px";
                    el.startWidth = w;
                }
                break;

            case "%":
                this.profile["width"] = [];

                var w = this.$["row"].offsetWidth;
                for(var i=0; i<l; i++) {
                    var el = this.$["cell" + i];
                    var cw = el.offsetWidth;
                    var pw = 100 * cw / w;
                    el.style.width = pw + "%";
                    el.startWidth = undefined;
                    this.profile["width"][i] = pw;
                }
                break;
        }
    },




    setCellsCount: function(oldCount, newCount) {
        var alist = this.getApps(oldCount);

        for(var i=0; i<alist.length; i++) {
            desktop.layout.getApp(alist[i].wid).setParent(desktop.$["tmp_hidden"]);
        }

        this.renderCells();

        var perCol = Math.ceil(alist.length / newCount);
        if(perCol == 0) perCol = 1;
        var c = 0;
        for(var i=0; i<alist.length; i++) {
            desktop.layout.getApp(alist[i].wid).setParent(this.$["cell" + c]);
            if((i + 1) % perCol == 0 && c < newCount) c ++;
        }
    },




    getApps: function(cellsCount) {
        var res = [];
        var c = !isNaN(cellsCount) ? cellsCount : this.profile["count"];
        for(var i=0; i<c; i++) {
            var el = this.$["cell" + i];
            for(var j=0; j<el.childNodes.length; j++) {
                var wid = parseInt(el.childNodes[j].wid);
                if(wid) {
                    var app = desktop.layout.getApp(wid);
                    res.push({ 
                        wid: wid, 
                        name: app.appName, 
                        pos: i, 
                        owner: this.id 
                    });
                }
            }
        }
        return res;
    },


    onClose: function() {
        var apps = this.getApps();
        for(var i=0; i<apps.length; i++) {
            var app = desktop.layout.getApp(apps[i].wid);
            app.close();
        }
    }


});