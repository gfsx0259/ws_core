<?

    $config["js_apps"]["core.apps.files_manager"] = array(

        "content" => array(
            USERTYPE_ADMIN => array(
                "code" => array("files_manager.js"),
                "templates" => array(
                    "templates/files_manager.xml",
                    "templates/files_manager_bulk_edit.xml",
                 ),
                "styles" => array("styles.css")
            ),

            USERTYPE_CONTRIBUTOR => array(
                "code" => array("files_manager.js"),
                "templates" => array(
                    "templates/files_manager.xml",
                    "templates/files_manager_bulk_edit.xml",
                 ),
                "styles" => array("styles.css")
            )
        )

    )

?>