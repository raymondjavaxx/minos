/**
 * minos.js plugin to use Sizzle as selector engine.
 */
"use strict";

minos.find = function (selector) {
  return Sizzle(selector);
};
