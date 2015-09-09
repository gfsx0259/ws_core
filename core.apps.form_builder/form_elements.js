core.apps.form_builder.extendPrototype({

    all_field_properties: [
        "title",
        "label",
        "name",
        "width",
        "height",
        "use_as_subject",
        "use_as_reply",
        "statements",
        "options",
        "name_format",
        "time_format",
        "confirm_email",
        "text",
        "document",
        "url",
        "required",
        "currency",
        "new_window",
        "qty_input_type",
        "qty_min",
        "qty_max"
    ],





/*
form data: [
    { type: "...",
      properties: {
          name: "",
          label: "",
          required: false,
          ...
      },
      validators: [  ] },
    ...
]
*/

    form_elements: {
        text: {
            title: "Single line text",
            properties: {
                "label": "Single line text",
                "name": "text",
                "required": false,
                "use_as_subject": false
            },
            behavior: "element"
        },


        // textarea
        textarea: {
          title: "Paragraph text",
          properties: {
            "label": "Paragraph text",
            "name": "textarea",
            "height": "150",
            "required": false
          },
          behavior: "element"
        },

        // select
        select: {
          title: "Drop down",
          properties: {
            "label": "Drop down",
            "name": "select",
            "options": [],
            "required": false
          },
          behavior: "element"
        },

        // radio
        radios: {
          title: "Select a choice",
          properties: {
            "label": "Select a choice",
            "name": "radio",
            "options": []
          },
          behavior: "element"
        },

        // checkboxes
        checkboxes: {
          title: "Multiple choice",
          properties: {
            "label": "Multiple choice",
            "name": "checkboxes",
            "options": []
          },
          behavior: "element"
        },

        file: {
          title: "File",
          properties: {
            "label": "Select file",
            "name": "file",
            "required": false
          },
          behavior: "element"
        },

        // email
        email: {
          title: "Email",
          properties: {
            "label": "Email",
            "name": "email",
            "required": false,
            "use_as_reply": true
          },
          behavior: "element"
        },


        // name
        name: {
          title: "Name",
          properties: {
            "label": "Name",
            "name": "name",
            "name_format": "name",
            "required": false
          },
          behavior: "element"
        },



        // mixed elements

        price: {
          title: "Price",
          properties: {
            "label": "Price",
            "name": "price",
            "currency": "AUD",
            "required": false
          },
          behavior: "element"
        },


        addr: {
          title: "Address",
          properties: {
            "label": "Address",
            "name": "addr",
            "required": false
          },
          behavior: "element"
        },

        contact: {
          title: "Contact",
          properties: {
            "label": "Contact",
            "name": "contact",
            "confirm_email": false,
            "required": false
          },
          behavior: "element"
        },


        time: {
          title: "Time",
          properties: {
            "label": "Time",
            "name": "time",
            "time_format": "hhmm"
          },
          behavior: "element"
        },

        date: {
          title: "Date",
          properties: {
            "label": "Date",
            "name": "date"
          },
          behavior: "element"
        },

        statements: {
          title: "Choice matrix",
          properties: {
            "label": "Choice matrix",
            "name": "statements",
            "statements": [],
            "options": []
          },
          behavior: "element"
        },


        hr: {
          title: "Horizontal line",
          properties: {},
          behavior: "element"
        },

        page_break: {
          title: "Page break",
          properties: {},
          behavior: "control"
        },

        repeater: {
          title: "Repeater",
          properties: {
            "label": "How many applicants are there?",
            "qty_input_type": "select",
            "qty_min": 1,
            "qty_max": 20
          },
          behavior: "control"
        },


        "link": {
          title: "Link",
          properties: {
            "title": "Link",
            "url": "http://",
            "new_window": false
          },
          behavior: "element"
        },

        note: {
          title: "Note",
          properties: {
            "label": "Note",
            "text": "",
            "document": false
          },
          behavior: "element"
        },

        captcha: {
          title: "Captcha",
          properties: {
            "label": "Enter code",
            "name": "captcha",
            "required": true
          },
          behavior: "element"
        }

    }

});