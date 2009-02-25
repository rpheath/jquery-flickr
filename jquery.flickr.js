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
  
  $.flickr = {
    // Flickr API is now optional (uses feeds alternatively)
    // see http://www.flickr.com/services/feeds/ for details
    api: true
  }
  
  // the actual request url
  // (constructs extra params as they come in)
  $.flickr.url = function(method, params) {
    var base = 'http://api.flickr.com/services', service_type, query
        
    if (!$.flickr.api && method.match(/\.gne$/)) {
      service_type = '/feeds/'
      query = method + '?'
    } else {
      service_type = '/rest/'
      query = '?' + method + '&api_key=' + $.flickr.settings.api_key + '&'
    }
    
    return [base, service_type, query].join('') + 'format=json' + 
      ($.isEmpty(params) ? '' : '&' + $.param(params)) + '&jsoncallback=?'
  }
  
  // translate plugin image sizes to flickr sizes
  $.flickr.translate = function(size) {
    switch(size) {
      case 'sq': return '_s' // square
      case 't' : return '_t' // thumbnail
      case 's' : return '_m' // small
      case 'm' : return ''   // medium
      default  : return ''   // medium
    }
  }
  
  // determines what to do with the links
  $.flickr.linkTag = function(text, photo, href) {
    if (!$.flickr.api && photo.link) href = photo.link
    
    if (href === undefined) href = ['http://www.flickr.com/photos', photo.owner, photo.id].join('/')      
    return '<a href="' + href + '" title="' + photo.title + '">' + text + '</a>'
  }
  
  // helper methods for thumbnails
  $.flickr.thumbnail = {
    src: function(photo, size) {
      if (!$.flickr.api) return photo.media.m.replace(/_m/, '_s')
      
      if (size === undefined) size = $.flickr.translate($.flickr.settings.thumbnail_size)
      return 'http://farm' + photo.farm + '.static.flickr.com/' + photo.server + 
        '/' + photo.id + '_' + photo.secret + size + '.jpg'
    },
    imageTag: function(image) {
      return '<img src="' + image.src + '" alt="' + image.alt + '" />'
    }
  }
  
  // accepts a series of photos and constructs
  // the thumbnails that link back to Flickr
  $.flickr.thumbnail.process = function(photos) {
    photos = $.flickr.api ? photos.photo : photos.items
    
    var thumbnails = $.map(photos, function(photo) {
      var image = new Image(), html = '', href = undefined

      image.src = $.flickr.thumbnail.src(photo)
      image.alt = photo.title

      var size = $.flickr.settings.link_to_size
      if (size != undefined && size.match(/sq|t|s|m|o/)) 
        href = $.flickr.thumbnail.src(photo, $.flickr.translate(size))
      
      html = $.flickr.linkTag($.flickr.thumbnail.imageTag(image), photo, href)
        
      return ['<li>' + html + '</li>']
    }).join("\n")
    
    return $('<ul class="flickr"></ul>').append(thumbnails)
  }
  
  // determines which method to use
  $.flickr.which = function(api_call, feed_request) {
    return $.flickr.api ? api_call : feed_request
  }
  
  // handles requesting and thumbnailing photos
  $.flickr.photos = function(method, options) {
    var options = $.extend($.flickr.settings, options || {}),
        elements = $.flickr.self, photos
    
    return elements.each(function() {
      $.getJSON($.flickr.url(method, options), function(data) {
        photos = $.flickr.api ? (data.photos === undefined ? data.photoset : data.photos) : data
        elements.append($.flickr.thumbnail.process(photos))
      })
    })
  }
  
  // namespace to hold available API methods
  // note: options available to each method match that of Flickr's docs
  $.flickr.methods = {
    // http://www.flickr.com/services/api/flickr.photos.getRecent.html
    // - or -
    // http://www.flickr.com/services/feeds/docs/photos_public/
    photosGetRecent: function(options) {
      $.flickr.photos($.flickr.which('flickr.photos.getRecent', 'photos_public.gne'), options)
    },
    // http://www.flickr.com/services/api/flickr.photos.getContactsPublicPhotos.html
    photosGetContactsPublicPhotos: function(options) {
      $.flickr.photos('flickr.photos.getContactsPublicPhotos', options)
    },
    // http://www.flickr.com/services/api/flickr.photos.search.html
    // - or -
    // http://www.flickr.com/services/feeds/docs/photos_public/
    photosSearch: function(options) {
      $.flickr.photos($.flickr.which('flickr.photos.search', 'photos_public.gne'), options)
    },
    // http://www.flickr.com/services/api/flickr.photosets.getPhotos.html
    photosetsGetPhotos: function(options) {
      $.flickr.photos($.flickr.which('flickr.photosets.getPhotos', 'photoset.gne'), options)
    }
  }
  
  // the plugin
  $.fn.flickr = function(options) {
    $.flickr.self = $(this)
    
    // base configuration
    $.flickr.settings = $.extend({
      //api_key: 'YOUR API KEY',
      thumbnail_size: 'sq'
    }, options || {})
    
    if ($.flickr.settings.api_key === undefined) $.flickr.api = false
    
    return $.flickr.methods
  }
})(jQuery);