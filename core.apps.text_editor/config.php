<?

    $config["js_apps"]["core.apps.text_editor"] = array(


        "content" => array(
            USERTYPE_ADMIN => array(
                "code" => array(
                    "text_editor.js",
                    "text_editor_obj.js",
                    "browsers/mozilla.js",
                    "browsers/msie.js",
                    "browsers/opera.js",
                    "browsers/safari.js",
                    "text_editor_obj_symbols.js"
                ),
                "styles" => array(
                    "style.css",
                    "text_editor_ex.css"
                ),
                "templates" => array(
                    "templates/text_editor.xml",
                    "templates/text_editor_panels.xml",
                    "templates/text_editor_ex.xml"
                )
            ),


            USERTYPE_CONTRIBUTOR => array(
                "code" => array(
                    "text_editor.js",
                    "text_editor_obj.js",
                    "browsers/mozilla.js",
                    "browsers/msie.js",
                    "browsers/opera.js",
                    "browsers/safari.js",
                    "text_editor_obj_symbols.js"
                ),
                "styles" => array(
                    "style.css",
                    "text_editor_ex.css"
                ),
                "templates" => array(
                    "templates/text_editor.xml",
                    "templates/text_editor_panels.xml",
                    "templates/text_editor_ex.xml"
                )
            )
        )

    )


?>