core.apps.files_upload = function(args) {
    
    this._renderContent();

}


core.apps.files_upload.prototype = {


    getTitle: function() {
        return "Files upload queue";
    },


    renderContent: function() {
        this.displayTpl(this.$["content"], "upload_content");
    },

    /*
    init: function() {
        var files = desktop.files_uploader.getQueue();
        for(var i=0; i<files.length; i++) {
            this.renderFile(files[i]);
        }
    },
        */

    onShowContent: function() {},



/// handlers
    uploadQueuedFile: function(file_info) {
        this.renderFile(file_info);
    },


    uploadStarted: function(id) {
        this.hideElement("rm" + id);
        this.$["file" + id].status = "uploading";
        this.initProgressBar(this.$["file" + id]);
    },


    uploadProgress: function(args) {
        this.updateProgressBar(args.percents);
    },


    uploadFinished: function(args) {
        this.hideProgressBar();

        if(args.success) {
            var status = "uploaded",
                info = "File uploaded";
        } else {
            var status = "error",
                info = args.message || "Error";
        }
        this.$["file" + args.id].className += " " + status;
        this.$["file" + args.id].status = status;
        this.$["st" + args.id].innerHTML = info;
    },





    // files list
    renderFile: function(f) {
        this.buildModel(this.$["list"], 
            { tag: "div", className: "file",
              id: "file" + f.id,
              fid: f.id,
              status: "in_queue",
              events: { onmouseover: ["onFileMouseover", f.id], onmouseout: ["onFileMouseout", f.id] },
              childs: [
                { tag: "div", className: "title",
                  style: { background: "url(" + core.utils.fsystem.getFileIcon(f.name) + ") no-repeat" },
                  innerHTML: f.name },

//                { tag: "div", className: "size",
//                  innerHTML: core.utils.fsystem.formatSize(f.size) },

                { tag: "div", className: "status_img" },

                { tag: "div", className: "status",
                  id: "st" + f.id },

                { tag: "div", className: "cancel_file",
                  id: "rm" + f.id,
                  display: false,
                  title: "Remove file from upload queue",
                  events: { onclick: ["onRemoveFileClick", f.id]} }
              ]}
        );
    },


    onRemoveFileClick: function(e, fid) {
        desktop.files_uploader.removeUploadItem(fid);
        core.browser.element.remove(this.$["file" + fid]);
        this.$["file" + fid] = null;
    },


    onFileMouseover: function(e, fid) {
        if(this.$["file" + fid].status != "in_queue") return;
        this.showElement("rm" + fid);
    },

    onFileMouseout: function(e, fid) {
        if(this.$["file" + fid].status != "in_queue") return;
        this.hideElement("rm" + fid);
    },





    // progress bar
    initProgressBar: function(el) {
        if(!this.$["pbar"]) {
            this.buildModel(desktop.$["tmp_hidden"],
                { tag: "div", className: "pbar_box",
                  id: "pbar_box",
                  childs: [
                    { tag: "div", className: "bar",
                      id: "pbar" },
                    { tag: "div", className: "text",
                      id: "pbar_text" }
                  ]}
            );
        }
        el.appendChild(this.$["pbar_box"]);
        this.updateProgressBar(0);
    },


    updateProgressBar: function(p) {
        this.$["pbar"].style.width = p + "%";
        this.$["pbar_text"].innerHTML = p + " %";
    },


    hideProgressBar: function() {
        desktop.$["tmp_hidden"].appendChild(this.$["pbar_box"]);
    }


}
core.apps.files_upload.extendPrototype(core.components.html_component);
core.apps.files_upload.extendPrototype(core.components.popup_app);