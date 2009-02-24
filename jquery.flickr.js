/*****************************************
 * Flickr API (in jQuery)
 * version: 1.0 (02/23/2009)
 * written for jQuery 1.3.1 or later
 *****************************************/
(function($) {
  $.fn.flickr = function(options) {
    $.flickr = {
      self: $(this)
    }
    
    $.flickr.settings = $.extend({
      api_key: '',
      user_id: ''
    }, options)
    
    $.flickr.methods = {
      // desired api methods go here
    }
    
    return $.flickr.methods
  }
})(jQuery);