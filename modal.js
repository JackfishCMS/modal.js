module.exports = modal

var EventEmitter = require('events').EventEmitter
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

/* Helper functions */
function isFunctionWithArguments(fn) {
  return fn.length > 0
}

/**
 * A shortcut method that will generate a new Modal instance
 * @param {ModalOptions} options
 */
function modal(options) {
  return new Modal($.extend({}, defaults, options))
}
/**
 * A Modal class
 * @param {ModalOptions} settings
 */
class Modal extends EventEmitter {
  constructor(settings) {
    super()

    this.settings = settings
    this.keyup = this.keyup.bind(this)
    this.centre = this.centre.bind(this)

    this.el = $(template(settings))
    this.modal = this.el.find('.js-modal')
    var content = this.el.find('.js-content')
    var buttons = this.el.find('.js-button')
    this.keys = {}
    this.transitionFn = $.fn.transition ? 'transition' : 'animate'

    if (typeof settings.content === 'string') {
      content.append($('<p/>', { text: settings.content }))
    } else {
      content.append(settings.content)
    }

    this.modal.addClass(settings.className)

    // Cache the button shortcut keycodes
    $.each(
      settings.buttons,
      function (i, button) {
        if (!button.keyCodes) return
        $.each(
          button.keyCodes,
          function (n, keyCode) {
            this.keys[keyCode + ''] = i
          }.bind(this)
        )
      }.bind(this)
    )

    // Assign button event handlers
    buttons.each(
      function (i, el) {
        $(el).on(
          'click',
          function () {
            this.emit(settings.buttons[i].event)
            this.removeModal()
          }.bind(this)
        )
      }.bind(this)
    )

    // Listen for clicks outside the modal
    this.el.on(
      'click',
      function (e) {
        if ($(e.target).is(this.el)) {
          this.emit(settings.clickOutsideEvent)
          // Clicks outside should close?
          if (settings.clickOutsideToClose) {
            this.removeModal()
          }
        }
      }.bind(this)
    )

    // Set initial styles
    this.el.css({ opacity: 0 })
    this.modal.css({ top: '0%' })

    // Append to DOM
    $('body').append(this.el)

    // transition in
    this.el[this.transitionFn]({ opacity: 1 }, settings.fx ? 100 : 0)

    if (this.modal.outerHeight(true) < $(window).height()) {
      var diff = $(window).height() - this.modal.outerHeight(true)
      this.modal[this.transitionFn](
        { top: diff / 2 + 10 },
        settings.fx ? 200 : 0,
        function () {
          this.modal[this.transitionFn](
            { top: diff / 2 },
            settings.fx ? 150 : 0
          )
        }.bind(this)
      )
    }

    $(document).on('keyup', this.keyup)
    $(window).on('resize', this.centre)
  }

  /*
   * Reposition the modal in the middle of the screen
   */
  centre() {
    if (this.modal.outerHeight(true) < $(window).height()) {
      var diff = $(window).height() - this.modal.outerHeight(true)
      this.modal.css({ top: diff / 2 })
    }
  }

  /*
   * Respond to a key event
   */
  keyup(e) {
    var button = this.keys[e.keyCode + '']
    if (typeof button !== 'undefined') {
      this.emit(this.settings.buttons[button].event)
      this.removeModal()
    }
  }

  performRemoveModal() {
    this.el[this.transitionFn]({ opacity: 0 }, this.settings.fx ? 200 : 0)
    // Do setTimeout rather than using the transition
    // callback as it potentially fails to get called in IE10
    setTimeout(
      function () {
        this.el[this.settings.removeMethod]()
      }.bind(this),
      this.settings.fx ? 200 : 0
    )
    this.modal[this.transitionFn](
      { top: $(window).height() },
      this.settings.fx ? 200 : 0
    )
    this.emit('close')
    this.removeAllListeners()
    $(document).off('keyup', this.keyup)
    $(window).off('resize', this.centre)
  }

  /**
   * Remove a modal from the DOM
   * and tear down its related events
   */
  removeModal() {
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
          this.performRemoveModal()
        }
      }.bind(this)
      this.emit('beforeClose', performClose)
    } else {
      this.emit('beforeClose')
      this.performRemoveModal()
    }
  }

  close() {
    this.removeModal()
  }
}
