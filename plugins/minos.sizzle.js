/*jshint newcap: false */

/*!
 * minos.js plugin to use Sizzle as selector engine.
 */

(function (minos) {
  "use strict";

  minos.find = function (selector) {
    return Sizzle(selector);
  };
})(minos);
