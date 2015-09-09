<?

class api_layout_modes
{


    // $args: {  version_id: int }
    function clearMobileData($args)
    {
        $sql = "
                UPDATE
                    site_versions
                SET
                    mobile_theme_id=pc_theme_id,
                    mobile_colors=pc_colors,
                    mobile_fonts=pc_fonts
                WHERE
                    id = %version_id%
                LIMIT 1";

        $this->db->query($sql, $args);


        $sql = "
                UPDATE
                    layout_rows
                SET
                    mobile_data = '',
                    mobile_style_id=1,
                    mobile_used_apps='',
                    mobile_used_submenus='',
                    mobile_used_images='',
                    mobile_used_styles='',
                    mobile_search_index_ready=0,
                    mobile_search_index=''
                WHERE
                    version_id = %version_id% ";
        $this->db->query($sql, $args);

        $sql = "
                DELETE FROM
                    layout_rows2texts
                WHERE
                    version_id = %version_id% AND
                    layout_mode = 'mobile'";
        $this->db->query($sql, $args);

        $sql = "
                UPDATE
                    pages
                SET
                    mobile_style_id = pc_style_id
                WHERE
                    version_id = %version_id%";
        $this->db->query($sql, $args);
    }


}

?>