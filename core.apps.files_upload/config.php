<?

    $config["js_apps"]["core.apps.files_upload"] = array(

        "content" => array(
            USERTYPE_ADMIN => array(
                "code" => array(
                    "files_upload.js"
                ),
                "styles" => array("style.css"),
                "templates" => array("templates/upload_content.xml")
            ),


            USERTYPE_CONTRIBUTOR => array(
                "code" => array(
                    "files_upload.js"
                ),
                "styles" => array("style.css"),
                "templates" => array("templates/upload_content.xml")
            )

        )

    )


?>