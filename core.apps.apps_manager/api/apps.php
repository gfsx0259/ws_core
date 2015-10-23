<?php

class api_apps{

    public $table = 'toolbar_apps';
    //it allow to add ability to scan custom vendor directories later
    public $vendorsList = [
        'generdyn'
    ];

    public $maxDepth = 4;
    public $composerAppsPackages = [];
    public $customVendorsList = [];

     function getCategoriesList(){
         return [
             ['text' => 'Basic', 'value' => CATEGORY_BASIC],
             ['text' => 'Media', 'value' => CATEGORY_MEDIA],
             ['text' => 'Advanced', 'value' => CATEGORY_ADVANCED],
             ['text' => 'E-commerce', 'value' => CATEGORY_ECOMMERCE],
             ['text' => 'Hidden', 'value' => CATEGORY_HIDDEN],
             ['text' => 'Basic', 'value' => CATEGORY_BASIC],
             ['text' => 'Dates', 'value' => CATEGORY_DATES],
             ['text' => 'Social', 'value' => CATEGORY_SOCIAL],
             ['text' => 'Maps', 'value' => CATEGORY_MAPS],
             ['text' => 'Slides', 'value' => CATEGORY_TABS_SLIDES],
             ['text' => 'Navigate', 'value' => CATEGORY_NAVIGATE]
         ];
     }

    function setComposerAppsPackages(){
        $this->setCustomVendors();
        $composerConfig = json_decode(file_get_contents('composer.json'));
        $requiredList = array_keys(get_object_vars($composerConfig->require));
        foreach($requiredList as $item){
            //add custom here
            $vendorNames = array_merge($this->vendorsList,$this->customVendorsList);
            foreach($vendorNames as $vendorName){
                if(strpos($item,$vendorName)!=-1){
                    list($vendor,$packageName) = explode('/',$item);
                    if(!empty($packageName) && !in_array($packageName,$this->composerAppsPackages[$vendor])){
                        $this->composerAppsPackages[$vendor][] = $packageName;
                    }
                }
            }
        }
    }

    function setCustomVendors(){
        //TODO get it from interface (maybe widget profile)
        $this->customVendorsList[] = 'xenium';
    }

    function getData(){
        $this->setComposerAppsPackages();
        return [
            'categories' => $this->getCategoriesList(),
            'list' => $this->getDataFromConfig()
        ];
    }

    function getDataFromConfig(){
        global $config;
        $installedData = $this->getInstalledAppsData();
        $appsData = [];
        foreach($config['apps_manager_data'] as $vendorName => &$vendor){
            foreach($vendor as $packageName => &$package){
                foreach($package as &$app){
                    list($name,$category) = explode('/',$app);
                    if(!$name || !$category){
                        continue;
                    }
                    $item = [
                        'name'=>$name,
                        'category'=>$category,
                        'title'=> ucfirst(str_replace('_',' ',$name)),
                        'vendorName' => $vendorName,
                        'packageName' => $packageName,
                        'packageAvailable' => in_array($packageName,$this->composerAppsPackages[$vendorName]) ? 1 : 0,
                        'configData' => $this->getAppConfig($vendorName,$packageName,$name),
                        'installedData' => isset($installedData[$name]) ? $installedData[$name] : false
                    ];

                    if($item['installedData']['version'] && $item['configData']['version']){
                        //if first greater that second
                        if(version_compare($item['configData']['version'],$item['installedData']['version'])==1){
                            $item['isUpdateAllowed'] = true;
                        }else{
                            $item['isUpdateAllowed'] = false;
                        }
                    }
                    $appsData[$name] = $item;
                }
            }
        }

        return $appsData;
    }

    function getAppConfig($vendorName,$packageName,$appName)
    {
        $config = [];
        $fullAppName = 'core.apps.' . $appName;
        $fullPath = $this->getAppPath($vendorName,$packageName,$fullAppName);
        if(!file_exists($fullPath . '/config.php')){
            return false;
        }else{
            include $fullPath . '/config.php';
        }
        return $config['js_apps'][$fullAppName]['general'];
    }

    function getAppPath($vendorName,$packageName,$appName){
        return 'vendor/'.$vendorName.'/'.$packageName.'/'.$appName;
    }

    function getInstalledAppsData()
    {
        $sql = "SELECT * FROM {$this->table}";
        $result = $this->db->get_key_list($sql,null,'name');

        return $result;
    }


    function fillArrayWithFileNodes(DirectoryIterator $dir ,$depth=0)
    {
        $depth++;
        $data = array();
        foreach ($dir as $node) {
            if(in_array($node->getFilename(),array('composer','.git','autoload.php','composer.json')) || ($depth>$this->maxDepth && $node->isDir())){
                continue;
            }
            if($node->isDir() && !$node->isDot()){
                $data[$node->getFilename()] = $this->fillArrayWithFileNodes(new DirectoryIterator($node->getPathname()),$depth );
            }elseif ($node->isFile()){
                 $data[] = $node->getFilename();
            }
        }
        return $data;
    }
}