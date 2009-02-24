/*****************************************
 * Flickr API (in jQuery)
 * version: 1.0 (02/23/2009)
 * written for jQuery 1.3.2 or later
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
  
  $.fn.flickr = function(options) {
    // base flickr object
    $.flickr = {
      self: $(this),
      url: function(method, params) {
        return 'http://api.flickr.com/services/rest/?method=' + method + '&format=json' +
          '&api_key=' + $.flickr.settings.api_key + ($.isEmpty(params) ? '' : '&' + $.param(params)) + '&jsoncallback=?'
      },
      thumbnail: function(photos) {
        return $.map(photos.photo, function(photo) {
          var src = 'http://farm' + photo.farm + '.static.flickr.com/' + photo.server + '/' + photo.id + '_' + photo.secret + '_s.jpg',
              image = new Image()

          image.src = src
          image.alt = photo.title
          
          return ['<img src="' + image.src + '" alt="' + image.alt + '" />']
        }).join(" ")
      }
    }
    
    // base configuration
    $.flickr.settings = $.extend({
      api_key: 'YOUR API KEY',
      user_id: 'YOUR USER ID'
    }, options || {})
    
    // namespace to hold available API methods
    $.flickr.methods = {
      // http://www.flickr.com/services/api/flickr.photos.getRecent.html
      photosGetRecent: function(options) {
        var options = $.extend({}, options || {})
        
        return $.flickr.self.each(function() {
          $.getJSON($.flickr.url('flickr.photos.getRecent', options), function(data) {
            $.flickr.self.html($.flickr.thumbnail(data.photos))
          })
        })
      }
    }
    
    return $.flickr.methods
  }
})(jQuery);