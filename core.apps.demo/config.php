<?php

$config['js_apps']['core.apps.demo'] = array(

    'general' => array(3
        'title' => 'Demo',
        'name' => 'demo',//should be like 3th part of folder
        'version' => '1.0.0',
        'icon' => 'icon.png',
        'category' => CATEGORY_TABS_SLIDES,
        'description' => ''
       
    ),

    'content' => array(
        USERTYPE_ADMIN => array(
            'code' => array(
                'accordion.js',
                'accordion.admin.js'
            )
        ),

        USERTYPE_CONTRIBUTOR => array(
            'code' => array('accordion.js')
        ),

        USERTYPE_GUEST => array(
            'code' => array('accordion.js')
        )
    )
);