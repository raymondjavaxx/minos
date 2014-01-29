(function (w) {
  "use strict";

  var minos = function (selector) {
    if (typeof selector === 'string') {
      var matches = minos.find(selector);
      return new minos.Set(matches);
    }

    if (selector instanceof Node) {
      var elements = [selector];
      return new minos.Set(elements);
    }

    if (typeof selector === 'function') {
      minos(document).ready(selector);
    }
  };

  minos.find = function (selector) {
    return document.querySelectorAll(selector);
  };

  minos.plug = function (name, fn) {
    minos.Set.prototype[name] = fn;
  };

  minos.normalize = function (content) {
    if (typeof content === 'string') {
      return minos.parseHTML(content);
    }

    if (content instanceof Array) {
      return new minos.Set(content);
    }

    return content;
  };

  minos.dasherize = function (text) {
    return text.replace(/[A-Z]/g, function (char, i) {
      if (i === 0) {
        return char.toLowerCase();
      }

      return '-' + char.toLowerCase();
    });
  };

  minos.parseHTML = function (htmlString) {
    var wrapper = document.createElement('div');
    wrapper.innerHTML = htmlString;

    var elements = [];
    for (var i = 0; i < wrapper.childNodes.length; i+=1) {
      elements.push(wrapper.childNodes[i].cloneNode(true));
    }

    return new minos.Set(elements);
  };

  minos.Set = function (elements) {
    this.elements = elements;
  };

  minos.plug('ready', function (fn) {
    return this.each(function (el, i) {
      el.addEventListener("DOMContentLoaded", fn);
    });
  });

  minos.plug('each', function (fn) {
    for (var i = 0; i < this.elements.length; i+=1) {
      fn.call(this.elements[i], this.elements[i], i);
    }
    return this;
  });

  minos.plug('get', function (i) {
    if (i === undefined) {
      return this.elements;
    }

    return this.elements[i];
  });

  minos.plug('append', function (content) {
    return this.each(function (el, i) {
      minos.normalize(content).clone().each(function () {
        el.appendChild(this);
      });
    });
  });

  minos.plug('before', function (content) {
    return this.each(function (el, i) {
      minos.normalize(content).clone().each(function () {
        el.parentNode.insertBefore(this, el);
      });
    });
  });

  minos.plug('after', function (content) {
    return this.each(function (el, i) {
      minos.normalize(content).clone().each(function () {
        el.parentNode.insertBefore(this, el.nextSibling);
      });
    });
  });

  minos.plug('replaceWith', function (content) {
    return this.before(content).remove();
  });

  minos.plug('appendTo', function (target) {
    var targetElement;

    if (typeof target == 'string') {
      var matches = minos.find(target);
      targetElement = matches[0];
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
  });

  minos.plug('remove', function () {
    return this.each(function (el, i) {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });
  });

  minos.plug('clone', function () {
    var elements = [];

    this.each(function (el, i) {
      elements.push(el.cloneNode(true));
    });

    return new minos.Set(elements);
  });

  minos.plug('length', function () {
    return this.elements.length;
  });

  minos.plug('hasClass', function (klass) {
    var result = false;

    this.each(function (el, i) {
      var klasses = el.className.split(' ');
      if (klasses.indexOf(klass) !== -1) {
        result = true;
      }
    });

    return result;
  });

  minos.plug('addClass', function (klass) {
    return this.each(function (el, i) {
      var klasses = el.className.split(' ');
      if (klasses.indexOf(klass) === -1) {
        klasses.push(klass);
        el.className = klasses.join(' ');
      }
    });
  });

  minos.plug('removeClass', function (klass) {
    return this.each(function (el, i) {
      var klasses = el.className.split(' ');
      if (klasses.indexOf(klass) !== -1) {
        klasses.splice(klasses.indexOf(klass), 1);
        el.className = klasses.join(' ');
      }
    });
  });

  minos.plug('toggleClass', function (klass) {
    return this.each(function (el, i) {
      var element = minos(el);
      if (element.hasClass(klass)) {
        element.removeClass(klass);
      } else {
        element.addClass(klass);
      }
    });
  });

  minos.plug('attr', function (name, value) {
    // Getter
    if (value === undefined) {
      return this.get(0).getAttribute(name);
    }

    return this.each(function (el, i) {
      el.setAttribute(name, value);
    });
  });

  minos.plug('text', function (value) {
    // Getter
    if (value === undefined) {
      return this.get(0).textContent;
    }

    return this.each(function (el, i) {
      el.textContent = value;
    });
  });

  minos.plug('css', function (property, value) {
    // Getter
    if (arguments.length < 2 && typeof property != 'object') {
      var element = this.get(0);
      var computed = window.getComputedStyle(element);

      if (typeof property == 'string') {
        return element.style[property] || computed.getPropertyValue(property);
      }

      if (property instanceof Array) {
        var props = {};
        for (var i = 0; i < property.length; i++) {
          var p = property[i];
          props[p] = element.style[p] || computed.getPropertyValue(p);
        }
        return props;
      }
    }

    var css = [];
    var hash = {};

    if (typeof property == 'string') {
      hash[property] = value;
    } else {
      hash = property;
    }

    for (var key in hash) {
      css.push(minos.dasherize(key) + ':' + hash[key]);
    }

    return this.each(function (el, i) {
      el.style.cssText += ';' + css.join(';');
    });
  });

  minos.plug('on', function (type, selector, listener) {
    var matches = document.documentElement.matches ||
                  document.documentElement.webkitMatchesSelector ||
                  document.documentElement.mozMatchesSelector ||
                  document.documentElement.msMatchesSelector;

    if (typeof selector !== 'string') {
      listener = selector;
      selector = undefined;
    }

    var callback = function (e) {
      if (selector === undefined || matches.call(e.target, selector)) {
        listener.call(e.target, e);
      }
    };

    return this.each(function (el, i) {
      el.addEventListener(type, callback, false);
    });
  });

  w.minos = minos;
})(window);
