<?php

class dialog_controller_files_manager extends dialog_controller
{


    public $widgetName = 'files_manager';
    public $appAPIs = [
        'filesmanager_search',
        "image_editor/images"
    ];

    var $APIs = array(
        "filesystem",
        "short_links",
        "files_dropbox",
        "sites",
        'memcache'
    );


    var $dirUnixMode = 0770;


    function run()
    {
        parent::run();

        global $config;

        switch ($_REQUEST["act"]) {
            case "get_file_info":
                $fname = $this->getUserDir() . $this->getParam("fname");
                if (file_exists($fname)) {
                    return array(
                        "status" => "info",
                        "name" => basename($fname),
                        "size" => filesize($fname),
                        "time" => fileatime($fname),
                        "size_string" => $this->getImgSize($fname, true));
                } else {
                    return array("status" => "error");
                }
                break;


            case "get_image_data":
                $file = $this->getParam("file");
                $fname = $this->getUserDir() . $file;
                if (file_exists($fname) && ($size = getimagesize($fname))) {
                    return array(
                        "file" => $file,
                        "width" => $size[0],
                        "height" => $size[1]
                    );
                }
                break;


            case "get_files":
                if (!$this->canEdit()) return false;
                $res = array(
                    "status" => "files",
                    "data" => $this->readUserFolder($_REQUEST['force'])
                );
                if ($_REQUEST["user_search"] == 1) {
                    $res["user_search"] = $this->filesmanager_search->getAllData();
                }
                return $res;
                break;


// Files
            case "rename":
                if (!$this->canEdit()) return false;

                $res = array();

                $dir = $this->getUserDir();
                $src = $this->getParam("src");
                $dst = $this->getParam("dst");
                if (empty($dst)) {
                    $this->sendAdminNotify($dst);
                    return;
                }

                $this->images->removeThumb($src);
                $this->images->removeThumb($dst);

                if (file_exists($dir . $dst)) {
                    $res["msg"] = "Can't rename. File <" . $dst . "> already exists.";
                } else {
                    @rename($dir . $src, $dir . $dst);
                    @touch($dir . $dst);
                }

                $res["status"] = "files";
                $res["data"] = $this->readUserFolder();
                $res["select_file_name"] = $dst;


                return $res;
                break;

            case "rethumb":
                if (!$this->canEdit()) return false;

                $files = explode("*", $_REQUEST["files"]);
                foreach ($files as $file) {
                    $file = $this->filesystem->cleanFilename($file, false);
                    $this->images->removeThumb($file);
                }
                return true;
                break;

            case "delete":
                if (!$this->canEdit()) return false;

                $files = explode("*", $_REQUEST["files"]);
                foreach ($files as $file) {
                    $file = $this->filesystem->cleanFilename($file, false);
                    if (empty($file)) {
                        $this->sendAdminNotify($file);
                        continue;
                    }
                    if (file_exists($this->getUserDir() . $file)) {
                        @unlink($this->getUserDir() . $file);
                        //delete thumbs
                        foreach (glob($this->getUserDir() . '*[0-9]x[0-9]*', GLOB_ONLYDIR) as $dir) {
                            if (file_exists($dir . '/' . $file)) {
                                @unlink($dir . '/' . $file);
                            }
                        }

                    }
                }
                return array("status" => "files",
                    "data" => $this->readUserFolder());
                break;

            case "copy_to_server":
                if (!$this->canEdit()) return false;
                $files = explode("*", $_REQUEST["files"]);
                foreach ($files as $file) {
                    $file = $this->filesystem->cleanFilename($file);
                    if (empty($file)) {
                        $this->sendAdminNotify($file);
                        continue;
                    }

                    $dir = $config["storage"] . "/";
                    $file_name = basename($file);
                    $file_path = $dir . $file_name;
                    if (file_exists($file_path)) {
                        if (@unlink($file_path) === false) {
                            return array("status" => "error", "info" => "Can't overwrite existing file");
                        }
                    }
                    $this->files_dropbox->copyFileTo($file, $file_path);
                    @touch($file_path);

                }

                return array("status" => "files",
                    "data" => $this->readUserFolder());
                break;

            case "dropbox_get_filelink":
                $path = $this->getParam("fname");
                $mid = 'dropbox_filelink_' . md5($path);
                $link = $this->memcache->get($mid);
                if (!$link) {
                    $link = $this->files_dropbox->getFileLink($path);
                    $this->memcache->set($mid, $link);
                }

                return array("status" => "dropbox_link",
                    "data" => array(
                        'link' => $link,
                        'id' => $_REQUEST['id']
                    ));
                break;

            case "copy_to_dropbox":
                if (!$this->canEdit()) return false;
                $files = explode("*", $_REQUEST["files"]);
                foreach ($files as $file) {
                    $file = $this->filesystem->cleanFilename($file);

                    $dir = $config["storage"] . "/";
                    $file_name = basename($file);
                    $file_path = $dir . $file_name;
                    $this->files_dropbox->uploadFile($file_path, $file_name);
                }

                return array("status" => "files",
                    "data" => $this->readUserFolder());
                break;

            case "disconnect_dropbox":
                if (!$this->canEdit()) return false;
                $this->files_dropbox->disconnect();
                return array("status" => "files",
                    "data" => $this->readUserFolder());
                break;

            // user search
            case "save_user_search":
                if ($this->usertype < USERTYPE_ADMIN) return;
                $p = array(
                    "folder" => $_POST["folder"],
                    "data" => stripslashes($_POST["data"])
                );
                $this->filesmanager_search->setSectionData($p);
                return false;
                break;


            case "search_images":
                return array(
                    "status" => "search_images_result",
                    "data" => $this->searchImages($_REQUEST["q"])
                );
                break;


            case "send_links":
                if (!$this->canEdit()) return false;

                //send email
                global $config, $host;
                $this->useAPI("mailer");

                $files = explode("*", $_REQUEST["files"]);
                $path = "http://" . $host . "/" . $this->getUserDir();
                for ($i = 0; $i < count($files); $i++) {
                    $file = $this->filesystem->cleanFilename($files[$i]);
                    $href = $path . $file;
                    $files[$i] = "<a href=\"" . $href . "\">" . $file . "</a>";
                }

                $ev = array(
                    "FILES_LINKS_HTML" => implode("<br/>", $files)
                );
                $this->mailer->setValues($ev);
                $this->mailer->setTemplate("files_manager_links");
                $this->mailer->send("donotreply@" . $config["domain"], $_REQUEST["email"]);
                break;


            case "bulk_edit_iteration":
                if (!$this->canEdit()) return false;
                if ($this->bulkEditIteration()) {
                    return array(
                        "status" => "ok"
                    );
                } else {
                    return array(
                        "status" => "error",
                        "message" => $this->bulk_edit_error_str
                    );
                }
                break;
        } // switch
    } // run


