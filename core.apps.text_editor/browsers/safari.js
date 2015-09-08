// Safari specific code

if(core.browser.safari) {
    core.objects.text_editor_ex.extendPrototype({

        // initEditor
        initEditor: function() {
            var pdoc = this.getDoc();
            try {
                if(pdoc.designMode != 'on') {
                    pdoc.designMode = 'on';
                    pdoc.designMode = 'off';
                    pdoc.designMode = 'on';
                }
            } catch(e) {
                setTimeout(this.initEditor.bind(this), 50);
                return ;
            }
        },


        // returns reference to editors page iframe same as getIframeObject under Gecko
        getIframe: function() {
            return this.$["iframe"];
        },



        // returns reference to content document of editors page
        getDoc: function() {
            return this.$["iframe"].contentDocument;
        },



        // insert node at selection
        insertNodeAtSelection: function(newNode) {
            var pif = this.getIframe();
            var pdoc = this.getDoc();

            var sel = pif.contentWindow.getSelection();
            var rng = sel.getRangeAt(0);
            rng.deleteContents();

            var container = rng.startContainer;
            var startpos = rng.startOffset;

            rng = pdoc.createRange();
            switch(container.nodeType) {
                case 3:
                // text node
                var txt = container.nodeValue;
                var afterTxt = txt.substring(startpos);
                container.nodeValue = txt.substring(0, startpos);
                if(container.nextSibling == null) {
                    container.parentNode.appendChild(newNode);
                    container.parentNode.appendChild(pdoc.createTextNode(afterTxt));
                }
                 else {
                    var afterNode = pdoc.createTextNode(afterTxt);
                    container.parentNode.insertBefore(afterNode, container.nextSibling);
                    container.parentNode.insertBefore(newNode, afterNode);
                }
                rng.setStart(container.parentNode.childNodes[1], 0);
                rng.setEnd(container.parentNode.childNodes[2], 0);
                break;
                default:
                // element node
                container.insertBefore(newNode, container.childNodes[startpos]);
                rng.setEnd(container.childNodes[startpos], 0);
                rng.setStart(container.childNodes[startpos], 0);
                break;
            }

            sel.removeAllRanges();
            // sel.addRange(rng);
        },



        // returns currently selected node
        getNodeAtSelection: function() {
            var pif = this.getIframe();

            var sel = pif.contentWindow.getSelection();
            if(sel && sel.rangeCount > 0) {
                var rng = sel.getRangeAt(0);

                return rng.cloneContents();
            } else {
                return null;
            }
        },



        // returns selection's parent element (closest current element)
        getSelectionParent: function() {
            var result;

            var pif = this.getIframe();
            var pdoc = this.getDoc();

            var sel = pif.contentWindow.getSelection();
            if(sel && sel.rangeCount > 0) {
                var rng = sel.getRangeAt(0);

                var container = rng.commonAncestorContainer;
                result = container;

                if(container.nodeType == 3)
                 { // text node
                    result = container.parentNode;
                } else if(rng.startContainer.nodeType == 1 && rng.startContainer == rng.endContainer && (rng.endOffset - rng.startOffset) <= 1) {
                    // single object selected
                    result = rng.startContainer.childNodes[rng.startOffset];
                }
            } else {
                result = pdoc.body;
            }
            return result;
        },



        selectionWalk: function(func) {
            var pif = this.getIframe();

            var sel = pif.contentWindow.getSelection();
            if(sel && sel.rangeCount > 0) {
                var rng = sel.getRangeAt(0);
                var ancestor = rng.commonAncestorContainer;

                this.selectionNodeWalk(ancestor, rng, func);
            }
        },



        selectionNodeWalk: function(node, rng, func) {
            if(rng.isPointInRange(node, 0) || rng.startContainer == node || rng.endContainer == node) {
                func(node, (rng.startContainer == node) ? rng.startOffset : null, (rng.endContainer == node) ? rng.endOffset : null);
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
            var elm = pdoc.createElement("span");
            var frag = pdoc.createDocumentFragment();
            elm.innerHTML = source;
            while(elm.hasChildNodes())
                frag.appendChild(elm.childNodes[0]);
            this.insertNodeAtSelection(frag);
        },



        // applies style setting or css class to selection
        applyStyleToSelection: function(cssClass, styleName, styleValue) {
            var sel = this.getNodeAtSelection();
            var pnode = this.getSelectionParent();
            if(sel) {
                if(sel.nodeType == 1)
                 { // element
                    if(cssClass != '')
                        sel.className = cssClass;
                    if(styleName != '')
                        sel.style[styleName] = styleValue;
                    this.insertNodeAtSelection(sel);
                } else {
                    var pdoc = this.getDoc();
                    var spn = pdoc.createElement("SPAN");
                    if(cssClass != '')
                        spn.className = cssClass;
                    if(styleName != '')
                        spn.style[styleName] = styleValue;
                    spn.appendChild(sel);
                    if(spn.innerHTML.length > 0)
                     { // something selected
                        if(spn.innerHTML != pnode.innerHTML || pnode.tagName == "BODY")
                        // this is a new snippet, set class on it
                            this.insertNodeAtSelection(spn);
                        else
                         { // change class
                            if(cssClass != '')
                                pnode.className = cssClass;
                            if(styleName != '')
                                pnode.style[styleName] = styleValue;
                        }
                    } else
                     { // nothing is select, set class on the parent
                        if(pnode.tagName != "BODY")
                         { // there is a parent, set class on it
                            if(cssClass != '')
                                pnode.className = cssClass;
                            if(styleName != '')
                                pnode.style[styleName] = styleValue;
                        } else {
                            spn.innerHTML = pnode.innerHTML;
                            pnode.innerHTML = '';
                            pnode.appendChild(spn);
                        }
                    }
                }
            }
        }



    });
}