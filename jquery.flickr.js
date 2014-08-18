/*****************************************
 * Flickr API (in jQuery)
 * version: 1.0 (02/23/2009)
 * written for jQuery 1.3.2
 * by Ryan Heath (http://rpheath.com)
 *
 * Changes: 
 *  - Added tagSelect method to get the list of tags
 *    in a flickr account which can be used to filter
 *    the displayed images. Dan Smith 05/23/2011.
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
        default: return ''   // medium
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
    src: function(photo, size) {
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
    var thumbnails = $.map(photos.photo, function(photo) {
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

  // handles requesting and thumbnailing photos
  $.flickr.photos = function(method, options) {
    var options = $.extend($.flickr.settings, options || {}),
        elements = $.flickr.self, photos

    return elements.each(function() {
      $.getJSON($.flickr.url(method, options), function(data) {
        photos = (data.photos === undefined ? data.photoset : data.photos)
        elements.append($.flickr.thumbnail.process(photos))
      })
    })
  }

  // handles requesting list of tags
  $.flickr.tags = function(method, options, select) {
    var options = $.extend($.flickr.settings, options || {}),
  		  elements = $.flickr.self, tags

    return elements.each(function() {
      $.getJSON($.flickr.url(method, options), function(data) {
        var list = $.flickr.tags.selectList(data.who.tags, select);
        elements.append(list);
      })
    })
  }

  // converts tags into select list. parameters:
  //  multiple: can select multiple items in list (bool).
  //  size: length of displayed list box, set to 0 to create a drop down list (integer).
  //  prompt: adds a text prompt to the top of the list (e.g. "Please select...") (string).
  //  onchange: callback to handle the select list's change event (function).
  $.flickr.tags.selectList = function(tags, options) {
    // what if there are no tags?
    var optionList = $.map(tags.tag, function(tag) {
      return ['<option value="' + tag._content + '">' + tag._content + '</option>']
    }).join("\n")

    var selectList = $('<select class="flickr"></select>');
    if (options.multiple === true)
      selectList.attr('multiple', 'multiple');
    if (options.size !== undefined && options.size > 0)
      selectList.attr('size', options.size);
    if (options.prompt !== undefined && options.prompt != '')
      selectList.append('<option value="" selected="selected">' + options.prompt + '</option>');
    if (typeof(options.onchange) === 'function')
      selectList.change(options.onchange);

    return selectList.append(optionList)
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
    // http://www.flickr.com/services/api/flickr.tags.getListUser.html
    // select parameter; {multiple: true, size: 4, prompt: 'Select one...', onchange: getPhotosByTag }
    tagSelect: function(options, select) {
      $.flickr.tags('flickr.tags.getListUser', options, select)
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