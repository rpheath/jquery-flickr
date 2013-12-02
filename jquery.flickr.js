/*****************************************
 * Flickr API (in jQuery)
 * version: 1.0 (02/23/2009)
 * written for jQuery 1.3.2
 * by Ryan Heath (http://rpheath.com)
 *****************************************/
(function($) {
  // core extensions
  $.extend({
    // determines if an object is empty
    // $.isEmpty({})             // => true
    // $.isEmpty({user: 'rph'})  // => false
    isEmpty: function(obj) {
      for (var i in obj) { return false }
      return true
    }
  })
  
  // base flickr object
  $.flickr = {
    // the actual request url
    // (constructs extra params as they come in)
    url: function(method, params) {
      return 'http://api.flickr.com/services/rest/?method=' + method + '&format=json' +
        '&api_key=' + $.flickr.settings.api_key + ($.isEmpty(params) ? '' : '&' + $.param(params)) + '&jsoncallback=?'
    },
    // translate plugin image sizes to flickr sizes
    translate: function(size) {
      switch(size) {
        case 'sq': return '_s' // square
        case 't' : return '_t' // thumbnail
        case 's' : return '_m' // small
        case 'm' : return ''   // medium
        default  : return ''   // medium
      }
    },
    // determines what to do with the links
    linkTag: function(text, photo, href) {
      if (href === undefined) href = ['http://www.flickr.com/photos', photo.owner, photo.id].join('/')      
      return '<a href="' + href + '" title="' + photo.title + '">' + text + '</a>'
    }
  }
  
  // helper methods for thumbnails
  $.flickr.thumbnail = {
    src: function(photo, id, size) {
      if (size === undefined) size = $.flickr.translate($.flickr.settings.thumbnail_size)
      return 'http://farm' + photo.farm + '.static.flickr.com/' + photo.server + 
        '/' + id + '_' + photo.secret + size + '.jpg'
    },
    imageTag: function(image) {
      return '<img src="' + image.src + '" alt="' + image.alt + '" />'
    }
  }
  
  // accepts a series of photos and constructs
  // the thumbnails that link back to Flickr
  $.flickr.thumbnail.process = function(photos) {
    var thumbnails = $.map(photos, function(photo) {
      var image = new Image(), html = '', href = undefined

      image.src = $.flickr.thumbnail.src(photo, photo.id)
      image.alt = photo.title

      var size = $.flickr.settings.link_to_size
      if (size != undefined && size.match(/sq|t|s|m|o/)) 
        href = $.flickr.thumbnail.src(photo, photo.id, $.flickr.translate(size))
      
      html = $.flickr.linkTag($.flickr.thumbnail.imageTag(image), photo, href)
        
      return ['<li>' + html + '</li>']
    }).join("\n")
    
    return $('<ul class="flickr"></ul>').append(thumbnails)
  }

  $.flickr.thumbnail.processSet = function(photosets, options){
    var list = document.createElement('ul');
    list.className = 'flickr';

    for(var i = 0, len = photosets.length; i < len; i++){
      var photoset = photosets[i];
      console.log(photoset);
      var image = new Image(), html = '', href = undefined;

      var size = $.flickr.settings.link_to_size

      var href = $.flickr.thumbnail.src(photoset, photoset.primary)
      if (size != undefined && size.match(/sq|t|s|m|o/)) 
        href = $.flickr.thumbnail.src(photoset, photoset.primary, $.flickr.translate(size));

      image.src = href;
      image.alt = photoset.title._content;
      image.title = photoset.title._content;

      var a = document.createElement('a');
      a.href = 'http://flickr.com/photos/'+options.user_id+'/sets/'+photoset.id;
      a.appendChild(image);

      var li = document.createElement('li');
      li.appendChild(a);

      list.appendChild(li);
    }

    return $(list);
  }

  //Handles the JSON request
  $.flickr.request = function(method, options, callback) {
    var options = $.extend($.flickr.settings, options || {}),
        elements = $.flickr.self, photos
    
    return elements.each(function() {
      $.getJSON($.flickr.url(method, options), function(data) {
        callback(data, elements);
      });
    });
  }
  
  // handles requesting and thumbnailing photos
  $.flickr.photos = function(method, options) {
    $.flickr.request(method, options, function(data, elements){
        photos = (data.photos === undefined ? data.photoset : data.photos)
        elements.append($.flickr.thumbnail.process(photos.photo))
    });
  }

  $.flickr.photosets = function(method, options) {
    $.flickr.request(method, options, function(data, elements){
        if(data.stat !== 'ok')
          return false;
        photosets = data.photosets;
        //elements.append($.flickr.thumbnail.process(photosets.photoset))
        elements.append($.flickr.thumbnail.processSet(photosets.photoset, options));
    });
  }
  
  // namespace to hold available API methods
  // note: options available to each method match that of Flickr's docs
  $.flickr.methods = {
    // http://www.flickr.com/services/api/flickr.photos.getRecent.html
    photosGetRecent: function(options) {
      $.flickr.photos('flickr.photos.getRecent', options)
    },
    // http://www.flickr.com/services/api/flickr.photos.getContactsPublicPhotos.html
    photosGetContactsPublicPhotos: function(options) {
      $.flickr.photos('flickr.photos.getContactsPublicPhotos', options)
    },
    // http://www.flickr.com/services/api/flickr.photos.search.html
    photosSearch: function(options) {
      $.flickr.photos('flickr.photos.search', options)
    },
    // http://www.flickr.com/services/api/flickr.photosets.getPhotos.html
    photosetsGetPhotos: function(options) {
      $.flickr.photos('flickr.photosets.getPhotos', options)
    },
    photosetsGetList: function(options) {
      $.flickr.photosets('flickr.photosets.getList', options) 
    }
  }
  
  // the plugin
  $.fn.flickr = function(options) {
    $.flickr.self = $(this)
    
    // base configuration
    $.flickr.settings = $.extend({
      api_key: 'YOUR API KEY',
      thumbnail_size: 'sq'
    }, options || {})
    
    return $.flickr.methods
  }
})(jQuery);