<?php

ini_set('upload_max_filesize', $config["site"]["filesystem_quote"]);

//    header("Cache-Control: no-cache");

class dialog_controller_files_upload extends dialog_controller
{

    public $appAPIs = [
        'image_editor/images'
    ];

    public $APIs = [
        "filesystem"
    ];


    function run()
    {
        global $config;
        parent::run();

        if($_REQUEST['act']=='upload_by_url'){
            $this->upload_by_url();
            return false;
        }
        try {

            if (!$this->canEdit()) {
                throw new Exception("Access denied");
            }

            if ((!$_FILES["Filedata"] || $_FILES["Filedata"]["error"]) && !isset($_REQUEST["file_name"])) {
                throw new Exception("Empty file");
            }

            $this->site_info = $this->sites->getSiteInfo();
            $dir = $config["storage"] . "/";

            $file_name = basename($this->getFileName());
            if (empty($file_name)) {
                sysEmail("dangerous file upload attempt",
                    "Filename: " . $this->initial_file_name . "\n"
                );
                throw new Exception("Wrong file name");

            }
            $file_path = $dir . basename($this->getFileName());

            if (file_exists($file_path)) {
                if (@unlink($file_path) === false) {
                    throw new Exception("Can't overwrite existing file");
                }
            }

            if (!$this->saveFile($file_path)) {
                return array("status" => "error", "info" => "Target folder not exists");
                throw new Exception("Site files folder not exists");
            }
            @chmod($file_path, $config["unix_file_mode"]);
            @touch($file_path);


            $this->sys_log->add("FILE_UPLOADED", $file_name .' => '.$this->sid);
            @$this->images->removeThumb($file_name);

            if ($_REQUEST["iframe_upload"] == 1) {
                $this->outputJS();
            } else {
                return array("status" => "uploaded", "info" => "File uploaded");
            }
        } catch (Exception $e) {
            if ($_REQUEST["iframe_upload"] == 1) {
                $this->outputJS($e->getMessage());
            } else {
                return array("status" => "error", "info" => $e->getMessage());
            }
        }
    }


    function outputJS($error = "")
    {
        die("<script type='text/javascript'>window.parent.desktop.files_uploader.upload_input_end('" . addslashes($error) . "');</script>");
    }


    function getFileSize()
    {
        if ($_FILES["Filedata"]) {
            return $_FILES["Filedata"]["size"];
        } else {
            return (int)$_SERVER["CONTENT_LENGTH"];
        }
    }


    function getFileName()
    {
        if ($_FILES["Filedata"]) {
            $res = $_FILES["Filedata"]["name"];
        } else {
            $res = $_REQUEST["file_name"];
        }
        $this->initial_file_name = $res;
        return $this->filesystem->cleanFilename($res);
    }


    function saveFile($file_path)
    {
        if ($_FILES["Filedata"]) {
            return move_uploaded_file($_FILES["Filedata"]["tmp_name"], $file_path);
        } else {
            $src = fopen("php://input", "r");
            $dst = fopen($file_path, "w");
            $size = stream_copy_to_stream($src, $dst);
            fclose($src);
            fclose($dst);
            return $size == $this->getFileSize();
        }
    }


    function canEdit()
    {
        if ($this->usertype >= USERTYPE_ADMIN) {
            return true;
        } else if ($this->usertype == USERTYPE_CONTRIBUTOR) {
            $p = $this->contributors->getData();
            if ($p["manage_files"]) return true;
        }
        return false;
    }


    //upload by url controller

    var $buffer_size = 8192;
    var $transfer_initialized = false;

    function upload_by_url()
    {
        global $config;
        ob_end_clean();

        if (!$this->canEdit()) {
            $this->dieJS("Access denied");
        }

        $ch = curl_init($_REQUEST["url"]);
        curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:19.0) Gecko/20100101 Firefox/19.0");
//            curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 30);
        curl_setopt($ch, CURLOPT_BUFFERSIZE, $this->buffer_size);
        curl_setopt($ch, CURLOPT_HEADERFUNCTION, array(&$this, "curlHeader"));
        curl_setopt($ch, CURLOPT_WRITEFUNCTION, array(&$this, "curlWrite"));
        curl_exec($ch);

        fclose($this->dst_fp);

        if (curl_errno($ch)) {
            $this->dieJS("Curl error: " . curl_error($ch));
        }
        @chmod($this->dst_file_path, $config["unix_file_mode"]);
        @touch($this->dst_file_path);

        $this->dieJS();
    }


    function curlHeader($ch, $header)
    {
        $len = strlen($header);
        if (strpos($header, "HTTP/") !== false) {
            $tmp = explode(" ", trim($header));
            $http = array_shift($tmp);
            $http_code = (int)array_shift($tmp);
            if ($http_code != 200) {
                $this->dieJS(implode(" ", $tmp));
            }
        } else if (strpos($header, "Content-Length:") !== false) {
            $tmp = explode(":", $header);
            $this->src_file_size = (int)$tmp[1];
        }
        return $len;
    }


    function curlWrite($ch, $buf)
    {
        $this->initTransfer();
        fwrite($this->dst_fp, $buf);
        $len = strlen($buf);
        $this->loaded += $len;

        echo
            "<script type='text/javascript'>window.parent.desktop.files_uploader.upload_url_progress({" .
            "total:" . $this->src_file_size . ",loaded:" . $this->loaded . "});</script>";
        flush();

        return $len;
    }


    function dieJS($error = "")
    {
        die("<script type='text/javascript'>window.parent.desktop.files_uploader.upload_url_end('" . addslashes($error) . "');</script>");
    }


    function initTransfer()
    {
        global $config;

        if ($this->transfer_initialized) return;
        $this->transfer_initialized = true;

        if (!$this->src_file_size) {
            $this->dieJS("Incorrect file size");
        }

        $this->site_info = $this->sites->getSiteInfo();

        $dir = $config["storage"] . "/";

        $p = parse_url($_REQUEST["url"]);
        $this->dst_file_name = $p["path"] ? $p["path"] : $p["host"];
        $this->dst_file_name = basename($this->dst_file_name);
        $this->dst_file_name = $this->filesystem->cleanFilename($this->dst_file_name);

        if (empty($this->dst_file_name)) {
            sysEmail("dangerous file upload attempt",
                "Filename: " . $p["path"] . "\n"
            );
            $this->dieJS("Error");
        }

        $this->dst_file_path = $dir . $this->dst_file_name;

        if (file_exists($this->dst_file_path)) {
            if (@unlink($this->dst_file_path) === false) {
                $this->dieJS("Can't overwrite existing file");
            }
        }

        $this->dst_fp = @fopen($this->dst_file_path, "w");
        $this->loaded = 0;
    }
}