    function canEdit()
    {
        //    return true;
        if ($this->usertype >= USERTYPE_ADMIN) {
            return true;
        } else if ($this->usertype == USERTYPE_CONTRIBUTOR) {
            $p = $this->contributors->getData();
            if ($p["manage_files"]) return true;
        }
        return false;
    }


    function getParam($n)
    {
        return isset($_REQUEST[$n]) ? $this->filesystem->cleanFilename($_REQUEST[$n]) : "";
    }


    function getUserDir()
    {
        global $config;
        return $config["storage"] . "/";
    }


    function readUserFolder($force = FALSE)
    {
        $wd = $this->getUserDir();
        if (!is_dir($wd)) {
            mkdir($wd, $this->dirUnixMode);
        }

        $files = array();
        $total_size = 0;

        if ($dh = opendir($wd)) {
            while (false !== ($file = readdir($dh))) {
                $fn = $wd . $file;
                if (($file == ".") || ($file == "..") || is_dir($fn)) continue;

                $size = filesize($fn);
                $total_size += $size;
                if (strpos($file, "____.") === 0) continue; // forms files
                $file = array(
                    "source" => 'ws',
                    "name" => $file,
                    "size" => $size,
                    "time" => fileatime($fn)
                );
                $pi = pathinfo($fn);
                $ext = strtolower($pi["extension"]);
                if ($ext == "png" || $ext == "jpg" || $ext == "gif" || $ext == "bmp") {
                    $file["pic_size"] = $this->getImgSize($fn);
                }
                $files[] = $file;
            }
            closedir($dh);
        }

        $count = count($files);//files in usual folder

        // short links
        $short_links = $this->short_links->getFiles2Codes();
        $fk = array();

        // add link if not exists
        foreach ($files as $file) {
            $fk[$file["name"]] = true;
            if (!$short_links[$file["name"]]) {
                $p = array(
                    "file_name" => $file["name"]
                );
                $short_links[$file["name"]] = $this->short_links->fileAdd($p);
            }
        }

        // remove link if file not found
        foreach ($short_links as $file_name => $code) {
            if (!$fk[$file_name]) {
                $p = array(
                    "file_name" => $file_name
                );
                $this->short_links->fileDelete($p);
                unset($short_links[$file_name]);
            }
        }

        $dropbox['active'] = $this->files_dropbox->isConnected();
        if ($dropbox['active']) {
            //add to memcache
            $mem_id = 'dropbox_files';
            $dfiles = $this->memcache->get($mem_id);
            if (!$dfiles || $force) {
                $dfiles = $this->files_dropbox->getFilesList();
                $this->memcache->set($mem_id, $dfiles);
            }

            foreach ($dfiles as $file) {
                $short_links[$file["path"]] = $file["link"];
            }
            $files = array_merge($files, $dfiles);
            $count += count($dfiles);
        }

        return array(
            "files" => $files,
            "short_links" => $short_links,
            "total_size" => $total_size,
            "dropbox" => $dropbox,
            'count' => $count
        );
    }


