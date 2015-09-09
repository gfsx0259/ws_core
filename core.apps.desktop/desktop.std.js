core.apps.desktop.extendPrototype({
    

    initLayoutElements: function() {
        var ids = [ 
            "document_wrapper",
            "site_content",
            "site_header",
            "header_doc",
            "site_logo",
            "site_title",
            "inp_site_search_q",
            "site_search_popup",
            "site_menu",
            "site_breadcrumbs",
            "page_content",
            "page_comments",
//            "page_content2",
            "page_footer",
            "site_footer",
            "page_content_wrapper",
            "site_auth",
            "auth_logged",
            "auth_logged_user",
            "auth_not_logged"
        ];
        for(var i=0; i<ids.length; i++) {
            var id = ids[i];
            this.$[id] = document.getElementById(id);
        }


        if(this.$["site_title"]) {
            core.browser.event.attach(this.$["site_title"], "onclick", this.onTitleClick.bindAsEventListener(this));
        }

        var el = this.$["inp_site_search_q"];
        if(el && core.data.main_menu_flags && core.data.main_menu_flags.indexOf("f") != -1) {
            core.browser.event.attach(el, "onfocus", this.onSiteSearchFocus.bindAsEventListener(this));
            core.browser.event.attach(el, "onblur", this.onSiteSearchBlur.bindAsEventListener(this));
        }
    },



    setTitle: function(str) {
        var el = this.$["site_title"];
        if(!el) return;
        el.innerHTML = core.common.formatTitle(str);
    },



    onTitleClick: function(e) {
        location.href = "http://" + core.data.http_host;
    },



    onSiteSearchFocus: function(e) {
        this.showElement("site_search_popup");
        return true;
    },

    onSiteSearchBlur: function(e) {
        var f = function() {
            desktop.hideElement("site_search_popup");
        };
        setTimeout(f, 300);
        return true;
    },



    // Theme

    initTheme: function() {
        this.initTheme2();
        if(core.apps.theme) {
            try {
            this.theme = new core.apps.theme();
            } catch(e) {}
            this.renderSiteLogo();
        }
    },


    initTheme2: function() {
        if(core.data.page_style_id) {
            document.body.className = "wsts_" + core.data.page_style_id;
        }
    },


    renderSiteLogo: function() {
        if(!this.$["site_logo"]) return;
        var file = core.data.site_info.site_logo;
        if(file) {
            file = core.common.getUserFile(file);
        } else if(this.theme && this.theme.site_logo && this.theme.site_logo) {
            //TODO: ��������� ��� � ������ ���� ����
            file = this.theme.site_logo.src;
            if(core.data.site_info.custom_theme) {
                file = 
                    "/custom_themes/" +
                    core.data.site_info.custom_theme + "/"+ this.theme.site_logo.src;
            } else {
                file = "/themes/" + core.data.site_info.theme + "/" + this.theme.site_logo.src;
            }
        }
        this.$["site_logo"].style.background = file ? "transparent url('" + file + "') no-repeat left center" : "none";
    },



    // site users login

    updateAuthControls: function() {
//return;
        if(core.data.site_user) {
            this.showElements(["site_auth", "auth_logged"]);
            if(this.$["auth_logged_user"]) {
                this.$["auth_logged_user"].innerHTML = core.data.site_user.email;
            }
        } else {
            if(core.data.site_info.enable_users == 1) {
                this.showElements(["site_auth", "auth_not_logged"]);
            } else {
                this.hideElements(["site_auth", "auth_not_logged"]);
            }
        }
    },

    onAuthLogoutClick: function(e) {
        var p = {
            dialog: "site_users",
            act: "logout"
        };
        core.transport.send("/controller.php", p, desktop.onLogoutResponce);
    },


    onLogoutResponce: function(r) {
        desktop.loadURL(window.location.href);
    },


    onAuthRegisterClick: function(e) {
        this.loadURL("/user/?mode=register");
    },


/*

    // status: "error" || "success"
    showEcomCartMsg: function(product) {
        if(!this.$["ecom_cart_msg"]) {
            this.displayTpl(document.body, "ecom_cart_msg");
        }
        this.showElement("ecom_cart_msg");
        this.$["ecom_cart_msg_product_title"].innerHTML = product.name;
        var pic = product.pic ? core.common.getUserFile(product.pic) : "/static/ecommerce/default_product_picture.gif";
        this.$["ecom_cart_msg_product_img"].src = pic;

        clearTimeout(this.ecom_cart_product_msg_timeout);
        this.ecom_cart_product_msg_timeout = setTimeout(this.hideEcomCartMsg.bind(this), 6000);
    },


    hideEcomCartMsg: function() {
        clearTimeout(this.ecom_cart_product_msg_timeout);
        this.hideElement("ecom_cart_msg");
    },


    onEcomCartMsgCheckoutClick: function() {
        this.ecom_cart.gotoCheckoutPage();
    },

*/



    // ecom stock subscribers


    showEcomSubscribeDlg: function(product_id, dc_products) {
        this.ecom_subscribe_product_id = product_id;
        this.ecom_subscribe_dc_products = dc_products;
        if(!this.$.ecom_subscribe_dlg) {
            this.displayTpl(document.body, "ecom_subscribe_dlg");
        } else {
            this.showElement("ecom_subscribe_dlg");
        }
        this.hideElement("ecom_subscribe_msg");
        this.showElement("ecom_subscribe_form");
        if(core.data.site_user && this.$.inp_ecom_subscribe_email.value == "") {
            this.$["inp_ecom_subscribe_email"].value = core.data.site_user.email;
        }
    },



    hideEcomSubscribeDlg: function() {
        this.hideElement("ecom_subscribe_dlg");
    },


    onEcomSubscribeClick: function() {
        this.hideElement("ecom_subscribe_form");
        this.showElement("ecom_subscribe_msg");
        this.$.ecom_subscribe_msg.innerHTML = "Please wait...";
        var p = {
            dialog: "ecommerce",
            act: "subscribe",
            product_id: this.ecom_subscribe_product_id,
            dc_products: varToString(this.ecom_subscribe_dc_products),
            email: this.$["inp_ecom_subscribe_email"].value
        };
        core.transport.send('/controller.php', p, this.onEcomSubscribeResponse.bind(this));
    },


    onEcomSubscribeResponse: function(r) {
        delete(this.ecom_subscribe_product_id);
        delete(this.ecom_subscribe_dc_products);
        if(!r || r.status != "ok") {
            this.$.ecom_subscribe_msg.innerHTML = "Server error.";
        } else {
            this.$.ecom_subscribe_msg.innerHTML = r.msg;
        }
        setTimeout(this.hideEcomSubscribeDlg.bind(this), 3000);
    }

});