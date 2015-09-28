<?php

$config["js_apps"]["core.apps.baloon_tooltips"] = array(
    'general' => array(
        'title' => 'Baloon tooltips',
        'name' => 'baloon_tooltips',//should be like 3th part of folder
        'version' => '1.0.0',
        'category' => CATEGORY_HIDDEN,
        'description' => ''
    ),
    "content" => array(
        USERTYPE_ADMIN => array(
            "code" => array(
                "baloon_tooltips.js"
            ),
            "templates" => array(
                "templates/baloon_tooltip.xml"
            ),
            "styles" => array(
                "styles.css"
            )
        ),

        USERTYPE_CONTRIBUTOR => array(
            "code" => array(
                "baloon_tooltips.js"
            ),
            "templates" => array(
                "templates/baloon_tooltip.xml"
            ),
            "styles" => array(
                "styles.css"
            )
        )
    )

);