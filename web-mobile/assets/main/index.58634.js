window.__require = function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var b = o.split("/");
        b = b[b.length - 1];
        if (!t[b]) {
          var a = "function" == typeof __require && __require;
          if (!u && a) return a(b, !0);
          if (i) return i(b, !0);
          throw new Error("Cannot find module '" + o + "'");
        }
        o = b;
      }
      var f = n[o] = {
        exports: {}
      };
      t[o][0].call(f.exports, function(e) {
        var n = t[o][1][e];
        return s(n || e);
      }, f, f.exports, e, t, n, r);
    }
    return n[o].exports;
  }
  var i = "function" == typeof __require && __require;
  for (var o = 0; o < r.length; o++) s(r[o]);
  return s;
}({
  1: [ function(require, module, exports) {
    var process = module.exports = {};
    var cachedSetTimeout;
    var cachedClearTimeout;
    function defaultSetTimout() {
      throw new Error("setTimeout has not been defined");
    }
    function defaultClearTimeout() {
      throw new Error("clearTimeout has not been defined");
    }
    (function() {
      try {
        cachedSetTimeout = "function" === typeof setTimeout ? setTimeout : defaultSetTimout;
      } catch (e) {
        cachedSetTimeout = defaultSetTimout;
      }
      try {
        cachedClearTimeout = "function" === typeof clearTimeout ? clearTimeout : defaultClearTimeout;
      } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
      }
    })();
    function runTimeout(fun) {
      if (cachedSetTimeout === setTimeout) return setTimeout(fun, 0);
      if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
      }
      try {
        return cachedSetTimeout(fun, 0);
      } catch (e) {
        try {
          return cachedSetTimeout.call(null, fun, 0);
        } catch (e) {
          return cachedSetTimeout.call(this, fun, 0);
        }
      }
    }
    function runClearTimeout(marker) {
      if (cachedClearTimeout === clearTimeout) return clearTimeout(marker);
      if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
      }
      try {
        return cachedClearTimeout(marker);
      } catch (e) {
        try {
          return cachedClearTimeout.call(null, marker);
        } catch (e) {
          return cachedClearTimeout.call(this, marker);
        }
      }
    }
    var queue = [];
    var draining = false;
    var currentQueue;
    var queueIndex = -1;
    function cleanUpNextTick() {
      if (!draining || !currentQueue) return;
      draining = false;
      currentQueue.length ? queue = currentQueue.concat(queue) : queueIndex = -1;
      queue.length && drainQueue();
    }
    function drainQueue() {
      if (draining) return;
      var timeout = runTimeout(cleanUpNextTick);
      draining = true;
      var len = queue.length;
      while (len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) currentQueue && currentQueue[queueIndex].run();
        queueIndex = -1;
        len = queue.length;
      }
      currentQueue = null;
      draining = false;
      runClearTimeout(timeout);
    }
    process.nextTick = function(fun) {
      var args = new Array(arguments.length - 1);
      if (arguments.length > 1) for (var i = 1; i < arguments.length; i++) args[i - 1] = arguments[i];
      queue.push(new Item(fun, args));
      1 !== queue.length || draining || runTimeout(drainQueue);
    };
    function Item(fun, array) {
      this.fun = fun;
      this.array = array;
    }
    Item.prototype.run = function() {
      this.fun.apply(null, this.array);
    };
    process.title = "browser";
    process.browser = true;
    process.env = {};
    process.argv = [];
    process.version = "";
    process.versions = {};
    function noop() {}
    process.on = noop;
    process.addListener = noop;
    process.once = noop;
    process.off = noop;
    process.removeListener = noop;
    process.removeAllListeners = noop;
    process.emit = noop;
    process.prependListener = noop;
    process.prependOnceListener = noop;
    process.listeners = function(name) {
      return [];
    };
    process.binding = function(name) {
      throw new Error("process.binding is not supported");
    };
    process.cwd = function() {
      return "/";
    };
    process.chdir = function(dir) {
      throw new Error("process.chdir is not supported");
    };
    process.umask = function() {
      return 0;
    };
  }, {} ],
  2: [ function(require, module, exports) {
    module.exports = require("./lib/axios");
  }, {
    "./lib/axios": 4
  } ],
  3: [ function(require, module, exports) {
    "use strict";
    var utils = require("./../utils");
    var settle = require("./../core/settle");
    var cookies = require("./../helpers/cookies");
    var buildURL = require("./../helpers/buildURL");
    var buildFullPath = require("../core/buildFullPath");
    var parseHeaders = require("./../helpers/parseHeaders");
    var isURLSameOrigin = require("./../helpers/isURLSameOrigin");
    var createError = require("../core/createError");
    module.exports = function xhrAdapter(config) {
      return new Promise(function dispatchXhrRequest(resolve, reject) {
        var requestData = config.data;
        var requestHeaders = config.headers;
        utils.isFormData(requestData) && delete requestHeaders["Content-Type"];
        var request = new XMLHttpRequest();
        if (config.auth) {
          var username = config.auth.username || "";
          var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : "";
          requestHeaders.Authorization = "Basic " + btoa(username + ":" + password);
        }
        var fullPath = buildFullPath(config.baseURL, config.url);
        request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);
        request.timeout = config.timeout;
        request.onreadystatechange = function handleLoad() {
          if (!request || 4 !== request.readyState) return;
          if (0 === request.status && !(request.responseURL && 0 === request.responseURL.indexOf("file:"))) return;
          var responseHeaders = "getAllResponseHeaders" in request ? parseHeaders(request.getAllResponseHeaders()) : null;
          var responseData = config.responseType && "text" !== config.responseType ? request.response : request.responseText;
          var response = {
            data: responseData,
            status: request.status,
            statusText: request.statusText,
            headers: responseHeaders,
            config: config,
            request: request
          };
          settle(resolve, reject, response);
          request = null;
        };
        request.onabort = function handleAbort() {
          if (!request) return;
          reject(createError("Request aborted", config, "ECONNABORTED", request));
          request = null;
        };
        request.onerror = function handleError() {
          reject(createError("Network Error", config, null, request));
          request = null;
        };
        request.ontimeout = function handleTimeout() {
          var timeoutErrorMessage = "timeout of " + config.timeout + "ms exceeded";
          config.timeoutErrorMessage && (timeoutErrorMessage = config.timeoutErrorMessage);
          reject(createError(timeoutErrorMessage, config, "ECONNABORTED", request));
          request = null;
        };
        if (utils.isStandardBrowserEnv()) {
          var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ? cookies.read(config.xsrfCookieName) : void 0;
          xsrfValue && (requestHeaders[config.xsrfHeaderName] = xsrfValue);
        }
        "setRequestHeader" in request && utils.forEach(requestHeaders, function setRequestHeader(val, key) {
          "undefined" === typeof requestData && "content-type" === key.toLowerCase() ? delete requestHeaders[key] : request.setRequestHeader(key, val);
        });
        utils.isUndefined(config.withCredentials) || (request.withCredentials = !!config.withCredentials);
        if (config.responseType) try {
          request.responseType = config.responseType;
        } catch (e) {
          if ("json" !== config.responseType) throw e;
        }
        "function" === typeof config.onDownloadProgress && request.addEventListener("progress", config.onDownloadProgress);
        "function" === typeof config.onUploadProgress && request.upload && request.upload.addEventListener("progress", config.onUploadProgress);
        config.cancelToken && config.cancelToken.promise.then(function onCanceled(cancel) {
          if (!request) return;
          request.abort();
          reject(cancel);
          request = null;
        });
        requestData || (requestData = null);
        request.send(requestData);
      });
    };
  }, {
    "../core/buildFullPath": 10,
    "../core/createError": 11,
    "./../core/settle": 15,
    "./../helpers/buildURL": 19,
    "./../helpers/cookies": 21,
    "./../helpers/isURLSameOrigin": 24,
    "./../helpers/parseHeaders": 26,
    "./../utils": 28
  } ],
  4: [ function(require, module, exports) {
    "use strict";
    var utils = require("./utils");
    var bind = require("./helpers/bind");
    var Axios = require("./core/Axios");
    var mergeConfig = require("./core/mergeConfig");
    var defaults = require("./defaults");
    function createInstance(defaultConfig) {
      var context = new Axios(defaultConfig);
      var instance = bind(Axios.prototype.request, context);
      utils.extend(instance, Axios.prototype, context);
      utils.extend(instance, context);
      return instance;
    }
    var axios = createInstance(defaults);
    axios.Axios = Axios;
    axios.create = function create(instanceConfig) {
      return createInstance(mergeConfig(axios.defaults, instanceConfig));
    };
    axios.Cancel = require("./cancel/Cancel");
    axios.CancelToken = require("./cancel/CancelToken");
    axios.isCancel = require("./cancel/isCancel");
    axios.all = function all(promises) {
      return Promise.all(promises);
    };
    axios.spread = require("./helpers/spread");
    axios.isAxiosError = require("./helpers/isAxiosError");
    module.exports = axios;
    module.exports.default = axios;
  }, {
    "./cancel/Cancel": 5,
    "./cancel/CancelToken": 6,
    "./cancel/isCancel": 7,
    "./core/Axios": 8,
    "./core/mergeConfig": 14,
    "./defaults": 17,
    "./helpers/bind": 18,
    "./helpers/isAxiosError": 23,
    "./helpers/spread": 27,
    "./utils": 28
  } ],
  5: [ function(require, module, exports) {
    "use strict";
    function Cancel(message) {
      this.message = message;
    }
    Cancel.prototype.toString = function toString() {
      return "Cancel" + (this.message ? ": " + this.message : "");
    };
    Cancel.prototype.__CANCEL__ = true;
    module.exports = Cancel;
  }, {} ],
  6: [ function(require, module, exports) {
    "use strict";
    var Cancel = require("./Cancel");
    function CancelToken(executor) {
      if ("function" !== typeof executor) throw new TypeError("executor must be a function.");
      var resolvePromise;
      this.promise = new Promise(function promiseExecutor(resolve) {
        resolvePromise = resolve;
      });
      var token = this;
      executor(function cancel(message) {
        if (token.reason) return;
        token.reason = new Cancel(message);
        resolvePromise(token.reason);
      });
    }
    CancelToken.prototype.throwIfRequested = function throwIfRequested() {
      if (this.reason) throw this.reason;
    };
    CancelToken.source = function source() {
      var cancel;
      var token = new CancelToken(function executor(c) {
        cancel = c;
      });
      return {
        token: token,
        cancel: cancel
      };
    };
    module.exports = CancelToken;
  }, {
    "./Cancel": 5
  } ],
  7: [ function(require, module, exports) {
    "use strict";
    module.exports = function isCancel(value) {
      return !!(value && value.__CANCEL__);
    };
  }, {} ],
  8: [ function(require, module, exports) {
    "use strict";
    var utils = require("./../utils");
    var buildURL = require("../helpers/buildURL");
    var InterceptorManager = require("./InterceptorManager");
    var dispatchRequest = require("./dispatchRequest");
    var mergeConfig = require("./mergeConfig");
    function Axios(instanceConfig) {
      this.defaults = instanceConfig;
      this.interceptors = {
        request: new InterceptorManager(),
        response: new InterceptorManager()
      };
    }
    Axios.prototype.request = function request(config) {
      if ("string" === typeof config) {
        config = arguments[1] || {};
        config.url = arguments[0];
      } else config = config || {};
      config = mergeConfig(this.defaults, config);
      config.method ? config.method = config.method.toLowerCase() : this.defaults.method ? config.method = this.defaults.method.toLowerCase() : config.method = "get";
      var chain = [ dispatchRequest, void 0 ];
      var promise = Promise.resolve(config);
      this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
        chain.unshift(interceptor.fulfilled, interceptor.rejected);
      });
      this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
        chain.push(interceptor.fulfilled, interceptor.rejected);
      });
      while (chain.length) promise = promise.then(chain.shift(), chain.shift());
      return promise;
    };
    Axios.prototype.getUri = function getUri(config) {
      config = mergeConfig(this.defaults, config);
      return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, "");
    };
    utils.forEach([ "delete", "get", "head", "options" ], function forEachMethodNoData(method) {
      Axios.prototype[method] = function(url, config) {
        return this.request(mergeConfig(config || {}, {
          method: method,
          url: url,
          data: (config || {}).data
        }));
      };
    });
    utils.forEach([ "post", "put", "patch" ], function forEachMethodWithData(method) {
      Axios.prototype[method] = function(url, data, config) {
        return this.request(mergeConfig(config || {}, {
          method: method,
          url: url,
          data: data
        }));
      };
    });
    module.exports = Axios;
  }, {
    "../helpers/buildURL": 19,
    "./../utils": 28,
    "./InterceptorManager": 9,
    "./dispatchRequest": 12,
    "./mergeConfig": 14
  } ],
  9: [ function(require, module, exports) {
    "use strict";
    var utils = require("./../utils");
    function InterceptorManager() {
      this.handlers = [];
    }
    InterceptorManager.prototype.use = function use(fulfilled, rejected) {
      this.handlers.push({
        fulfilled: fulfilled,
        rejected: rejected
      });
      return this.handlers.length - 1;
    };
    InterceptorManager.prototype.eject = function eject(id) {
      this.handlers[id] && (this.handlers[id] = null);
    };
    InterceptorManager.prototype.forEach = function forEach(fn) {
      utils.forEach(this.handlers, function forEachHandler(h) {
        null !== h && fn(h);
      });
    };
    module.exports = InterceptorManager;
  }, {
    "./../utils": 28
  } ],
  10: [ function(require, module, exports) {
    "use strict";
    var isAbsoluteURL = require("../helpers/isAbsoluteURL");
    var combineURLs = require("../helpers/combineURLs");
    module.exports = function buildFullPath(baseURL, requestedURL) {
      if (baseURL && !isAbsoluteURL(requestedURL)) return combineURLs(baseURL, requestedURL);
      return requestedURL;
    };
  }, {
    "../helpers/combineURLs": 20,
    "../helpers/isAbsoluteURL": 22
  } ],
  11: [ function(require, module, exports) {
    "use strict";
    var enhanceError = require("./enhanceError");
    module.exports = function createError(message, config, code, request, response) {
      var error = new Error(message);
      return enhanceError(error, config, code, request, response);
    };
  }, {
    "./enhanceError": 13
  } ],
  12: [ function(require, module, exports) {
    "use strict";
    var utils = require("./../utils");
    var transformData = require("./transformData");
    var isCancel = require("../cancel/isCancel");
    var defaults = require("../defaults");
    function throwIfCancellationRequested(config) {
      config.cancelToken && config.cancelToken.throwIfRequested();
    }
    module.exports = function dispatchRequest(config) {
      throwIfCancellationRequested(config);
      config.headers = config.headers || {};
      config.data = transformData(config.data, config.headers, config.transformRequest);
      config.headers = utils.merge(config.headers.common || {}, config.headers[config.method] || {}, config.headers);
      utils.forEach([ "delete", "get", "head", "post", "put", "patch", "common" ], function cleanHeaderConfig(method) {
        delete config.headers[method];
      });
      var adapter = config.adapter || defaults.adapter;
      return adapter(config).then(function onAdapterResolution(response) {
        throwIfCancellationRequested(config);
        response.data = transformData(response.data, response.headers, config.transformResponse);
        return response;
      }, function onAdapterRejection(reason) {
        if (!isCancel(reason)) {
          throwIfCancellationRequested(config);
          reason && reason.response && (reason.response.data = transformData(reason.response.data, reason.response.headers, config.transformResponse));
        }
        return Promise.reject(reason);
      });
    };
  }, {
    "../cancel/isCancel": 7,
    "../defaults": 17,
    "./../utils": 28,
    "./transformData": 16
  } ],
  13: [ function(require, module, exports) {
    "use strict";
    module.exports = function enhanceError(error, config, code, request, response) {
      error.config = config;
      code && (error.code = code);
      error.request = request;
      error.response = response;
      error.isAxiosError = true;
      error.toJSON = function toJSON() {
        return {
          message: this.message,
          name: this.name,
          description: this.description,
          number: this.number,
          fileName: this.fileName,
          lineNumber: this.lineNumber,
          columnNumber: this.columnNumber,
          stack: this.stack,
          config: this.config,
          code: this.code
        };
      };
      return error;
    };
  }, {} ],
  14: [ function(require, module, exports) {
    "use strict";
    var utils = require("../utils");
    module.exports = function mergeConfig(config1, config2) {
      config2 = config2 || {};
      var config = {};
      var valueFromConfig2Keys = [ "url", "method", "data" ];
      var mergeDeepPropertiesKeys = [ "headers", "auth", "proxy", "params" ];
      var defaultToConfig2Keys = [ "baseURL", "transformRequest", "transformResponse", "paramsSerializer", "timeout", "timeoutMessage", "withCredentials", "adapter", "responseType", "xsrfCookieName", "xsrfHeaderName", "onUploadProgress", "onDownloadProgress", "decompress", "maxContentLength", "maxBodyLength", "maxRedirects", "transport", "httpAgent", "httpsAgent", "cancelToken", "socketPath", "responseEncoding" ];
      var directMergeKeys = [ "validateStatus" ];
      function getMergedValue(target, source) {
        if (utils.isPlainObject(target) && utils.isPlainObject(source)) return utils.merge(target, source);
        if (utils.isPlainObject(source)) return utils.merge({}, source);
        if (utils.isArray(source)) return source.slice();
        return source;
      }
      function mergeDeepProperties(prop) {
        utils.isUndefined(config2[prop]) ? utils.isUndefined(config1[prop]) || (config[prop] = getMergedValue(void 0, config1[prop])) : config[prop] = getMergedValue(config1[prop], config2[prop]);
      }
      utils.forEach(valueFromConfig2Keys, function valueFromConfig2(prop) {
        utils.isUndefined(config2[prop]) || (config[prop] = getMergedValue(void 0, config2[prop]));
      });
      utils.forEach(mergeDeepPropertiesKeys, mergeDeepProperties);
      utils.forEach(defaultToConfig2Keys, function defaultToConfig2(prop) {
        utils.isUndefined(config2[prop]) ? utils.isUndefined(config1[prop]) || (config[prop] = getMergedValue(void 0, config1[prop])) : config[prop] = getMergedValue(void 0, config2[prop]);
      });
      utils.forEach(directMergeKeys, function merge(prop) {
        prop in config2 ? config[prop] = getMergedValue(config1[prop], config2[prop]) : prop in config1 && (config[prop] = getMergedValue(void 0, config1[prop]));
      });
      var axiosKeys = valueFromConfig2Keys.concat(mergeDeepPropertiesKeys).concat(defaultToConfig2Keys).concat(directMergeKeys);
      var otherKeys = Object.keys(config1).concat(Object.keys(config2)).filter(function filterAxiosKeys(key) {
        return -1 === axiosKeys.indexOf(key);
      });
      utils.forEach(otherKeys, mergeDeepProperties);
      return config;
    };
  }, {
    "../utils": 28
  } ],
  15: [ function(require, module, exports) {
    "use strict";
    var createError = require("./createError");
    module.exports = function settle(resolve, reject, response) {
      var validateStatus = response.config.validateStatus;
      response.status && validateStatus && !validateStatus(response.status) ? reject(createError("Request failed with status code " + response.status, response.config, null, response.request, response)) : resolve(response);
    };
  }, {
    "./createError": 11
  } ],
  16: [ function(require, module, exports) {
    "use strict";
    var utils = require("./../utils");
    module.exports = function transformData(data, headers, fns) {
      utils.forEach(fns, function transform(fn) {
        data = fn(data, headers);
      });
      return data;
    };
  }, {
    "./../utils": 28
  } ],
  17: [ function(require, module, exports) {
    (function(process) {
      "use strict";
      var utils = require("./utils");
      var normalizeHeaderName = require("./helpers/normalizeHeaderName");
      var DEFAULT_CONTENT_TYPE = {
        "Content-Type": "application/x-www-form-urlencoded"
      };
      function setContentTypeIfUnset(headers, value) {
        !utils.isUndefined(headers) && utils.isUndefined(headers["Content-Type"]) && (headers["Content-Type"] = value);
      }
      function getDefaultAdapter() {
        var adapter;
        "undefined" !== typeof XMLHttpRequest ? adapter = require("./adapters/xhr") : "undefined" !== typeof process && "[object process]" === Object.prototype.toString.call(process) && (adapter = require("./adapters/http"));
        return adapter;
      }
      var defaults = {
        adapter: getDefaultAdapter(),
        transformRequest: [ function transformRequest(data, headers) {
          normalizeHeaderName(headers, "Accept");
          normalizeHeaderName(headers, "Content-Type");
          if (utils.isFormData(data) || utils.isArrayBuffer(data) || utils.isBuffer(data) || utils.isStream(data) || utils.isFile(data) || utils.isBlob(data)) return data;
          if (utils.isArrayBufferView(data)) return data.buffer;
          if (utils.isURLSearchParams(data)) {
            setContentTypeIfUnset(headers, "application/x-www-form-urlencoded;charset=utf-8");
            return data.toString();
          }
          if (utils.isObject(data)) {
            setContentTypeIfUnset(headers, "application/json;charset=utf-8");
            return JSON.stringify(data);
          }
          return data;
        } ],
        transformResponse: [ function transformResponse(data) {
          if ("string" === typeof data) try {
            data = JSON.parse(data);
          } catch (e) {}
          return data;
        } ],
        timeout: 0,
        xsrfCookieName: "XSRF-TOKEN",
        xsrfHeaderName: "X-XSRF-TOKEN",
        maxContentLength: -1,
        maxBodyLength: -1,
        validateStatus: function validateStatus(status) {
          return status >= 200 && status < 300;
        }
      };
      defaults.headers = {
        common: {
          Accept: "application/json, text/plain, */*"
        }
      };
      utils.forEach([ "delete", "get", "head" ], function forEachMethodNoData(method) {
        defaults.headers[method] = {};
      });
      utils.forEach([ "post", "put", "patch" ], function forEachMethodWithData(method) {
        defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
      });
      module.exports = defaults;
    }).call(this, require("_process"));
  }, {
    "./adapters/http": 3,
    "./adapters/xhr": 3,
    "./helpers/normalizeHeaderName": 25,
    "./utils": 28,
    _process: 1
  } ],
  18: [ function(require, module, exports) {
    "use strict";
    module.exports = function bind(fn, thisArg) {
      return function wrap() {
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) args[i] = arguments[i];
        return fn.apply(thisArg, args);
      };
    };
  }, {} ],
  19: [ function(require, module, exports) {
    "use strict";
    var utils = require("./../utils");
    function encode(val) {
      return encodeURIComponent(val).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+").replace(/%5B/gi, "[").replace(/%5D/gi, "]");
    }
    module.exports = function buildURL(url, params, paramsSerializer) {
      if (!params) return url;
      var serializedParams;
      if (paramsSerializer) serializedParams = paramsSerializer(params); else if (utils.isURLSearchParams(params)) serializedParams = params.toString(); else {
        var parts = [];
        utils.forEach(params, function serialize(val, key) {
          if (null === val || "undefined" === typeof val) return;
          utils.isArray(val) ? key += "[]" : val = [ val ];
          utils.forEach(val, function parseValue(v) {
            utils.isDate(v) ? v = v.toISOString() : utils.isObject(v) && (v = JSON.stringify(v));
            parts.push(encode(key) + "=" + encode(v));
          });
        });
        serializedParams = parts.join("&");
      }
      if (serializedParams) {
        var hashmarkIndex = url.indexOf("#");
        -1 !== hashmarkIndex && (url = url.slice(0, hashmarkIndex));
        url += (-1 === url.indexOf("?") ? "?" : "&") + serializedParams;
      }
      return url;
    };
  }, {
    "./../utils": 28
  } ],
  20: [ function(require, module, exports) {
    "use strict";
    module.exports = function combineURLs(baseURL, relativeURL) {
      return relativeURL ? baseURL.replace(/\/+$/, "") + "/" + relativeURL.replace(/^\/+/, "") : baseURL;
    };
  }, {} ],
  21: [ function(require, module, exports) {
    "use strict";
    var utils = require("./../utils");
    module.exports = utils.isStandardBrowserEnv() ? function standardBrowserEnv() {
      return {
        write: function write(name, value, expires, path, domain, secure) {
          var cookie = [];
          cookie.push(name + "=" + encodeURIComponent(value));
          utils.isNumber(expires) && cookie.push("expires=" + new Date(expires).toGMTString());
          utils.isString(path) && cookie.push("path=" + path);
          utils.isString(domain) && cookie.push("domain=" + domain);
          true === secure && cookie.push("secure");
          document.cookie = cookie.join("; ");
        },
        read: function read(name) {
          var match = document.cookie.match(new RegExp("(^|;\\s*)(" + name + ")=([^;]*)"));
          return match ? decodeURIComponent(match[3]) : null;
        },
        remove: function remove(name) {
          this.write(name, "", Date.now() - 864e5);
        }
      };
    }() : function nonStandardBrowserEnv() {
      return {
        write: function write() {},
        read: function read() {
          return null;
        },
        remove: function remove() {}
      };
    }();
  }, {
    "./../utils": 28
  } ],
  22: [ function(require, module, exports) {
    "use strict";
    module.exports = function isAbsoluteURL(url) {
      return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
    };
  }, {} ],
  23: [ function(require, module, exports) {
    "use strict";
    module.exports = function isAxiosError(payload) {
      return "object" === typeof payload && true === payload.isAxiosError;
    };
  }, {} ],
  24: [ function(require, module, exports) {
    "use strict";
    var utils = require("./../utils");
    module.exports = utils.isStandardBrowserEnv() ? function standardBrowserEnv() {
      var msie = /(msie|trident)/i.test(navigator.userAgent);
      var urlParsingNode = document.createElement("a");
      var originURL;
      function resolveURL(url) {
        var href = url;
        if (msie) {
          urlParsingNode.setAttribute("href", href);
          href = urlParsingNode.href;
        }
        urlParsingNode.setAttribute("href", href);
        return {
          href: urlParsingNode.href,
          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, "") : "",
          host: urlParsingNode.host,
          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, "") : "",
          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, "") : "",
          hostname: urlParsingNode.hostname,
          port: urlParsingNode.port,
          pathname: "/" === urlParsingNode.pathname.charAt(0) ? urlParsingNode.pathname : "/" + urlParsingNode.pathname
        };
      }
      originURL = resolveURL(window.location.href);
      return function isURLSameOrigin(requestURL) {
        var parsed = utils.isString(requestURL) ? resolveURL(requestURL) : requestURL;
        return parsed.protocol === originURL.protocol && parsed.host === originURL.host;
      };
    }() : function nonStandardBrowserEnv() {
      return function isURLSameOrigin() {
        return true;
      };
    }();
  }, {
    "./../utils": 28
  } ],
  25: [ function(require, module, exports) {
    "use strict";
    var utils = require("../utils");
    module.exports = function normalizeHeaderName(headers, normalizedName) {
      utils.forEach(headers, function processHeader(value, name) {
        if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
          headers[normalizedName] = value;
          delete headers[name];
        }
      });
    };
  }, {
    "../utils": 28
  } ],
  26: [ function(require, module, exports) {
    "use strict";
    var utils = require("./../utils");
    var ignoreDuplicateOf = [ "age", "authorization", "content-length", "content-type", "etag", "expires", "from", "host", "if-modified-since", "if-unmodified-since", "last-modified", "location", "max-forwards", "proxy-authorization", "referer", "retry-after", "user-agent" ];
    module.exports = function parseHeaders(headers) {
      var parsed = {};
      var key;
      var val;
      var i;
      if (!headers) return parsed;
      utils.forEach(headers.split("\n"), function parser(line) {
        i = line.indexOf(":");
        key = utils.trim(line.substr(0, i)).toLowerCase();
        val = utils.trim(line.substr(i + 1));
        if (key) {
          if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) return;
          parsed[key] = "set-cookie" === key ? (parsed[key] ? parsed[key] : []).concat([ val ]) : parsed[key] ? parsed[key] + ", " + val : val;
        }
      });
      return parsed;
    };
  }, {
    "./../utils": 28
  } ],
  27: [ function(require, module, exports) {
    "use strict";
    module.exports = function spread(callback) {
      return function wrap(arr) {
        return callback.apply(null, arr);
      };
    };
  }, {} ],
  28: [ function(require, module, exports) {
    "use strict";
    var bind = require("./helpers/bind");
    var toString = Object.prototype.toString;
    function isArray(val) {
      return "[object Array]" === toString.call(val);
    }
    function isUndefined(val) {
      return "undefined" === typeof val;
    }
    function isBuffer(val) {
      return null !== val && !isUndefined(val) && null !== val.constructor && !isUndefined(val.constructor) && "function" === typeof val.constructor.isBuffer && val.constructor.isBuffer(val);
    }
    function isArrayBuffer(val) {
      return "[object ArrayBuffer]" === toString.call(val);
    }
    function isFormData(val) {
      return "undefined" !== typeof FormData && val instanceof FormData;
    }
    function isArrayBufferView(val) {
      var result;
      result = "undefined" !== typeof ArrayBuffer && ArrayBuffer.isView ? ArrayBuffer.isView(val) : val && val.buffer && val.buffer instanceof ArrayBuffer;
      return result;
    }
    function isString(val) {
      return "string" === typeof val;
    }
    function isNumber(val) {
      return "number" === typeof val;
    }
    function isObject(val) {
      return null !== val && "object" === typeof val;
    }
    function isPlainObject(val) {
      if ("[object Object]" !== toString.call(val)) return false;
      var prototype = Object.getPrototypeOf(val);
      return null === prototype || prototype === Object.prototype;
    }
    function isDate(val) {
      return "[object Date]" === toString.call(val);
    }
    function isFile(val) {
      return "[object File]" === toString.call(val);
    }
    function isBlob(val) {
      return "[object Blob]" === toString.call(val);
    }
    function isFunction(val) {
      return "[object Function]" === toString.call(val);
    }
    function isStream(val) {
      return isObject(val) && isFunction(val.pipe);
    }
    function isURLSearchParams(val) {
      return "undefined" !== typeof URLSearchParams && val instanceof URLSearchParams;
    }
    function trim(str) {
      return str.replace(/^\s*/, "").replace(/\s*$/, "");
    }
    function isStandardBrowserEnv() {
      if ("undefined" !== typeof navigator && ("ReactNative" === navigator.product || "NativeScript" === navigator.product || "NS" === navigator.product)) return false;
      return "undefined" !== typeof window && "undefined" !== typeof document;
    }
    function forEach(obj, fn) {
      if (null === obj || "undefined" === typeof obj) return;
      "object" !== typeof obj && (obj = [ obj ]);
      if (isArray(obj)) for (var i = 0, l = obj.length; i < l; i++) fn.call(null, obj[i], i, obj); else for (var key in obj) Object.prototype.hasOwnProperty.call(obj, key) && fn.call(null, obj[key], key, obj);
    }
    function merge() {
      var result = {};
      function assignValue(val, key) {
        isPlainObject(result[key]) && isPlainObject(val) ? result[key] = merge(result[key], val) : isPlainObject(val) ? result[key] = merge({}, val) : isArray(val) ? result[key] = val.slice() : result[key] = val;
      }
      for (var i = 0, l = arguments.length; i < l; i++) forEach(arguments[i], assignValue);
      return result;
    }
    function extend(a, b, thisArg) {
      forEach(b, function assignValue(val, key) {
        a[key] = thisArg && "function" === typeof val ? bind(val, thisArg) : val;
      });
      return a;
    }
    function stripBOM(content) {
      65279 === content.charCodeAt(0) && (content = content.slice(1));
      return content;
    }
    module.exports = {
      isArray: isArray,
      isArrayBuffer: isArrayBuffer,
      isBuffer: isBuffer,
      isFormData: isFormData,
      isArrayBufferView: isArrayBufferView,
      isString: isString,
      isNumber: isNumber,
      isObject: isObject,
      isPlainObject: isPlainObject,
      isUndefined: isUndefined,
      isDate: isDate,
      isFile: isFile,
      isBlob: isBlob,
      isFunction: isFunction,
      isStream: isStream,
      isURLSearchParams: isURLSearchParams,
      isStandardBrowserEnv: isStandardBrowserEnv,
      forEach: forEach,
      merge: merge,
      extend: extend,
      trim: trim,
      stripBOM: stripBOM
    };
  }, {
    "./helpers/bind": 18
  } ],
  BaseView: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "9b015TiFVlD6o/Uc0WG1s2Z", "BaseView");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var Functions_1 = require("../Platform/Functions");
    var GameObjectPool_1 = require("../Platform/GameObjectPool");
    var SimpleReactive_1 = require("../Reactive/SimpleReactive");
    var ccclass = cc._decorator.ccclass;
    var BaseView = function(_super) {
      __extends(BaseView, _super);
      function BaseView() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.objNameMap = new Map();
        return _this;
      }
      BaseView.prototype.getObjFromMap = function(viewName) {
        var node = this.objNameMap.get(viewName);
        if (!node) {
          node = this.getNode(viewName);
          this.objNameMap.set(viewName, node);
        }
        if (!node) throw new Error("can't find node!");
        return node;
      };
      BaseView.prototype.getNode = function(name) {
        var names = name.split(".");
        var cur = this.node;
        for (var _i = 0, names_1 = names; _i < names_1.length; _i++) {
          var n = names_1[_i];
          cur = cur.getChildByName(n);
        }
        return cur;
      };
      BaseView.prototype.onEnable = function() {
        var _this = this;
        var go = cc.director.getScene().getChildByName("GameObjectPool");
        if (!go) {
          var go_1 = new cc.Node();
          go_1.name = "GameObjectPool";
          go_1.parent = cc.director.getScene();
          GameObjectPool_1.GameObjectPool.Init(go_1);
        }
        Functions_1.mySetTimeout(function() {
          _this.BindViewModel();
          _this.BindViewAction();
        });
      };
      BaseView.prototype.start = function() {
        var binds = this.GetViewModel();
        for (var _i = 0, binds_1 = binds; _i < binds_1.length; _i++) {
          var bindInfo = binds_1[_i];
          var selfNode = this.getNode(bindInfo.viewName);
          this.objNameMap.set(bindInfo.viewName, selfNode);
        }
      };
      BaseView.prototype.onDisable = function() {
        this.UnBindViewModel();
      };
      BaseView.prototype.BindViewModel = function() {
        var _this = this;
        var binds = this.GetViewModel();
        var _loop_1 = function(bindInfo) {
          try {
            var state_3 = bindInfo.state;
            Array.isArray(state_3) || (state_3 = [ state_3 ]);
            for (var _i = 0, state_1 = state_3; _i < state_1.length; _i++) {
              var info = state_1[_i];
              SimpleReactive_1.On(info.obj, info.key, function() {
                var bindFunc = bindInfo.bindFunc;
                bindFunc(_this.objNameMap.get(bindInfo.viewName), state_3[0].fun());
              });
              var bindFunc = bindInfo.bindFunc;
              bindFunc(this_1.objNameMap.get(bindInfo.viewName), state_3[0].fun());
            }
          } catch (e) {
            var state = bindInfo.state;
            Array.isArray(state) || (state = [ state ]);
            for (var _a = 0, state_2 = state; _a < state_2.length; _a++) {
              var info = state_2[_a];
              SimpleReactive_1.Clear(info.obj);
            }
            cc.log(e);
          }
        };
        var this_1 = this;
        for (var _i = 0, binds_2 = binds; _i < binds_2.length; _i++) {
          var bindInfo = binds_2[_i];
          _loop_1(bindInfo);
        }
      };
      BaseView.prototype.BindViewAction = function() {
        var binds = this.GetViewAction();
        var _loop_2 = function(bindInfo) {
          try {
            var node = this_2.getNode(bindInfo.viewName);
            "click" == bindInfo.type && node.on(cc.Node.EventType.TOUCH_START, function(touch) {
              bindInfo.bindFunc();
            });
          } catch (e) {
            cc.log(e);
          }
        };
        var this_2 = this;
        for (var _i = 0, binds_3 = binds; _i < binds_3.length; _i++) {
          var bindInfo = binds_3[_i];
          _loop_2(bindInfo);
        }
      };
      BaseView.prototype.UnBindViewModel = function() {
        var binds = this.GetViewModel();
        for (var _i = 0, binds_4 = binds; _i < binds_4.length; _i++) {
          var bindInfo = binds_4[_i];
          try {
            var state = bindInfo.state;
            Array.isArray(state) || (state = [ state ]);
            for (var _a = 0, state_4 = state; _a < state_4.length; _a++) {
              var info = state_4[_a];
              SimpleReactive_1.Clear(info.obj);
            }
          } catch (e) {
            cc.log(e);
          }
        }
      };
      BaseView = __decorate([ ccclass ], BaseView);
      return BaseView;
    }(cc.Component);
    exports.default = BaseView;
    cc._RF.pop();
  }, {
    "../Platform/Functions": "Functions",
    "../Platform/GameObjectPool": "GameObjectPool",
    "../Reactive/SimpleReactive": "SimpleReactive"
  } ],
  BindInfo: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "c22c9xYyPlEqZS89kKS2u51", "BindInfo");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    cc._RF.pop();
  }, {} ],
  CocosViewBindings: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "95aefkovblBwaUXZtYE3D7y", "CocosViewBindings");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.CocosViewBindings = void 0;
    var CocosViewBindings = function() {
      function CocosViewBindings() {}
      CocosViewBindings.prototype.bindGray = function(node, val) {
        val ? node.getComponent(cc.Sprite).setMaterial(0, cc.Material.getBuiltinMaterial(cc.Material.BUILTIN_NAME.GRAY_SPRITE)) : node.getComponent(cc.Sprite).setMaterial(0, cc.Material.getBuiltinMaterial(cc.Material.BUILTIN_NAME.SPRITE));
      };
      CocosViewBindings.prototype.bindWWWImg = function(node, val) {
        var sp = node.getComponent(cc.Sprite);
        if (!val) {
          sp.spriteFrame = null;
          return;
        }
        cc.assetManager.loadRemote(val, function(error, texture) {
          if (error) {
            cc.log(error);
            return;
          }
          var newSp = new cc.SpriteFrame(texture);
          sp.spriteFrame = newSp;
        });
      };
      CocosViewBindings.prototype.bindText = function(node, val) {
        if (null != val) {
          var label = node.getComponent(cc.Label);
          label.string = val;
        }
      };
      CocosViewBindings.prototype.bindShow = function(node, val) {
        node.active = val;
      };
      CocosViewBindings.prototype.bindHide = function(node, val) {
        node.active = !val;
      };
      CocosViewBindings.prototype.bindProgress = function(node, val) {
        var pro = node.getComponent(cc.ProgressBar);
        pro.progress = val;
      };
      CocosViewBindings.prototype.bindTween = function(node, val) {
        if (!val) return;
        cc.tween(node).by(val.time, val.opts).start();
      };
      CocosViewBindings.prototype.bindAnimStop = function(node, val) {
        val && cc.tween(node).stop();
      };
      CocosViewBindings.prototype.bindSprite = function(node, spInfo) {
        var sp = node.getComponent(cc.Sprite);
        cc.assetManager.loadBundle(spInfo.bundleName, function(error, bundle) {
          if (error) {
            cc.log(error);
            return;
          }
          bundle.load(spInfo.textureName, cc.SpriteFrame, null, function(error, spriteFrame) {
            if (error) {
              cc.log(error);
              return;
            }
            sp.spriteFrame = spriteFrame;
          });
        });
      };
      CocosViewBindings.prototype.bindAnimCom = function(node, val) {
        if (!val) {
          node.active = false;
          return;
        }
        node.active = true;
        var sp = node.getComponent(cc.Animation);
        sp.play("cd");
      };
      return CocosViewBindings;
    }();
    exports.CocosViewBindings = CocosViewBindings;
    cc._RF.pop();
  }, {} ],
  Export: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "eec347jn25KS5VqYM3ZKFUM", "Export");
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.ViewBindingsImp = void 0;
    var Global_1 = require("../Global");
    var CocosViewBindings_1 = require("./CocosViewBindings");
    var UnityViewBindings_1 = require("./UnityViewBindings");
    exports.ViewBindingsImp = Global_1.G_GameEngine == Global_1.GameEngine.CoCos ? new CocosViewBindings_1.CocosViewBindings() : new UnityViewBindings_1.UnityViewBindings();
    cc._RF.pop();
  }, {
    "../Global": "Global",
    "./CocosViewBindings": "CocosViewBindings",
    "./UnityViewBindings": "UnityViewBindings"
  } ],
  Functions: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "a0390/P40NAfbSgrpDAdmlg", "Functions");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.myUpdate = exports.mySetInterval = exports.myClearTimeout = exports.mySetTimeout = void 0;
    var generateId = 0;
    var Functions = function() {
      function Functions() {
        this.updateItems = new Set();
      }
      Functions.prototype.Update = function(dt) {
        this.updateItems.forEach(function(item, key, set) {
          var _a, _b, _c;
          item.elipseTime += 1e3 * dt;
          if (void 0 != item.delayTime) {
            if (item.elipseTime > item.delayTime) {
              set.delete(item);
              null === (_a = item.callback) || void 0 === _a ? void 0 : _a.call(item);
              true;
              cc.log("delay excute id:" + item.generateId + " delay:" + item.delayTime);
            }
          } else if (void 0 != item.interval) {
            if (item.elipseTime >= item.interval) {
              item.elipseTime = item.elipseTime - item.interval;
              null === (_b = item.callback) || void 0 === _b ? void 0 : _b.call(item);
            }
          } else null === (_c = item.callback) || void 0 === _c ? void 0 : _c.call(item);
        });
      };
      Functions.prototype.Delay = function(time, func) {
        var info = {
          callback: func,
          elipseTime: 0,
          delayTime: time,
          generateId: generateId++
        };
        this.updateItems.add(info);
        return generateId - 1;
      };
      Functions.prototype.ScheduleUpdate = function(func, interval) {
        var info = {
          callback: func,
          elipseTime: 0,
          generateId: generateId++,
          interval: interval
        };
        this.updateItems.add(info);
        return generateId - 1;
      };
      Functions.prototype.UnScheduleUpdate = function(handle) {
        this.updateItems.forEach(function(value, key, set) {
          if (value.generateId == handle) {
            set.delete(value);
            true;
            cc.log("delay excute id:" + value.generateId + " delay:" + value.delayTime + " interval:" + value.interval);
            return;
          }
        });
      };
      Functions.Get = function() {
        this.ins || (this.ins = new Functions());
        return this.ins;
      };
      return Functions;
    }();
    function mySetTimeout(fun, time) {
      void 0 === time && (time = 0);
      return Functions.Get().Delay(time, fun);
    }
    exports.mySetTimeout = mySetTimeout;
    function myClearTimeout(handle) {
      Functions.Get().UnScheduleUpdate(handle);
    }
    exports.myClearTimeout = myClearTimeout;
    function mySetInterval(fun, interval) {
      return Functions.Get().ScheduleUpdate(fun, interval);
    }
    exports.mySetInterval = mySetInterval;
    function myUpdate(dt) {
      Functions.Get().Update(dt);
    }
    exports.myUpdate = myUpdate;
    cc._RF.pop();
  }, {} ],
  GameAction: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "49792FEyNhGnZ2sFLfsNHfu", "GameAction");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.GameAction = void 0;
    var Math_1 = require("../Math/Math");
    var Msgs_1 = require("../Network/Msgs");
    var Network_1 = require("../Network/Network");
    var Functions_1 = require("../Platform/Functions");
    var GameModel_1 = require("./GameModel");
    var GlobalEvent_1 = require("./GlobalEvent");
    var GameAction = function() {
      function GameAction() {}
      GameAction.stopLoop = function() {
        -1 != this._loopHandler && Functions_1.myClearTimeout(this._loopHandler);
        this._loopHandler = -1;
      };
      GameAction.StartHitting = function() {
        var _this = this;
        GameModel_1.default.mutations.SetState(GameModel_1.GameState.HITTING);
        this._loopHandler = Functions_1.mySetInterval(function() {
          _this.gameLoop();
        });
      };
      GameAction.saying = function() {
        this.stopLoop();
        0 == GameModel_1.default.model.curStage && this.sendStartToServer();
        GameModel_1.default.mutations.SetState(GameModel_1.GameState.SAYING);
      };
      GameAction.Start = function() {
        var _this = this;
        if (!GameModel_1.default.model.sGetMissionInfo) return;
        this.stopLoop();
        GameModel_1.default.mutations.SetState(GameModel_1.GameState.CDING);
        Functions_1.mySetTimeout(function() {
          _this.saying();
        }, 3e3);
      };
      GameAction.SuperHit = function(superExcute) {
        if (GameModel_1.default.model.superIng) {
          var hited = [];
          for (var i = 1; i <= GameModel_1.default.model.holeNum; i++) {
            var mouse = GameModel_1.default.getters.GetMouse(i);
            if (mouse.state != GameModel_1.MouseState.None && mouse.state != GameModel_1.MouseState.Dead) {
              GameModel_1.default.mutations.SetMouseState(i, GameModel_1.MouseState.Hitted);
              mouse.ai.sMole.score >= 0 && GameModel_1.default.mutations.SetScoreWithHistory(GameModel_1.default.model.score + mouse.ai.sMole.score);
              hited.push(i);
            }
          }
          superExcute(hited);
          GameModel_1.default.mutations.SetContinuousScore(0);
          GameModel_1.default.mutations.SetIsSupering(false);
          this.sendScoreChange();
          GameModel_1.default.mutations.SetAudioEffect(GameModel_1.AudioEffect.Light);
          return true;
        }
        return false;
      };
      GameAction.OverByScore = function() {
        if (GameModel_1.default.getters.CanOverGameByScore()) {
          this.EndGame();
          return true;
        }
        return false;
      };
      GameAction.HitMouse = function(mouseIndex, fly, fail, lighing) {
        var _a, _b;
        if (GameModel_1.default.model.state != GameModel_1.GameState.HITTING) return;
        var isSuperHit = this.SuperHit(lighing);
        if (isSuperHit) {
          this.OverByScore();
          return;
        }
        var mouse = GameModel_1.default.getters.GetMouse(mouseIndex);
        if (GameModel_1.default.getters.CannotHitState(mouse.state)) return;
        GameModel_1.default.mutations.SetMouseState(mouseIndex, GameModel_1.MouseState.Hitted);
        if (1 == (null === (_a = mouse.ai.sMole) || void 0 === _a ? void 0 : _a.tappable)) {
          GameModel_1.default.mutations.SetContinuousScore(GameModel_1.default.model.continuousScore + mouse.ai.sMole.score);
          GameModel_1.default.mutations.SetScoreWithHistory(GameModel_1.default.model.score + mouse.ai.sMole.score);
          fly();
          GameModel_1.default.mutations.SetAudioEffect(GameModel_1.AudioEffect.Hit);
        } else if (0 == (null === (_b = mouse.ai.sMole) || void 0 === _b ? void 0 : _b.tappable)) {
          GameModel_1.default.mutations.SetContinuousScore(0);
          GameModel_1.default.mutations.SetScoreWithHistory(GameModel_1.default.model.score + mouse.ai.sMole.score);
          fail("" + mouse.ai.sMole.score);
          GameModel_1.default.mutations.SetAudioEffect(GameModel_1.AudioEffect.Error);
        }
        this.sendScoreChange();
        if (this.OverByScore()) return;
        GameModel_1.default.model.continuousScore >= GameModel_1.default.model.superScore && GameModel_1.default.mutations.SetIsSupering(true);
      };
      GameAction.NotHit = function(superExcute) {
        var isSuperHit = this.SuperHit(superExcute);
        GameModel_1.default.mutations.SetContinuousScore(0);
        if (isSuperHit) {
          this.OverByScore();
          return;
        }
        GameModel_1.default.mutations.SetAudioEffect(GameModel_1.AudioEffect.Unhit);
      };
      GameAction.sendEndToServer = function() {
        var _a;
        this.sendScoreChange();
        var msg = new Msgs_1.CMisstionComplete();
        msg.missionNum = GameModel_1.default.model.appInfo.missionNum;
        msg.missionScore = GameModel_1.default.model.score;
        msg.totalScore = (null === (_a = GameModel_1.default.model.sGetPlayerInfo) || void 0 === _a ? void 0 : _a.totalScore) + GameModel_1.default.model.score;
        msg.userId = GameModel_1.default.model.appInfo.userId;
        Network_1.Network.RpcSendOnly(msg);
      };
      GameAction.sendScoreChange = function() {
        var msg = new Msgs_1.CPlayerScoreChange();
        msg.roomId = GameModel_1.default.model.appInfo.roomId;
        msg.gameStatus = GameModel_1.default.model.state == GameModel_1.GameState.HITTING ? Msgs_1.SGameState.ING : Msgs_1.SGameState.ENDING;
        msg.missionNum = GameModel_1.default.model.appInfo.missionNum;
        msg.score = GameModel_1.default.model.score;
        msg.totalScore = GameModel_1.default.model.sGetPlayerInfo.totalScore;
        msg.userId = GameModel_1.default.model.appInfo.userId;
        Network_1.Network.RpcSendOnly(msg);
      };
      GameAction.sendStartToServer = function() {
        var msg = new Msgs_1.CMisstionStart();
        msg.missionNum = GameModel_1.default.model.appInfo.missionNum;
        msg.userId = GameModel_1.default.model.appInfo.userId;
        msg.roomId = GameModel_1.default.model.appInfo.roomId;
        Network_1.Network.RpcSendOnly(msg);
      };
      GameAction.EndGame = function() {
        this.stopLoop();
        GameModel_1.default.mutations.SetState(GameModel_1.GameState.ENDDING);
        this.sendEndToServer();
        this.GetRank();
      };
      GameAction.gameLoop = function() {
        var _this = this;
        var dt = cc.director.getDeltaTime();
        this.elipseTime += dt;
        var remain = GameModel_1.default.model.timeRemain - dt;
        remain <= 0;
        var intervalTime = GameModel_1.default.model.generateInterval;
        if (this.elipseTime >= intervalTime) {
          this.elipseTime = 0;
          var lastAppearMouse = GameModel_1.default.model.lastTriggerMouse;
          -1 != lastAppearMouse;
          var stateNoneMouses = GameModel_1.default.getters.GetMousesByFilter(function(mouse) {
            return mouse.state == GameModel_1.MouseState.None;
          });
          if (0 == GameModel_1.default.model.cachedMoleList.length) {
            this.stopLoop();
            Functions_1.mySetTimeout(function() {
              if (GameModel_1.default.model.curStage == GameModel_1.default.model.sGetMissionInfo.resourceList.length - 1) _this.EndGame(); else {
                GameModel_1.default.mutations.SetUpNewModelList(GameModel_1.default.model.sGetMissionInfo.resourceList[GameModel_1.default.model.curStage + 1].moleList);
                GameModel_1.default.mutations.SetCurStage(GameModel_1.default.model.curStage + 1);
                _this.saying();
              }
            }, 2e3);
            return;
          }
          var maxNumbers = GameModel_1.default.model.sGetMissionInfo.levelInfo.maxMoleNumber;
          if (maxNumbers) {
            var existingMouses = GameModel_1.default.getters.GetMousesByFilter(function(mouse) {
              return mouse.state != GameModel_1.MouseState.None;
            });
            if (existingMouses.length >= maxNumbers) return;
          }
          if (stateNoneMouses.length > 0) {
            var randomindex = Math_1.randomRangeInt(0, stateNoneMouses.length);
            GameModel_1.default.mutations.SetMouseStateByMouse(stateNoneMouses[randomindex], GameModel_1.MouseState.UpIng);
          }
        }
      };
      GameAction.GetMisstionInfo = function(missonId) {
        var send = new Msgs_1.CGetMissionInfo();
        send.missionNum = missonId;
        send.roomId = GameModel_1.default.model.appInfo.roomId;
        send.userId = GameModel_1.default.model.appInfo.userId;
        return Network_1.Network.Rpc(send).then(function(msg) {
          GameModel_1.default.mutations.SetMissionInfo(msg);
          for (var _i = 0, _a = msg.resourceList[0].moleList; _i < _a.length; _i++) {
            var mole = _a[_i];
            var url = mole.imgUrl;
            try {
              cc.assetManager.loadAny({
                url: url
              });
            } catch (_b) {}
          }
          cc.assetManager.loadAny({
            url: msg.resourceList[0].audioUrl
          });
        });
      };
      GameAction.GetPlayerInfo = function() {
        var playerInfo = new Msgs_1.CGetPlayerInfo();
        playerInfo.roomId = GameModel_1.default.model.appInfo.roomId;
        playerInfo.userId = GameModel_1.default.model.appInfo.userId;
        Network_1.Network.Rpc(playerInfo).then(function(msg) {
          GameModel_1.default.mutations.SetPlayerInfo(msg);
        });
      };
      GameAction.Replay = function() {
        GameModel_1.default.mutations.SetContinuousScore(0);
        GameModel_1.default.mutations.SetCurStage(0);
        GameModel_1.default.mutations.SetScore(0);
        GameModel_1.default.mutations.SetUpNewModelList(GameModel_1.default.model.sGetMissionInfo.resourceList[0].moleList);
        this.Start();
      };
      GameAction.Next = function() {
        var _a;
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_b) {
            switch (_b.label) {
             case 0:
              GameModel_1.default.model.appInfo.missionNum = (null === (_a = GameModel_1.default.model.appInfo) || void 0 === _a ? void 0 : _a.missionNum) + 1;
              GameModel_1.default.mutations.SetPlayerInfo(GameModel_1.default.model.sGetPlayerInfo);
              return [ 4, GameAction.GetMisstionInfo(GameModel_1.default.model.appInfo.missionNum) ];

             case 1:
              _b.sent();
              GameModel_1.default.mutations.SetScore(0);
              this.Start();
              return [ 2 ];
            }
          });
        });
      };
      GameAction.GetRank = function() {
        return __awaiter(this, void 0, void 0, function() {
          var msg, res;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              msg = new Msgs_1.CGetCurRank();
              msg.missionNum = GameModel_1.default.model.appInfo.missionNum;
              msg.roomId = GameModel_1.default.model.appInfo.roomId;
              msg.userId = GameModel_1.default.model.appInfo.userId;
              return [ 4, Network_1.Network.Rpc(msg) ];

             case 1:
              res = _a.sent();
              GameModel_1.default.mutations.SetCurRankInfo(res);
              return [ 2 ];
            }
          });
        });
      };
      GameAction.GetGameDescription = function() {
        return __awaiter(this, void 0, void 0, function() {
          var msg, res;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              msg = new Msgs_1.CGetGameDescription();
              return [ 4, Network_1.Network.Rpc(msg) ];

             case 1:
              res = _a.sent();
              GameModel_1.default.mutations.SetGameDescription(res);
              return [ 2 ];
            }
          });
        });
      };
      GameAction.SelectMisstion = function(missition) {
        var _a, _b;
        var appInfo = GameModel_1.default.model.appInfo;
        appInfo.missionNum = missition;
        null === (_a = GlobalEvent_1.GlobalEvent.SetGameing) || void 0 === _a ? void 0 : _a.call(GlobalEvent_1.GlobalEvent, true);
        null === (_b = GlobalEvent_1.GlobalEvent.SetSelect) || void 0 === _b ? void 0 : _b.call(GlobalEvent_1.GlobalEvent, false);
      };
      GameAction._loopHandler = -1;
      GameAction.elipseTime = 0;
      return GameAction;
    }();
    exports.GameAction = GameAction;
    cc._RF.pop();
  }, {
    "../Math/Math": "Math",
    "../Network/Msgs": "Msgs",
    "../Network/Network": "Network",
    "../Platform/Functions": "Functions",
    "./GameModel": "GameModel",
    "./GlobalEvent": "GlobalEvent"
  } ],
  GameModel: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "7f13d2iJSxAPaGzsNK4r6j9", "GameModel");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.AudioEffect = exports.MouseState = exports.GameState = void 0;
    var Math_1 = require("../Math/Math");
    var Functions_1 = require("../Platform/Functions");
    var SimpleReactive_1 = require("../Reactive/SimpleReactive");
    var GameState;
    (function(GameState) {
      GameState[GameState["PRESTART"] = 0] = "PRESTART";
      GameState[GameState["CDING"] = 1] = "CDING";
      GameState[GameState["HITTING"] = 2] = "HITTING";
      GameState[GameState["ENDDING"] = 3] = "ENDDING";
      GameState[GameState["SAYING"] = 4] = "SAYING";
    })(GameState = exports.GameState || (exports.GameState = {}));
    var MouseState;
    (function(MouseState) {
      MouseState[MouseState["None"] = 0] = "None";
      MouseState[MouseState["DownIng"] = 1] = "DownIng";
      MouseState[MouseState["UpIng"] = 2] = "UpIng";
      MouseState[MouseState["Staying"] = 3] = "Staying";
      MouseState[MouseState["NotHitted"] = 4] = "NotHitted";
      MouseState[MouseState["Hitted"] = 5] = "Hitted";
      MouseState[MouseState["Dead"] = 6] = "Dead";
    })(MouseState = exports.MouseState || (exports.MouseState = {}));
    var AudioEffect;
    (function(AudioEffect) {
      AudioEffect[AudioEffect["Error"] = 0] = "Error";
      AudioEffect[AudioEffect["Hit"] = 1] = "Hit";
      AudioEffect[AudioEffect["Unhit"] = 2] = "Unhit";
      AudioEffect[AudioEffect["Light"] = 3] = "Light";
      AudioEffect[AudioEffect["NaN"] = 4] = "NaN";
    })(AudioEffect = exports.AudioEffect || (exports.AudioEffect = {}));
    var normalAI = {
      level: 1,
      stayingTimer: .5,
      upTimer: .8,
      downTimer: .8,
      sMole: null
    };
    var _modelPrototype = {
      timeRemain: Number.MAX_VALUE,
      name: "",
      misstionAlertTxt: "",
      hammerType: 0,
      score: 0,
      hittedMouse: 0,
      systemAlertTxt: "",
      state: GameState.PRESTART,
      mouses: {},
      continuousScore: 0,
      superIng: false,
      superScore: 6,
      holeNum: 9,
      lastTriggerMouse: -1,
      appearMouse: 0,
      generateInterval: 1.3,
      notifies: [],
      isLoading: false,
      audioEffect: AudioEffect.NaN,
      appInfo: null,
      sGetMissionInfo: null,
      sGetPlayerInfo: null,
      sGetCurRank: null,
      cachedMoleList: [],
      sGetHisRank: null,
      curStage: -1,
      sGetGameDescription: null,
      misstionCount: 0
    };
    var model = {};
    function SpawnModel() {
      for (var key in _modelPrototype) model[key] = _modelPrototype[key];
    }
    SpawnModel();
    var helper = {
      selectOneMole: function() {
        var moles = model.cachedMoleList;
        if (0 == moles.length) {
          model.cachedMoleList = helper.deepCopy(model.sGetMissionInfo.resourceList[model.curStage].moleList);
          return;
        }
        if (1 == moles.length) {
          var ret_1 = moles[0];
          model.cachedMoleList = [];
          return ret_1;
        }
        var index = Math_1.randomRangeInt(0, moles.length);
        var ret = moles[index];
        moles.splice(index, 1);
        return ret;
      },
      deepCopy: function(sourceData) {
        var _this = this;
        if (Array.isArray(sourceData)) return sourceData.map(function(item) {
          return _this.deepCopy(item);
        });
        var obj = {};
        for (var key in sourceData) "object" === typeof sourceData[key] && null !== sourceData[key] ? obj[key] = this.deepCopy(sourceData[key]) : obj[key] = sourceData[key];
        return obj;
      }
    };
    for (var i = 1; i <= model.holeNum; i++) {
      var mouse = {
        timerHandlers: [],
        state: MouseState.None,
        ai: helper.deepCopy(normalAI)
      };
      mouse.ai.level = Math_1.randomRangeInt(1, 6);
      model.mouses[i.toString()] = mouse;
    }
    var getters = {
      GetCanNextByFinalMisstionNum: function() {
        true;
        cc.warn("finalMissionNum:" + model.appInfo.finalMissionNum + " missionNum:" + model.appInfo.missionNum);
        if (0 == model.appInfo.finalMissionNum) return true;
        var curMisstion = model.appInfo.missionNum;
        if (curMisstion >= model.appInfo.finalMissionNum) return false;
        return true;
      },
      GetMouse: function(index) {
        return model.mouses[index.toString()];
      },
      GetMousesByFilter: function(filter) {
        var ret = [];
        for (var i = 1; i <= model.holeNum; i++) {
          var mm = getters.GetMouse(i);
          filter(mm) && ret.push(mm);
        }
        return ret;
      },
      CanOverGameByScore: function() {
        if (model.score >= model.sGetMissionInfo.passingScore) return true;
        if (model.score <= model.sGetMissionInfo.negativeScore) return true;
        return false;
      },
      CannotHitState: function(state) {
        if (state == MouseState.Hitted || state == MouseState.Dead || state == MouseState.None) return true;
        return false;
      },
      FormatNumber: function(n) {
        return n.toString();
      }
    };
    var clearMouseHandler = function(mouse) {
      for (var _i = 0, _a = mouse.timerHandlers; _i < _a.length; _i++) {
        var handle = _a[_i];
        Functions_1.myClearTimeout(handle);
      }
      mouse.timerHandlers = [];
    };
    var mutations = {
      SetName: function(name) {
        SimpleReactive_1.Emit(model, "name", name);
      },
      SetState: function(state) {
        true;
        cc.log("SetState" + state);
        SimpleReactive_1.Emit(model, "state", state);
      },
      SetMouseStateByMouse: function(mouse, state) {
        for (var key in model.mouses) model.mouses[key] == mouse && mutations.SetMouseState(parseInt(key), state);
      },
      SetMouseState: function(index, state) {
        var mouse = model.mouses[index.toString()];
        if (mouse.state == state) return;
        if (state == MouseState.Hitted) {
          clearMouseHandler(mouse);
          mouse.timerHandlers.push(Functions_1.mySetTimeout(function() {
            mutations.SetMouseState(index, MouseState.Dead);
            Functions_1.mySetTimeout(function() {
              mutations.SetMouseState(index, MouseState.None);
            }, 100);
          }, 500));
        }
        state == MouseState.Dead && (mouse.ai.level = Math_1.randomRangeInt(1, 6));
        if (mouse.state == MouseState.None && state == MouseState.UpIng) {
          mouse.ai.sMole = helper.selectOneMole();
          model.lastTriggerMouse = index;
          mouse.timerHandlers.push(Functions_1.mySetTimeout(function() {
            mutations.SetMouseState(index, MouseState.Staying);
          }, 1e3 * mouse.ai.upTimer));
          mouse.timerHandlers.push(Functions_1.mySetTimeout(function() {
            mutations.SetMouseState(index, MouseState.DownIng);
          }, 1e3 * mouse.ai.upTimer + 1e3 * mouse.ai.stayingTimer));
          mouse.timerHandlers.push(Functions_1.mySetTimeout(function() {
            mutations.SetMouseState(index, MouseState.None);
          }, 1e3 * mouse.ai.upTimer + 1e3 * mouse.ai.stayingTimer + 1e3 * mouse.ai.downTimer));
        }
        mouse.state = state;
        SimpleReactive_1.Emit(model.mouses, index.toString(), mouse);
      },
      SetRemain: function(remain) {
        SimpleReactive_1.Emit(model, "timeRemain", remain);
      },
      SetScoreWithHistory: function(score) {
        var diff = score - model.score;
        model.score = score;
        model.sGetPlayerInfo.totalScore += diff;
        SimpleReactive_1.Emit(model, "score", score);
        SimpleReactive_1.Emit(model, "sGetPlayerInfo", model.sGetPlayerInfo);
      },
      SetScore: function(score) {
        SimpleReactive_1.Emit(model, "score", score);
      },
      SetContinuousScore: function(continuousScore) {
        SimpleReactive_1.Emit(model, "continuousScore", continuousScore);
      },
      SetIsSupering: function(isSupering) {
        SimpleReactive_1.Emit(model, "superIng", isSupering);
      },
      SetAppearNumGrow: function(num) {
        num ? model.appearMouse = 0 : model.appearMouse++;
        SimpleReactive_1.Emit(model, "appearMouse", model.appearMouse);
      },
      ResetModel: function() {
        SpawnModel();
        for (var i = 1; i <= model.holeNum; i++) {
          var mouse = getters.GetMouse(i);
          mouse.ai.level = Math_1.clamp(mouse.ai.level + 1, 1, 4);
        }
      },
      SetNotify: function(msg) {
        model.notifies.push(msg);
        SimpleReactive_1.Emit(model, "notifies", model.notifies);
      },
      SetLoading: function(loading) {
        SimpleReactive_1.Emit(model, "isLoading", loading);
      },
      SetAudioEffect: function(effect) {
        SimpleReactive_1.Emit(model, "audioEffect", effect);
      },
      SetMisstionCount: function(num) {
        SimpleReactive_1.Emit(model, "misstionCount", num);
      },
      SetMissionInfo: function(info) {
        model.superScore = info.hitAllScore;
        model.curStage = 0;
        model.cachedMoleList = helper.deepCopy(info.resourceList[model.curStage].moleList);
        for (var i = 1; i <= model.holeNum; i++) {
          var mouse = getters.GetMouse(i);
          if (info.levelInfo.stayingTimer) {
            mouse.ai.downTimer = info.levelInfo.downTimer;
            mouse.ai.stayingTimer = info.levelInfo.stayingTimer;
            mouse.ai.upTimer = info.levelInfo.upTimer;
            model.generateInterval = info.levelInfo.generateInterval;
          }
          SimpleReactive_1.Emit(model.mouses, i.toString(), mouse);
        }
        SimpleReactive_1.Emit(model, "sGetMissionInfo", info);
      },
      SetPlayerInfo: function(info) {
        SimpleReactive_1.Emit(model, "sGetPlayerInfo", info);
      },
      SetCurRankInfo: function(info) {
        SimpleReactive_1.Emit(model, "sGetCurRank", info);
      },
      SetHisRankInfo: function(info) {
        SimpleReactive_1.Emit(model, "sGetHisRank", info);
      },
      SetCurStage: function(stage) {
        SimpleReactive_1.Emit(model, "curStage", stage);
      },
      SetUpNewModelList: function(mole) {
        var newModels = helper.deepCopy(mole);
        SimpleReactive_1.Emit(model, "cachedMoleList", newModels);
      },
      SetGameDescription: function(msg) {
        SimpleReactive_1.Emit(model, "sGetGameDescription", msg);
      }
    };
    exports.default = {
      model: model,
      getters: getters,
      mutations: mutations
    };
    cc._RF.pop();
  }, {
    "../Math/Math": "Math",
    "../Platform/Functions": "Functions",
    "../Reactive/SimpleReactive": "SimpleReactive"
  } ],
  GameObjectPool: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "1fb90FPr4FNM7JMEg7cSBo8", "GameObjectPool");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.GameObjectPool = void 0;
    var GameObjectPool = function() {
      function GameObjectPool() {}
      GameObjectPool.prototype.GameObjectPool = function() {};
      GameObjectPool.keyMaker = function(bundleName, assetName) {
        return bundleName + assetName;
      };
      GameObjectPool.pushNode = function(pool, key, node) {
        var ar = pool.get(key);
        if (!ar) {
          pool.set(key, [ node ]);
          return;
        }
        ar.push(node);
      };
      GameObjectPool.moveNode = function(from, to, key, node) {
        var ar = from.get(key);
        if (!ar) {
          cc.log("move error:can not find key:" + key);
          return;
        }
        for (var i = ar.length - 1; i >= 0; i--) if (ar[i] == node) {
          var target = node;
          ar.splice(i, 1);
          break;
        }
        if (!target) {
          cc.log("move error:can not find node:" + node.name);
          return;
        }
        this.pushNode(to, key, node);
      };
      GameObjectPool.PreLoadBundle = function(bundleName) {
        cc.assetManager.loadBundle(bundleName);
      };
      GameObjectPool.Spawn = function(bundleName, assetName, callback, errorcb) {
        var _this = this;
        var key = this.keyMaker(bundleName, assetName);
        var freeNodes = this.freePool.get(key);
        if (freeNodes && freeNodes.length > 0) {
          var target = freeNodes[freeNodes.length - 1];
          this.moveNode(this.freePool, this.usedPool, key, target);
          return callback(target);
        }
        cc.assetManager.loadBundle(bundleName, function(error, bundle) {
          if (error) {
            cc.log(error);
            errorcb(error);
            return;
          }
          bundle.load(assetName, cc.Prefab, null, function(error, prefab) {
            if (error) {
              cc.log(error);
              errorcb(error);
              return;
            }
            var node = cc.instantiate(prefab);
            var k = _this.keyMaker(bundleName, assetName);
            _this.pushNode(_this.usedPool, k, node);
            callback(node);
          });
        });
      };
      GameObjectPool.SpawnSync = function(bundleName, assetName) {
        var _this = this;
        return new Promise(function(resolve, reject) {
          _this.Spawn(bundleName, assetName, function(node) {
            resolve(node);
          }, function(e) {
            reject(e);
          });
        });
      };
      GameObjectPool.Free = function(bundleName, assetName, node) {
        var key = this.keyMaker(bundleName, assetName);
        this.moveNode(this.usedPool, this.freePool, key, node);
        node.parent = this.root;
      };
      GameObjectPool.Init = function(parent) {
        this.root = new cc.Node();
        this.root.active = false;
        parent.addChild(this.root);
      };
      GameObjectPool.freePool = new Map();
      GameObjectPool.usedPool = new Map();
      return GameObjectPool;
    }();
    exports.GameObjectPool = GameObjectPool;
    cc._RF.pop();
  }, {} ],
  GameViewModel: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "1842drc8YxP5Jkb0vJoOYvw", "GameViewModel");
    var _a;
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var Math_1 = require("../Math/Math");
    var Msgs_1 = require("../Network/Msgs");
    var Network_1 = require("../Network/Network");
    var Export_1 = require("../Platform/Export");
    var Functions_1 = require("../Platform/Functions");
    var GameObjectPool_1 = require("../Platform/GameObjectPool");
    var SimpleReactive_1 = require("../Reactive/SimpleReactive");
    var GameAction_1 = require("./GameAction");
    var GameModel_1 = require("./GameModel");
    var ResultMode;
    (function(ResultMode) {
      ResultMode[ResultMode["Result"] = 0] = "Result";
      ResultMode[ResultMode["HistoryRank"] = 1] = "HistoryRank";
      ResultMode[ResultMode["CurRank"] = 2] = "CurRank";
    })(ResultMode || (ResultMode = {}));
    var viewModel = {
      showSelect: false,
      hammerType: 1,
      resultMode: ResultMode.Result,
      audio: null
    };
    var score = {
      fun: function() {
        return GameModel_1.default.getters.FormatNumber(Math.max(GameModel_1.default.model.score, 0));
      },
      key: "score",
      obj: GameModel_1.default.model
    };
    var hisScore = {
      fun: function() {
        var _a, _b;
        return GameModel_1.default.getters.FormatNumber(Math.max(0, null !== (_b = null === (_a = GameModel_1.default.model.sGetPlayerInfo) || void 0 === _a ? void 0 : _a.totalScore) && void 0 !== _b ? _b : 0));
      },
      key: "sGetPlayerInfo",
      obj: GameModel_1.default.model
    };
    var setSpriteFrame = function(node, bundleName, resName) {
      var sp = node.getComponent(cc.Sprite);
      cc.assetManager.loadBundle(bundleName, function(error, bundle) {
        if (error) {
          cc.log(error);
          return;
        }
        bundle.load(resName, cc.SpriteFrame, null, function(error, spriteFrame) {
          if (error) {
            cc.log(error);
            return;
          }
          sp.spriteFrame = spriteFrame;
        });
      });
    };
    var effectMap = (_a = {}, _a[GameModel_1.AudioEffect.Error] = "error", _a[GameModel_1.AudioEffect.Hit] = "hit", 
    _a[GameModel_1.AudioEffect.Unhit] = "unhit", _a[GameModel_1.AudioEffect.NaN] = "nan", 
    _a[GameModel_1.AudioEffect.Light] = "lighting", _a);
    var bindAudio = function(effectNode, effect) {
      var childName = effectMap[effect];
      for (var _i = 0, _a = effectNode.children; _i < _a.length; _i++) {
        var child = _a[_i];
        if (child.name == childName) {
          child.active = true;
          var audio = child.getComponent(cc.AudioSource);
          audio.play();
          audio.setCurrentTime(0);
        } else child.active = false;
      }
    };
    var bindSingleAudio = function(node, val) {
      var audio = node.getComponent(cc.AudioSource);
      val ? audio.play() : audio.stop();
    };
    var bindWWWAudio = function(effectNode, info) {
      if (!info || !info.url) {
        cc.audioEngine.stopMusic();
        return;
      }
      cc.assetManager.loadRemote(info.url, function(error, audio) {
        if (error) {
          cc.log(error);
          return;
        }
        cc.audioEngine.playMusic(audio, false);
        Functions_1.mySetTimeout(function() {
          var _a;
          null === (_a = info.callback) || void 0 === _a ? void 0 : _a.call(info);
        }, 1e3 * audio.duration);
      });
    };
    var bindAnim = function(node, val) {
      var anim = node.parent.parent.getComponent(cc.Animation);
      anim.stop();
      val.state == GameModel_1.MouseState.UpIng && cc.tween(node).by(val.ai.upTimer, {
        y: 280
      }).start();
      val.state == GameModel_1.MouseState.DownIng && cc.tween(node).by(val.ai.downTimer, {
        y: -280
      }).start();
      if (val.state == GameModel_1.MouseState.Hitted) {
        node.stopAllActions();
        if (GameModel_1.default.model.superIng) {
          setSpriteFrame(node, "Texture", "sd05");
          return;
        }
        anim.play("xuanyun1", 0);
        if (!val.ai.sMole) return;
        var level = Math_1.clamp(val.ai.sMole.moleType, 1, 6);
        var enableNum = 1 == val.ai.sMole.tappable ? 3 : 2;
        if (1 != val.ai.sMole.tappable) {
          setSpriteFrame(node, "Texture", "dishu0" + level + "_" + enableNum);
          return;
        }
      }
      if (val.state == GameModel_1.MouseState.None) {
        node.y = -280;
        if (!val.ai.sMole) return;
        var level = Math_1.clamp(val.ai.sMole.moleType, 1, 6);
        setSpriteFrame(node, "Texture", "dishu0" + level + "_1");
      }
    };
    var bindNotify = function(node, val) {
      if (!val || 0 == val.length) {
        node.active = false;
        return;
      }
      node.active = true;
      var msgContent = val[val.length - 1];
      var txt = node.children[0].getComponent(cc.Label);
      txt.string = msgContent.content;
      var anim = node.getComponent(cc.Animation);
      if (anim.currentClip) {
        var state = anim.getAnimationState("notify");
        state.stop ? anim.play("notify", 0) : anim.play("notify", 5 / 24);
        anim.currentClip.speed = 1 / anim.currentClip.duration * msgContent.showSeconds;
        return;
      }
      anim.play("notify", 0);
      anim.currentClip.speed = 1 / anim.currentClip.duration * msgContent.showSeconds;
    };
    var bindRank = function(nodeRank, info) {
      if (!info) return;
      var node = nodeRank.getChildByName("rankContent");
      var isIn = info.playerRanking <= info.rankingList.length;
      if (isIn) nodeRank.getChildByName("rankItem").active = false; else {
        var cur = nodeRank.getChildByName("rankItem");
        cur.active = true;
        cur.getChildByName("rank").getComponent(cc.Label).string = info.playerRanking.toString();
        cur.getChildByName("name").getComponent(cc.Label).string = GameModel_1.default.model.sGetPlayerInfo.playerName;
        viewModel.resultMode == ResultMode.CurRank ? cur.getChildByName("score").getComponent(cc.Label).string = GameModel_1.default.model.score.toString() : cur.getChildByName("score").getComponent(cc.Label).string = GameModel_1.default.model.sGetPlayerInfo.totalScore.toString();
      }
      var refreshNodeByInfo = function(cur, i) {
        cur.getChildByName("rank").getComponent(cc.Label).string = (i + 1).toString();
        cur.getChildByName("name").getComponent(cc.Label).string = info.rankingList[i].playerName;
        cur.getChildByName("score").getComponent(cc.Label).string = info.rankingList[i].playerScore.toString();
        var star = cur.getChildByName("xingxing");
        star && (star.active = i + 1 == info.playerRanking);
      };
      var total = Math.min(info.rankingList.length, 10);
      var _loop_2 = function(i) {
        var child = node.children[i];
        if (!info.rankingList[i]) {
          child && (child.active = false);
          return "continue";
        }
        if (child) {
          child.active = true;
          refreshNodeByInfo(child, i);
        } else GameObjectPool_1.GameObjectPool.SpawnSync("Prefab", "rankItem").then(function(itemNode) {
          node.active = true;
          node.addChild(itemNode);
          refreshNodeByInfo(itemNode, i);
        });
      };
      for (var i = 0; i < 10; i++) _loop_2(i);
    };
    var bindHammerSelect = function(node, info) {
      var sGetMissionInfo = info.sGetMissionInfo;
      var hammerType = info.hammerType;
      var score = info.score;
      if (!sGetMissionInfo) return;
      for (var i = 1; i <= 5; i++) {
        var curNode = node.getChildByName("chuizidi" + i);
        curNode.getChildByName("xuanze").active = i == hammerType;
        if (hammerType == i || score >= sGetMissionInfo.weaponList[i - 1].unlockScore) {
          curNode.children[0].getComponent(cc.Sprite).setMaterial(0, cc.Material.getBuiltinMaterial(cc.Material.BUILTIN_NAME.SPRITE));
          curNode.getComponent(cc.Sprite).setMaterial(0, cc.Material.getBuiltinMaterial(cc.Material.BUILTIN_NAME.SPRITE));
        } else {
          curNode.children[0].getComponent(cc.Sprite).setMaterial(0, cc.Material.getBuiltinMaterial(cc.Material.BUILTIN_NAME.GRAY_SPRITE));
          curNode.getComponent(cc.Sprite).setMaterial(0, cc.Material.getBuiltinMaterial(cc.Material.BUILTIN_NAME.GRAY_SPRITE));
        }
      }
    };
    var showRule = {
      fun: function() {
        return GameModel_1.default.model.state == GameModel_1.GameState.PRESTART;
      },
      key: "state",
      obj: GameModel_1.default.model
    };
    var ruleTxt = {
      fun: function() {
        var _a, _b;
        return null !== (_b = null === (_a = GameModel_1.default.model.sGetGameDescription) || void 0 === _a ? void 0 : _a.gameDescription) && void 0 !== _b ? _b : "";
      },
      key: "sGetGameDescription",
      obj: GameModel_1.default.model
    };
    var cdAnim = {
      fun: function() {
        return GameModel_1.default.model.state == GameModel_1.GameState.CDING;
      },
      key: "state",
      obj: GameModel_1.default.model
    };
    var misstion = {
      fun: function() {
        var _a, _b;
        return "\u7b2c" + (null !== (_b = null === (_a = GameModel_1.default.model.appInfo) || void 0 === _a ? void 0 : _a.missionNum) && void 0 !== _b ? _b : 1) + "\u5173";
      },
      key: "sGetPlayerInfo",
      obj: GameModel_1.default.model
    };
    var selectWeaponShow = [ {
      fun: function() {
        if (GameModel_1.default.model.state != GameModel_1.GameState.HITTING) return false;
        return viewModel.showSelect;
      },
      key: "showSelect",
      obj: viewModel
    }, {
      fun: null,
      key: "state",
      obj: GameModel_1.default.model
    } ];
    var weapenMode = [ {
      fun: function() {
        if (GameModel_1.default.model.score <= 0) {
          var hammerType = GameModel_1.default.model.score <= 0 ? 1 : viewModel.hammerType;
          viewModel.hammerType = 1;
        } else var hammerType = viewModel.hammerType;
        if (GameModel_1.default.model.superIng) {
          var info_1 = {
            bundleName: "Texture",
            textureName: "chuizi0" + hammerType + "_2"
          };
          return info_1;
        }
        var info = {
          bundleName: "Texture",
          textureName: "chuizi0" + hammerType + "_1"
        };
        return info;
      },
      key: "hammerType",
      obj: viewModel
    }, {
      fun: null,
      key: "superIng",
      obj: GameModel_1.default.model
    }, {
      fun: null,
      key: "score",
      obj: GameModel_1.default.model
    } ];
    var superWeapon = {
      fun: function() {
        var info = {
          bundleName: "Texture",
          textureName: "chuizi0" + viewModel.hammerType + "_" + (GameModel_1.default.model.superIng ? 2 : 1)
        };
        return info;
      },
      key: "superIng",
      obj: GameModel_1.default.model
    };
    var notifyContent = {
      fun: function() {
        return GameModel_1.default.model.notifies;
      },
      key: "notifies",
      obj: GameModel_1.default.model
    };
    var result = {
      fun: function() {
        return GameModel_1.default.model.state == GameModel_1.GameState.ENDDING;
      },
      key: "state",
      obj: GameModel_1.default.model
    };
    var resultScore = {
      fun: function() {
        return GameModel_1.default.model.score;
      },
      key: "score",
      obj: GameModel_1.default.model
    };
    var resultMisstion = {
      fun: function() {
        var _a, _b;
        return "\u7b2c" + (null !== (_b = null === (_a = GameModel_1.default.model.appInfo) || void 0 === _a ? void 0 : _a.missionNum) && void 0 !== _b ? _b : 1) + "\u5173";
      },
      key: "sGetPlayerInfo",
      obj: GameModel_1.default.model
    };
    var resultRank = {
      fun: function() {
        var _a, _b;
        return null !== (_b = null === (_a = GameModel_1.default.model.sGetCurRank) || void 0 === _a ? void 0 : _a.playerRanking) && void 0 !== _b ? _b : "1";
      },
      key: "sGetCurRank",
      obj: GameModel_1.default.model
    };
    var resultClose = {
      fun: function() {
        return viewModel.resultMode != ResultMode.Result;
      },
      key: "resultMode",
      obj: viewModel
    };
    var resultShow = {
      fun: function() {
        return viewModel.resultMode == ResultMode.Result;
      },
      key: "resultMode",
      obj: viewModel
    };
    var rankDesc = {
      fun: function() {
        return viewModel.resultMode == ResultMode.CurRank ? "\u5f53\u5173\u6392\u884c\u699c" : "\u5386\u53f2\u6392\u884c\u699c";
      },
      key: "resultMode",
      obj: viewModel
    };
    var loading = {
      fun: function() {
        return GameModel_1.default.model.isLoading;
      },
      key: "isLoading",
      obj: GameModel_1.default.model
    };
    var audioState = {
      fun: function() {
        return GameModel_1.default.model.audioEffect;
      },
      key: "audioEffect",
      obj: GameModel_1.default.model
    };
    var wwwaudioState = [ {
      fun: function() {
        var _a;
        if (GameModel_1.default.model.state == GameModel_1.GameState.SAYING) return {
          url: GameModel_1.default.model.sGetMissionInfo.resourceList[GameModel_1.default.model.curStage].audioUrl,
          callback: function() {
            GameAction_1.GameAction.StartHitting();
          }
        };
        if (GameModel_1.default.model.state == GameModel_1.GameState.PRESTART) return {
          url: null === (_a = GameModel_1.default.model.sGetGameDescription) || void 0 === _a ? void 0 : _a.audioUrl
        };
        return null;
      },
      key: "state",
      obj: GameModel_1.default.model
    }, {
      fun: null,
      key: "sGetGameDescription",
      obj: GameModel_1.default.model
    }, {
      fun: null,
      key: "sGetMissionInfo",
      obj: GameModel_1.default.model
    } ];
    var bgState = {
      fun: function() {
        var _a, _b;
        var ret = {
          bundleName: "Texture",
          textureName: "bg0" + Math_1.clamp(null !== (_b = null === (_a = GameModel_1.default.model.sGetMissionInfo) || void 0 === _a ? void 0 : _a.sceneNum) && void 0 !== _b ? _b : 1, 1, 3) + "_2"
        };
        return ret;
      },
      key: "sGetMissionInfo",
      obj: GameModel_1.default.model
    };
    var avartMap = [ "nan", "nv", "child" ];
    var avatarState = {
      fun: function() {
        var _a, _b;
        var avatar = Math_1.clamp(null !== (_b = null === (_a = GameModel_1.default.model.sGetPlayerInfo) || void 0 === _a ? void 0 : _a.avatar) && void 0 !== _b ? _b : 1, 1, 3);
        var avartName = avartMap[avatar - 1];
        var ret = {
          bundleName: "Texture",
          textureName: avartName
        };
        return ret;
      },
      key: "sGetPlayerInfo",
      obj: GameModel_1.default.model
    };
    var bgmState = {
      fun: function() {
        return GameModel_1.default.model.state == GameModel_1.GameState.HITTING;
      },
      key: "state",
      obj: GameModel_1.default.model
    };
    var rankState = [ {
      fun: function() {
        if (viewModel.resultMode == ResultMode.CurRank) return GameModel_1.default.model.sGetCurRank;
        if (viewModel.resultMode == ResultMode.HistoryRank) return GameModel_1.default.model.sGetHisRank;
        return null;
      },
      key: "resultMode",
      obj: viewModel
    }, {
      fun: null,
      key: "sGetCurRank",
      obj: GameModel_1.default.model
    }, {
      fun: null,
      key: "sGetHisRank",
      obj: GameModel_1.default.model
    } ];
    var selectWeapenState = [ {
      fun: function() {
        return {
          sGetMissionInfo: GameModel_1.default.model.sGetMissionInfo,
          score: GameModel_1.default.model.score,
          hammerType: GameModel_1.default.model.score <= 0 ? 1 : viewModel.hammerType
        };
      },
      key: "sGetMissionInfo",
      obj: GameModel_1.default.model
    }, {
      fun: null,
      key: "score",
      obj: GameModel_1.default.model
    }, {
      fun: null,
      key: "hammerType",
      obj: viewModel
    } ];
    var nextBtnState = [ {
      fun: function() {
        var _a, _b;
        var canNext = GameModel_1.default.getters.GetCanNextByFinalMisstionNum();
        if (!canNext) return true;
        return null !== (_b = GameModel_1.default.model.score < (null === (_a = GameModel_1.default.model.sGetMissionInfo) || void 0 === _a ? void 0 : _a.passingScore)) && void 0 !== _b ? _b : 0;
      },
      key: "score",
      obj: GameModel_1.default.model
    }, {
      fun: null,
      key: "sGetMissionInfo",
      obj: GameModel_1.default.model
    }, {
      fun: null,
      key: "appInfo",
      obj: GameModel_1.default.model
    } ];
    var stateBinds = [ {
      viewName: "Rule_panel",
      bindFunc: Export_1.ViewBindingsImp.bindShow,
      state: showRule
    }, {
      viewName: "Rule_panel.Name",
      bindFunc: Export_1.ViewBindingsImp.bindText,
      state: ruleTxt
    }, {
      viewName: "PlayerInfoNew.tishi.cur.num",
      bindFunc: Export_1.ViewBindingsImp.bindText,
      state: score
    }, {
      viewName: "jeisuan.result.his.num",
      bindFunc: Export_1.ViewBindingsImp.bindText,
      state: hisScore
    }, {
      viewName: "CD",
      bindFunc: Export_1.ViewBindingsImp.bindAnimCom,
      state: cdAnim
    }, {
      viewName: "Guanqia.num",
      bindFunc: Export_1.ViewBindingsImp.bindText,
      state: misstion
    }, {
      viewName: "SelectWeapon",
      bindFunc: Export_1.ViewBindingsImp.bindShow,
      state: selectWeaponShow
    }, {
      viewName: "Weapon_panel.chuizi02_2",
      bindFunc: Export_1.ViewBindingsImp.bindSprite,
      state: weapenMode
    }, {
      viewName: "Weapon_panel.chuizi02_2",
      bindFunc: Export_1.ViewBindingsImp.bindSprite,
      state: superWeapon
    }, {
      viewName: "tishi",
      bindFunc: bindNotify,
      state: notifyContent
    }, {
      viewName: "jeisuan",
      bindFunc: Export_1.ViewBindingsImp.bindShow,
      state: result
    }, {
      viewName: "jeisuan.result.score",
      bindFunc: Export_1.ViewBindingsImp.bindText,
      state: resultScore
    }, {
      viewName: "jeisuan.result.misstion",
      bindFunc: Export_1.ViewBindingsImp.bindText,
      state: resultMisstion
    }, {
      viewName: "jeisuan.result.rank",
      bindFunc: Export_1.ViewBindingsImp.bindText,
      state: resultRank
    }, {
      viewName: "jeisuan.guanbi",
      bindFunc: Export_1.ViewBindingsImp.bindShow,
      state: resultClose
    }, {
      viewName: "jeisuan.result",
      bindFunc: Export_1.ViewBindingsImp.bindShow,
      state: resultShow
    }, {
      viewName: "jeisuan.rank",
      bindFunc: Export_1.ViewBindingsImp.bindHide,
      state: resultShow
    }, {
      viewName: "jeisuan.rank.misstion",
      bindFunc: Export_1.ViewBindingsImp.bindText,
      state: rankDesc
    }, {
      viewName: "loading01",
      bindFunc: Export_1.ViewBindingsImp.bindShow,
      state: loading
    }, {
      viewName: "audio.effect",
      bindFunc: bindAudio,
      state: audioState
    }, {
      viewName: "audio.alert.alert",
      bindFunc: bindWWWAudio,
      state: wwwaudioState
    }, {
      viewName: "audio.bgm.bgm",
      bindFunc: bindSingleAudio,
      state: bgmState
    }, {
      viewName: "BG",
      bindFunc: Export_1.ViewBindingsImp.bindSprite,
      state: bgState
    }, {
      viewName: "PlayerInfoNew.head.nan",
      bindFunc: Export_1.ViewBindingsImp.bindSprite,
      state: avatarState
    }, {
      viewName: "jeisuan.rank",
      bindFunc: bindRank,
      state: rankState
    }, {
      viewName: "WeaponSelect.show",
      bindFunc: Export_1.ViewBindingsImp.bindSprite,
      state: weapenMode
    }, {
      viewName: "SelectWeapon.Hor",
      bindFunc: bindHammerSelect,
      state: selectWeapenState
    }, {
      viewName: "jeisuan.result.layout.anniu01",
      bindFunc: Export_1.ViewBindingsImp.bindGray,
      state: nextBtnState
    } ];
    var onClickSelect = function() {
      if (GameModel_1.default.model.state == GameModel_1.GameState.HITTING) {
        viewModel.showSelect = true;
        SimpleReactive_1.Emit(viewModel, "showSelect", true);
      }
    };
    var onClickCloseSelect = function() {
      viewModel.showSelect = false;
      SimpleReactive_1.Emit(viewModel, "showSelect", false);
    };
    var onClickNext = function() {
      var _a, _b;
      if (!GameModel_1.default.getters.GetCanNextByFinalMisstionNum()) return;
      (null !== (_b = GameModel_1.default.model.score >= (null === (_a = GameModel_1.default.model.sGetMissionInfo) || void 0 === _a ? void 0 : _a.passingScore)) && void 0 !== _b ? _b : 0) && GameAction_1.GameAction.Next();
    };
    var onClickReplay = function() {
      GameAction_1.GameAction.Replay();
    };
    var onClickHistoryRank = function() {
      viewModel.resultMode = ResultMode.HistoryRank;
      var send = new Msgs_1.CGetHistoryRank();
      send.userId = GameModel_1.default.model.appInfo.userId;
      Network_1.Network.Rpc(send).then(function(msg) {
        GameModel_1.default.mutations.SetHisRankInfo(msg);
      });
      SimpleReactive_1.Emit(viewModel, "resultMode", ResultMode.HistoryRank);
    };
    var onClickHistorycurRank = function() {
      viewModel.resultMode = ResultMode.CurRank;
      var send = new Msgs_1.CGetCurRank();
      send.missionNum = GameModel_1.default.model.appInfo.missionNum;
      send.roomId = GameModel_1.default.model.appInfo.roomId;
      send.userId = GameModel_1.default.model.appInfo.userId;
      Network_1.Network.Rpc(send).then(function(msg) {
        GameModel_1.default.mutations.SetCurRankInfo(msg);
      });
      SimpleReactive_1.Emit(viewModel, "resultMode", ResultMode.CurRank);
    };
    var onClickResultClose = function() {
      viewModel.resultMode = ResultMode.Result;
      SimpleReactive_1.Emit(viewModel, "resultMode", ResultMode.Result);
    };
    var onClickConfirm = function() {
      GameAction_1.GameAction.Start();
    };
    var actionBinds = [ {
      viewName: "WeaponSelect",
      bindFunc: onClickSelect,
      type: "click"
    }, {
      viewName: "SelectWeapon.Close",
      bindFunc: onClickCloseSelect,
      type: "click"
    }, {
      viewName: "jeisuan.result.layout.anniu01",
      bindFunc: onClickNext,
      type: "click"
    }, {
      viewName: "jeisuan.result.layout.anniu02",
      bindFunc: onClickReplay,
      type: "click"
    }, {
      viewName: "jeisuan.result.layout.anniu03",
      bindFunc: onClickHistorycurRank,
      type: "click"
    }, {
      viewName: "jeisuan.result.layout.anniu04",
      bindFunc: onClickHistoryRank,
      type: "click"
    }, {
      viewName: "jeisuan.guanbi",
      bindFunc: onClickResultClose,
      type: "click"
    }, {
      viewName: "Rule_panel.confirm",
      bindFunc: onClickConfirm,
      type: "click"
    } ];
    var bindMouseClick = function(index, suc, fail, lighing) {
      GameAction_1.GameAction.HitMouse(index, suc, fail, lighing);
    };
    var _loop_1 = function(i) {
      var viewName = "Mouses.Mouse" + i + ".Mask.dishu01_1";
      var state = {
        fun: function() {
          var mouse = GameModel_1.default.getters.GetMouse(i);
          return mouse;
        },
        key: i.toString(),
        obj: GameModel_1.default.model.mouses
      };
      stateBinds.push({
        viewName: viewName,
        bindFunc: bindAnim,
        state: state
      });
      var imgState = {
        fun: function() {
          var _a, _b;
          var mouse = GameModel_1.default.getters.GetMouse(i);
          return null !== (_b = null === (_a = mouse.ai.sMole) || void 0 === _a ? void 0 : _a.imgUrl) && void 0 !== _b ? _b : "";
        },
        key: i.toString(),
        obj: GameModel_1.default.model.mouses
      };
      stateBinds.push({
        viewName: viewName + ".paizi.sp",
        bindFunc: Export_1.ViewBindingsImp.bindWWWImg,
        state: imgState
      });
      actionBinds.push({
        viewName: viewName,
        bindFunc: bindMouseClick.bind(this_1, i),
        type: "mouseClick"
      });
    };
    var this_1 = this;
    for (var i = 1; i <= GameModel_1.default.model.holeNum; i++) _loop_1(i);
    var onSelectHammer = function(i) {
      if (GameModel_1.default.model.score < GameModel_1.default.model.sGetMissionInfo.weaponList[i - 1].unlockScore) return;
      viewModel.hammerType = i;
      viewModel.showSelect = false;
      SimpleReactive_1.Emit(viewModel, "showSelect", false);
      SimpleReactive_1.Emit(viewModel, "hammerType", i);
    };
    for (var i = 1; i <= 5; i++) actionBinds.push({
      viewName: "SelectWeapon.Hor.chuizidi" + i,
      bindFunc: onSelectHammer.bind(this, i),
      type: "click"
    });
    exports.default = {
      stateBinds: stateBinds,
      actionBinds: actionBinds
    };
    cc._RF.pop();
  }, {
    "../Math/Math": "Math",
    "../Network/Msgs": "Msgs",
    "../Network/Network": "Network",
    "../Platform/Export": "Export",
    "../Platform/Functions": "Functions",
    "../Platform/GameObjectPool": "GameObjectPool",
    "../Reactive/SimpleReactive": "SimpleReactive",
    "./GameAction": "GameAction",
    "./GameModel": "GameModel"
  } ],
  GameView: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "57476pZBrRCJJZszjX4JVgl", "GameView");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var Functions_1 = require("../Platform/Functions");
    var GameObjectPool_1 = require("../Platform/GameObjectPool");
    var BaseView_1 = require("./BaseView");
    var GameAction_1 = require("./GameAction");
    var GameModel_1 = require("./GameModel");
    var GameViewModel_1 = require("./GameViewModel");
    var ccclass = cc._decorator.ccclass;
    var GameView = function(_super) {
      __extends(GameView, _super);
      function GameView() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      GameView.prototype.GetViewModel = function() {
        return GameViewModel_1.default.stateBinds;
      };
      GameView.prototype.GetViewAction = function() {
        return GameViewModel_1.default.actionBinds;
      };
      GameView.prototype.sortZIndex = function() {
        var mouses = this.node.getChildByName("Mouses");
        for (var _i = 0, _a = mouses.children; _i < _a.length; _i++) {
          var mouse = _a[_i];
          mouse.zIndex = -mouse.y;
        }
      };
      GameView.prototype.start = function() {
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            _super.prototype.start.call(this);
            this.sortZIndex();
            GameObjectPool_1.GameObjectPool.PreLoadBundle("Prefab");
            return [ 2 ];
          });
        });
      };
      GameView.prototype.hanmmerMove = function(touch) {
        var hammer = this.getObjFromMap("Weapon_panel.chuizi02_2");
        var pos = hammer.parent.convertToNodeSpaceAR(touch.getLocation());
        hammer.x = pos.x + 20;
        hammer.y = pos.y;
      };
      GameView.prototype.lighting = function(mouseIndexs) {
        return __awaiter(this, void 0, void 0, function() {
          var _loop_1, _i, mouseIndexs_1, index;
          var _this = this;
          return __generator(this, function(_a) {
            _loop_1 = function(index) {
              GameObjectPool_1.GameObjectPool.SpawnSync("Prefab", "Lighting").then(function(node) {
                node.parent = _this.getObjFromMap("Effect");
                var mouse = _this.getObjFromMap("Mouses.Mouse" + index + ".Mask.dishu01_1");
                var worldAABB = mouse.getBoundingBoxToWorld();
                var pos = node.parent.convertToNodeSpaceAR(worldAABB.center);
                node.x = pos.x;
                node.y = pos.y;
                var anim = node.getComponent(cc.Animation);
                anim.stop();
                anim.play("Lighting", 0);
                Functions_1.mySetTimeout(function() {
                  GameObjectPool_1.GameObjectPool.Free("Prefab", "Lighting", node);
                }, 1e3 * anim.currentClip.duration);
              });
            };
            for (_i = 0, mouseIndexs_1 = mouseIndexs; _i < mouseIndexs_1.length; _i++) {
              index = mouseIndexs_1[_i];
              _loop_1(index);
            }
            return [ 2 ];
          });
        });
      };
      GameView.prototype.handmerHit = function(touch) {
        return __awaiter(this, void 0, void 0, function() {
          var node, anim, chuizi, animChuizi, parentNode, pos;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              return [ 4, GameObjectPool_1.GameObjectPool.SpawnSync("Prefab", "Hit") ];

             case 1:
              node = _a.sent();
              anim = node.getComponent(cc.Animation);
              anim.stop();
              anim.play("Hit", 0);
              chuizi = this.getNode("Weapon_panel.chuizi02_2");
              animChuizi = chuizi.getComponent(cc.Animation);
              animChuizi.stop();
              animChuizi.play("chuizi", 0);
              parentNode = this.getNode("Weapon_panel");
              node.parent = parentNode;
              node.zIndex = -1;
              pos = parentNode.convertToNodeSpaceAR(touch.getLocation());
              node.x = pos.x - node.width / 2;
              node.y = pos.y - node.height / 2;
              Functions_1.mySetTimeout(function() {
                GameObjectPool_1.GameObjectPool.Free("Prefab", "Hit", node);
              }, 1e3 * anim.currentClip.duration);
              return [ 2 ];
            }
          });
        });
      };
      GameView.prototype.onEnable = function() {
        var _this = this;
        _super.prototype.onEnable.call(this);
        Functions_1.mySetTimeout(function() {
          var startFrame = -100;
          _this.node.on(cc.Node.EventType.TOUCH_END, function(touch) {
            if (GameModel_1.default.model.state == GameModel_1.GameState.HITTING) {
              var endFrame = cc.director.getTotalFrames();
              endFrame - startFrame <= 10 && _this.handmerHit(touch);
            }
          });
          _this.node.on(cc.Node.EventType.TOUCH_MOVE, function(touch) {
            GameModel_1.default.model.state == GameModel_1.GameState.HITTING && _this.hanmmerMove(touch);
          });
          _this.node.on(cc.Node.EventType.TOUCH_START, function(touch) {
            return __awaiter(_this, void 0, void 0, function() {
              var _this = this;
              return __generator(this, function(_a) {
                startFrame = cc.director.getTotalFrames();
                if (GameModel_1.default.model.state == GameModel_1.GameState.HITTING) {
                  this.hanmmerMove(touch);
                  2 == touch.eventPhase && GameAction_1.GameAction.NotHit(function(indexes) {
                    _this.lighting(indexes);
                  });
                }
                return [ 2 ];
              });
            });
          });
        });
      };
      GameView.prototype.onDisable = function() {
        _super.prototype.onDisable.call(this);
      };
      GameView.prototype.coinFly = function(coin) {
        coin.stopAllActions();
        var target = this.getObjFromMap("PlayerInfoNew.tishi.cur.num");
        var box = target.getBoundingBoxToWorld();
        var pos = coin.parent.convertToNodeSpaceAR(cc.v2(box.x, box.y));
        cc.tween(coin).to(.15, {
          scale: 1.5
        }).to(.15, {
          scale: 1
        }).to(.5, {
          x: pos.x,
          y: pos.y
        }).call(function() {
          GameObjectPool_1.GameObjectPool.Free("Prefab", "Coin", coin);
        }).start();
      };
      GameView.prototype.minusScore = function(score) {
        score.stopAllActions();
        cc.tween(score).by(.5, {
          y: 50
        }).call(function() {
          GameObjectPool_1.GameObjectPool.Free("Prefab", "NegCoin", score);
        }).start();
      };
      GameView.prototype.BindViewAction = function() {
        var _this = this;
        _super.prototype.BindViewAction.call(this);
        var binds = this.GetViewAction();
        var _loop_2 = function(bindInfo) {
          try {
            var node = this_1.getNode(bindInfo.viewName);
            "mouseClick" == bindInfo.type && node.on(cc.Node.EventType.TOUCH_START, function(touch) {
              Functions_1.mySetTimeout(function() {
                return __awaiter(_this, void 0, void 0, function() {
                  var _this = this;
                  return __generator(this, function(_a) {
                    bindInfo.bindFunc(function() {
                      return __awaiter(_this, void 0, void 0, function() {
                        var node, pos;
                        return __generator(this, function(_a) {
                          switch (_a.label) {
                           case 0:
                            return [ 4, GameObjectPool_1.GameObjectPool.SpawnSync("Prefab", "Coin") ];

                           case 1:
                            node = _a.sent();
                            node.parent = this.getObjFromMap("Effect");
                            pos = node.parent.convertToNodeSpaceAR(touch.getLocation());
                            node.x = pos.x;
                            node.y = pos.y + 20;
                            this.coinFly(node);
                            return [ 2 ];
                          }
                        });
                      });
                    }, function(num) {
                      return __awaiter(_this, void 0, void 0, function() {
                        var node, pos;
                        return __generator(this, function(_a) {
                          switch (_a.label) {
                           case 0:
                            return [ 4, GameObjectPool_1.GameObjectPool.SpawnSync("Prefab", "NegCoin") ];

                           case 1:
                            node = _a.sent();
                            node.parent = this.getObjFromMap("Effect");
                            pos = node.parent.convertToNodeSpaceAR(touch.getLocation());
                            node.x = pos.x;
                            node.y = pos.y + 20;
                            node.getComponent(cc.Label).string = num;
                            this.minusScore(node);
                            return [ 2 ];
                          }
                        });
                      });
                    }, function(hittdIndexes) {
                      _this.lighting(hittdIndexes);
                    });
                    return [ 2 ];
                  });
                });
              }, 200);
            });
          } catch (e) {
            cc.log(e);
          }
        };
        var this_1 = this;
        for (var _i = 0, binds_1 = binds; _i < binds_1.length; _i++) {
          var bindInfo = binds_1[_i];
          _loop_2(bindInfo);
        }
      };
      GameView = __decorate([ ccclass ], GameView);
      return GameView;
    }(BaseView_1.default);
    exports.default = GameView;
    cc._RF.pop();
  }, {
    "../Platform/Functions": "Functions",
    "../Platform/GameObjectPool": "GameObjectPool",
    "./BaseView": "BaseView",
    "./GameAction": "GameAction",
    "./GameModel": "GameModel",
    "./GameViewModel": "GameViewModel"
  } ],
  Game: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "4b493g1KRNAzqEF+BN3HPMt", "Game");
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.Game = void 0;
    var Game = function() {
      function Game() {}
      return Game;
    }();
    exports.Game = Game;
    cc._RF.pop();
  }, {} ],
  GlobalEvent: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "6fd73d+JXtNOL9TINXtQQRS", "GlobalEvent");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.GlobalEvent = void 0;
    var GlobalEvent = function() {
      function GlobalEvent() {}
      return GlobalEvent;
    }();
    exports.GlobalEvent = GlobalEvent;
    cc._RF.pop();
  }, {} ],
  Global: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "b8652Gv3phFdrGh3u8EMzY4", "Global");
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.G_PlayMode = exports.G_GameEngine = exports.PlayMode = exports.GameEngine = void 0;
    var GameEngine;
    (function(GameEngine) {
      GameEngine[GameEngine["CoCos"] = 0] = "CoCos";
      GameEngine[GameEngine["Unity"] = 1] = "Unity";
    })(GameEngine = exports.GameEngine || (exports.GameEngine = {}));
    var PlayMode;
    (function(PlayMode) {
      PlayMode[PlayMode["Debug"] = 0] = "Debug";
      PlayMode[PlayMode["Release"] = 1] = "Release";
    })(PlayMode = exports.PlayMode || (exports.PlayMode = {}));
    exports.G_GameEngine = GameEngine.CoCos;
    exports.G_PlayMode = PlayMode.Debug;
    cc._RF.pop();
  }, {} ],
  INetwork: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "278f37OHnlBy77jOUQGCXlR", "INetwork");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    cc._RF.pop();
  }, {} ],
  IViewBindings: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "2d52bunSY5Cv737YEsE2If6", "IViewBindings");
    var IViewBindings = function() {
      function IViewBindings() {}
      return IViewBindings;
    }();
    cc._RF.pop();
  }, {} ],
  Main: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "c59ebdijSlDg6QTst0KGXaC", "Main");
    "use strict";
    var __extends = this && this.__extends || function() {
      var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || {
          __proto__: []
        } instanceof Array && function(d, b) {
          d.__proto__ = b;
        } || function(d, b) {
          for (var p in b) Object.prototype.hasOwnProperty.call(b, p) && (d[p] = b[p]);
        };
        return extendStatics(d, b);
      };
      return function(d, b) {
        extendStatics(d, b);
        function __() {
          this.constructor = d;
        }
        d.prototype = null === b ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
    }();
    var __decorate = this && this.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if ("object" === typeof Reflect && "function" === typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc); else for (var i = decorators.length - 1; i >= 0; i--) (d = decorators[i]) && (r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r);
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.Main = void 0;
    var GameAction_1 = require("./Game/GameAction");
    var ccclass = cc._decorator.ccclass;
    var Main = function(_super) {
      __extends(Main, _super);
      function Main() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      Main.prototype.start = function() {
        GameAction_1.GameAction.Start();
      };
      Main = __decorate([ ccclass ], Main);
      return Main;
    }(cc.Component);
    exports.Main = Main;
    cc._RF.pop();
  }, {
    "./Game/GameAction": "GameAction"
  } ],
  Math: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "cd8c8V81fFKyI1MB+m+hdy1", "Math");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.clamp = exports.randomRangeInt = void 0;
    function randomRangeInt(low, high) {
      return Math.floor(Math.random() * (high - low) + low);
    }
    exports.randomRangeInt = randomRangeInt;
    function clamp(value, low, high) {
      if (value >= low && value <= high) return value;
      if (value < low) return low;
      if (value > high) return high;
    }
    exports.clamp = clamp;
    cc._RF.pop();
  }, {} ],
  Msgs: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "5eca8rgkI5CKItbxBPxWfFI", "Msgs");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.CGetGameDescription = exports.SGameOver = exports.SGetHistoryRank = exports.CGetHistoryRank = exports.SGetCurRank = exports.CGetCurRank = exports.SPushMessage = exports.CPlayerScoreChange = exports.SGameState = exports.CMisstionStart = exports.CMisstionComplete = exports.SGetPlayerInfo = exports.CGetPlayerInfo = exports.SGetMissionInfo = exports.CGetMissionInfo = exports.SGetGameParam = exports.CGetGameParam = exports.HttpRes = exports.HttpMsg = exports.WebSocketMsg = void 0;
    var WebSocketMsg = function() {
      function WebSocketMsg() {}
      return WebSocketMsg;
    }();
    exports.WebSocketMsg = WebSocketMsg;
    var HttpMsg = function() {
      function HttpMsg() {}
      return HttpMsg;
    }();
    exports.HttpMsg = HttpMsg;
    var HttpRes = function() {
      function HttpRes() {}
      return HttpRes;
    }();
    exports.HttpRes = HttpRes;
    var CGetGameParam = function(_super) {
      __extends(CGetGameParam, _super);
      function CGetGameParam() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.url = "getGameParam";
        return _this;
      }
      return CGetGameParam;
    }(HttpMsg);
    exports.CGetGameParam = CGetGameParam;
    var SGetGameParam = function(_super) {
      __extends(SGetGameParam, _super);
      function SGetGameParam() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      return SGetGameParam;
    }(HttpRes);
    exports.SGetGameParam = SGetGameParam;
    var CGetMissionInfo = function(_super) {
      __extends(CGetMissionInfo, _super);
      function CGetMissionInfo() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.url = "getMissionInfo";
        return _this;
      }
      return CGetMissionInfo;
    }(HttpMsg);
    exports.CGetMissionInfo = CGetMissionInfo;
    var SGetMissionInfo = function(_super) {
      __extends(SGetMissionInfo, _super);
      function SGetMissionInfo() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      return SGetMissionInfo;
    }(HttpMsg);
    exports.SGetMissionInfo = SGetMissionInfo;
    var CGetPlayerInfo = function(_super) {
      __extends(CGetPlayerInfo, _super);
      function CGetPlayerInfo() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.url = "getPlayerInfo";
        return _this;
      }
      return CGetPlayerInfo;
    }(HttpMsg);
    exports.CGetPlayerInfo = CGetPlayerInfo;
    var SGetPlayerInfo = function(_super) {
      __extends(SGetPlayerInfo, _super);
      function SGetPlayerInfo() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      return SGetPlayerInfo;
    }(HttpMsg);
    exports.SGetPlayerInfo = SGetPlayerInfo;
    var CMisstionComplete = function(_super) {
      __extends(CMisstionComplete, _super);
      function CMisstionComplete() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.url = "finishMission";
        return _this;
      }
      return CMisstionComplete;
    }(HttpMsg);
    exports.CMisstionComplete = CMisstionComplete;
    var CMisstionStart = function(_super) {
      __extends(CMisstionStart, _super);
      function CMisstionStart() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.url = "startMission";
        return _this;
      }
      return CMisstionStart;
    }(HttpMsg);
    exports.CMisstionStart = CMisstionStart;
    var SGameState;
    (function(SGameState) {
      SGameState[SGameState["ENDING"] = 0] = "ENDING";
      SGameState[SGameState["ING"] = 1] = "ING";
    })(SGameState = exports.SGameState || (exports.SGameState = {}));
    var CPlayerScoreChange = function(_super) {
      __extends(CPlayerScoreChange, _super);
      function CPlayerScoreChange() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.url = "updateGameStatus";
        return _this;
      }
      return CPlayerScoreChange;
    }(HttpMsg);
    exports.CPlayerScoreChange = CPlayerScoreChange;
    var SPushMessage = function(_super) {
      __extends(SPushMessage, _super);
      function SPushMessage() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.name = "SPushMessage";
        return _this;
      }
      return SPushMessage;
    }(WebSocketMsg);
    exports.SPushMessage = SPushMessage;
    var CGetCurRank = function(_super) {
      __extends(CGetCurRank, _super);
      function CGetCurRank() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.url = "getMissionRank";
        return _this;
      }
      return CGetCurRank;
    }(HttpMsg);
    exports.CGetCurRank = CGetCurRank;
    var SGetCurRank = function(_super) {
      __extends(SGetCurRank, _super);
      function SGetCurRank() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      return SGetCurRank;
    }(HttpMsg);
    exports.SGetCurRank = SGetCurRank;
    var CGetHistoryRank = function(_super) {
      __extends(CGetHistoryRank, _super);
      function CGetHistoryRank() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.url = "getHistoryRank";
        return _this;
      }
      return CGetHistoryRank;
    }(HttpMsg);
    exports.CGetHistoryRank = CGetHistoryRank;
    var SGetHistoryRank = function(_super) {
      __extends(SGetHistoryRank, _super);
      function SGetHistoryRank() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      return SGetHistoryRank;
    }(HttpMsg);
    exports.SGetHistoryRank = SGetHistoryRank;
    var SGameOver = function(_super) {
      __extends(SGameOver, _super);
      function SGameOver() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.name = "SGameOver";
        return _this;
      }
      return SGameOver;
    }(WebSocketMsg);
    exports.SGameOver = SGameOver;
    var CGetGameDescription = function(_super) {
      __extends(CGetGameDescription, _super);
      function CGetGameDescription() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.url = "getGameDescription";
        return _this;
      }
      return CGetGameDescription;
    }(HttpMsg);
    exports.CGetGameDescription = CGetGameDescription;
    cc._RF.pop();
  }, {} ],
  NetWorkImp: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "f14f5wxh+dCx6a6lQY09mDR", "NetWorkImp");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.MyWebSocket = exports.MyHttp = void 0;
    var axios_1 = require("axios");
    var Functions_1 = require("../Platform/Functions");
    var MyHttp = function() {
      function MyHttp() {}
      MyHttp.Ins = function() {
        MyHttp._ins || (MyHttp._ins = new MyHttp());
        return MyHttp._ins;
      };
      MyHttp.prototype.Send = function(msg) {
        return __awaiter(this, void 0, void 0, function() {
          var url, resp;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              url = MyHttp.httpUrl + msg.url;
              msg.url = null;
              return [ 4, axios_1.default.post(url, msg) ];

             case 1:
              resp = _a.sent();
              return [ 2, resp.data.data ];
            }
          });
        });
      };
      MyHttp.prototype.OnRecv = function(msg) {};
      MyHttp._ins = null;
      MyHttp.httpUrl = "http://8.131.82.17:8089/mole/api/";
      return MyHttp;
    }();
    exports.MyHttp = MyHttp;
    var MyWebSocket = function() {
      function MyWebSocket() {
        var _this = this;
        this.hearbeatInterval = -1;
        this.ws = null;
        this.heartBeat = null;
        this.onrev = null;
        this.heartInterval = 5;
        this.ws = new WebSocket(MyWebSocket.uri + MyWebSocket.uid);
        var ws = this.ws;
        ws.onopen = function() {
          cc.log("ws opend on " + (MyWebSocket.uri + MyWebSocket.uid));
          _this.hearbeatInterval = Functions_1.mySetInterval(function() {
            var _a;
            null === (_a = _this.heartBeat) || void 0 === _a ? void 0 : _a.call(_this, _this);
          }, 1e3 * _this.heartInterval);
        };
        ws.onmessage = function(evt) {
          var _a;
          var data = evt.data;
          if (0 == data.msgType) return;
          null === (_a = _this.onrev) || void 0 === _a ? void 0 : _a.call(_this, evt.data);
        };
        ws.onclose = function() {
          cc.log("ws closed on " + (MyWebSocket.uri + MyWebSocket.uid));
          _this.stopHeartBeat();
          Functions_1.mySetTimeout(function() {
            MyWebSocket._ins = new MyWebSocket();
          }, 2e3);
        };
      }
      MyWebSocket.prototype.stopHeartBeat = function() {
        Functions_1.myClearTimeout(this.heartInterval);
      };
      MyWebSocket.SetUid = function(uid) {
        this.uid = uid;
      };
      MyWebSocket.Ins = function() {
        if (!MyWebSocket._ins) {
          if (!MyWebSocket.uid) throw new Error("must set uid");
          MyWebSocket._ins = new MyWebSocket();
        }
        return MyWebSocket._ins;
      };
      MyWebSocket.prototype.Send = function(msg) {
        if ("string" != typeof msg) throw new Error("send type must be string");
        this.ws.send(msg);
      };
      MyWebSocket.prototype.SetHearBeat = function(HeartBeat) {
        this.heartBeat = HeartBeat;
      };
      MyWebSocket.prototype.SetOnRecv = function(onrev) {
        this.onrev = onrev;
      };
      MyWebSocket.uid = "";
      MyWebSocket.uri = "ws://8.131.82.17:999/game/mole?userId=";
      MyWebSocket._ins = null;
      return MyWebSocket;
    }();
    exports.MyWebSocket = MyWebSocket;
    cc._RF.pop();
  }, {
    "../Platform/Functions": "Functions",
    axios: 2
  } ],
  NetworkFactory: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "e4af1fi+9VOpLRM8LjThRJj", "NetworkFactory");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.NetworkFactory = void 0;
    var NetWorkImp_1 = require("./NetWorkImp");
    var NetworkFactory = function() {
      function NetworkFactory() {}
      NetworkFactory.GetHttp = function() {
        return NetWorkImp_1.MyHttp.Ins();
      };
      NetworkFactory.GetWebSocket = function(userId) {
        NetWorkImp_1.MyWebSocket.SetUid(userId);
        return NetWorkImp_1.MyWebSocket.Ins();
      };
      return NetworkFactory;
    }();
    exports.NetworkFactory = NetworkFactory;
    cc._RF.pop();
  }, {
    "./NetWorkImp": "NetWorkImp"
  } ],
  Network: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "b5225SvQQNAuYfZV0WQVNKe", "Network");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.Network = void 0;
    var GameModel_1 = require("../Game/GameModel");
    var Functions_1 = require("../Platform/Functions");
    var Msgs_1 = require("./Msgs");
    var NetworkFactory_1 = require("./NetworkFactory");
    var hearBeadIdGen = 0;
    var HeartBeatData = function() {
      function HeartBeatData() {
        this.msgType = 0;
        this.msg = "ping";
        this.uniId = hearBeadIdGen++;
      }
      return HeartBeatData;
    }();
    var Network = function() {
      function Network() {}
      Network.Send = function(msg) {};
      Network.AddNotify = function(msg, callback) {
        this.notifyListeners.set(msg.name, callback);
      };
      Network.Rpc = function(send, block) {
        void 0 === block && (block = false);
        return __awaiter(this, void 0, Promise, function() {
          var hasResponsed, res;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              this.needResponseCount++;
              hasResponsed = false;
              Functions_1.mySetTimeout(function() {
                hasResponsed || GameModel_1.default.mutations.SetLoading(true);
              }, 200);
              return [ 4, NetworkFactory_1.NetworkFactory.GetHttp().Send(send) ];

             case 1:
              res = _a.sent();
              true;
              cc.log(res);
              hasResponsed = true;
              this.needResponseCount--;
              this.needResponseCount <= 0 && GameModel_1.default.mutations.SetLoading(false);
              return [ 2, res ];
            }
          });
        });
      };
      Network.RpcSendOnly = function(send) {
        NetworkFactory_1.NetworkFactory.GetHttp().Send(send);
        true;
        cc.log(send);
      };
      Network.WebSocketConect = function(userId) {
        var myws = NetworkFactory_1.NetworkFactory.GetWebSocket(userId);
        myws.SetHearBeat(function(sender) {
          var data = new HeartBeatData();
          sender.Send(JSON.stringify(data));
        });
        var _this = this;
        var onRev = function(msg) {
          var m = JSON.parse(msg);
          if (1 == m.msgType) {
            var cb = _this.notifyListeners.get("SPushMessage");
            var spush = new Msgs_1.SPushMessage();
            spush.content = m.msg;
            spush.showSeconds = m.showSeconds;
            null === cb || void 0 === cb ? void 0 : cb(spush);
          }
          if (88 == m.msgType) {
            var cb = _this.notifyListeners.get("SGameOver");
            var spush = new Msgs_1.SGameOver();
            null === cb || void 0 === cb ? void 0 : cb(spush);
          }
        };
        myws.SetOnRecv(onRev);
      };
      Network.notifyListeners = new Map();
      Network.needResponseCount = 0;
      return Network;
    }();
    exports.Network = Network;
    cc._RF.pop();
  }, {
    "../Game/GameModel": "GameModel",
    "../Platform/Functions": "Functions",
    "./Msgs": "Msgs",
    "./NetworkFactory": "NetworkFactory"
  } ],
  SelectViewModel: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "1b517hiEPVKR4zMpP+zyhi9", "SelectViewModel");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var Export_1 = require("../Platform/Export");
    var SimpleReactive_1 = require("../Reactive/SimpleReactive");
    var GameAction_1 = require("./GameAction");
    var GameModel_1 = require("./GameModel");
    var viewModel = {
      curPage: 1
    };
    var pageMaxItem = 24;
    function setSpriteFrame(node, bundleName, resName) {
      var sp = node.getComponent(cc.Sprite);
      cc.assetManager.loadBundle(bundleName, function(error, bundle) {
        if (error) {
          cc.log(error);
          return;
        }
        bundle.load(resName, cc.SpriteFrame, null, function(error, spriteFrame) {
          if (error) {
            cc.log(error);
            return;
          }
          sp.spriteFrame = spriteFrame;
        });
      });
    }
    function updateSeletItem(node, val) {
      if (!val) {
        node.active = false;
        return;
      }
      node.active = true;
      node.getChildByName("ditu01").active = val.canSelect;
      node.getChildByName("ditu02").active = !val.canSelect;
      var gewei = node.getChildByName("layout").getChildByName("gewei");
      var shiwei = node.getChildByName("layout").getChildByName("shiwei");
      if (val.num >= 10) {
        shiwei.active = true;
        gewei.active = true;
        setSpriteFrame(gewei, "Texture", "selectMisstion/s" + val.num % 10);
        setSpriteFrame(shiwei, "Texture", "selectMisstion/s" + Math.floor(val.num / 10));
      } else {
        shiwei.active = false;
        gewei.active = true;
        setSpriteFrame(gewei, "Texture", "selectMisstion/s" + val.num);
      }
      function onSelect(touch) {
        GameAction_1.GameAction.SelectMisstion(val.num);
      }
      node.off(cc.Node.EventType.TOUCH_START, onSelect);
      node.on(cc.Node.EventType.TOUCH_START, onSelect);
    }
    function bindSelectItem(node, val) {
      var _this = this;
      node.children.forEach(function(itemNode, index) {
        return __awaiter(_this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            updateSeletItem(itemNode, val[index]);
            return [ 2 ];
          });
        });
      });
    }
    var selectState = [ {
      fun: function() {
        var count = GameModel_1.default.model.misstionCount;
        var ret = [];
        var finalMissionNum = Math.min(count, 99) - 1;
        var pages = Math.floor(finalMissionNum / pageMaxItem) + 1;
        var offset = finalMissionNum % pageMaxItem;
        var start = (viewModel.curPage - 1) * pageMaxItem;
        var len = viewModel.curPage == pages ? offset : pageMaxItem;
        while (len >= 0) {
          var selectInfo = {
            canSelect: true,
            num: start + 1
          };
          ret.push(selectInfo);
          len--;
          start++;
        }
        return ret;
      },
      key: "misstionCount",
      obj: GameModel_1.default.model
    }, {
      fun: null,
      key: "curPage",
      obj: viewModel
    } ];
    var arrowStateLeft = [ {
      fun: function() {
        var count = GameModel_1.default.model.misstionCount;
        if (count < pageMaxItem) return false;
        if (viewModel.curPage >= 2) return true;
        return false;
      },
      key: "curPage",
      obj: viewModel
    }, {
      fun: null,
      key: "misstionCount",
      obj: GameModel_1.default.model
    } ];
    var arrowStateRight = [ {
      fun: function() {
        var count = GameModel_1.default.model.misstionCount;
        if (count < pageMaxItem) return false;
        if (viewModel.curPage < Math.ceil(count / pageMaxItem)) return true;
        return false;
      },
      key: "curPage",
      obj: viewModel
    }, {
      fun: null,
      key: "misstionCount",
      obj: GameModel_1.default.model
    } ];
    var stateBinds = [ {
      viewName: "layout",
      bindFunc: bindSelectItem,
      state: selectState
    }, {
      viewName: "left",
      bindFunc: Export_1.ViewBindingsImp.bindShow,
      state: arrowStateLeft
    }, {
      viewName: "right",
      bindFunc: Export_1.ViewBindingsImp.bindShow,
      state: arrowStateRight
    } ];
    var onClickRightBtn = {
      bindFunc: function() {
        viewModel.curPage++;
        SimpleReactive_1.Emit(viewModel, "curPage", viewModel.curPage);
      },
      type: "click",
      viewName: "right"
    };
    var onClickLeftBtn = {
      bindFunc: function() {
        viewModel.curPage--;
        SimpleReactive_1.Emit(viewModel, "curPage", viewModel.curPage);
      },
      type: "click",
      viewName: "left"
    };
    var actionBinds = [ onClickRightBtn, onClickLeftBtn ];
    exports.default = {
      stateBinds: stateBinds,
      actionBinds: actionBinds
    };
    cc._RF.pop();
  }, {
    "../Platform/Export": "Export",
    "../Reactive/SimpleReactive": "SimpleReactive",
    "./GameAction": "GameAction",
    "./GameModel": "GameModel"
  } ],
  SelectView: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "7a866inzRFGELIRxwkcdepf", "SelectView");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var BaseView_1 = require("./BaseView");
    var SelectViewModel_1 = require("./SelectViewModel");
    var ccclass = cc._decorator.ccclass;
    var SelectView = function(_super) {
      __extends(SelectView, _super);
      function SelectView() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      SelectView.prototype.GetViewModel = function() {
        return SelectViewModel_1.default.stateBinds;
      };
      SelectView.prototype.GetViewAction = function() {
        return SelectViewModel_1.default.actionBinds;
      };
      SelectView = __decorate([ ccclass ], SelectView);
      return SelectView;
    }(BaseView_1.default);
    exports.default = SelectView;
    cc._RF.pop();
  }, {
    "./BaseView": "BaseView",
    "./SelectViewModel": "SelectViewModel"
  } ],
  SimpleReactive: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "62bbdMQ5rdO0pabxMCwyh/I", "SimpleReactive");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.Clear = exports.On = exports.Emit = void 0;
    var listenerMap = new Map();
    function Emit(obj, key, val) {
      var _a;
      obj[key] = val;
      var listeners = null === (_a = listenerMap.get(obj)) || void 0 === _a ? void 0 : _a.get(key);
      if (listeners) for (var _i = 0, listeners_1 = listeners; _i < listeners_1.length; _i++) {
        var listener = listeners_1[_i];
        try {
          listener();
        } catch (e) {
          cc.log(e);
        }
      }
    }
    exports.Emit = Emit;
    function On(obj, key, fun) {
      var listeners = listenerMap.get(obj);
      if (!listeners) {
        var element = new Map([ [ key, [ fun ] ] ]);
        listenerMap.set(obj, element);
        return;
      }
      var keyValue = listeners.get(key);
      if (!keyValue) {
        listeners.set(key, [ fun ]);
        return;
      }
      keyValue.push(fun);
    }
    exports.On = On;
    function Clear(obj) {
      listenerMap.delete(obj);
    }
    exports.Clear = Clear;
    cc._RF.pop();
  }, {} ],
  StartUp: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "a60a99LdLtPULxdBGdU51Xt", "StartUp");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var Msgs_1 = require("../Network/Msgs");
    var Network_1 = require("../Network/Network");
    var Functions_1 = require("../Platform/Functions");
    var GameAction_1 = require("./GameAction");
    var GameModel_1 = require("./GameModel");
    var GameView_1 = require("./GameView");
    var GlobalEvent_1 = require("./GlobalEvent");
    var ccclass = cc._decorator.ccclass;
    var StartUp = function(_super) {
      __extends(StartUp, _super);
      function StartUp() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      StartUp.prototype.onEnable = function() {
        return __awaiter(this, void 0, void 0, function() {
          var appInfo, sendMsg, msg;
          var _this = this;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              appInfo = GameApp.startGame();
              appInfo || (appInfo = {
                autoStart: 1,
                missionNum: 2,
                finalMissionNum: 5,
                roomId: 1,
                userId: "12345"
              });
              true;
              cc.log(appInfo);
              GameModel_1.default.model.appInfo = appInfo;
              Network_1.Network.WebSocketConect(GameModel_1.default.model.appInfo.userId);
              Network_1.Network.AddNotify(new Msgs_1.SPushMessage(), function(msg) {
                GameModel_1.default.mutations.SetNotify(msg);
              });
              Network_1.Network.AddNotify(new Msgs_1.SGameOver(), function(msg) {
                GameAction_1.GameAction.EndGame();
              });
              sendMsg = new Msgs_1.CGetGameParam();
              sendMsg.userId = GameModel_1.default.model.appInfo.userId;
              return [ 4, Network_1.Network.Rpc(sendMsg) ];

             case 1:
              msg = _a.sent();
              GameModel_1.default.mutations.SetMisstionCount(msg.missionCount);
              GameAction_1.GameAction.GetMisstionInfo(appInfo.missionNum);
              GameAction_1.GameAction.GetPlayerInfo();
              GameAction_1.GameAction.GetGameDescription();
              this.SetGameing(1 == appInfo.autoStart);
              this.SetSelect(0 == appInfo.autoStart);
              GlobalEvent_1.GlobalEvent.SetGameing = function(gaming) {
                _this.SetGameing(gaming);
              };
              GlobalEvent_1.GlobalEvent.SetSelect = function(selecting) {
                _this.SetSelect(selecting);
              };
              return [ 2 ];
            }
          });
        });
      };
      StartUp.prototype.SetGameing = function(gaming) {
        var gameNode = this.node.getParent().getChildByName("Game");
        gameNode.active = gaming;
        gameNode.getComponent(GameView_1.default).enabled = gaming;
      };
      StartUp.prototype.onDisable = function() {
        GlobalEvent_1.GlobalEvent.SetGameing = void 0;
        GlobalEvent_1.GlobalEvent.SetSelect = void 0;
      };
      StartUp.prototype.SetSelect = function(selecting) {
        var gameNode = this.node.getParent().getChildByName("SelectMisstion");
        gameNode.active = selecting;
      };
      StartUp.prototype.update = function(dt) {
        Functions_1.myUpdate(dt);
      };
      StartUp = __decorate([ ccclass ], StartUp);
      return StartUp;
    }(cc.Component);
    exports.default = StartUp;
    cc._RF.pop();
  }, {
    "../Network/Msgs": "Msgs",
    "../Network/Network": "Network",
    "../Platform/Functions": "Functions",
    "./GameAction": "GameAction",
    "./GameModel": "GameModel",
    "./GameView": "GameView",
    "./GlobalEvent": "GlobalEvent"
  } ],
  UnityViewBindings: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "53452NMU+tKvq7cMDzYNWMz", "UnityViewBindings");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.UnityViewBindings = void 0;
    var UnityViewBindings = function() {
      function UnityViewBindings() {}
      UnityViewBindings.prototype.bindGray = function(node, val) {
        throw new Error("Method not implemented.");
      };
      UnityViewBindings.prototype.bindWWWImg = function(node, val) {
        throw new Error("Method not implemented.");
      };
      UnityViewBindings.prototype.bindHide = function(node, val) {
        throw new Error("Method not implemented.");
      };
      UnityViewBindings.prototype.bindAnimCom = function(node, val) {
        throw new Error("Method not implemented.");
      };
      UnityViewBindings.prototype.bindSprite = function(node, val) {
        throw new Error("Method not implemented.");
      };
      UnityViewBindings.prototype.bindTween = function(node, val) {
        throw new Error("Method not implemented.");
      };
      UnityViewBindings.prototype.bindAnimStop = function(node, val) {
        throw new Error("Method not implemented.");
      };
      UnityViewBindings.prototype.bindText = function() {
        throw new Error("Method not implemented.");
      };
      UnityViewBindings.prototype.bindShow = function() {
        throw new Error("Method not implemented.");
      };
      UnityViewBindings.prototype.bindProgress = function() {
        throw new Error("Method not implemented.");
      };
      return UnityViewBindings;
    }();
    exports.UnityViewBindings = UnityViewBindings;
    cc._RF.pop();
  }, {} ]
}, {}, [ "BaseView", "BindInfo", "Game", "GameAction", "GameModel", "GameView", "GameViewModel", "GlobalEvent", "SelectView", "SelectViewModel", "StartUp", "Global", "Main", "Math", "INetwork", "Msgs", "NetWorkImp", "Network", "NetworkFactory", "CocosViewBindings", "Export", "Functions", "GameObjectPool", "IViewBindings", "UnityViewBindings", "SimpleReactive" ]);