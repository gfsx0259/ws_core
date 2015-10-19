<?php

class api_bootstrap{

    public $table = 'bs_themes';

    function get_list(){
        global $config;
        $data = [];
        $sql = "SELECT * FROM {$this->table}";
        $data['themes'] = $this->db->get_key_list($sql,null,'path');
        //check for existing
        foreach($data['themes'] as $key => &$item){
            $item['is_mark_to_delete']= 0;
            $item['status']= 0;
            if($this->is_file_exists($key)){
                $item['status']= 1;
            }
        }
        $data['files'] =  $this->glob_recursive($config["storage"]."*.css");
        foreach($data['files'] as &$file){
            if(strpos($file,$config["storage"])==0){
                $file = substr($file,strlen($config['storage']));
            }
        }
        return $data;
    }


    function glob_recursive($pattern, $flags = 0){
        $files = glob($pattern, $flags);
        foreach (glob(dirname($pattern).'/*', GLOB_ONLYDIR|GLOB_NOSORT) as $dir) {
            $files = array_merge($files, $this->glob_recursive($dir.'/'.basename($pattern), $flags));
        }
        return $files;
    }

    function save($data){
        foreach($data as $item){
            if($row = $this->is_exist($item->path)){
                if($item->theme_id && $item->is_mark_to_delete){
                    $sql = "DELETE FROM {$this->table} WHERE theme_id = %theme_id%";
                    $this->db->query($sql,$item->theme_id);
                    //if($item->is_default){
                       // $sql = "UPDATE {$this->table} SET is_default = 0";
                        //$this->db->query($sql);
                    //}
                }else{
                    if($item->is_default != $row['is_default']){
                        $sql = "UPDATE {$this->table} SET is_default = %is_default% WHERE theme_id = %id%";
                        $this->db->query($sql,['is_default'=>$item->is_default,'id'=>$row['theme_id']]);
                    }
                }
            }else{
                $sql = "INSERT INTO {$this->table} (`path`, `is_default`) VALUES (%path%,%is_default%)";
                $this->db->query($sql,['is_default'=>(int)$item->is_default,'path'=>$item->path]);
            }
        }
    }

    function is_exist($path){
        $sql = "SELECT * FROM {$this->table} WHERE path = %path%";
        $result = $this->db->get_row($sql,$path);
        if(is_array($result)){
            return $result;
        }
        return false;
    }

    function is_file_exists($path){
        global $config;
        if(file_exists($config['storage'].$path)){
            return $config['storage'].$path;
        }
        return false;
    }

    function getCurrentBSTheme(){
        $sql = "SELECT path FROM {$this->table} WHERE is_default = 1";
        $path = $this->db->get_one($sql);
        if(!$path){
            return false;
        }elseif($path = $this->is_file_exists($path)){
            return '/'.$path;
        }
        return false;
    }

}