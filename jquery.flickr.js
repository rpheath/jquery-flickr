/*****************************************
 * Flickr API (in jQuery)
 * version: 1.0 (02/23/2009)
 * written for jQuery 1.3.2
 * by Ryan Heath (http://rpheath.com)
 *****************************************/
(($) => {
  // core extensions
  $.extend({
    // determines if an object is empty
    // $.isEmpty({})             // => true
    // $.isEmpty({user: 'rph'})  // => false
    isEmpty: (obj) => {
      return Object.keys(obj).length == 0
    }
  })
  
  // base flickr object
  $.flickr = {
    // the actual request url
    // (constructs extra params as they come in)
    url: (method, params) => {
      let api_key = $.flickr.settings.api_key;
      return `http://api.flickr.com/services/rest/?method=${method}&format=json&api_key=${api_key}${($.isEmpty(params) ? '' : '&' + $.param(params))}&jsoncallback=?`
    },
    // translate plugin image sizes to flickr sizes
    translate: (size) => {
      switch(size) {
        case 'sq': return '_s' // square
        case 't' : return '_t' // thumbnail
        case 's' : return '_m' // small
        case 'm' : return ''   // medium
        default  : return ''   // medium
      }
    },
    // determines what to do with the links
    linkTag: (text, photo, href) => {
      if (href === undefined) href = `http://www.flickr.com/photos/${photo.owner}/${photo.id}`
      return `<a href="${href}" title="${photo.title}">${text}</a>`
    }
  }
  
  // helper methods for thumbnails
  $.flickr.thumbnail = {
    src: (photo, size) => {
      if (size === undefined) size = $.flickr.translate($.flickr.settings.thumbnail_size)
      return `http://farm${photo.farm}.static.flickr.com/${photo.server}/${photo.id}_${photo.secret}${size}.jpg`
    },
    imageTag: function(image) {
      return `<img src="${image.src}" alt="${image.alt}" />`
    }
  }
  
  // accepts a series of photos and constructs
  // the thumbnails that link back to Flickr
  $.flickr.thumbnail.process = (photos) => {
    let thumbnails = $.map(photos.photo, (photo) => {
      let image = new Image(), html = '', href = undefined

      image.src = $.flickr.thumbnail.src(photo)
      image.alt = photo.title

      let size = $.flickr.settings.link_to_size
      if (size != undefined && size.match(/sq|t|s|m|o/)) 
        href = $.flickr.thumbnail.src(photo, $.flickr.translate(size))
      
      html = $.flickr.linkTag($.flickr.thumbnail.imageTag(image), photo, href)
        
      return [`<li>${html}</li>`]
    }).join("\n")
    
    return $('<ul class="flickr"></ul>').append(thumbnails)
  }
  
  // handles requesting and thumbnailing photos
  $.flickr.photos = (method, options) => {
    let options = $.extend($.flickr.settings, options || {}),
        elements = $.flickr.self, photos
    
    return elements.each(() => {
      $.getJSON($.flickr.url(method, options), (data) => {
        photos = (data.photos === undefined ? data.photoset : data.photos)
        elements.append($.flickr.thumbnail.process(photos))
      })
    })
  }
  
  // namespace to hold available API methods
  // note: options available to each method match that of Flickr's docs
  $.flickr.methods = {
    // http://www.flickr.com/services/api/flickr.photos.getRecent.html
    photosGetRecent: (options) => {
      $.flickr.photos('flickr.photos.getRecent', options)
    },
    // http://www.flickr.com/services/api/flickr.photos.getContactsPublicPhotos.html
    photosGetContactsPublicPhotos: (options) => {
      $.flickr.photos('flickr.photos.getContactsPublicPhotos', options)
    },
    // http://www.flickr.com/services/api/flickr.photos.search.html
    photosSearch: (options) => {
      $.flickr.photos('flickr.photos.search', options)
    },
    // http://www.flickr.com/services/api/flickr.photosets.getPhotos.html
    photosetsGetPhotos: (options) => {
      $.flickr.photos('flickr.photosets.getPhotos', options)
    }
  }
  
  // the plugin
  $.fn.flickr = (options) => {
    $.flickr.self = $(this)
    
    // base configuration
    $.flickr.settings = $.extend({
      api_key: 'YOUR API KEY',
      thumbnail_size: 'sq'
    }, options || {})
    
    return $.flickr.methods
  }
})(jQuery);