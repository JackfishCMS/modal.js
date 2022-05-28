var pug = require('pug-runtime');
function template(locals) {var pug_html = "", pug_mixins = {}, pug_interp;;
    var locals_for_with = (locals || {});
    
    (function (buttons, title) {
      pug_html = pug_html + "\u003Cdiv class=\"modal-overlay\"\u003E\u003Cdiv class=\"modal-content js-modal\"\u003E";
if ((title)) {
pug_html = pug_html + "\u003Ch1 class=\"modal-title\"\u003E" + (pug.escape(null == (pug_interp = title) ? "" : pug_interp)) + "\u003C\u002Fh1\u003E";
}
pug_html = pug_html + "\u003Cdiv class=\"js-content\"\u003E\u003C\u002Fdiv\u003E";
if ((buttons && buttons.length)) {
pug_html = pug_html + "\u003Cdiv class=\"modal-controls\"\u003E";
// iterate buttons
;(function(){
  var $$obj = buttons;
  if ('number' == typeof $$obj.length) {
      for (var pug_index0 = 0, $$l = $$obj.length; pug_index0 < $$l; pug_index0++) {
        var button = $$obj[pug_index0];
pug_html = pug_html + "\u003Cbutton" + (pug.attr("class", pug.classes(["js-button",button.className], [false,true]), false, false)) + "\u003E";
if (button.iconClassName) {
pug_html = pug_html + "\u003Ci" + (pug.attr("class", pug.classes([button.iconClassName], [true]), false, false)) + "\u003E\u003C\u002Fi\u003E ";
}
pug_html = pug_html + (pug.escape(null == (pug_interp = button.text) ? "" : pug_interp)) + "\u003C\u002Fbutton\u003E";
      }
  } else {
    var $$l = 0;
    for (var pug_index0 in $$obj) {
      $$l++;
      var button = $$obj[pug_index0];
pug_html = pug_html + "\u003Cbutton" + (pug.attr("class", pug.classes(["js-button",button.className], [false,true]), false, false)) + "\u003E";
if (button.iconClassName) {
pug_html = pug_html + "\u003Ci" + (pug.attr("class", pug.classes([button.iconClassName], [true]), false, false)) + "\u003E\u003C\u002Fi\u003E ";
}
pug_html = pug_html + (pug.escape(null == (pug_interp = button.text) ? "" : pug_interp)) + "\u003C\u002Fbutton\u003E";
    }
  }
}).call(this);

pug_html = pug_html + "\u003C\u002Fdiv\u003E";
}
pug_html = pug_html + "\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E";
    }.call(this, "buttons" in locals_for_with ?
        locals_for_with.buttons :
        typeof buttons !== 'undefined' ? buttons : undefined, "title" in locals_for_with ?
        locals_for_with.title :
        typeof title !== 'undefined' ? title : undefined));
    ;;return pug_html;}
module.exports = template;