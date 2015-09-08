core.apps.imagebox = function() {}


core.apps.imagebox.prototype = {


    open: function(images, active_image) {
        if(!active_image) active_image = 0;
        if(!images.length || !images[active_image]) return;
        this.images = images;
        this.active_image = active_image;
        if(!this.$) {
            this.renderBox();
        }
        this.showElements(["imageBoxMainDiv", "overlay"]);
        this.showImage();
    },



    close: function() {
        this.hideElements(["imageBoxMainDiv", "overlay"]);
    },


                 
    renderBox: function() {
        this.buildModel(document.body,
            { tag: "div", 
              id: "overlay",
              className: "desktop_overlay" ,
              style:{zIndex:"100100"},
              events: { onclick: ["close"]}}
        );
        this.buildModel(document.body,
            { tag: "div", 
              id: "imageBoxMainDiv",
              className: "imageBoxMainDiv",
              style:{zIndex:"100101"},
              childs: [
                { tag: "div", id: "topNav", className: "imageBoxTopNav",
                  childs: [
                    { tag: "a", className: "imageBoxNavClose", events: { onclick: ["close"]}}
                  ]},
                { tag: "div", id: "outerImageContainer", className: "outerImageContainer", 
                  childs: [
                    { tag: "div", id: "imageContainer",className: "imageContainer",
                      childs:[
                        { tag: "img", id:"imageBoxImage", className: "imageBoxImage"},
                        { tag: "div", id: "hoverNav", className: "hoverNav",
                          childs:[
                            { tag: "a", id:"prevLink",className: "prevLink",events: { onclick: ["prevImage"]}},
                            { tag: "a", id:"nextLink",className: "nextLink",events: { onclick: ["nextImage"]}}
                          ]},
                        { tag: "div", id: "loading", className: "loading"}
                      ]}
                  ]},
                { tag: "div", id: "imageDataContainer", className: "imageDataContainer",
                  childs:[
                    { tag: "div", id: "imageData", className: "imageData",
                      childs: [
                        { tag: "div", id: "imageDetails", className: "imageDetails",
                          childs: [
                            {tag: "span", id: "caption", className: "caption"},
                            {tag: "span", id: "numberDisplay", className: "numberDisplay"}
                          ]},
                        { tag: "div", id: "bottomNav", className: "bottomNav",
                          childs: [ 
                            { tag: "a", id: "bottomNavClose", className: "imageBoxNavClose", events: { onclick: ["close"]}}
                          ]}
                      ]}
                   ]}
            ]}
        );
    },



    showImage: function(){
        this.showElement("loading");       
        this.img = new Image();
        this.img.onload = this.onImageLoaded.bind(this);
        this.img.src = this.getImageURL(this.images[this.active_image]);
        this.preloadNeighborImages()
    },


    onImageLoaded: function() {
        this.hideElement("loading");
        this.$["imageBoxImage"].src = this.getImageURL(this.images[this.active_image]);
        this.updatePosition(this.img.width, this.img.height);
        this.updateNavigation();
    },

    
    preloadNeighborImages: function(){
        var preloadNextImage, preloadPrevImage;
        if (this.images.length > this.active_image + 1){
            preloadNextImage = new Image();
            preloadNextImage.src = this.getImageURL(this.images[this.active_image + 1]);
        }
        if (this.active_image > 0){
            preloadPrevImage = new Image();
            preloadPrevImage.src = this.getImageURL(this.images[this.active_image - 1]);
        }
    
    },
    nextImage: function() {
        if (this.active_image + 2 > this.images.length ){
            return;
        }
        this.active_image = this.active_image + 1;
        this.showImage();
    },
    prevImage: function() {
        if (this.active_image - 1 <0){
            return;
        }
        this.active_image = this.active_image - 1;
        this.showImage();
    },
    
    setimages: function(images,current){
        if (current == undefined){
            current = 0;
        }
        this.active_image = current;
        this.images = images;
    },


    updateNavigation: function() {
        if(this.active_image >= this.images.length - 1){
            this.hideElement("nextLink");
        } else {
            this.showElement("nextLink");
        }
        if(this.active_image == 0){
            this.hideElement("prevLink");
        } else {
            this.showElement("prevLink");
        }
        if(this.images.length > 1){
            this.$["numberDisplay"].innerHTML = "Image "+ (this.active_image + 1)+" of "+this.images.length;
        }
    },

    updatePosition: function(imgWidth, imgHeight) {
        var widthNew = imgWidth < 800 ? imgWidth + 20 : 820;
        this.$["topNav"].style.width = widthNew+"px";
        this.$["outerImageContainer"].style.width = widthNew+"px";
        this.$["imageDataContainer"].style.width = widthNew+"px";

        var rect = core.browser.getWindowSize();
        var h = Math.min(this.$["imageBoxMainDiv"].offsetHeight, rect.height);
        this.$["imageBoxMainDiv"].style.top = Math.floor(0.5 * (rect.height - h)) + "px";
    },


    getImageURL: function(fname) {
        return fname.indexOf("http://") == -1 ? core.common.getUserFile(fname) : fname;
    }

}

core.apps.imagebox.extendPrototype(core.components.html_component);
core.apps.imagebox.extendPrototype(core.components.popup_app);