    function getImgSize($file, $formatted = false)
    {
        if ($formatted) {
            $size = getimagesize($file);
            return $size ? $size[0] . "x" . $size[1] : "";
        } else {
            return getimagesize($file);
        }
    }


    var $image_extensions = array(
        "png" => true,
        "gif" => true,
        "jpg" => true,
        "jpeg" => true,
        "bmp" => true
    );

    function searchImages($str)
    {
        $str = str_replace("\\", "", $str);
        $str = str_replace("/", "", $str);
        $str = str_replace(";", " ", $str);
        $str = str_replace(",", " ", $str);
        $tmp = explode(" ", $str);

        $keywords = array();
        for ($i = 0; $i < count($tmp); $i++) {
            $keyword = trim($tmp[$i]);
            if (strlen($keyword) < 2) continue;
            $keywords[] = $keyword;
        }

        $files = array();

        if (count($keywords) > 0) {
            $regexp = "/" . implode("|", $keywords) . "/";

            $wd = $this->getUserDir();
            if (!is_dir($wd)) {
                mkdir($wd, $this->dirUnixMode);
            }

            if ($dh = opendir($wd)) {
                while (false !== ($file = readdir($dh))) {
                    if (($file == ".") || ($file == "..") || is_dir($file) || (strpos($file, "____.") === 0)) continue;
                    $pinfo = pathinfo($file);
                    if (!$this->image_extensions[$pinfo["extension"]] || preg_match($regexp, $pinfo["filename"]) == 0) continue;
                    $files[] = $file;
                }
                closedir($dh);
            }
        }
        return $files;
    }


    function bulkEditIteration()
    {
        $this->bulk_edit_error_str = "Server error";

        $dir = $this->getUserDir();
        if (!is_dir($dir)) return false;

        $file = $this->filesystem->cleanFilename($_REQUEST["file"]);
        if (!file_exists($dir . $file)) return true;

        if ($_REQUEST["new_file"]) {
            $new_file = $this->filesystem->cleanFilename($_REQUEST["new_file"]);

            if (empty($new_file) || strpos($new_file, "#") !== false) {
                return false;
            }

            $fi = pathinfo($file);
            $new_file .= "." . $fi["extension"];
            if ($new_file && file_exists($dir . $new_file) && $_REQUEST["overwrite"] != 1) return true;
        }

        if ($_REQUEST["resize_method"]) {
            ini_set("memory_limit", "100M");
            set_time_limit(300);
            include("system/wideimage/WideImage.inc.php");

            $image = wiImage::load($dir . $file);
            if (!$image) {
                $this->bulk_edit_error_str = "Can't open image <b>" . $file . "</b>";
                return false;
            }

            $method = $_REQUEST["resize_method"];
            if ($method != "fill" && $method != "fit" && $method != "stretch" && $method != "pc") {
                $this->bulk_edit_error_str = "Resize method not supported";
                return false;
            }

            if ($method == "pc") {
                $pc = (int)$_REQUEST["resize_pc"];
                if (!$pc || $pc > 100) return false;

                $width = round($image->getWidth() * $pc / 100);
                $height = round($image->getHeight() * $pc / 100);
                $image = $image->resize($width, $height, "stretch");
            } else {
                $width = (int)$_REQUEST["resize_width"];
                $height = (int)$_REQUEST["resize_height"];
                if ($width < 1 || $height < 1) return false;
                $image = $image->resize($width, $height, $method);
            }


            if (!$image) {
                return false;
            }


            if ($new_file) {
                if ($_REQUEST["delete_original"] == 1) {
                    @unlink($dir . $file);
                }

                if (file_exists($dir . $new_file)) {
                    @unlink($dir . $new_file);
                }
                $image->saveToFile($dir . $new_file);
                $image = null;
            } else {
                @unlink($dir . $file);
                $image->saveToFile($dir . $file);
            }
        } else if ($new_file) {
            if ($_REQUEST["delete_original"] == 1) {
                @rename($dir . $file, $dir . $new_file);
            } else {
                @copy($dir . $file, $dir . $new_file);
            }
        }
        return true;
    }


    function sendNotify($file)
    {
        $site_info = $this->sites->getSiteInfo();
        sysEmail("dangerous filename detected",
            "Filename: " . $file . "\n"
        );
    }

}