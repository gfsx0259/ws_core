core.apps.desktop.prototype.ecom_cart = {


    // interface


    //args: { id, form_data, dc_products, amount }
    addProduct: function(args, callback) {
        this.last_added_product_id = args.id;
        var p = {
            act: "cart_add_product",
            amount: parseInt(args.amount) || 1,
            pid: args.id,
            dc_products: varToString(args.dc_products) || "",
            form_data: args.form_data || "",
            discount: args.discount ? args.discount : 0
        }


        this.send(p, callback);
    },


    //args: { form_data, amount_to_pay }
    addDonation: function(args, callback) {
        var p = {
            act: "cart_add_donation",
            amount_to_pay: parseFloat(args.amount_to_pay),
            form_data: args.form_data || ""
        }
        if(!p.amount_to_pay) return;
        this.send(p, callback);
    },


    removeProduct: function(key, callback) {
        var p = {
            act: "cart_remove_product",
            cart_key: key
        };
        this.send(p, callback);
    },




    // data

    send: function(p, callback) {
        p.dialog = "ecommerce";
        core.transport.send('/controller.php', p, this.onServerResponce.bind(this, callback), 'POST');
    },


    onServerResponce: function(callback, r) {
        if(!r || !r.data || !r.data.cart) return;
        if(r.data.status == 0) {
            desktop.modal_dialog.alert(r.data.text);
        } else {
            core.data.ecom_cart = r.data.cart;

            if(r.data.redirect_to_page) {
                desktop.ecom_cart.gotoCheckoutPage(r.data.redirect_to_page, r.data.checkout_ssl);
                return;
            } else {
                this.onCartUpdated();
                if(r.act == "cart_add_product") {
                    var product = r.data.cart.items[r.data.added_product_cart_key];
                    if(product) {
                        desktop.layout.callApps("ecommerce_breadcrumbs", "blinkDetailsPopup");
//                        desktop.showEcomCartMsg(r.data.cart.items[r.data.added_product_cart_key]);
                    } else {
                        desktop.modal_dialog.alert(r.data.text + '\nTotal amount: ' + r.data.cart.total_amount_items + r.data.cur);
                    }
                }
            }
        }
        if(callback) try {
            callback(r);
        } catch(e) {}
    },



    onCartUpdated: function(skip_apps) {
        if(!skip_apps) skip_apps = {};
        if(desktop.layout && desktop.layout.haveApps) {
            desktop.layout.callApps("shopping_cart", "refresh");
            desktop.layout.callApps("ecommerce_breadcrumbs", "refresh");
            desktop.layout.callApps("ecommerce_checkout", "refresh");
        }

        var el = $('scart_icon_text');
        if(el) {
            var cart = core.data.ecom_cart;
            var items_count = 0;
            if(cart) {
                var total_amount = Number(cart.total_amount_all).toFixed(2);
                for(var i in cart.items) items_count++;
            } else {
                var total_amount = "0.00";
            }
            el.innerHTML = "<span>Shopping Cart</span> " + items_count + " item/s | $" + total_amount + " value";
        }
    },


/*
    gotoCheckout: function() {
        if(core.browser.ie && core.browser.isWindowsXP()) {
            var url = 
                core.data.site_info.subdomain + "." + core.data.home_domain +
                "/checkout/?sync_session=1" +
                "&PHPSESSID=" + core.browser.cookies.get("PHPSESSID") +
                "&ecom_cart_id=" + core.browser.cookies.get("ecom_cart_id");
        } else {
            var url = core.data.http_host + "/checkout/";
        }
        location.href = "https://" + url;
    },
*/

    gotoCheckoutPage: function(page_url, checkout_ssl) {
        if(!page_url) {
            var p = {
                dialog: "ecommerce_checkout",
                act: "get_checkout_page"
            }
            core.transport.send('/controller.php', p, this.onCheckoutPage.bind(this));
            return;
        }
        if(page_url && REQUEST_GET.page != page_url) {
            page_url = page_url + ".html";

            if(core.browser.ie && core.browser.isWindowsXP()) {
                var url = 
                    core.data.site_info.subdomain + "." + core.data.home_domain +
                    "/checkout/?sync_session=1" +
                    "&PHPSESSID=" + core.browser.cookies.get("PHPSESSID") +
                    "&ecom_cart_id=" + core.browser.cookies.get("ecom_cart_id");
            } else {
                var url = core.data.http_host + "/" + page_url;
            }
            location.href = (checkout_ssl == 1 ? 'https' : 'http') + '://' + url;
        }
    },


    onCheckoutPage: function(r) {
        if(r && r.status == "ok") {
            this.gotoCheckoutPage(r.page_url, r.checkout_ssl);
        }
    }

}