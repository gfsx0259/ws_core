core.apps.menu.extendPrototype({

    onFirstRun: function() {
        this.showSettings();
    },

    // settings

    settingsBlocks: [
        { title: "Button text:",
          controls: [
            { tag: "wsc_text", id: "inp_button_text" }
          ]}
    ],



    fillSettingsForm: function() {
        this.$.inp_button_text.value = this.profile.buttton_text;
    },


    processSettingsForm: function() {
        this.profile.buttton_text = this.$.inp_button_text.value;
    },


    onSettingsUpdated: function() {
        if(this.$.button) {
            this.$.button.innerHTML = this.profile.buttton_text;
        }
    }


});