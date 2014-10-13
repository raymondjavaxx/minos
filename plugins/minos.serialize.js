(function (minos) {
  "use strict";

  minos.plug('serialize', function () {
    var data = {};
    this.children('input,select').each(function (el, i) {
      data[el.name] = el.value;
    });
    return data;
  });
})(minos);
