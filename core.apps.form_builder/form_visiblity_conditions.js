/*
visiblity_condition: {
    mode: "visible" | "hidden",
    src_element: "src_elemtn_name",
    condition: "equal" | "not_equal",
    value: "src_element_value"
}
*/


core.apps.form_builder.extendPrototype({


    getFieldByName: function(name) {
        for(var i=0; i<this.data.fields.length; i++) {
            if(this.data.fields[i].properties.name == name) {
                return this.data.fields[i];
            }
        }
        return false;
    },


    ev_deault_visibility_condition: {
        mode: "visible",
        src_element: "",
        condition: "equal",
        value: ""
    },


    ev_src_element_types: {
        text: true,
        textarea: true,
        select: true,
        checkboxes: true
    },


    showVisibilityCondition: function(p) {
        var field = p.field;

        var src_elements = this.getEVSrcElements(field.properties.name, p.parent);
        if(!src_elements.length) {
            this.hideVisibilityCondition();
            return;
        }
        this.showElement("box_visibility_condition");

        if(field.visibility_condition) {
            var vc = field.visibility_condition;
            this.$["inp_ev_always_visible"].setChecked(false);
        } else {
            var vc = this.ev_deault_visibility_condition;
            this.$["inp_ev_always_visible"].setChecked(true);
        }   
        this.toggleEVParamsBox();


        var opts = [
            { text: "...", value: "" }
        ];
        for(var i=0; i<src_elements.length; i++) {
            opts.push({
                text: src_elements[i].label,
                value: src_elements[i].name
            });
        }
        this.$["inp_ev_src"].setOptions(opts);

        var vc = field.visibility_condition ? field.visibility_condition : this.ev_deault_visibility_condition;

        this.$["inp_ev_mode"].setValue(vc.mode);
        this.$["inp_ev_condition"].setValue(vc.condition);
        this.$["inp_ev_src"].setValue(vc.src_element);
        this.$["inp_ev_value"].value = vc.value;

    },


    hideVisibilityCondition: function() {
        this.hideElement("box_visibility_condition");
    },


    toggleEVParamsBox: function() {
        if(this.$["inp_ev_always_visible"].checked) {
            this.hideElement("box_ev_params");
        } else {
            this.showElement("box_ev_params");
        }
    },


    getEVSrcElements: function(exclude_name, node) {
        var res = [];
        for(var i=0; i<node.length; i++) {
            var field = node[i];
            if(this.ev_src_element_types[field.type] && field.properties.name != exclude_name) {
                res.push({
                    name: field.properties.name,
                    label: field.properties.label
                });
            }
        }
        return res;
    },



    getVisibilityCondition: function() {
        if(this.$["inp_ev_always_visible"].checked) {
            return false;
        } else {
            return {
                mode: this.$["inp_ev_mode"].value,
                condition: this.$["inp_ev_condition"].value,
                src_element: this.$["inp_ev_src"].value,
                value: this.$["inp_ev_value"].value
            }
        }
    },


    renameEVSrcElements: function(old_name, new_name) {
        for(var i=0; i<this.data.fields.length; i++) {
            var vc = this.data.fields[i].visibility_condition;
            if(!vc) continue;
            if(vc.src_element == old_name) {
                vc.src_element = new_name;
            }
        }
    }



});