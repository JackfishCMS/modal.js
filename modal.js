module.exports = modal

var Emitter = require('events').EventEmitter
var template = require('./modal-template')
/**
 * @typedef {Object} ModalButton
 * @property {string} text The button text
 * @property {string} event The event name to fire when the button is clicked
 * @property {string} [className] The className to apply to the button
 * @property {string} [iconClassName] If set, adds an `i` element before button text with the given class(es)
 * @property {number[]} [keyCodes] The keycodes of shortcut keys for the button
 */

/**
 * @typedef {Object} ModalOptions
 * @property {string} [title] The modal title
 * @property {HTMLElement | string} [content] The modal content
 * @property {ModalButton[]} [buttons] The modal buttons
 * @property {boolean} [clickOutsideToClose] Whether a click event outside of the modal should close it
 * @property {string} [clickOutsideEvent] The name of the event to be triggered on clicks outside of the modal
 * @property {string} [className] Class to apply to the modal element
 * @property {string} [removeMethod] which jQuery method to remove the modal contents with (default: remove)
 *         This is useful when you want to append the contents to the DOM again later. In which case
 *         set this to 'detach' so that bound event handlers aren't removed.
 */

/** @type {ModalOptions} */
var defaults = {
  title: 'Are you sure?',
  content: 'Please confirm this action.',
  buttons: [
    {
      text: 'Cancel',
      event: 'cancel',
      className: '',
      iconClassName: '',
      keyCodes: [27]
    },
    { text: 'Confirm', event: 'confirm', className: '', iconClassName: '' }
  ],
  clickOutsideToClose: true,
  clickOutsideEvent: 'cancel',
  className: '',
  removeMethod: 'remove',
  fx: true // used for testing
}

/**
 * A shortcut method that will generate a new Modal object
 * @param {ModalOptions} options
 */
function modal(options) {
  return new Modal($.extend({}, defaults, options))
}

/**
 * A shortcut method that will generate a new Modal object
 * @param {ModalOptions} settings
 */
function Modal(settings) {
  Emitter.call(this)

  var el = $(template(settings))
  var modal = el.find('.js-modal')
  var content = el.find('.js-content')
  var buttons = el.find('.js-button')
  var keys = {}
  var transitionFn = $.fn.transition ? 'transition' : 'animate'

  if (typeof settings.content === 'string') {
    content.append($('<p/>', { text: settings.content }))
  } else {
    content.append(settings.content)
  }

  modal.addClass(settings.className)

  // Cache the button shortcut keycodes
  $.each(settings.buttons, function (i, button) {
    if (!button.keyCodes) return
    $.each(button.keyCodes, function (n, keyCode) {
      keys[keyCode + ''] = i
    })
  })

  /*
   * Reposition the modal in the middle of the screen
   */
  function centre() {
    if (modal.outerHeight(true) < $(window).height()) {
      var diff = $(window).height() - modal.outerHeight(true)
      modal.css({ top: diff / 2 })
    }
  }

  /*
   * Remove a modal from the DOM
   * and tear down its related events
   */
  var removeModal = $.proxy(function () {
    var listenersWithCallback = 0

    $.each(this.listeners('beforeClose'), function (i, fn) {
      if (isFunctionWithArguments(fn)) {
        listenersWithCallback++
      }
    })

    if (listenersWithCallback > 0) {
      var currentCallsCount = 0
      var performClose = function () {
        if (++currentCallsCount === listenersWithCallback) {
          performRemoveModal()
        }
      }
      this.emit('beforeClose', performClose)
    } else {
      this.emit('beforeClose')
      performRemoveModal()
    }
  }, this)

  function isFunctionWithArguments(fn) {
    return fn.length > 0
  }

  var performRemoveModal = $.proxy(function () {
    el[transitionFn]({ opacity: 0 }, settings.fx ? 200 : 0)
    // Do setTimeout rather than using the transition
    // callback as it potentially fails to get called in IE10
    setTimeout(
      function () {
        el[settings.removeMethod]()
      },
      settings.fx ? 200 : 0
    )
    modal[transitionFn]({ top: $(window).height() }, settings.fx ? 200 : 0)
    this.emit('close')
    this.removeAllListeners()
    $(document).off('keyup', keyup)
    $(window).off('resize', centre)
  }, this)

  // Expose so you can control externally
  this.close = function () {
    removeModal()
  }

  // Expose so you can recentre externally
  this.centre = centre

  /*
   * Respond to a key event
   */
  var keyup = $.proxy(function (e) {
    var button = keys[e.keyCode + '']
    if (typeof button !== 'undefined') {
      this.emit(settings.buttons[button].event)
      removeModal()
    }
  }, this)

  // Assign button event handlers
  buttons.each(
    $.proxy(function (i, el) {
      $(el).on(
        'click',
        $.proxy(function () {
          this.emit(settings.buttons[i].event)
          removeModal()
        }, this)
      )
    }, this)
  )

  $(document).on('keyup', keyup)

  // Listen for clicks outside the modal
  el.on(
    'click',
    $.proxy(function (e) {
      if ($(e.target).is(el)) {
        this.emit(settings.clickOutsideEvent)
        // Clicks outside should close?
        if (settings.clickOutsideToClose) {
          removeModal()
        }
      }
    }, this)
  )

  // Set initial styles
  el.css({ opacity: 0 })
  modal.css({ top: '0%' })

  // Append to DOM
  $('body').append(el)

  // transition in
  el[transitionFn]({ opacity: 1 }, settings.fx ? 100 : 0)

  if (modal.outerHeight(true) < $(window).height()) {
    var diff = $(window).height() - modal.outerHeight(true)
    modal[transitionFn](
      { top: diff / 2 + 10 },
      settings.fx ? 200 : 0,
      function () {
        modal[transitionFn]({ top: diff / 2 }, settings.fx ? 150 : 0)
      }
    )
  }

  $(window).on('resize', centre)
}

// Be an emitter
Modal.prototype = Emitter.prototype
