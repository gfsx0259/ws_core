core.apps.users_manager = function() {
    this.users_offset = 0;
    this.usersPerPage = 10;
    this.users_total=0;
};


core.apps.users_manager.prototype = {

    window_resize: {
        height: 450,
        min_height: 450,
        width: 960,
        min_width: 950,
        target: "panels"
    },


    onResize: function(v) {
        this.$["left_menu"].style.height = v.height - 15 + "px";
        this.$["sections_content"].style.height = v.height - 15 + "px";
    },


    getTitle: function() {
        return "Users manager";
    },


    renderContent: function() {
        this.displayTpl(this.$["content"], "users_manager");
        if(core.data.site_info.users_reg_moderation == 1) {
            this.showElement("bar_moderation");
        } else {
            this.hideElement("bar_moderation");
        }

        this.users_pager = new core.objects.pager({ 
            parent: this.$["users_pager_box"], 
            callback: this.setUsersOffset.bind(this),
            per_page:this.$["inp_user_manager_users_per_page"].value
        });
        this.moderation_pager = new core.objects.pager({ 
            parent: this.$["moderation_pager_box"], 
            callback: this.setModerationOffset.bind(this)
        });
        this.showBar("users");
    },

    


    // bars code

    onBarClick: function(e) {
        e = core.browser.event.fix(e);
        var el = e.target;
        if(!el.bar_name) el = el.parentNode;
        el.blur();
        this.showBar(el.bar_name);
    },

    showBar: function(bar) {
        if(this.activeBar) {
            this.hideElement("content_" + this.activeBar);
            this.$["bar_" + this.activeBar].className = "";
        }
        
        this.initBarContent(bar);
        this.activeBar = bar;
        this.showElement("content_" + bar);
        this.$["bar_" + bar].className = "active";
    },



    isBarContentReady: {},

    initBarContent: function(bar) {
        if(this.isBarContentReady[bar]) return;
        switch(bar) {
            case "settings":
                this.$["inp_users_reg_msg"].value = core.data.site_info.users_reg_msg;
                this.$["inp_enable_users"].setChecked(core.data.site_info.enable_users == 1);
                this.$["inp_users_reg_moderation"].setChecked(core.data.site_info.users_reg_moderation == 1);
                this.$["inp_users_reg_confirmation"].setChecked(core.data.site_info.users_reg_confirmation == 1);
                this.onSettingsModerationChange();
                break;

            case "users":
                this.loadUsers();
                break;

            case "moderation":
                this.loadModerationList();
                break;

            case "permissions":
                var p = {
                    dialog: "users_manager",
                    act: "get_permissions"
                };
                core.transport.send("/controller.php", p, this.onPermissionsData.bind(this), "POST");
                break;
        }
        this.isBarContentReady[bar] = true;
    },







    // Settings
    onSettingsModerationChange: function() {
        if(this.$["inp_users_reg_moderation"].checked) {
            this.showElement("bar_moderation");
        } else {
            this.hideElement("bar_moderation");
        }
    },


    onSaveSettingsClick: function(e) {
        this.$["btn_save_settings"].disabled = true;
        this.hideElement("msg_settings_saved");
        var p = {
            dialog: "users_manager",
            act: "save_settings",
            //email: this.$["inp_site_email"].value.trim(),
            enable_users: this.$["inp_enable_users"].checked ? 1 : 0,
            users_reg_confirmation: this.$["inp_users_reg_confirmation"].checked ? 1 : 0,
            users_reg_moderation: this.$["inp_users_reg_moderation"].checked ? 1 : 0,
            users_reg_msg: this.$["inp_users_reg_msg"].value
        };
        with(core.data.site_info) {
            enable_users = p.enable_users;
            users_reg_moderation = p.users_reg_moderation;
            users_reg_confirmation = p.users_reg_confirmation;
            email = p.email;
        }
        core.transport.send("/controller.php", p, this.onSettingsSaved.bind(this), "POST");
    },


    onSettingsSaved: function(r) {
        if(r == "ok") {
            this.$["btn_save_settings"].disabled = false;
            this.showElement("msg_settings_saved");
            desktop.updateAuthControls();
        } else {
            desktop.modal_dialog.alert("Server error");
        }
    },





    // Permissions

    onPermissionsData: function(r) {
        if(r) {
            core.data.contributor_permissions = r;
            this.hideElement("permissions_msg");
            this.showElement("permissions_form");
//            this.$["inp_p_forum_post"].checked = r.forum_post == 1;
            this.$["inp_p_manage_events"].setChecked(r.manage_events == 1);
            this.$["inp_p_manage_docs"].setChecked(r.manage_docs == 1);
            this.$["inp_p_manage_files"].setChecked(r.manage_files == 1);
        } else {
            this.$["permissions_msg"].innerHTML = "Server error"
        }
    },


    onSavePermissionsClick: function(e) {
        this.$["btn_save_permissions"].disabled = true;
        this.hideElement("msg_permissions_saved");
        var p = {
            dialog: "users_manager",
            act: "set_permissions",
//            forum_post: this.$["inp_p_forum_post"].checked ? 1 : 0,
            manage_events: this.$["inp_p_manage_events"].checked ? 1 : 0,
            manage_docs: this.$["inp_p_manage_docs"].checked ? 1 : 0,
            manage_files: this.$["inp_p_manage_files"].checked ? 1 : 0
        };
        core.transport.send("/controller.php", p, this.onPermissionsSaved.bind(this), "POST");
    },

    onPermissionsSaved: function(r) {
        if(r == "ok") {
            this.$["btn_save_permissions"].disabled = false;
            this.showElement("msg_permissions_saved");
        } else {
            desktop.modal_dialog.alert("Server error");
        }
    },





    // Users

    onUsersSearchClick: function() {
        this.loadUsers();
    },

    onResetUsersSearchClick: function() {
        this.$["inp_filter_confirmed"].setValue("");
        this.$["inp_filter_q"].value = "";
        this.onUsersSearchClick();
    },


    getSearchFilter: function() {
        var f = {
            q: this.$["inp_filter_q"].value.trim(),
            confirmed: this.$["inp_filter_confirmed"].value,
            contributor: this.$["inp_filter_contributor"].value,
            offset: this.users_offset
        };
        return f;
    },


    loadUsers: function() {
        this.setUsersBlocked("Loading...");
        var p = this.getSearchFilter();
        p.dialog = "users_manager";
        p.act = "search_users";
        p.offset = this.users_offset;
        p.per_page = this.users_pager.per_page;
        core.transport.send("/controller.php", p, this.onUsersResponce.bind(this), "POST");
    },



    onUsersResponce: function(r) {
        if(r && r.status == "users") {
            this.users = r.data;
            this.users_total = r.total;
            this.updateUsersPager();
            this.renderUsersList();
        }
    },




    // users list pager

    updateUsersPager: function() {
        this.users_pager.setData(this.users_offset, this.users_total);
    },


    setUsersOffset: function(v) {
        this.users_offset = v;
        this.loadUsers();
    },


    // render users list
    
    clearUsersList: function() {
        var el = this.$["users_table"];
        while(el.childNodes.length > 2) {
            el.removeChild(el.lastChild);
        }
    },



    renderUsersList: function() {
        this.setUsersBlocked(false);
        this.clearUsersList();
        for(var i=0; i<this.users.length; i++) {
            var v = this.users[i];
            var m =                 
                { tag: "tr",
                  childs: [
                    { tag: "td", innerHTML: v.first_name },
                    { tag: "td", innerHTML: v.last_name },
                    { tag: "td", innerHTML: v.email },
                    { tag: "td", innerHTML: v.pwd },

                    { tag: "td", className: "ta_center",
                      innerHTML: v.confirmed == 1 ? "Yes" : "No" },
                    { tag: "td", className: "ta_center",
                      innerHTML: v.contributor == 1 ? "Yes" : "No" },

                    { tag: "td", className: "ta_center last",
                      childs: [
                        { tag: "img", className: "icon",
                          title: "Edit",
                          src: "/static/icons/pencil.png",
                          events: { onclick: [ "onEditUserClick", i ] } },
                        { tag: "span", innerHTML: " &nbsp; " },
                        { tag: "img", className: "icon",
                          title: "Delete",
                          src: "/static/icons/cross.png",
                          events: { onclick: [ "onDeleteUserClick", i ] } }
                      ]}
                  ]};
            this.buildModel(this.$["users_table"], m);
        }
    },




    // edit users

    onEditUserClick: function(e, idx) {
        this.activeUserIdx = idx;
        var v = this.users[idx];
        this.$["inp_user_first_name"].value = v.first_name;
        this.$["inp_user_last_name"].value = v.last_name;
        this.$["inp_user_email"].value = v.email;
        this.$["inp_user_pwd"].value = v.pwd;
        this.$["inp_user_confirmed"].setChecked(v.confirmed == 1);
        this.$["inp_user_contributor"].setChecked(v.contributor == 1);
        this.hideElement("btn_add_user");
        this.showElement("btn_save_user");
    },


    processUserForm: function() {
        var d = {
            first_name: this.$["inp_user_first_name"].value.trim(),
            last_name: this.$["inp_user_last_name"].value.trim(),
            email: this.$["inp_user_email"].value.trim(),
            pwd: this.$["inp_user_pwd"].value.trim(),
            confirmed: this.$["inp_user_confirmed"].checked ? 1 : 0,
            contributor: this.$["inp_user_contributor"].checked ? 1 : 0,
            approved: 1
        };
        if(d.email == "") {
            desktop.modal_dialog.alert("Please enter user email");
            return false;
        } else if(d.contributor == 1 && d.email == "" && d.pwd == "") { 
            desktop.modal_dialog.alert("Please enter user email and pwd both");
            return false;
        }
        return d;
    },


    clearUserForm: function() {
        this.$["inp_user_first_name"].value = "";
        this.$["inp_user_last_name"].value = "";
        this.$["inp_user_email"].value = "";
        this.$["inp_user_pwd"].value = "";
        this.$["inp_user_confirmed"].setChecked(core.data.site_info.users_reg_confirmation == 0);
        this.$["inp_user_contributor"].setChecked(false);
        this.showElement("btn_add_user");
        this.hideElement("btn_save_user");
    },



    // add user


    onAddUserClick: function(e) {
        var d = this.processUserForm();
        if(d) {
            this.setUsersBlocked("Saving...");
            d.dialog = "users_manager";
            d.act = "create_user";
            core.transport.send("/controller.php", d, this.onAddUserResponce.bind(this), "POST");
        }
    },


    onAddUserResponce: function(r) {
        if(!r) {
            this.setUsersBlocked("Server error");
        } else {
            this.loadUsers();
            if(r.status != "ok") {
                this.setUsersBlocked(false);
                desktop.modal_dialog.alert("Email already used");
            } else {
                this.clearUserForm();
            }
        }
    },



    // update user

    onSaveUserClick: function(e) {
        var d = this.processUserForm();
        if(d) {
            this.setUsersBlocked("Updating user...");
            var id = this.users[this.activeUserIdx].id;
            this.users[this.activeUserIdx].id = clone(d);
            d.dialog = "users_manager";
            d.act = "update_user";
            d.id = id;
            core.transport.send("/controller.php", d, this.onSaveUserResponce.bind(this), "POST");
        }
    },


    onSaveUserResponce: function(r) {
        if(r == "ok") {
            this.loadUsers();
            this.showElement("btn_add_user");
            this.hideElement("btn_save_user");
            this.$["inp_user_first_name"].value = '';
            this.$["inp_user_last_name"].value = '';
            this.$["inp_user_email"].value = '';
            this.$["inp_user_pwd"].value = '';
            this.$["inp_user_confirmed"].setChecked(false);
            this.$["inp_user_contributor"].setChecked(false);
        } else {
            this.setUsersBlocked("Server error");
        }
    },



    // delete user

    onDeleteUserClick: function(e, idx) {
        desktop.modal_dialog.confirm("Delete user?", this.deleteUser.bind(this, idx));
    },

    deleteUser: function(idx) {
        this.setUsersBlocked("Deleting user...");
        var p = {
            dialog: "users_manager",
            act: "delete_user",
            id: this.users[idx].id
        };
        core.transport.send("/controller.php", p, this.onDeleteUserResponce.bind(this), "POST");
    },


    onDeleteUserResponce: function(r) {
        if(r == "ok") {
            var current_page=(this.users_offset/this.users_pager.per_page)+1;
            var total_pages=Math.ceil((this.users_total-1)/this.users_pager.per_page);
            if(current_page>total_pages)
                this.users_offset=(total_pages-1)*this.users_pager.per_page;
            //this.users_total=this.users_total-2;
            //this.users_offset=Math.floor(this.users_total/this.users_pager.per_page)*this.users_pager.per_page;
            this.loadUsers();
        } else {
            this.setUsersBlocked("Server error");
        }
    },



    // common funcs

    setUsersBlocked: function(v) {
        if(v) {
            this.clearUsersList();
            this.hideElement("user_editor");
            this.showElement("msg_users");
            this.$["msg_users_content"].innerHTML = v;
            this.users_pager.hide();
            this.hideElement("btn_popup_ok");
        } else {
            this.showElement("btn_popup_ok");
            if(!this.users_pager.is_empty) {
                this.users_pager.show();
            }
            this.hideElement("msg_users");
            try{
                this.$["user_editor"].style.display = "table-row";
            }
            catch(err){
                this.$["user_editor"].style.display = "";
            }
        }
    },






    // moderation

    loadModerationList: function() {
        this.setModerationBlocked("Loading...");
        var p = {
            dialog: "users_manager",
            act: "get_moderation_list",
            offset: this.moderation_offset,
            per_page: this.moderation_pager.per_page
        };
        core.transport.send("/controller.php", p, this.onModerationListResponce.bind(this), "POST");
    },



    onModerationListResponce: function(r) {
        if(r && r.status == "data") {
            this.moderation_list = r.data;
            this.moderation_total = r.total;
            this.updateModerationPager();
            this.renderModerationList();
        }
    },


    updateModerationPager: function() {
        this.moderation_pager.setData(this.moderation_offset, this.moderation_total);
    },


    setModerationOffset: function(v) {
        this.moderation_offset = v;
        this.loadModerationList();
    },



    clearModerationList: function() {
        var el = this.$["moderation_table"];
        while(el.childNodes.length > 1) {
            el.removeChild(el.lastChild);
        }
    },



    renderModerationList: function() {
        this.setModerationBlocked(false);
        this.clearModerationList();
        for(var i=0; i<this.moderation_list.length; i++) {
            var v = this.moderation_list[i];
            var m =                 
                { tag: "tr",
                  childs: [
                    { tag: "td", innerHTML: v.first_name },
                    { tag: "td", innerHTML: v.last_name },
                    { tag: "td", innerHTML: v.email },
                    { tag: "td", innerHTML: v.pwd },


                    { tag: "td", 
                      className: "ta_center last",
                      childs: [
                        { tag: "select",
                          id: "inp_moder_act" + i,
                          style: { width: "100px" },
                          options: [
                            { value: "", text: "..." },
                            { value: 1, text: "approve" },
                            { value: 0, text: "disapprove" }
                          ]}
                      ]}
                  ]};
            if(v.reg_reason != "") {
                m = [ 
                    m,
                    { tag: "tr",
                      childs: [
                         { tag: "td", colSpan: 9,
                           innerHTML: v.reg_reason }
                      ]}
                ];

            }
            this.buildModel(this.$["moderation_table"], m);
        }
    },
 
    onChangeRowsPerPage:function(){
        var current_page=(this.users_offset/this.users_pager.per_page)+1;
        this.users_pager.changeRowsPerPage(this.$["inp_user_manager_users_per_page"].value);
        var total_pages=Math.ceil(this.users_total/this.users_pager.per_page);
        if(current_page>total_pages)
            this.users_offset=(total_pages-1)*this.users_pager.per_page;        
        this.loadUsers();
    },
    onApplyModerationClick: function(e) {
        var p = {
            dialog: "users_manager",
            act: "moderate",
            per_page: this.moderation_pager.per_page,
            approved: [],
            disapproved: []
        };
        for(var i=0; i<this.moderation_list.length; i++) {
            var uid = this.moderation_list[i].id;
            switch(this.$["inp_moder_act" + i].value) {
                case "1":
                    p.approved.push(uid);
                    break;
                case "0":
                    p.disapproved.push(uid);
                    break;
            }
        }
        if(p.approved.length || p.disapproved.length) {
            this.setModerationBlocked("Loading...");

            p.approved = p.approved.join("-");
            p.disapproved = p.disapproved.join("-");
            core.transport.send("/controller.php", p, this.onModerationListResponce.bind(this), "POST");
        }
    },




    setModerationBlocked: function(v) {
        if(v) {
            this.clearModerationList();
            try{
                this.$["msg_moderation"].style.display = "table-row";
            }
            catch(err){
                this.$["msg_moderation"].style.display = "";
            }
            this.$["msg_moderation_content"].innerHTML = v;
            this.moderation_pager.hide();
            this.hideElements(["btn_popup_ok", "moderation_controls"]);
        } else {
            this.showElements(["btn_popup_ok", "moderation_controls"]);
            if(!this.moderation_pager.is_empty) {
                this.moderation_pager.show();
            }
            this.hideElement("msg_moderation");
        }
    }


};
core.apps.users_manager.extendPrototype(core.components.html_component);
core.apps.users_manager.extendPrototype(core.components.popup_app);