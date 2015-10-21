<?php

class api_apps{

    public $table = 'toolbar_apps';
    //it allow to add ability to scan custom vendor directories later
    public $vendorsList = [
        'generdyn'
    ];
    public $maxDepth = 4;

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

    function getData(){
        return [
            'categories' => $this->getCategoriesList(),
            'list' => $this->getDataFromConfig()
        ];
    }

    function getDataFromConfig(){
        global $config;
        foreach($config['packages'] as $packageName => &$package){
            foreach($package as $appName => &$app){
                list($name,$category) = explode('/',$app);
                $config['packages'][$packageName][$appName] = [
                    'name'=>$name,
                    'category'=>$category
                ];
            }
        }
        return $config['packages'];
    }


    function getInstalledAppsData()
    {
        $sql = "SELECT * FROM {$this->table}";
        $result = $this->db->get_list($sql);
        varp($result);
        return "test";
    }

    function getAllowedAppsData(){
        $structure = $this->getAppsByVendors();
        varp($structure);
    }

    function getAppsByVendors(){
        $data = [];
        foreach($this->vendorsList as $vendorName){
            $data[$vendorName] = $this->fillArrayWithFileNodes(new DirectoryIterator(realpath('vendor/'.$vendorName)));
        }
        return $data;
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

    function test(){

        $path = realpath('vendor');
        $directory = new \RecursiveDirectoryIterator($path, \FilesystemIterator::FOLLOW_SYMLINKS);
        $filter = new \RecursiveCallbackFilterIterator($directory, function ($current, $key, $iterator) {
            // Skip hidden files and directories.
            $ignoredDirectories = ['.git','composer'];
            if ($current->getFilename() === '.') {
                return FALSE;
            }
            if ($current->isDir()) {
                foreach($ignoredDirectories as $item){
                    $fn = $current->getFileName();
                    if(strpos($fn,$item)>0){
                        return false;
                        continue;
                    }
                }
                // Only recurse into intended subdirectories.
                return true;
            }
          return false;
        });
        $iterator = new \RecursiveIteratorIterator($filter);
        $files = array();
        foreach ($iterator as $info) {
            $files[] = $info->getPathname();
        }
        varp($files);
    }



    function glob_recursive($pattern, $flags = 0){

        $files = glob($pattern, $flags);
        foreach (glob(dirname($pattern).'/*', GLOB_ONLYDIR|GLOB_NOSORT) as $dir) {
            $files = array_merge($files, $this->glob_recursive($dir.'/'.basename($pattern), $flags));
        }
        return $files;
    }

}