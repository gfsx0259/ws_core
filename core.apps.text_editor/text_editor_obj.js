core.objects.text_editor_ex = function(args) {

    this.style = "wyz";
    this.maxHistory = 100;
    this.render(args.parent_el);

    this.initEditor();
    this.initEditorDoc();
    this.renderPagesSelect();
    this.initHistory();
    this.updateToolbar();
    

}



core.objects.text_editor_ex.prototype = {


    setHeight: function(h) {
        this.total_height = h;
        this.updateContentHeight();
    },




    hide: function() {
        this.hidePanel();
        this.hidePreview();
    },


    updateContentHeight: function() {
        var dy = this.$.toolbar.offsetHeight + this.$.panels.offsetHeight;
        this.$.iframe.style.height = this.total_height - dy + "px";
        this.$.textarea.style.height = this.total_height - dy + "px";
    },


    // icons dir: /static/text_editor
    tButtons: [
        { title: "Open document", icon: "folder.png", cmd: "open_docs" },
        { title: "Switch to HTML edit mode", icon: "html.png", cmd: "html_mode" },
        "divider",
        { title: "Undo", icon: "arrow_undo.png", cmd: "undo" },
        { title: "Redo", icon: "arrow_redo.png", cmd: "redo" },
        "divider",
        { title: "Heading", icon: "text_heading_1.png", procedure: "heading", args: "h1", needSelection: true },
        { title: "Heading", icon: "text_heading_2.png", procedure: "heading", args: "h2", needSelection: true },
        { title: "Heading", icon: "text_heading_3.png", procedure: "heading", args: "h3", needSelection: true },
        { title: "Heading", icon: "text_heading_4.png", procedure: "heading", args: "h4", needSelection: true },
        { title: "Heading", icon: "text_heading_5.png", procedure: "heading", args: "h5", needSelection: true },
        { title: "Heading", icon: "text_heading_6.png", procedure: "heading", args: "h6", needSelection: true },
        "divider",
        { title: "Bold", icon: "text_bold.png", cmd: "bold", needSelection: true },
        { title: "Italic", icon: "text_italic.png", cmd: "italic", needSelection: true },
        { title: "Underline", icon: "text_underline.png", cmd: "underline", needSelection: true },
        { title: "Font", icon: "font.png", cmd: "font_dlg", needSelection: true },
        "divider",
        { title: "Align left", icon: "text_align_left.png", cmd: "justifyleft" },
        { title: "Align center", icon: "text_align_center.png", cmd: "justifycenter" },
        { title: "Align right", icon: "text_align_right.png", cmd: "justifyright" },
        "divider",
        { title: "Ordered list", icon: "text_list_numbers.png", cmd: "insertorderedlist" },
        { title: "Unordered list", icon: "text_list_bullets.png", cmd: "insertunorderedlist" },
        "divider",
        { title: "Convert selected text to blockqoute", icon: "blockquote.png", cmd: "ins_blockqoute", needSelection: true },
        { title: "Convert selected text to text block", icon: "block.png", cmd: "blocks_dlg", needSelection: true },
        "divider",
        { title: "Link", icon: "link.png", cmd: "link_dlg", needSelection: true, tag: "A" },
        { title: "Unlink selected", icon: "link_delete.png", cmd: "unlink", needSelection: true },
        "divider",
        { title: "Picture", icon: "picture.png", cmd: "img_dlg" },
        { title: "Table", icon: "table.png", cmd: "table_dlg" },
        { title: "Button Maker", icon: "button_maker.png", cmd: "buttonmaker_dlg" },
        { title: "Insert symbol", icon: "add.png", cmd: "symbols_dlg" },
        "divider",
        { title: "Clear formatting", icon: "remove_format.png", procedure: "removeFormat", needSelection: true }
    ],



    blockStyles: [ "attention","notice","alert","download","approved","media","note","cart","camera","doc" ],
    blockquoteStyles: [ "color1","color2","color3","color4","color5","color6","color7","color8","color9","color10" ],
    listStyles: [ "bullet-1","bullet-2","bullet-3","bullet-4","bullet-5","bullet-6" ],
    linkStyles: [ "link-1","link-2","link-3","link-4","link-5","link-6","link-7","link-8","link-9","link-10" ],
    font_faces: [
        "Arial",
        "Verdana",
        "Times",
        "Times New Roman",
        "Georgia",
        "Trebuchet MS",
        "Sans",
        "Comic Sans MS",
        "Courier New",
        "Webdings",
        "Garamond",
        "Helvetica"
    ],
    font_sizes: [ 9, 10, 11, 12, 13, 14, 15, 16, 18, 20, 22, 24, 28, 32, 36, 40 ],



// render
    render: function(parent_el) {
        this.displayTpl(parent_el, "text_editor_ex");

        var m = [];
        var event;
        for(var i=0; i<this.tButtons.length; i++) {
            var t = this.tButtons[i];
            if(t != "divider" && t.procedure) {
                event = ["procedure_" + t.procedure, ["body", t.args]];
            } else {
                event = ["tbCommand", [t.cmd,"body"]];
            }
            m.push(
                t == "divider" 
                ?
                { tag: "div", className: "divider" }
                :
                { tag: "a", className: "button",
                  id: "btn_" + t.cmd,
                  href: "void",
                  title: t.title,
                  style: { background: "url(/static/text_editor/" + t.icon + ") 3px 3px no-repeat" },
                  events: { onclick: event }
                }
            );
        }

        this.buildModel(this.$["toolbar_iframe"], m);

        // List styles
        var m = [];
        for(var i=0; i<this.listStyles.length; i++) {
            var n = this.listStyles[i];
            m.push(
                { tag: "div", className: "panel_list_thumb",
                  childs: [
                    { tag: "ul", className: n,
                      childs: [
                        { tag: "li", 
                          innerHTML: "Item" }
                      ]}
                  ],
                  events: { onclick: ["panelCmd", ["list_style", n,"body"]] } }
            );
        }
        m.push(
            { tag: "div", className: "panel_thumb_cancel",
              title: "No style",
              events: { onclick: ["panelCmd", ["list_style", null,"body"]] } }
        );
        this.buildModel(this.$["panel_list"], m);



        // link styles
        var m = [];
        for(var i=0; i<this.linkStyles.length; i++) {
            var n = this.linkStyles[i];
            m.push(
                { tag: "div", className: "panel_link_thumb " + n,
                  innerHTML: "Style " + (i+1),
                  style: { width: "50px", height: "auto", marginTop: "5px" },
                  events: { onclick: ["panelCmd", ["link_style", n,"body"]] } }
            );
        }
        m.push(
            { tag: "div", className: "panel_thumb_cancel",
              title: "No style",
              events: { onclick: ["panelCmd", ["link_style", null,"body"]] } }
        );
        this.buildModel(this.$["link_styles"], m);



        // Block styles
        var m = [];
        for(var i=0; i<this.blockStyles.length; i++) {
            var n = this.blockStyles[i];
            m.push(
                { tag: "div", className: "panel_block_thumb " + n,
                  innerHTML: "Text",
                  events: { onclick: ["panelCmd", ["block_style", n,"body"]] } }
            );
        }
        m.push(
            { tag: "div", className: "panel_thumb_cancel",
              title: "No style",
              events: { onclick: ["panelCmd", ["block_style", null,"body"]] } }
        );
        this.buildModel(this.$["panel_block"], m);



        // Blockquote styles
        var m = [];
        for(var i=0; i<this.blockquoteStyles.length; i++) {
            var n = this.blockquoteStyles[i];
            m.push(
                { tag: "blockquote", className: "panel_blockquote_thumb " + n,
                  innerHTML: "Text",
                  events: { onclick: ["panelCmd", ["blockquote_style", n,"body"]] } }
            );
        }
        m.push(
            { tag: "div", className: "panel_thumb_cancel",
              title: "No style",
              events: { onclick: ["panelCmd", ["blockquote_style", null,"body"]] } }
        );
        this.buildModel(this.$["panel_blockquote"], m);





        var opts = [], v;
        for(var i=0; i<this.font_faces.length; i++) {
            v = this.font_faces[i];
           
            opts.push(
                { text: "<font style='font-family: \"" + v + "\"'>" + v + "</font>", 
                  value: v } 
            );
        }
        this.$.inp_font_family.setOptions(opts);

        opts = [];
        for(var i=0; i<this.font_sizes.length; i++) {
            v = this.font_sizes[i] + "px";
            opts.push(
                { text: v, value: v } 
            );
        }
        this.$.inp_font_size.setOptions(opts);
    },






    initEditorDoc: function() {
        var d = this.getDoc();

        if(core.data.theme) {
            var theme_html = 
                "<link rel='stylesheet' type='text/css' href='/themes_v2/fixed.css'/>" +
                "<link rel='stylesheet' type='text/css' href='" + desktop.getThemeFile() + "'/>";
        } else {
            var theme_src = 
                core.data.site_info.custom_theme ?
                "/custom_themes/" + core.data.site_info.user_id + "/" + core.data.site_info.custom_theme + "/_editor.css"
                :
                "/themes/" + core.data.site_info.theme + "-editor.css";
            var theme_html = "<link rel='stylesheet' type='text/css' href='" + theme_src + "'/>";
        }

        d.open();
        d.write(
            "<html><head>" +
            theme_html +
            "<style type='text/css'>body { min-width: inherit; width: auto !important;}</style>" +
            "</head><body class='" + document.body.className + "'></body></html>");
        d.close();

        this.setHTML(null);
        core.browser.event.attach(d, "onkeyup", this.onIframeInput.bindAsEventListener(this));
        core.browser.event.attach(d, "onmouseup", this.updateToolbar.bindAsEventListener(this));
        
        this.focus();
    },



    onIframeInput: function(e) {
        this.historySave();
        this.updateToolbar();
    },


    
    // toolbar

    updateToolbar: function(e) {
        e = core.browser.event.fix(e);
        var targ='';
        if(e!=undefined) {
            if (e.target) targ = e.target;
            else if (e.srcElement) targ = e.srcElement;
            if (targ.nodeType == 3) // defeat Safari bug
                targ = targ.parentNode;
        }
        this.is_changed = true;
        this.tag = this.getSelectionParent();
        if(targ&&targ.tagName=='BUTTON')
            this.tag=targ;
        if(this.tag && this.tag.tagName == "LI") {
            this.tag = this.tag.parentNode;
        }
        if(this.tag) {
            var tn = this.tag.tagName;
            switch(tn) {
                case "UL":
                    this.showPanel("list");
                    break;
                case "BLOCKQUOTE":
                    this.showPanel("blockquote");
                    break;
                case "DIV":
                    this.showPanel("block");
                    break;
                case "A":
                    this.showPanel("link");
                    break;
                case "IMG":
                    this.showPanel("img");
                    break;
                case "BUTTON":
                    this.showPanel("buttonmaker");
                    break;
                default:
                    this.hidePanel();
            }
        }   
        this.updateButtons();
    },




    setButtonDisabled: function(name, v) {
        this.$["btn_" + name].disabled = v;
        this.$["btn_" + name].className = v ? "button disabled" : "button";
    },


    updateButtons: function() {
        var n = this.getNodeAtSelection();

        var notSel = (n && n.textContent) ? false : true;

        for(var i=0; i<this.tButtons.length; i++) {
            var b = this.tButtons[i];
            if(n && b.tag && b.tag == n.tagName) {
                this.setButtonDisabled(b.cmd, false);
//                this.$["btn_" + b.cmd].disabled = false;
//                this.$["btn_" + b.cmd].className = "button";
            } else if(b.needSelection) {
                this.setButtonDisabled(b.cmd, notSel);
//                this.$["btn_" + b.cmd].disabled = notSel;
//                this.$["btn_" + b.cmd].className = notSel ? "button disabled" : "button";
            }
        }

        this.setButtonDisabled("undo", !this.isUndoAvailable());
        this.setButtonDisabled("redo", !this.isRedoAvailable());
    },



    tbCommand: function(e, args) {
        var cmd=args[0];

        if(e) {
            e.target.blur();
            if(e.target.disabled) return;
        }
        if(typeof(cmd) == "object") {
            var cmdArgs = cmd;
            cmd = cmdArgs.shift();
        }
        this.getIframe().focus();

        var tag = this.getSelectionParent();

        switch(cmd) {
            case "undo":
                this.updateToolbar();
                this.historyUndo();
                return;
                break;

            case "redo":
                this.historyRedo();
                this.updateToolbar();
                return;
                break;

            case "open_docs":
               if(desktop.popup_apps["text_editor"].isChanged()) {
                    desktop.modal_dialog.confirm(
                        "Save changes?", 
                        function() {
                            desktop.popup_apps["text_editor"].onSaveClick();
                        }
                    );
               } else {
                   desktop.popup_apps["text_editor"].onCancelClick();
               }
               desktop.openTextsManager();
               break;
           

            case "img_dlg":
               desktop.openFilesManager(this.onImageSelected.bind(this), "pictures");
               return;
               break;

            case "link_dlg":
                this.showPanel("link");
                return;
                break;
            case "buttonmaker_dlg":
                this.showPanel("buttonmaker");
                return;
                break;

            case "table_dlg":
                this.showPanel("table");
                return;
                break;


            case "symbols_dlg":
                this.showPreview("symbols", "Select symbol");
                return;
                break;

            case "heading_h1":
            case "heading_h2":
            case "heading_h3":
            case "heading_h4":
            case "heading_h5":
            case "heading_h6":
                var h = cmd.split("_")[1];
                var el = this.getDoc().createElement(h);
                var c = this.getNodeAtSelection().textContent;
                if(!c) c = " ";
                el.innerHTML = c;
                this.insertNodeAtSelection(el);

                this.historySave();
                this.updateToolbar();
                return;
                break;


            case "blocks_dlg":
                this.showPreview("blocks", "Select text block style");
                return;
                break;

            case "ins_blockqoute":
                this.showPanel("blockquote");
                return;
                break;

            case "justifyleft":
                if(tag.tagName == "IMG") {
                    tag.style.floating = "left";
                    this.historySave();
                    return;
                }
                break;

            case "justifycenter":
                if(tag.tagName == "IMG") {
                    tag.style.floating = "none";
                    tag.style.display = "inline";
                    tag.align = "center";
                    this.historySave();
                    return;
                }
                break;

            case "justifyright":
                if(tag.tagName == "IMG") {
                    tag.style.floating = "right";
                    this.historySave();
                    return;
                }
                break;

            case "html_mode":
                this.setHTMLMode();
                return;
                break;

            case "font_dlg":
                this.showPanel("font");
//                this.showPreview("font", "Select font style");
                return;
                break;
        }
        this.execCommand(cmd,false);
    },






    
    
    // Panels 

    showPanel: function(p) {
        switch(p) {
            case "link":
                if(this.tag && this.tag.tagName == "A") {
                    var prefix = "http://" + core.data.http_host;
                    this.$["inp_link_url"].value = this.tag.href.replace(prefix, "");
                    this.showElement("link_styles");
                } else {
                    this.$["inp_link_url"].value = "";
                    this.hideElement("link_styles");
                }
                break;
             case "buttonmaker":
                if(this.tag && this.tag.tagName == "BUTTON") {
                    //loc=" "+this.tag.onclick;
                    loc=this.tag.getAttribute('onclick');
                    loc=loc.replace("window.location",'');
                    loc=loc.replace(/\"/g,'');
                    loc=loc.replace(/\'/g,'');
                    loc=loc.replace("=",'');
                    loc=loc.replace("  ",'');
                    if(this.tag.getAttribute('style')&&this.tag.getAttribute('style')!=null)
                    {
                        
                        this.$["inp_buttonmaker_width"].value = this.getStyleAttributeValue(this.tag.getAttribute('style'),'width','px');
                        this.$["inp_buttonmaker_height"].value = this.getStyleAttributeValue(this.tag.getAttribute('style'),'height','px');
                    }
                    this.$["inp_buttonmaker_url"].value = loc;
                    this.$["inp_buttonmaker_text"].value = this.tag.innerHTML;
                    this.$["inp_buttonmaker_btn"].value = 'Change';
                    this.$["inp_buttonmaker_delbtn"].style.display = '';
                    this.$["inp_buttonmaker_style"].value = this.tag.className;
                } else {
                    this.$["inp_buttonmaker_text"].value = "";
                    this.$["inp_buttonmaker_url"].value = "";
                    this.$["inp_buttonmaker_width"].value = "";
                    this.$["inp_buttonmaker_height"].value = "";
                    this.$["inp_buttonmaker_btn"].value = 'Create';
                    this.$["inp_buttonmaker_delbtn"].style.display = 'none';
                    this.$["inp_buttonmaker_style"].value = "";
                }
                break;
            case "img": 
                this.$["inp_img_align"].value = this.tag.align;
                this.$["inp_img_margin"].value = "";
                this.$["inp_image_width"].value = this.tag.clientWidth;
                this.$["inp_image_height"].value = this.tag.clientHeight;
                this.$["inp_image_alt"].value = this.tag.alt;
                this.$["box_img_product"].innerHTML = this.tag.getAttribute("product_name") || "none ";
                break;
        }
        if(this.activePanel == p) return;
        this.hidePanel();
        this.showElement("panel_" + p);
        this.updateContentHeight();
        this.activePanel = p;
        this.hideElement("pages_list");
    },


    hidePanel: function() {
        if(!this.activePanel) return;
        this.hideElement("panel_" + this.activePanel);
        this.updateContentHeight();
        this.activePanel = false;
        this.hideElement("pages_list");
    },




    panelCmd: function(e, args) {
        var tag = this.getSelectionParent();
        if(tag.tagName == "LI") tag = tag.parentNode;
        switch(args[0]) {
            case "block_style":
                var c = this.getNodeAtSelection();
                if(c && c.textContent) {
                    if(args[1] != null) {
                        el = this.getDoc().createElement("div");
                        el.className = args[1];
                        el.innerHTML = c.textContent;
                        this.insertNodeAtSelection(el);
                    }
                } else {
                    if(tag.tagName == "DIV") {
                        tag.className = args[1];
                    }
                }
                break;

            case "blockquote_style":
                var c = this.getNodeAtSelection();
                if(c && c.textContent) {
                    if(args[1] != null) {
                        el = this.getDoc().createElement("blockquote");
                        el.className = args[1];
                        el.innerHTML = c.textContent;
                        this.insertNodeAtSelection(el);
                    }
                } else {
                    if(tag.tagName == "BLOCKQUOTE") {
                        tag.className = args[1];
                    }
                }
                break;

            case "list_style":
                tag.className = args[1] != null ? args[1] : "";
                break;
            case "link_style":
                if(tag.tagName == "A") {
                    tag.className = args[1] != null ? args[1] : "";
                }
                break;
                
        }
        this.hidePreview();
        this.hidePanel();
        this.historySave();
        this.getIframe().focus();
    },


    // link panel

    renderPagesSelect: function() {
        if(core.data.pages_list.length == 0) {
            this.hideElement("pages_list");
        } else {
            for(var i=0; i<core.data.pages_list.length; i++) {
                this.buildModel(this.$["pages_list"],
                    { tag: "a",
                      events: { onclick: [ "onPageSelected", i ] },
                      innerHTML: core.data.pages_list[i].name }
                );
            }
        }
    },


    showPagesSelect: function(e) {
        e = core.browser.event.fix(e);
        if(!e || !e.target) return;

        if(this.active_url_input == e.target.tg) {
            this.active_url_input = null;
            this.hideElement("pages_list");
            return;
        }

        this.active_url_input = e.target.tg;
        var inp_el = this.$[this.active_url_input];
        var pos = core.browser.element.getPosition(inp_el, true);

        this.showElement("pages_list");
        this.$["pages_list"].style.top = pos.top + inp_el.offsetHeight + 1 + "px";
        this.$["pages_list"].style.left = pos.left + "px";
        this.$["pages_list"].style.width = inp_el.offsetWidth - 2 + "px";
    },



    onPageSelected: function(e, idx) {
        var url = core.data.pages_list[idx].url;
        if(url.indexOf("/") == -1) {
            url += ".html";
        }
        this.$[this.active_url_input].value = "/" + url;
        this.hideElement("pages_list");
        this.active_url_input = null;
    },




   
    onButtonPageSelected: function(e) {
        var p = this.$["inp_buttonmaker_page"].value;
        if(p == "") return;
        this.$["inp_buttonmaker_url"].value = "/" + p + ".html";
    },


    showFileSelect: function(e) {
        this.tmp_selection = this.getSelection();
        desktop.openFilesManager(this.onFileSelected.bind(this), "dat");
    },


    onFileSelected: function(file) {
        this.setSelection(this.tmp_selection);
        this.$["inp_link_url"].value = core.common.getUserFile(file);
        this.setActiveTagURL();
    },


    setActiveTagURL: function() {
        var url = this.$["inp_link_url"].value;
        this.tag = this.getSelectionParent();
        var n = this.getNodeAtSelection();
        if(n && n.textContent) { 
             this.execCommand("createlink", url);
        } else if(this.tag && this.tag.tagName == "A") {
            this.tag.href = url;
        }
        this.hidePanel();
    },


    setButtonURL: function() {
        var styleStr="";
        if(!isNaN(eval(this.$["inp_buttonmaker_width"].value))&&eval(this.$["inp_buttonmaker_width"].value)>0)
            styleStr+="width:"+eval(this.$["inp_buttonmaker_width"].value)+"px;";
        if(!isNaN(eval(this.$["inp_buttonmaker_height"].value))&&eval(this.$["inp_buttonmaker_height"].value)>0)
            styleStr+="height:"+eval(this.$["inp_buttonmaker_height"].value)+"px;";

        var cn = this.$["inp_buttonmaker_style"].value;

        if(this.tag.tagName=='BUTTON')
        {
            this.tag.innerHTML=this.$["inp_buttonmaker_text"].value;
            this.tag.setAttribute('onclick',"window.location='"+this.$["inp_buttonmaker_url"].value+"'");
            if(styleStr!='')
                this.tag.setAttribute('style',styleStr);
            this.tag.className = cn;
        } else {
            var url = this.$["inp_buttonmaker_url"].value;
            var buttonText = this.$["inp_buttonmaker_text"].value;
            if(styleStr!='')
                var html = "<button class=\""+cn+"\" onclick=\"window.location='"+url+"'\" style='"+styleStr+"' >"+buttonText+"</button>";
            else
                var html = "<button class=\""+cn+"\" onclick=\"window.location='"+url+"'\" >"+buttonText+"</button>";
            el = this.getDoc().createElement("div");
            el.style.display="inline";
            el.innerHTML = html;
            this.insertNodeAtSelection(el);     
        }
        this.hidePanel();
    },


    getStyleAttributeValue: function(styleStr,findAtr,removeValue){
        var styleStrArray=styleStr.split(';');
        for(var atr in styleStrArray)
        {
            var atrArray=styleStrArray[atr].split(':');
            if(this.removeSpaces(atrArray[0]).toLowerCase()==findAtr.toLowerCase())
            {
                atrArray[1]=atrArray[1].toLowerCase();
                removeValue=removeValue.toLowerCase();
                return this.removeSpaces(atrArray[1]).replace(removeValue,'');
            }
        }
        return '';
    },
    removeSpaces:function(str){
        return str.replace(/\s/g,'');
    },

    // IMG panel

    onImgAlignChange: function(e) {
        var v = this.$["inp_img_align"].value;
        if(v == "") return;
        this.tag.align = v;
    },

    onImgMarginChange: function(e) {
        var v = this.$["inp_img_margin"].value;
        if(v == "") return;
        this.tag.style.margin = v;
    },
    onImgWidthChange: function(e) {
        var v = this.$["inp_image_width"].value;
        if(v == "") return;
        this.tag.style.width = v+"px";
    },
    onImgHeightChange: function(e) {
        var v = this.$["inp_image_height"].value;
        if(v == "") return;
        this.tag.style.height = v+"px";
    },

    onImgAltChange: function(e) {
        var el = this.$["inp_image_alt"];
        var v = el.value.trim();
        el.value = v;
        this.tag.alt = v;
    },

    onImgProductSelect: function(e) {
        desktop.openEcommerceManager(this.onImgProductSelected.bind(this), "select_one", "products"); 
    },

    onImgProductSelected: function(p) {
        var el = this.$["box_img_product"];

        for(var id in p) {
            var product = p[id];
            break;
        }
        el.product_id = product.id;
        el.innerHTML = product.name;
        this.tag.style.cursor = "pointer";
        this.tag.setAttribute("title", "Click to add \"" + product.name + "\" to shopping cart");
        this.tag.setAttribute("product_name", product.name);
        this.tag.setAttribute("onclick", "desktop.ecom_cart.addProduct({id:" + product.id + "})");
    },

    onImgProductClear: function() {
        var el = this.$["box_img_product"];
        el.innerHTML = "none";
        this.tag.style.cursor = "";
        this.tag.removeAttribute("title");
        this.tag.removeAttribute("product_name");
        this.tag.removeAttribute("onclick");
    },


    onEditImageClick: function() {
        var f = this.tag.src;
        if(!f) return;
        f = f.split("/");
        f = f.pop();
        desktop.runImageEditor(f, this.onImageEdited.bind(this));
    },

    onImageEdited: function(fname) {
        this.tag.src = core.common.getUserFile(fname);
    },
   


    // table panel
    addTable: function(e) {
        var rows = parseInt(this.$["inp_table_rows"].value, 10);
        this.$["inp_table_rows"].value = rows;
        var cols = parseInt(this.$["inp_table_cols"].value, 10);
        this.$["inp_table_cols"].value = cols;
        if(rows < 1 || rows > 100 || cols < 1 || cols > 30) desktop.modal_dialog.alert("Incorrect values");

        var n = 0;
        var html = "<table class='text_table'>";
        for(var i=0; i<rows; i++) {
            html += "<tr>";
            for(var j=0; j<cols; j++) {
                html += "<td>" + n + "</td>";
                n++;
            }
            html += "</tr>";
        }
        html += "</table>";
        el = this.getDoc().createElement("div");
        el.innerHTML = html;
        this.insertNodeAtSelection(el);
    },





    onApplyFontClick: function() {
        var el = this.getDoc().createElement("font");
        el.style.fontSize = this.$.inp_font_size.value;
        el.style.fontFamily = this.$.inp_font_family.value;
        el.style.color = this.$.inp_font_color.value;
        var c = this.getNodeAtSelection().textContent;
        if(!c) c = " ";
        el.innerHTML = c;
        this.insertNodeAtSelection(el);
        this.hidePanel();
    },


////////////////
    onImageSelected: function(src) {
        this.execCommand("insertimage", core.common.getUserFile(src));
    },



    // editor doc

    execCommand: function(cmd, arg) {
        this.getDoc().execCommand(cmd, false, arg ? arg : null);
        this.updateToolbar();
        this.historySave();
        this.focus();
    },

    setHTML: function(html) {
        this.getDoc().body.innerHTML = html ? html : "<br/>";
    },



    getHTML: function() {
        if(this.style == "html") {
            var html = this.$["textarea"].value;
        } else { 
            var html = this.getDoc().body.innerHTML;
        }
        html = html.replace(" class=\"\"", "").replace(" class=\'\'", "");
        this.setHTML(html);
        return html;
    },



    focus: function() {
        var ifr = this.getIframe();
        if(ifr.contentWindow) {
            ifr.contentWindow.focus();
        } else {
            ifr.focus();
        }
    },



    // modes
    setWYZMode: function() {
        if(this.style == "wyz") return;
        this.setHTML(this.getHTML());
        this.hideElements(["textarea", "toolbar_textarea"]);
        this.showElements(["iframe", "toolbar_iframe"]);
        this.style = "wyz";
        this.historyStop(0);
    },


    setHTMLMode: function() {
        if(this.style == "html") return;
        this.$["textarea"].value = this.getHTML();
        this.hideElements(["iframe", "toolbar_iframe"]);
        this.showElements(["textarea", "toolbar_textarea"]);
        this.style = "html";
        this.historyStop(0);
    },






    // undo/redo

    initHistory: function() {
        this.is_changed = false;
        this.history = [this.getHTML()];
        this.historyIdx = 0;
    },



    historySave: function() {
        if(this.isRedoAvailable()) {
            this.historyStop(this.historyIdx);
        }
        this.history.push(this.getDoc().body.innerHTML);
        if(this.history.length > this.maxHistory) {
            this.history.shift();
        }
        this.historyIdx = this.history.length - 1;
    },


    historyStop: function(lastIdx) {
        this.history = this.history.splice(0, lastIdx + 1);
    },


    historyUndo: function() {
        if(this.historyIdx) {
            this.historyIdx--;
            this.setHTML(this.history[this.historyIdx]);
        }
    },


    historyRedo: function() {
        if(this.historyIdx < this.history.length - 1) {
            this.historyIdx++;
            this.setHTML(this.history[this.historyIdx]);
        }
    },
    

    isUndoAvailable: function() {
        return this.historyIdx;
    },


    isRedoAvailable: function() {
        return this.historyIdx < this.history.length - 1;
    },
        


    // get/set selection
    getSelection: function() {
        if(window.getSelection) {
            var selection = this.getIframe().contentWindow.getSelection();
            if(selection && selection.rangeCount > 0) {
                var selectedRange = selection.getRangeAt(0);
                return selectedRange.cloneRange();
            } else {
                return null;
            }
        } else if(this.getDoc().selection) {
            var selection = this.getDoc().selection;
            if(selection.type.toLowerCase() == 'text') {
                return selection.createRange().getBookmark();
            } else {
                return null;
            }
        } else {
            return null;
        }
    },

                          
    setSelection: function(s) {
        if(!s) return;
        if(window.getSelection) {
            var selection = this.getIframe().contentWindow.getSelection();
            selection.removeAllRanges();
            selection.addRange(s);
        } else if(this.getDoc().selection && this.getDoc().body.createTextRange) {
            var range = this.getDoc().body.createTextRange();
            range.moveToBookmark(s);
            range.select();
        }
    },



    // exrta settigns panel (author, date, tags etc)
    setExtraData: function(doc) {
        var el = this.$["doc_date"];
        var d = doc.modified ? new Date(doc.modified * 1000) : new Date();
        el.time = d.getUnixTime();
        el.value = d.format();
        this.$["inp_doc_author"].value = doc.author || "";
        this.$["inp_doc_tags"].value = doc.tags || "";
    },



    onDocCalSelected: function(cal) {
        var d = cal.date;
        var el = this.$["doc_date"];
        el.value = d.format();
        el.time = d.getUnixTime();
    },



    setDocumentTitle: function(str) {
        this.setTitle(str);
        this.doc_title = str;
    },

    getDocumentTitle: function() {
        return this.doc_title;
    },




    isSelectionEmpty: function() {
        var n = this.getNodeAtSelection();
        return !n || n.textContent == "";
    },





    // TODO: make one lib for this and inline texteditor

    procedure_removeFormat: function(e, args) {
        if(e) {
            e.target.blur();
        }
        var range = this.getSelection();
        if(!range || this.isSelectionEmpty()) return;

        var start_container = range.startContainer.nodeType == 3 ? range.startContainer.parentNode : range.startContainer;
        var end_container = range.endContainer.nodeType == 3 ? range.endContainer.parentNode : range.endContainer;
        if(start_container == end_container && this.getDoc().body != start_container) {
            range.selectNode(start_container);
        }
        var text = range.cloneContents().textContent;
        var el = this.getDoc().createTextNode(text);
        range.deleteContents();
        range.insertNode(el);
        this.getIframe().focus();



    },



    procedure_heading: function(e, args) {
        if(e) {
            e.target.blur();
        }

        var range = this.getSelection();
        if(!range || this.isSelectionEmpty()) return;

        var tag = args[1];

        var start_container = range.startContainer.nodeType == 3 ? range.startContainer.parentNode : range.startContainer;
        var end_container = range.endContainer.nodeType == 3 ? range.endContainer.parentNode : range.endContainer;

        if(start_container == end_container && ("h1h2h3h4h5h6").indexOf(start_container.tagName.toLowerCase()) != -1) {
            range.selectNode(start_container);
            var text = range.cloneContents().textContent;
            var el = this.getDoc().createElement(tag);
            el.innerHTML = text;
            start_container.parentNode.replaceChild(el, start_container);
        } else {
            var text = range.cloneContents().textContent;
            var el = this.getDoc().createElement(tag);
            el.innerHTML = text;
            range.deleteContents();
            range.insertNode(el);
        }
    },









// previews
    showPreview: function(target, title) {
        this.showElement("preview_wrapper");
        if(this.preview_target) {
            this.hideElement("preview_" + this.preview_target);
        }

        var k = "preview_" + target;
        if(!this.$[k]) {
            this.buildModel(this.$.preview,
                { tag: "div", 
                  id: k,
                  className: k,
                  childs: this.callFunction("getPreviewModel_" + target) }
            );
        } else {
            this.showElement(k);
        }
        this.preview_target = target;
        this.$.preview_title.innerHTML = title;
    },



    hidePreview: function() {
        this.hideElement("preview_wrapper");        
    },




// symbols

    getPreviewModel_symbols: function() {
        var m = [], c, s;
        for(var i=0; i<this.font_awesome_sections.length; i++) {
            s = this.font_awesome_sections[i];
            m.push(
                { tag: "strong",
                  innerHTML: s.title }
            );
            for(var j=0; j<s.classes.length; j++) {
                c = s.classes[j];
                m.push(
                    { tag: "i",
                      className: c,
                      events: { onclick: ["onSymbolClick", c] } }
                );
            }
        }
        return m;
    },


    onSymbolClick: function(e, c) {
        var el = this.getDoc().createElement("i");
        el.className = c;
        this.insertNodeAtSelection(el);
        this.hidePreview();
    },



// font
    getPreviewModel_font: function() {
        
    },



// blocks ???
    getPreviewModel_blocks: function() {
        var m = [];
        for(var i=0; i<this.blockStyles.length; i++) {
            var n = this.blockStyles[i];
            m.push(
                { tag: "div", className: "panel_block_thumb " + n,
                  innerHTML: "Text",
                  events: { onclick: ["panelCmd", ["block_style", n,"body"]] } }
            );
        }
        return m;
    }
 
}
core.objects.text_editor_ex.extendPrototype(core.components.html_component);