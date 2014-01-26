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
  };

  minos.find = function (selector) {
    return document.querySelectorAll(selector);
  };

  minos.plug = function (name, fn) {
    minos.Set.prototype[name] = fn;
  };

  minos.parseHTML = function (htmlString) {
    var fragment = document.createDocumentFragment();
    var wrapper = fragment.appendChild(document.createElement('div'));
    wrapper.innerHTML = htmlString;
    return new minos.Set(wrapper.childNodes);
  };

  minos.Set = function (elements) {
    this.elements = elements;
  };

  minos.plug('each', function (fn) {
    for (var i = 0; i < this.elements.length; i+=1) {
      fn.call(this.elements[i], this.elements[i], i);
    }
    return this;
  });

  minos.plug('get', function (i) {
    return this.elements[i];
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
      return this.get(0).getAttribute();
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

  w.minos = minos;
})(window);
