core.apps.page_title.extendPrototype({

    onFirstRun: function() {
        this.showSettings();
    },

    settingsBlocks: [
        { title: "Content:", 
          controls: [
            { tag: "wsc_textarea", id: "inp_content",
              style: { height: "50px" } },
            { tag: "p",
              innerHTML: "Placeholders available:<br/>%MENU-NAME%<br/>%PAGE-TITLE%<br/>%MENU-BYLINE%" }
          ]}
    ],


    fillSettingsForm: function() {
        this.$["inp_content"].value = this.profile["content"];
    },


    processSettingsForm: function() {
        this.profile["content"] = this.$["inp_content"].value;
    },


    onSettingsUpdated: function() {
        this.refresh();
    }

});