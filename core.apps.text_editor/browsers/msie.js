// IE specific code

if(core.browser.ie) {

    core.objects.text_editor_ex.extendPrototype({

        initEditor: function() {
            var pdoc = this.getDoc();

            if(pdoc.designMode != 'on') {
                pdoc.designMode = "on";
            }
            try {
                if(pdoc.readyState != "complete") {
                    setTimeout(this.initEditor.bind(this), 20);
                    return ;
                }
            } catch(excp) {
                setTimeout(this.initEditor.bind(this), 20);
                return ;
            }
        },




        // returns reference to editors page iframe
        getIframe: function() {
            return this.$["iframe"];
        },



        // returns reference to content document of editors page
        getDoc: function() {
            return this.$["iframe"].contentWindow.document;
        },



        // insert node at selection
        insertNodeAtSelection: function(newNode) {
            this.focus();
            var pdoc = this.getDoc();
            var sel = pdoc.selection.createRange();
            var val;
            if(newNode.nodeType == 3)
             { // text node
                val = newNode.nodeValue;
            } else {
                val = newNode.outerHTML;
            }

            if(pdoc.selection.type == "Control") {
                sel(0).outerHTML = val;
            } else
             { // text node
                sel.pasteHTML(val);
            }
        },



        // returns currently selected node
        getNodeAtSelection: function() {
            this.focus();
            var result = null;

            var pdoc = this.getDoc();
            var sel = pdoc.selection.createRange();

            if(pdoc.selection.type == "Control") {
                result = sel(0);
            } else
             { // text node
                // IE can't use document fragment as normal node 
                // so we have to create a fake span surrouning selection
                result = pdoc.createElement("SPAN");
                result.innerHTML = sel.htmlText;
                result.textContent = result.innerText;
            }

            return result;
        },



        // returns selection's parent element (closest current element)
        getSelectionParent: function() {
            this.focus();
            var result = null;

            var pdoc = this.getDoc();
            var sel = pdoc.selection.createRange();

            if(pdoc.selection.type == "Control") {
                result = sel(0);
            } else
             { // text node
                result = sel.parentElement();
            }

            return result;
        },
         

        selectionWalk: function(func) {
            this.focus();

            var pdoc = this.getDoc();
            var sel = pdoc.selection.createRange();

            if(pdoc.selection.type.toLowerCase() != "control") {
                // text range
                // insert fake start and end markers
                var start_rng = sel.duplicate();
                start_rng.collapse();
                start_rng.pasteHTML('<span id="_spaw_start_container"></span>');
                var end_rng = sel.duplicate();
                end_rng.collapse(false);
                end_rng.pasteHTML('<span id="_spaw_end_container"></span>');

                this._in_selection = false;
                this.selectionNodeWalk(sel.parentElement(), null, func);

                // remove fake start and end markers
                pdoc.getElementById("_spaw_start_container").parentNode.removeChild(pdoc.getElementById("_spaw_start_container"));
                pdoc.getElementById("_spaw_end_container").parentNode.removeChild(pdoc.getElementById("_spaw_end_container"));
            } else {
                // control range
                this._in_selection = true;
                this.selectionNodeWalk(sel(0), null, func);
            }
        },



        selectionNodeWalk: function(node, rng, func) {
            if(this._in_selection || (node.nodeType == 1 && (node.id == '_spaw_start_container' || node.id == '_spaw_end_container'))) {
                if(node.nodeType != 1 || (node.id != '_spaw_start_container' && node.id != '_spaw_end_container'))
                    func(node, null, null);
                if(node.nodeType == 1 && node.id == '_spaw_end_container')
                    this._in_selection = false;
                else
                    this._in_selection = true;
            }
            if(node.childNodes && node.childNodes.length > 0) {
                for(var i = 0; i < node.childNodes.length; i++) {
                    var cnode = node.childNodes[i];
                    this.selectionNodeWalk(cnode, rng, func);
                }
            }
        },



        insertHtmlAtSelection: function(source) {
            var pdoc = this.getDoc();
            var sel = pdoc.selection.createRange();
            try {
                if(pdoc.selection.type == "Control")
                 { // control node
                    sel(0).outerHTML = source;
                    this.focus();
                } else {
                    sel.pasteHTML(source);
                }
            } catch(excp) {
                sel.collapse();
                try {
                    sel.pasteHTML(source);
                } catch(excp) {
                    // everything failed so do nothing
                }
            }
        },



        // applies style setting or css class to selection
        applyStyleToSelection: function(cssClass, styleName, styleValue) {
            this.focus();

            var sel = this.getNodeAtSelection(); // for IE this always returns span for non-objects
            var pnode = this.getSelectionParent();
            if(sel) {
                if(sel.innerHTML.length > 0 && sel.innerHTML != pnode.outerHTML)
                 { // setting class on a new snippet
                    if(cssClass != '')
                        sel.className = cssClass;
                    if(styleName != '')
                        sel.style.setAttribute(styleName, styleValue, 0);
                    this.insertNodeAtSelection(sel);
                } else if(sel.innerHTML.length == 0)
                 { // empty selection, set class on the parent
                    if(pnode && pnode.tagName != "BODY") {
                        if(cssClass != '')
                            pnode.className = cssClass;
                        if(styleName != '')
                            pnode.style.setAttribute(styleName, styleValue, 0);
                    } else
                     { // parent is body
                        sel.innerHTML = pnode.innerHTML;

                        if(cssClass != '')
                            sel.className = cssClass;
                        if(styleName != '')
                            sel.style.setAttribute(styleName, styleValue, 0);

                        pnode.innerHTML = sel.outerHTML;
                    }
                } else
                 { // changing class on an element
                    if(cssClass != '')
                        pnode.className = cssClass;
                    if(styleName != '')
                        pnode.style.setAttribute(styleName, styleValue, 0);
                }
            }
        },


        // removes style from selection
        removeStyleFromSelection: function(cssClass, styleName) {
            this.focus();

            var pnode = this.getSelectionParent();

            if(cssClass) {
                while(pnode && pnode.tagName != "BODY" && (!pnode.className || pnode.className == "")) {
                    pnode = pnode.parentNode;
                }

                if(pnode && pnode.tagName != "BODY") {
                    pnode.removeAttribute("class");
                    pnode.removeAttribute("className");
                }
            }

            if(styleName) {
                while(pnode && pnode.tagName != "BODY" && !pnode.style.getAttribute(styleName)) {
                    pnode = pnode.parentNode;
                }

                if(pnode && pnode.tagName != "BODY") {
                    pnode.style.removeAttribute(styleName);
                }
            }
        }



    });
}