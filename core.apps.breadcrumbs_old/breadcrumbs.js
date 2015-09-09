core.apps.breadcrumbs_old = function(args) {

    if(core.data["page_file"] == "index" && core.data["page_id"] == "") return;

    var home_page_mi = {
        url: "index",
        title: "Home",
        type: "std"
    };
    

    function findItem(url, node) {
        if(!node) node = core.data.main_menu;
        for(var i=0; i<node.length; i++) {
            if(node[i].url == url || findItem(url, node[i].childs)) {
                path.unshift(
                    { title: node[i].title,
                      url: node[i].url,
                      type: node[i].type,
                      blank_page: "0" }
                );
                return true;
            }
        }
        return false;
    }


    function formatLink(mi) {
        var url = mi.url;
        if(mi.type == "std" || mi.type == "doc") {
            url = "/"  + url + ".html";
        } else if(mi.type != "external") {
            url = "/" + url;
        }
        return "<a href='" + url + "'>" + mi.title + "</a>"
    }

    var path = [];
    var links = [];


    if(findItem(core.data.page_file)) {
        if(path[0].url != "index") {
            path.unshift(home_page_mi);
        } else {
            path[0].title = "Home";
        }
        for(var i=0; i<path.length-1; i++) {
            links.push(formatLink(path[i]));
        }
        links.push("<span>" + path[i++].title + "</span>");
    } else {
        links.push(formatLink(home_page_mi));
        links.push("<span>" + core.data.page_title + "</span>");
    }

    args.parentElement.innerHTML = links.join(" :: ");
    args.parentElement.childNodes[0].className += " first_item";

};
core.apps.breadcrumbs_old.extendPrototype(core.components.html_component);