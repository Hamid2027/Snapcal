/**
 * Cross-browser Polyfills for older browsers, Brave, and iOS Safari
 */

// Polyfill for Object.hasOwn (ES2022) for ES2020 compatibility
if (typeof (Object as any).hasOwn !== 'function') {
  Object.defineProperty(Object, 'hasOwn', {
    value: function (object: any, property: PropertyKey): boolean {
      if (object == null) {
        throw new TypeError('Cannot convert undefined or null to object');
      }
      return Object.prototype.hasOwnProperty.call(Object(object), property);
    },
    configurable: true,
    enumerable: false,
    writable: true,
  });
}

// Polyfill for globalThis
if (typeof globalThis === 'undefined') {
  (function () {
    if (typeof self !== 'undefined') {
      (self as any).globalThis = self;
    } else if (typeof window !== 'undefined') {
      (window as any).globalThis = window;
    }
  })();
}
