core.apps.files_manager = function() {

    this.active_folder = "pictures";
    this.active_tab = "ws";
    this.view_mode = core.data.files_manager_view_mode || "list";

    this.offset = 0;
    this.rows_total = 0;
    this.files = {};
    this.queries = {};
    this.obj_pager = {per_page:25};
    this.items_sum={};

}



core.apps.files_manager.prototype = {

    // resize

    window_resize: {
        hmargin: 200,
        min_height: 200,
        min_width: 950,
        target: "panels"
    },


    onResize: function(v) {
        var h = v.height - 15;
        this.$["folders"].style.height = h + "px";
        this.$["extra_panel"].style.height = h - 10 + "px";
        this.$[this.getFilesId()].style.height = h - 89 + "px";
        this.onThumbsScroll();
    },


    // incons path: static/folders/
    // max key length - 10
    folders: {
        pictures: {
            icon: "picture_32.png",
            title: "Pictures"
        },

        audio: {
            icon: "audio_32.png",
            title: "Audio"
        },

        video: {
            icon: "movie_32.png",
            title: "Video"
        },

        flash: {
            icon: "flash_32.png",
            title: "Flash"
        },

        dat: {
            icon: "folder_32.png",
            title: "Files"
        },

        themes: {
            icon: "theme_32.png",
            title: "Themes"
        }
    },


    // type to folder relation
    filters: {
        video: "video",
        flash: "flash",
        audio: "audio",
        picture: "pictures",
        theme: "themes"
    },






    // content

    renderContent: function() {
        this.preview_cache_value = 1;

        this.displayTpl(this.$["content"], "files_manager");
        for(var fn in this.folders) {
            var f = this.folders[fn];
            this.buildModel(this.$["folders"],
                { tag: "a", href: "void",
                    className: "folder",
                    id: "folder" + fn,
                    events: { onclick: ["onFolderClick", fn] },
                    childs: [
                        { tag: "img", src: "/static/folders/" + f.icon },
                        { tag: "span", innerHTML: f.title },
                        { tag: "span", id: "files_count" + fn },
                        { tag: "div", className: "links",
                            id: "links_" + fn }
                    ]}
            );
            this.queries[fn] = "";
        }
        this.loadFiles(1);

        desktop.files_uploader.addButton(this.$.btn_upload);

        this.setSortKey("name");
        this.renderPaginators();

    },


    onShowContent: function() {
        if(this.refresh_on_show) {
            this.loadFiles();
        }

        var d = core.values.files_manager;
        if(d.onselect) {
            this.onselect = d.onselect;
            this.onselect_multiple = d.onselect_multiple;
        }

        this.allow_multiple_selection = this.onselect_multiple || (!this.onselect_multiple && !this.onselect);

        var btns = [
            "btn_edit",
            "btn_rename",
            "btn_delete",
            "btn_send_links",
            "btn_choose",
            "btn_refresh",
            "btn_upload",
            "btn_download",
            "btn_copy_to_dbox"
        ];

        if(this.onselect || this.onselect_multiple) {
            this.hideElements(btns);
        } else {
            this.showElements(btns);
        }

        if(d.folder) {
            var folder = this.folders[d.folder] ? d.folder : this.active_folder;
            this.disable_change_folder = true;
        } else {
            var folder = this.active_folder;
            this.disable_change_folder = false;
        }
        this.showFolder(folder);
    },


    getTitle: function() {
        return this.onselect ? "Choose file(s)" : "My files";
    },


    // create paginators
    renderPaginators: function() {
        var p, barName = 'filemanager', selName, boxName, funcName;

        selName = "sel_" + barName + "_rows_per_page";
        boxName = "box_" + barName + "_pager";
        funcName = "setListOffset_" + barName.ucFirst();

        if (this.$[selName] && this.$[boxName] && typeof(this[funcName]) == "function") {
            // set default "Rows Per Page" setting
            if(this.$[selName].setValue) {
                this.$[selName].setValue(this.obj_pager.per_page, true);
            } else {
                this.$[selName].value = this.obj_pager.per_page;
            }
            // paginator settings
            p = {
                parent: this.$[boxName],
                callback: this[funcName].bind(this),
                per_page: this.$[selName].value
            };
            // create paginator
            this.obj_pager = new core.objects.pager(p);
        }

    },

    //after pagination click
    setListOffset_Filemanager: function(new_offset) {
        this.offset = new_offset;
        this.renderActiveFolderFiles(this.offset);
      //  this.obj_pager.setData(this.offset , this.items_sum[this.active_folder] );
    },

    //change count of visible pages
    onSelChange_Filemanager_RowsPerPage: function() {
        var current_page = (this.offset / this.obj_pager.per_page) + 1;
        this.obj_pager.changeRowsPerPage(this.$["sel_filemanager_rows_per_page"].value);
        var total_pages = Math.ceil(this.rows_total / this.obj_pager.per_page);
        if (current_page > total_pages) {
            this.offset = (total_pages - 1) * this.obj_pager.per_page;
        }
        this.renderActiveFolderFiles(this.offset);
    },





    // mouse clicks

    onFolderClick: function(e, f) {
        if(this.disable_change_folder) return;
        this.$["folder" + f].blur();
        this.showFolder(f);
    },


    onUploadClick: function() {
        desktop.uploader.uploadFile(this.loadFiles.bind(this));
    },

    onRefreshClick: function() {
        this.refresh(1);
    },

    onDownloadClick: function() {
        var file = this.getSelectedFile();
        if(file) {
            desktop.loadURL(core.common.getUserFile(file));
        }
    },


    onReThumbClick: function() {
        var files = this.getSelectedFiles();
        if(files.length > 0) {
            var p = { act: "rethumb", files: files.join("*")};
            p.dialog = "files";
            core.transport.send("/controller.php", p);
        }
    },


    onRenameClick: function() {
        var file = this.getSelectedFile();
        if(!file) return;

        desktop.modal_dialog.prompt2(
            "Enter new file name",
            file,
            "For ecommerce products use the following naming convention<br/><strong>$brand$category$product name$order.jpg</strong>",
            this.rename.bind(this, file)
        );
    },

    rename: function(file, newName) {
        newName = this.sanitizeFileName(newName);
        if(file == newName) return;
        if(newName != "") {
            this.sendToServer({ act: "rename", src: file, dst: newName });
        } else {
            desktop.modal_dialog.alert("Incorrect filename.");
        }
    },



    onDeleteClick: function() {
        var files = this.getSelectedFiles(),
            str = "Delete " + (files.length > 1 ? files.length + " files" : "file") + "?";
        if(files.length > 0) {
            desktop.modal_dialog.confirm(str, this.deleteConfirmed.bind(this, files));
        }
    },

    onCopyToSiteClick: function() {
        var files = this.getSelectedFiles();
        if(files.length > 0) {
            this.showElement('file_loading');
            this.sendToServer({ act: "copy_to_server", files: files.join("*") });
        }
    },

    onDisconnectDropboxClick: function(){
        this.selectTab('ws');
        this.showElement('file_loading');
        this.sendToServer({ act: "disconnect_dropbox" });
    },

    onCopyToDropboxClick: function() {
        var files = this.getSelectedFiles();
        if(files.length > 0) {
            this.showElement('file_loading');
            this.sendToServer({ act: "copy_to_dropbox", files: files.join("*") });
        }
    },

    onInfoDropBoxClose: function(){
        this.hideElement('info_dropbox');
    },


    deleteConfirmed: function(files) {
        this.sendToServer({ act: "delete", files: files.join("*") });
    },


    onEditClick: function() {
        var file = this.getSelectedFile();
        if(file) {
            desktop.runImageEditor(file);
        }
    },


    onChooseClick: function() {
        desktop.hidePopupApp();

        var files = this.getSelectedFiles();
        if(files.length > 0) {
            if(this.onselect_multiple) {
                this.onselect_multiple(files);
            } else if(this.onselect) {
                this.onselect(files[0]);
            }
        }
    },




    // toolbar buttons
    updateToolbar: function() {
        var selection = this.getSelectedFiles();

        if(this.onselect || this.onselect_multiple) {
            if((selection.length == 1 && this.onselect) || (selection.length > 0 && this.onselect_multiple)) {
                this.showElement("btn_choose");
            } else {
                this.hideElement("btn_choose");
            }
        } else {
            this.hideElement("btn_choose");

            if(selection.length > 0) {
                this.showElements(["btn_delete", "btn_send_links", "btn_copy_to_dbox"]);
            } else {
                this.hideElements(["btn_delete", "btn_send_links", "btn_copy_to_dbox"]);
            }


            if(selection.length == 1 && this.active_folder == "pictures") {
                this.showElement("btn_edit");
            } else {
                this.hideElement("btn_edit");
            }

            if(selection.length == 1) {
                if(this.active_tab == 'ws'){
                    var f = "http://" + core.data.http_host + "/f-" + core.data.short_links[selection[0]];
                }else{
                    var f = core.data.short_links[selection[0]];
                }

                this.$["file_link"].innerHTML = f;
                this.$["file_link"].href = f;

                var selectionFull = this.getSelectedFilesFull();

                var file =  selectionFull[0];
                var actual_link = '';
                if(file.link){
                    actual_link = file.link;
                }else{
                    actual_link = core.common.getUserFile(this.preview_file) + "?cache=" + this.preview_cache_value;
                }

                this.$["file_link_actual"].innerHTML = actual_link;
                this.$["file_link_actual"].href = actual_link;

                this.showElements(["btn_rename", "btn_download"]);
            } else {
                this.$["file_link"].innerHTML = "";
                this.$["file_link_actual"].innerHTML = "";
                this.hideElements(["btn_rename", "btn_download"]);
            }

            this.$["btn_refresh"].disabled = this.is_loading;


            if(this.active_folder == "pictures") {
                if(this.view_mode == "thumbs") {
                    this.hideElement("btn_mode_thumbs");
                    this.showElement("btn_mode_list");
                } else {
                    this.hideElement("btn_mode_list");
                    this.showElement("btn_mode_thumbs");
                }
            } else {
                this.hideElements(["btn_mode_list", "btn_mode_thumbs"]);
            }
        }
    },



    // data
    refresh: function(force) {
        if(this.isVisible) {
            this.loadFiles(false,force);
        } else {
            this.refresh_on_show = true;
        }
    },


    loadFiles: function(load_user_search,force) {
        var p = {
            act: "get_files",
            user_search: load_user_search ? 1 : 0,
            force:force?1:0
        }
        this.sendToServer(p);
    },


    sendToServer: function(p,response) {
        this.refresh_on_show = false;
        if(this.is_loading) return;
        this.is_loading = true;

        p.dialog = "files";
        core.transport.send("/controller.php", p, response ? response : this.onServerResponce.bind(this));
    },


    onServerResponce: function(r) {
        if(!r || r.status != "files") {
            return;
        }
        if(r.msg) {
            desktop.modal_dialog.alert(r.msg);
        }
        if(r.user_search) {
            this.initUserSearch(r.user_search);
        }
        core.data.dropbox = r.data.dropbox;
        core.data.user_files = r.data.files;
        core.data.short_links = r.data.short_links;
        this.splitFilesByFolders(r.data.files);
        this.is_loading = false;
        this.updateDiscInfo(r.data.total_size);

        if(this.active_tab != 'ws') {
            this.selectTab(this.active_tab);
        }else{
            this.renderActiveFolderFiles();
        }

        if(r.select_file_name) {
            this.selectFileByName(r.select_file_name);
        }

        this.rows_total = r.data.count;//all
    },


    splitFilesByFolders: function(data) {
        this.files = {};
        for(var i=0; i<data.length; i++) {
            var fn = data[i].name;
            var fsource = data[i].source;
            if(!this.files[fsource]) this.files[fsource] = {};
            var tag = this.filters[core.utils.fsystem.getFileType(fn)] || "dat";
            if(!this.files[fsource][tag]) this.files[fsource][tag] = [];
            data[i].formatted_time = new Date(data[i].time * 1000).format();
            data[i].icon = core.utils.fsystem.getFileIcon(data[i].name);
            data[i].formatted_size = core.utils.fsystem.formatSize(data[i].size);
            if(data[i].pic_size) {
                data[i].formatted_pic_size = data[i].pic_size[0] + "x" + data[i].pic_size[1];
            }
            this.files[fsource][tag].push(data[i]);
        }

        for(var fn in this.folders) {
            var c = this.files.ws[fn] ? this.files.ws[fn].length : 0;
            this.$["files_count" + fn].innerHTML = " (" + c + ")";
           // this.items_sum[fn] = parseInt(c);//for paginator
        }
    },



    // folders
    showFolder: function(name) {
        if(this.active_folder) {
            var n = "folder" + this.active_folder;
            this.$[n].className = "folder";
        }
        if(name != "pictures" && this.sort_mode.key == "pic_size") {
            this.setSortKey("name");
        }

        this.$["inp_search_query"].setValue("");
        this.queries[this.active_folder] = "";
        this.active_folder = name;
        var n = "folder" + name;
        this.$[n].className = "folder_active";
        this.updateViewModeUI();
        this.offset = 0;
        this.renderActiveFolderFiles();
        //this.obj_pager.setData(0, this.items_sum[name]);
    },



    // files list

    renderActiveFolderFiles: function(offset) {
        if(this.is_loading) {
//            this.$[this.getFilesId()].innerHTML = "Loading...";
            this.showElement('file_loading');
            return;
        }else{
            this.hideElement('file_loading');
        }
        this.visible_files = this.getActiveFolderFiles(offset);
        this.last_selected_idx = null;
        if(this.visible_files) {
            this.visible_files = this.sortFiles(this.visible_files);
        }
        switch(this.active_folder) {
            case "pictures":
                this.renderPicturesList(this.visible_files);
                break;
            default:
                this.renderFilesList(this.visible_files);
                break;
        }
        this.updateToolbar();
    },




    renderFilesList: function(files) {
        this.$[this.getFilesListId()].innerHTML = "";

        if(!files) return;

        var m = [];
        for(var i=0; i<files.length; i++) {
            var file = files[i];
            m.push(
                { tag: "file",
                    id: "file" + file.name,
                    events: {
                        onclick: ["onFileClick", i]
                    },
                    info: "file",
                    innerHTML:
                        "<img src='" + file.icon +"'/>" +
                            "<div class='finfo'>" + file.formatted_time + "</div>" +
                            "<div class='finfo'>" + file.formatted_size + "</div>" +
                            (file.formatted_pic_size ? "<div class='finfo'>" + file.formatted_pic_size + "</div>" : "") +
                            "<div class='fname nowrap'>" + file.name + "</div>"  }
            );
        }
        this.buildModel(this.$[this.getFilesListId()], m);
    },



    // active folder files
    getActiveFolderFiles: function(offset) {
        if(!this.files[this.active_tab]) return;
        var list = this.files[this.active_tab][this.active_folder];
        var q = this.queries[this.active_folder].toLowerCase();

        if(typeof(this.offset)!='undefined' && typeof(list)!='undefined' && q == ""){
            var listNew = list.slice(this.offset,this.offset+parseInt(this.$["sel_filemanager_rows_per_page"].value));
            //set calculated offset if exist
            this.obj_pager.setData(offset||0,  list.length ,parseInt(this.$["sel_filemanager_rows_per_page"].value));
        }else{
            this.obj_pager.setData(0,0);
        }

        if(q == "") return listNew ? listNew : list;
        var res = [];
        for(var i=0; i<list.length; i++) {
            var n = list[i].name.toLowerCase();
            if(n.indexOf(q) != -1) res.push(list[i]);
        }

        if(typeof(this.offset)!='undefined' && typeof(q)!='undefined'){
            var length = res.length;
            if(length>parseInt(this.$["sel_filemanager_rows_per_page"].value)){
                var resNew = res.slice(this.offset,this.offset+parseInt(this.$["sel_filemanager_rows_per_page"].value));
                this.obj_pager.setData(offset||0,length ,parseInt(this.$["sel_filemanager_rows_per_page"].value));
            }
        }else{
            this.obj_pager.setData(0,0);
        }

        return resNew ? resNew : res;
    },



    // search

    initUserSearch: function(us) {
        for(var f in this.folders) {
            if(!us[f]) continue;

            var l = us[f].data.split("\n");
            for(var i=0; i<l.length; i++) {
                if(l[i] != "") {
                    this.renderSearchLink(l[i], f);
                }
            }
        }
    },


    saveUserSearch: function(folder) {
        var data = [];
        var el = this.$["links_" + folder];
        for(var i=0; i<el.childNodes.length; i++) {
            data.push(el.childNodes[i].query.trim());
        }

        var p = {
            dialog: "files",
            act: "save_user_search",
            folder: folder,
            data: data.join("\n")
        }
        core.transport.send("/controller.php", p, this.onUserSearchSaved.bind(this), "POST");
    },


    onUserSearchSaved: function(r) {},



    onSearchClick: function() {
        var q = this.$["inp_search_query"].getValue();
        if(q == this.queries[this.active_folder]) return;
        this.queries[this.active_folder] = q;
        this.setListOffset_Filemanager(0);//reset pagination
        this.renderActiveFolderFiles();
    },

    onSearchClearClick: function(e) {
        this.queries[this.active_folder] = "";
        this.offset = 0;
        this.renderActiveFolderFiles();
    },


    onSearchSaveClick: function() {
        this.onSearchClick();
        var q = this.queries[this.active_folder];
        if(q != "") {
            this.renderSearchLink(q);
            this.saveUserSearch(this.active_folder);
        }
    },


    renderSearchLink: function(q, folder) {
        var folder = folder || this.active_folder;
        var el = this.$["links_" + folder];
        this.buildModel(el,
            { tag: "a",
                events: { onclick: "onSavedSearchClick" },
                innerHTML: q,
                query: q,
                folder: folder,
                childs: [
                    { tag: "div", className: "remove",
                        events: { onclick: "onRemoveSavedSearchClick"} }
                ]}
        );
        if(el.childNodes.length >= 10) {
            core.browser.element.remove(el.firstChild);
        }
    },


    onSavedSearchClick: function(e, q) {
        e = core.browser.event.fix(e);
        e.target.blur();
        this.$["inp_search_query"].setValue(e.target.query);
        core.browser.event.kill(e);
        this.onSearchClick();
    },

    onRemoveSavedSearchClick: function(e) {
        e = core.browser.event.fix(e);
        var folder = e.target.parentNode.folder;
        core.browser.element.remove(e.target.parentNode);
        this.saveUserSearch(folder);
        core.browser.event.kill(e);
    },


    // file handlers

    onFileClick: function(e, idx) {
        e = core.browser.event.fix(e);
        var file = this.visible_files[idx];

        if(e.ctrlKey && this.allow_multiple_selection) {
            this.setFileSelected(idx, !file.is_selected);
            this.last_selected_idx = idx;
        } else if(e.shiftKey && this.allow_multiple_selection) {
            var last_selected_idx = this.last_selected_idx || 0;
            if(idx < last_selected_idx) {
                var idx_start = idx, idx_end = last_selected_idx;
                this.last_selected_idx = idx;
            } else {
                var idx_end = idx, idx_start = last_selected_idx;
            }
            for(var i=0; i<this.visible_files.length; i++) {
                this.setFileSelected(i, i >= idx_start && i <= idx_end);
            }
        } else {
            for(var i=0; i<this.visible_files.length; i++) {
                if(i != idx && this.visible_files[i].is_selected) {
                    this.setFileSelected(i, false);
                }
            }
            this.setFileSelected(idx, true);
            this.last_selected_idx = idx;
        }
        if(file.source === 'dropbox' && file.link === ''){
            this.showElement('file_loading');
            core.browser.event.kill(e);
            return  this.sendToServer({ act: "dropbox_get_filelink", fname: file.path, id:idx}, this.onDropboxLinkResponse.bind(this));
        }



        if(this.allow_multiple_selection && file.source != 'dropbox' && this.getSelectedFiles().length > 1) {
            this.showBulkActionPanel();
        } else {
            this.setPreviewSrc(file);
        }
        this.updateToolbar();
        core.browser.event.kill(e);
    },



    onDropboxLinkResponse: function(r) {
        this.hideElement('file_loading');
        this.is_loading = false;
        this.visible_files[r.data.id].link = r.data.link;
        core.data.short_links[this.visible_files[r.data.id].path] = r.data.link
        this.files[this.active_tab][this.active_folder][r.data.id].link = r.data.link;
        if($('file_img_'+r.data.id)){
            $('file_img_'+r.data.id).src = r.data.link;
        }
        this.setPreviewSrc(this.visible_files[r.data.id]);
        this.updateToolbar();
    },



    setFileSelected: function(idx, is_selected) {
        if(this.visible_files[idx].is_selected != is_selected) {
            this.visible_files[idx].is_selected = is_selected;
            this.$["file" + this.visible_files[idx].name].className = is_selected ? "selected" : "";
        }
    },



    getSelectedFiles: function() {
        var res = [];
        if(this.visible_files && this.visible_files.length) {
            for(var i=0; i<this.visible_files.length; i++) {
                if(this.visible_files[i].is_selected) {
                    if(this.visible_files[i].path){
                        res.push(this.visible_files[i].path);
                    }else{
                        res.push(this.visible_files[i].name);
                    }
                }
            }
        }
        return res;
    },

    getSelectedFilesFull: function() {
        var res = [];
        if(this.visible_files && this.visible_files.length) {
            for(var i=0; i<this.visible_files.length; i++) {
                if(this.visible_files[i].is_selected) {
                    res.push(this.visible_files[i]);
                }
            }
        }
        return res;
    },



    selectFileByName: function(name) {
        for(var i=0; i<this.visible_files.length; i++) {
            var file = this.visible_files[i];
            if(file.name == name) {
                this.last_selected_idx = i;
                this.setFileSelected(i, true);
            } else {
                this.setFileSelected(i, false);
            }
        }
        this.updateToolbar();
    },


    getSelectedFile: function() {
        var selection = this.getSelectedFiles();
        return selection.length == 1 ? selection[0] : false;
    },




    // info
    setPreviewSrc: function(file) {
        if(this.preview_file == file.name) return;
        this.hideElement("bulk_edit");
        this.showElement("img_preview");
        this.preview_file = file.name;
        if(this.active_folder == "pictures" && this.view_mode == "list") {
            if(file.link){
                this.$["img_preview"].src = file.link;
            }else{
                this.$["img_preview"].src = core.common.getUserFile(this.preview_file) + "?cache=" + this.preview_cache_value;
            }
        }
    },







    updateDiscInfo: function(used_size) {
        if(this.is_loading) {
            this.$["disc_info"].innerHTML = "";
            return;
        }
        var free_space = core.data.scheme.fs_disc_space - used_size;
        this.$["disc_info"].innerHTML =
            "Total space: <strong>" + core.utils.fsystem.formatSize(core.data.scheme.fs_disc_space) + "</strong>" +
                ", Used: <strong>" + core.utils.fsystem.formatSize(used_size) + "</strong>" +
                ", Free: <strong>" + core.utils.fsystem.formatSize(free_space) + "</strong>";
    },





    updateViewModeUI: function() {
        if(this.active_folder == "pictures") {
            this.showElement("c_sort_pic_size");
            if(this.view_mode == "list") {
                this.showElement(this.getFilesListId());
                this.hideElement(this.getThumbsListId());
                this.$["wrapper"].className = "extra_panel_visible";
            } else {
                this.hideElement(this.getFilesListId());
                this.showElement(this.getThumbsListId());
                this.$["wrapper"].className = "";
            }
        } else {
            this.hideElement("c_sort_pic_size");
            this.showElement(this.getFilesListId());
            this.hideElement(this.getThumbsListId());
            this.$["wrapper"].className = "";
        }
    },







    // images list
    onListModeClick: function() {
        this.setViewMode("list");
    },


    onThumbsModeClick: function() {
        this.setViewMode("thumbs");
    },



    setViewMode: function(mode) {
        this.view_mode = mode;
        this.renderActiveFolderFiles();
        this.updateViewModeUI();

        var r = {
            dialog: "session_data",
            act: "set",
            key: "files_manager_view_mode",
            data: this.view_mode
        }
        core.transport.send("/controller.php", r, null, "POST");
    },




    renderPicturesList: function(list) {
        if(this.view_mode == "thumbs") {
            this.hideElement(this.getFilesListId());
            this.showElements(this.getThumbsListId());
            this.renderThumbsList(list);
        } else {
            this.hideElement(this.getThumbsListId());
            this.showElement(this.getFilesListId());
            this.renderFilesList(list);
        }
    },



    onThumbsScroll: function(e) {
        if(this.active_folder != "pictures" || this.view_mode == "list") return;
        e = core.browser.event.fix(e);

        var files_el = this.$[this.getFilesId()];
        var visible_rect = {
            top: files_el.scrollTop,
            bottom: files_el.scrollTop + files_el.offsetHeight
        }

        var list_el = this.$[this.getThumbsListId()];
        for(var i=0; i<list_el.childNodes.length; i++) {
            var thumb_el = list_el.childNodes[i];
            if(thumb_el.is_loaded) continue;
            if(thumb_el.offsetTop + thumb_el.offsetTop >= visible_rect.top && thumb_el.offsetTop <= visible_rect.bottom) {
                var img = thumb_el.firstChild.firstChild;
                img.onload = this.onThumbLoaded.bind(this);
                img.src = img.getAttribute("file_url");
                thumb_el.is_loaded = true;
            }
        }
    },


    onThumbLoaded: function(e) {
        e = core.browser.event.fix(e);
        var img = new Image();
        img.src = e.target.src;
        if(img.width > img.height) {
            var old_height = e.target.parentNode.offsetHeight;
            var new_height = Math.floor(e.target.parentNode.offsetWidth * img.height / img.width);
            e.target.style.width = "100%";
            e.target.style.height = new_height + "px"
            e.target.style.marginTop = Math.floor(0.5 * (old_height - new_height)) + "px";
        } else if(img.width < img.height){
            e.target.style.width = Math.floor(e.target.parentNode.offsetHeight * img.width / img.height) + "px";
            e.target.style.height = "100%";
        } else {
            e.target.style.width = "100%";
            e.target.style.height = "100%";
        }
    },

    getThumbsListId: function (){
        return "thumbs_list_"+this.active_tab;
    },

    getFilesListId: function (){
        return "files_list_"+this.active_tab;
    },

    getFilesId: function (){
        return "files_"+this.active_tab;
    },

    renderThumbsList: function(files) {
        this.$[this.getThumbsListId()].innerHTML = "";

        if(!files) return;

        for(var i=0; i<files.length; i++) {
            var file = files[i];
            if(file.link || file.link === ''){
                var file_link = file.link;
            }else{
                var file_link = core.common.getUserFile(file.name);
            }

            this.buildModel(this.$[this.getThumbsListId()],
                { tag: "file",
                    id: "file" + file.name,
                    events: {
                        onclick: ["onFileClick", i]
                    },
                    info: "file",
                    innerHTML:
                        "<div class='img_box'><img id='file_img_"+i+"' file_url='" + file_link +"'/></div>" +
                            "<span class='fname nowrap'>" + file.name + "</span>" }
            );
        }
        this.onThumbsScroll();
    },




// sort
    sortFiles: function(list) {
        var key = this.sort_mode.key;
        if(key == "pic_size") {
            if(this.sort_mode.reverse) {
                var func = function(a, b) { return a[key][0]*a[key][1] < b[key][0]*b[key][1] ? 1 : -1 }
            } else {
                var func = function(a, b) { return a[key][0]*a[key][1] >= b[key][0]*b[key][1] ? 1 : -1 }
            }
        } else {
            if(this.sort_mode.reverse) {
                var func = function(a, b) { return a[key] < b[key] ? 1 : -1 }
            } else {
                var func = function(a, b) { return a[key] >= b[key] ? 1 : -1 }
            }
        }
        return clone(list.sort(func));
    },




    onSortSizeClick: function() {
        this.setSortKey("size");
        this.renderActiveFolderFiles();
    },

    onSortPicSizeClick: function() {
        this.setSortKey("pic_size");
        this.renderActiveFolderFiles();
    },

    onSortTimeClick: function() {
        this.setSortKey("time");
        this.renderActiveFolderFiles();
    },

    onSortNameClick: function() {
        this.setSortKey("name");
        this.renderActiveFolderFiles();
    },


    setSortKey: function(key) {
        if(!this.sort_mode) {
            this.sort_mode = {
                key: key,
                reverse: false
            }
        } else {
            this.$["sort_" + this.sort_mode.key].className = "";
            this.$["sort_dir_" + this.sort_mode.key].innerHTML = "";
            if(this.sort_mode.key == key) {
                this.sort_mode.reverse = !this.sort_mode.reverse;
            } else {
                this.sort_mode = {
                    key: key,
                    reverse: false
                }
            }
        }

        this.$["sort_" + this.sort_mode.key].className = "active";
        this.$["sort_dir_" + this.sort_mode.key].innerHTML = this.sort_mode.reverse ? "<img src='/static/app_files_manager/arrow_up.png'/>" : "<img src='/static/app_files_manager/arrow_down.png'/>";
    },




    //
    onSendLinksClick: function() {
        var files = this.getSelectedFiles();
        core.values.dialog_prompt = {
            label: "Enter e-mail",
            default_value: core.data.user.email,
            callback: this.onEmailEntered.bind(this, files.join("*"))
        }
        desktop.showPopupApp("dialog_prompt");
    },


    onEmailEntered: function(files, email) {
        desktop.setState("loading");
        var p = {
            dialog: "files",
            act: "send_links",
            files: files,
            email: email
        }
        core.transport.send("/controller.php", p, this.onSendLinksResponse.bind(this), "POST");
    },


    onSendLinksResponse: function(e) {
        desktop.setState("normal");
    },

    // tabs
    onTabClick: function(e) {
        e = core.browser.event.fix(e);
        var el = e.target.key ? e.target : e.target.parentNode;
        el.blur();
        this.selectTab(el.key);
    },


    selectTab: function(tab) {
        if(this.active_tab) {
            this.hideElement("tab_" + this.active_tab);
            this.$["btn_tab_" + this.active_tab].className = "";
            this.hideElement("btm_buttons_" + this.active_tab);
            this.hideElement('info_dropbox');

        }
        this.active_tab = tab;
        if(!this.is_loading && this.active_tab == 'dropbox' && (!core.data.dropbox || !core.data.dropbox.active)){
            this.hideElement("files_box");
            this.showElement("tab_" + this.active_tab+'_disabled');
        }else{
            this.showElement("btm_buttons_" + this.active_tab);
            this.hideElement("tab_dropbox_disabled");
            this.showElement("files_box");
            this.showElement("tab_" + this.active_tab);
            if(this.active_tab == 'dropbox'){
                if(typeof(this.files[this.active_tab][this.active_folder])=='undefined' || !this.files[this.active_tab] || !this.files[this.active_tab][this.active_folder].length){
                    this.obj_pager.setData(0, 0);//reset pager
                    this.showElement('info_dropbox');
                }
                this.$[this.getFilesId()].style.height = this.$['files_ws'].style.height;
            }
        }
        this.$["btn_tab_" + this.active_tab].className = "active";
        this.offset = 0;
        this.renderActiveFolderFiles();
    },






    // bulk edit
    showBulkActionPanel: function() {
        if(!this.$.bulk_edit) {
            this.displayTpl(this.$.extra_panel, "files_manager_bulk_edit");
            this.updateBulkEditUI();
        }
        this.showElement("bulk_edit");
        this.hideElement("img_preview");
    },


    updateBulkEditUI: function() {
        this.setElementVisible("box_be_resize", this.$.inp_be_resize.checked);
        this.setElementVisible("box_be_rename", this.$.inp_be_rename.checked);
        this.setElementVisible("box_be_apply", this.$.inp_be_resize.checked || this.$.inp_be_rename.checked);

        this.setElementVisible("box_size1", this.$.inp_be_resize_method.value != "pc");
        this.setElementVisible("box_size2", this.$.inp_be_resize_method.value == "pc");
    },


    onBEAutoincremtStartBlur: function() {
        var v = parseInt(this.$.inp_be_autoincrement_start.value, 10) || 0;
        this.$.inp_be_autoincrement_start.value = Math.max(v, 0);
    },


    onPcSizeblur: function() {
        var v = parseInt(this.$.inp_pc_size.value, 10) || 100;
        if(v > 100) v = 100;
        this.$.inp_pc_size.value = Math.max(v, 0);
    },


    onBENameBlur: function() {
        this.$.inp_be_name.value = this.sanitizeFileName(this.$.inp_be_name.value, true);
    },


    onBulkEditApplyClick: function() {
        this.bulk_edit = {}
        if(this.$.inp_be_resize.checked) {
            this.bulk_edit.resize = {
                method: this.$.inp_be_resize_method.value
            };

            if(this.bulk_edit.resize.method == "pc") {
                this.bulk_edit.resize.pc = this.$.inp_pc_size.value;
                if(!this.bulk_edit.resize.pc) {
                    desktop.modal_dialog.alert("Percentage of reduction must be greater than zero");
                    return;
                }
            } else {
                this.bulk_edit.resize.width = this.$.inp_be_size.value.width;
                this.bulk_edit.resize.height = this.$.inp_be_size.value.height;
                if(!this.bulk_edit.resize.width || !this.bulk_edit.resize.height) {
                    desktop.modal_dialog.alert("Width and height must be greater than zero");
                    return;
                }
            }
        }

        if(this.$.inp_be_rename.checked) {
            this.bulk_edit.rename = {
                name: this.$.inp_be_name.value.trim(),
                autoincrement_start: Math.max(parseInt(this.$.inp_be_autoincrement_start.value, 10), 0),
                overwrite: this.$.inp_be_overwrite.checked ? 1 : 0,
                delete_original: this.$.inp_be_delete_original.checked ? 1 : 0
            }
            if(this.bulk_edit.rename.name == "" || this.bulk_edit.rename.name.indexOf("#") == -1) {
                desktop.modal_dialog.alert("Enter correct file name.<br/>Placeholder # required in file name.");
                return;
            }
        }
        if(!this.bulk_edit.resize && !this.bulk_edit.rename) return;
        this.bulk_edit.files = this.getSelectedFiles();
        this.bulk_edit.current_file_idx = 0;
        this.bulkEditIteration();
    },




    bulkEditIteration: function() {
        var file = this.bulk_edit.files[this.bulk_edit.current_file_idx];
        var p = {
            dialog: "files",
            act: "bulk_edit_iteration",
            file: file
        }

        desktop.modal_dialog.progress(
            "Processing files",
            Math.round(100 * this.bulk_edit.current_file_idx / (this.bulk_edit.files.length - 1)),
            file
        );

        if(this.bulk_edit.resize) {
            p.resize_width = this.bulk_edit.resize.width;
            p.resize_height = this.bulk_edit.resize.height;
            p.resize_pc = this.bulk_edit.resize.pc;
            p.resize_method = this.bulk_edit.resize.method;
        }
        if(this.bulk_edit.rename) {
            var cur_name = file.split(".");
            cur_name.pop();
            cur_name = cur_name.join(".");
            p.new_file = this.bulk_edit.rename.name.replace(/\%/g, cur_name).replace(/\#/g, this.bulk_edit.rename.autoincrement_start + this.bulk_edit.current_file_idx);
            p.overwrite = this.bulk_edit.rename.overwrite;
            p.delete_original = this.bulk_edit.rename.delete_original;
        }
        core.transport.send("/controller.php", p, this.onBulkEditIterationResponce.bind(this), "POST");
    },


    onBulkEditIterationResponce: function(r) {
        if(!r || r.status != "ok") {
            desktop.modal_dialog.close();
            var msg = r && r.message ? r.message : "Server error";
            desktop.modal_dialog.alert(msg);
            return;
        }

        if(this.bulk_edit.current_file_idx < this.bulk_edit.files.length - 1) {
            this.bulk_edit.current_file_idx++;
            this.bulkEditIteration();
        } else {
            this.preview_cache_value ++;
            desktop.modal_dialog.close();
            if(this.bulk_edit.rename) {
                this.loadFiles();
            }
        }
    },



    sanitizeFileName: function(str, allow_placeholders) {
        str = str.trim();
        if(allow_placeholders) {
            str = str.replace(/[^%#\w\s\d\!$\-_~,;:\[\]\(\)\.@#'\"]/g, "");
        } else {
            str = str.replace(/[^\w\s\d\!$\-_~,;:\[\]\(\)\.@#'\"]/g, "");
        }
        if(str == ".." || str == ".") return "";

        var deprecated = [
            "htaccess", "phtml", "php", "php3", "php4", "php5", "php6", "phps", "cgi",
            "exe", "pl", "asp", "aspx", "shtml", "shtm", "fcgi", "fpl", "jsp", "htm", "wml"
        ];


        ext = str.split(".");
        ext = ext[ext.length - 1].toLowerCase();
        if(deprecated.indexOf(ext) != -1) {
            return "";
        }

        return str;
    }

}
core.apps.files_manager.extendPrototype(core.components.html_component);
core.apps.files_manager.extendPrototype(core.components.popup_app);