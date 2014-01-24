"use strict";

var minos = function (selector) {
  var matches = document.querySelectorAll(selector);
  return new minos.Set(matches);
};

minos.Set = function (elements) {
  this.elements = elements;
};

minos.Set.prototype.each = function (fn) {
  for (var i = 0; i < this.elements.length; i+=1) {
    fn.call(this.elements[i], this.elements[i], i);
  }
  return this;
};

minos.Set.prototype.get = function (i) {
  return this.elements[i];
};

minos.Set.prototype.appendTo = function (target) {
  var targetElement;

  if (typeof target == 'string') {
    targetElement = document.querySelector(target);
  } else if (target instanceof minos.Set) {
    targetElement = target.get(0);
  } else if (target instanceof Node) {
    targetElement = target;
  }

  if (targetElement) {
    this.each(function (el, i) {
      targetElement.appendChild(el);
    });
  }

  return this;
};

minos.Set.prototype.remove = function () {
  return this.each(function (el, i) {
    if (el.parentNode) {
      el.parentNode.removeChild(el);
    }
  });
};

minos.Set.prototype.length = function () {
  return this.elements.length;
};

minos.Set.prototype.addClass = function (klass) {
  return this.each(function (el, i) {
    var klasses = el.className.split(' ');
    if (klasses.indexOf(klass) === -1) {
      klasses.push(klass);
      el.className = klasses.join(' ');
    }
  });
};

window['minos'] = minos;
