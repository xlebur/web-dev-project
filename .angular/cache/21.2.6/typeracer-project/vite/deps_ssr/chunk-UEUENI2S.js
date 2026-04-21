import { createRequire } from 'module';const require = createRequire(import.meta.url);
import {
  BrowserDomAdapter,
  BrowserModule,
  EVENT_MANAGER_PLUGINS,
  EventManagerPlugin,
  HTTP_ROOT_INTERCEPTOR_FNS
} from "./chunk-S3Y5GYQ4.js";
import {
  NullViewportScroller,
  PLATFORM_SERVER_ID,
  PlatformLocation,
  ViewportScroller,
  XhrFactory,
  getDOM,
  setRootDomAdapter
} from "./chunk-GKMKJTXA.js";
import {
  APP_ID,
  ApplicationRef,
  CSP_NONCE,
  DOCUMENT,
  IS_HYDRATION_DOM_REUSE_ENABLED,
  Inject,
  Injectable,
  InjectionToken,
  Injector,
  NgModule,
  PLATFORM_ID,
  PLATFORM_INITIALIZER,
  Renderer2,
  SSR_CONTENT_INTEGRITY_MARKER,
  TESTABILITY,
  Testability,
  TransferState,
  Version,
  annotateForHydration,
  createPlatformFactory,
  inject,
  makeEnvironmentProviders,
  platformCore,
  require_cjs,
  setClassMetadata,
  setDocument,
  startMeasuring,
  stopMeasuring,
  ɵɵdefineInjectable,
  ɵɵdefineInjector,
  ɵɵdefineNgModule,
  ɵɵinject
} from "./chunk-R367YO5W.js";
import {
  index
} from "./chunk-WC4PITUE.js";
import {
  __async,
  __toESM
} from "./chunk-JJCEQHS6.js";

// node_modules/@angular/platform-server/fesm2022/_server-chunk.mjs
var import_rxjs = __toESM(require_cjs(), 1);
function setDomTypes() {
  Object.assign(globalThis, index.impl);
  globalThis["KeyboardEvent"] = index.impl.Event;
}
function parseDocument(html, url = "/") {
  let window2 = index.createWindow(html, url);
  let doc = window2.document;
  return doc;
}
function serializeDocument(doc) {
  return doc.serialize();
}
var DominoAdapter = class _DominoAdapter extends BrowserDomAdapter {
  static makeCurrent() {
    setDomTypes();
    setRootDomAdapter(new _DominoAdapter());
  }
  supportsDOMEvents = false;
  static defaultDoc;
  createHtmlDocument() {
    return parseDocument("<html><head><title>fakeTitle</title></head><body></body></html>");
  }
  getDefaultDocument() {
    if (!_DominoAdapter.defaultDoc) {
      _DominoAdapter.defaultDoc = index.createDocument();
    }
    return _DominoAdapter.defaultDoc;
  }
  isElementNode(node) {
    return node ? node.nodeType === _DominoAdapter.defaultDoc.ELEMENT_NODE : false;
  }
  isShadowRoot(node) {
    return node.shadowRoot == node;
  }
  getGlobalEventTarget(doc, target) {
    if (target === "window") {
      return doc.defaultView;
    }
    if (target === "document") {
      return doc;
    }
    if (target === "body") {
      return doc.body;
    }
    return null;
  }
  getBaseHref(doc) {
    const length = doc.head.children.length;
    for (let i = 0; i < length; i++) {
      const child = doc.head.children[i];
      if (child.tagName === "BASE") {
        return child.getAttribute("href") || "";
      }
    }
    return "";
  }
  dispatchEvent(el, evt) {
    el.dispatchEvent(evt);
    const doc = el.ownerDocument || el;
    const win = doc.defaultView;
    if (win) {
      win.dispatchEvent(evt);
    }
  }
  getUserAgent() {
    return "Fake user agent";
  }
  getCookie(name) {
    throw new Error("getCookie has not been implemented");
  }
};
var INITIAL_CONFIG = new InjectionToken("Server.INITIAL_CONFIG");
var BEFORE_APP_SERIALIZED = new InjectionToken("Server.RENDER_MODULE_HOOK");
var ENABLE_DOM_EMULATION = new InjectionToken("ENABLE_DOM_EMULATION");
var PlatformState = class _PlatformState {
  _doc;
  _enableDomEmulation = enableDomEmulation(inject(Injector));
  constructor(_doc) {
    this._doc = _doc;
  }
  renderToString() {
    if (ngDevMode && !this._enableDomEmulation && !window?.document) {
      throw new Error("Disabled DOM emulation should only run in browser environments");
    }
    const measuringLabel = "renderToString";
    startMeasuring(measuringLabel);
    const rendered = this._enableDomEmulation ? serializeDocument(this._doc) : this._doc.documentElement.outerHTML;
    stopMeasuring(measuringLabel);
    return rendered;
  }
  getDocument() {
    return this._doc;
  }
  static ɵfac = function PlatformState_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _PlatformState)(ɵɵinject(DOCUMENT));
  };
  static ɵprov = ɵɵdefineInjectable({
    token: _PlatformState,
    factory: _PlatformState.ɵfac
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(PlatformState, [{
    type: Injectable
  }], () => [{
    type: void 0,
    decorators: [{
      type: Inject,
      args: [DOCUMENT]
    }]
  }], null);
})();
function enableDomEmulation(injector) {
  return injector.get(ENABLE_DOM_EMULATION, true);
}
var ServerXhr = class _ServerXhr {
  xhrImpl;
  ɵloadImpl() {
    return __async(this, null, function* () {
      if (!this.xhrImpl) {
        const {
          default: xhr
        } = yield import("./xhr2-PGY6L7KE.js");
        this.xhrImpl = xhr;
      }
    });
  }
  build() {
    const impl = this.xhrImpl;
    if (!impl) {
      throw new Error("Unexpected state in ServerXhr: XHR implementation is not loaded.");
    }
    return new impl.XMLHttpRequest();
  }
  static ɵfac = function ServerXhr_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ServerXhr)();
  };
  static ɵprov = ɵɵdefineInjectable({
    token: _ServerXhr,
    factory: _ServerXhr.ɵfac
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ServerXhr, [{
    type: Injectable
  }], null, null);
})();
function relativeUrlsTransformerInterceptorFn(request, next) {
  const platformLocation = inject(PlatformLocation);
  const {
    href,
    protocol,
    hostname,
    port
  } = platformLocation;
  if (!protocol.startsWith("http")) {
    return next(request);
  }
  let urlPrefix = `${protocol}//${hostname}`;
  if (port) {
    urlPrefix += `:${port}`;
  }
  const baseHref = platformLocation.getBaseHrefFromDOM() || href;
  const baseUrl = new URL(baseHref, urlPrefix);
  const newUrl = new URL(request.url, baseUrl).toString();
  return next(request.clone({
    url: newUrl
  }));
}
var SERVER_HTTP_PROVIDERS = [{
  provide: XhrFactory,
  useClass: ServerXhr
}, {
  provide: HTTP_ROOT_INTERCEPTOR_FNS,
  useValue: relativeUrlsTransformerInterceptorFn,
  multi: true
}];
function parseUrl(urlStr, origin) {
  const {
    hostname,
    protocol,
    port,
    pathname,
    search,
    hash,
    href
  } = new URL(urlStr, origin);
  return {
    hostname,
    href,
    protocol,
    port,
    pathname,
    search,
    hash
  };
}
var ServerPlatformLocation = class _ServerPlatformLocation {
  href = "/";
  hostname = "/";
  protocol = "/";
  port = "/";
  pathname = "/";
  search = "";
  hash = "";
  _hashUpdate = new import_rxjs.Subject();
  _doc = inject(DOCUMENT);
  constructor() {
    const config = inject(INITIAL_CONFIG, {
      optional: true
    });
    if (!config) {
      return;
    }
    if (config.url) {
      const url = parseUrl(config.url, this._doc.location.origin);
      this.protocol = url.protocol;
      this.hostname = url.hostname;
      this.port = url.port;
      this.pathname = url.pathname;
      this.search = url.search;
      this.hash = url.hash;
      this.href = url.href;
    }
  }
  getBaseHrefFromDOM() {
    return getDOM().getBaseHref(this._doc);
  }
  onPopState(fn) {
    return () => {
    };
  }
  onHashChange(fn) {
    const subscription = this._hashUpdate.subscribe(fn);
    return () => subscription.unsubscribe();
  }
  get url() {
    return `${this.pathname}${this.search}${this.hash}`;
  }
  setHash(value, oldUrl) {
    if (this.hash === value) {
      return;
    }
    this.hash = value;
    const newUrl = this.url;
    queueMicrotask(() => this._hashUpdate.next({
      type: "hashchange",
      state: null,
      oldUrl,
      newUrl
    }));
  }
  replaceState(state, title, newUrl) {
    const oldUrl = this.url;
    const parsedUrl = parseUrl(newUrl, this._doc.location.origin);
    this.pathname = parsedUrl.pathname;
    this.search = parsedUrl.search;
    this.href = parsedUrl.href;
    this.protocol = parsedUrl.protocol;
    this.setHash(parsedUrl.hash, oldUrl);
  }
  pushState(state, title, newUrl) {
    this.replaceState(state, title, newUrl);
  }
  forward() {
    throw new Error("Not implemented");
  }
  back() {
    throw new Error("Not implemented");
  }
  getState() {
    return void 0;
  }
  static ɵfac = function ServerPlatformLocation_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ServerPlatformLocation)();
  };
  static ɵprov = ɵɵdefineInjectable({
    token: _ServerPlatformLocation,
    factory: _ServerPlatformLocation.ɵfac
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ServerPlatformLocation, [{
    type: Injectable
  }], () => [], null);
})();
var ServerEventManagerPlugin = class _ServerEventManagerPlugin extends EventManagerPlugin {
  doc;
  constructor(doc) {
    super(doc);
    this.doc = doc;
  }
  supports(eventName) {
    return true;
  }
  addEventListener(element, eventName, handler, options) {
    return getDOM().onAndCancel(element, eventName, handler, options);
  }
  static ɵfac = function ServerEventManagerPlugin_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ServerEventManagerPlugin)(ɵɵinject(DOCUMENT));
  };
  static ɵprov = ɵɵdefineInjectable({
    token: _ServerEventManagerPlugin,
    factory: _ServerEventManagerPlugin.ɵfac
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ServerEventManagerPlugin, [{
    type: Injectable
  }], () => [{
    type: void 0,
    decorators: [{
      type: Inject,
      args: [DOCUMENT]
    }]
  }], null);
})();
var TRANSFER_STATE_STATUS = new InjectionToken(typeof ngDevMode === "undefined" || ngDevMode ? "TRANSFER_STATE_STATUS" : "", {
  factory: () => ({
    serialized: false
  })
});
var TRANSFER_STATE_SERIALIZATION_PROVIDERS = [{
  provide: BEFORE_APP_SERIALIZED,
  useFactory: serializeTransferStateFactory,
  multi: true
}];
function createScript(doc, textContent, nonce) {
  const script = doc.createElement("script");
  script.textContent = textContent;
  if (nonce) {
    script.setAttribute("nonce", nonce);
  }
  return script;
}
function warnIfStateTransferHappened(injector) {
  const transferStateStatus = injector.get(TRANSFER_STATE_STATUS);
  if (transferStateStatus.serialized) {
    console.warn(`Angular detected an incompatible configuration, which causes duplicate serialization of the server-side application state.

This can happen if the server providers have been provided more than once using different mechanisms. For example:

  imports: [ServerModule], // Registers server providers
  providers: [provideServerRendering()] // Also registers server providers

To fix this, ensure that the \`provideServerRendering()\` function is the only provider used and remove the other(s).`);
  }
  transferStateStatus.serialized = true;
}
function serializeTransferStateFactory() {
  const doc = inject(DOCUMENT);
  const appId = inject(APP_ID);
  const transferStore = inject(TransferState);
  const injector = inject(Injector);
  return () => {
    const measuringLabel = "serializeTransferStateFactory";
    startMeasuring(measuringLabel);
    const content = transferStore.toJson();
    if (transferStore.isEmpty) {
      return;
    }
    if (typeof ngDevMode !== "undefined" && ngDevMode) {
      warnIfStateTransferHappened(injector);
    }
    const script = createScript(doc, content, null);
    script.id = appId + "-state";
    script.setAttribute("type", "application/json");
    doc.body.appendChild(script);
    stopMeasuring(measuringLabel);
  };
}
var INTERNAL_SERVER_PLATFORM_PROVIDERS = [{
  provide: DOCUMENT,
  useFactory: _document
}, {
  provide: PLATFORM_ID,
  useValue: PLATFORM_SERVER_ID
}, {
  provide: PLATFORM_INITIALIZER,
  useFactory: initDominoAdapter,
  multi: true
}, {
  provide: PlatformLocation,
  useClass: ServerPlatformLocation,
  deps: []
}, {
  provide: PlatformState,
  deps: [DOCUMENT]
}];
function initDominoAdapter() {
  const injector = inject(Injector);
  const _enableDomEmulation = enableDomEmulation(injector);
  return () => {
    if (_enableDomEmulation) {
      DominoAdapter.makeCurrent();
    } else {
      BrowserDomAdapter.makeCurrent();
    }
  };
}
var SERVER_RENDER_PROVIDERS = [{
  provide: EVENT_MANAGER_PLUGINS,
  multi: true,
  useClass: ServerEventManagerPlugin
}];
var PLATFORM_SERVER_PROVIDERS = [TRANSFER_STATE_SERIALIZATION_PROVIDERS, SERVER_RENDER_PROVIDERS, SERVER_HTTP_PROVIDERS, {
  provide: Testability,
  useValue: null
}, {
  provide: TESTABILITY,
  useValue: null
}, {
  provide: ViewportScroller,
  useClass: NullViewportScroller
}];
var ServerModule = class _ServerModule {
  static ɵfac = function ServerModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ServerModule)();
  };
  static ɵmod = ɵɵdefineNgModule({
    type: _ServerModule,
    exports: [BrowserModule]
  });
  static ɵinj = ɵɵdefineInjector({
    providers: PLATFORM_SERVER_PROVIDERS,
    imports: [BrowserModule]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ServerModule, [{
    type: NgModule,
    args: [{
      exports: [BrowserModule],
      providers: PLATFORM_SERVER_PROVIDERS
    }]
  }], null, null);
})();
function _document() {
  const injector = inject(Injector);
  const config = injector.get(INITIAL_CONFIG, null);
  const _enableDomEmulation = enableDomEmulation(injector);
  let document;
  if (config && config.document) {
    document = typeof config.document === "string" ? _enableDomEmulation ? parseDocument(config.document, config.url) : window.document : config.document;
  } else {
    document = getDOM().createHtmlDocument();
  }
  setDocument(document);
  return document;
}
function platformServer(extraProviders) {
  const noServerModeSet = false;
  if (noServerModeSet) {
    globalThis["ngServerMode"] = true;
  }
  const platform = createPlatformFactory(platformCore, "server", INTERNAL_SERVER_PLATFORM_PROVIDERS)(extraProviders);
  if (noServerModeSet) {
    platform.onDestroy(() => {
      globalThis["ngServerMode"] = void 0;
    });
  }
  return platform;
}

// node_modules/@angular/platform-server/fesm2022/platform-server.mjs
var import_rxjs2 = __toESM(require_cjs(), 1);
function provideServerRendering() {
  if (false) {
    globalThis["ngServerMode"] = true;
  }
  return makeEnvironmentProviders([...PLATFORM_SERVER_PROVIDERS]);
}
var EVENT_DISPATCH_SCRIPT_ID = "ng-event-dispatch-contract";
function createServerPlatform(options) {
  const extraProviders = options.platformProviders ?? [];
  const measuringLabel = "createServerPlatform";
  startMeasuring(measuringLabel);
  const platform = platformServer([{
    provide: INITIAL_CONFIG,
    useValue: {
      document: options.document,
      url: options.url
    }
  }, extraProviders]);
  stopMeasuring(measuringLabel);
  return platform;
}
function findEventDispatchScript(doc) {
  return doc.getElementById(EVENT_DISPATCH_SCRIPT_ID);
}
function removeEventDispatchScript(doc) {
  findEventDispatchScript(doc)?.remove();
}
function prepareForHydration(platformState, applicationRef) {
  const measuringLabel = "prepareForHydration";
  startMeasuring(measuringLabel);
  const environmentInjector = applicationRef.injector;
  const doc = platformState.getDocument();
  if (!environmentInjector.get(IS_HYDRATION_DOM_REUSE_ENABLED, false)) {
    removeEventDispatchScript(doc);
    return;
  }
  appendSsrContentIntegrityMarker(doc);
  const eventTypesToReplay = annotateForHydration(applicationRef, doc);
  if (eventTypesToReplay.regular.size || eventTypesToReplay.capture.size) {
    insertEventRecordScript(environmentInjector.get(APP_ID), doc, eventTypesToReplay, environmentInjector.get(CSP_NONCE, null));
  } else {
    removeEventDispatchScript(doc);
  }
  stopMeasuring(measuringLabel);
}
function appendSsrContentIntegrityMarker(doc) {
  const comment = doc.createComment(SSR_CONTENT_INTEGRITY_MARKER);
  doc.body.firstChild ? doc.body.insertBefore(comment, doc.body.firstChild) : doc.body.append(comment);
}
function appendServerContextInfo(applicationRef) {
  const injector = applicationRef.injector;
  let serverContext = sanitizeServerContext(injector.get(SERVER_CONTEXT, DEFAULT_SERVER_CONTEXT));
  applicationRef.components.forEach((componentRef) => {
    const renderer = componentRef.injector.get(Renderer2);
    const element = componentRef.location.nativeElement;
    if (element) {
      renderer.setAttribute(element, "ng-server-context", serverContext);
    }
  });
}
function insertEventRecordScript(appId, doc, eventTypesToReplay, nonce) {
  const measuringLabel = "insertEventRecordScript";
  startMeasuring(measuringLabel);
  const {
    regular,
    capture
  } = eventTypesToReplay;
  const eventDispatchScript = findEventDispatchScript(doc);
  if (eventDispatchScript) {
    const replayScriptContents = `window.__jsaction_bootstrap(document.body,"${appId}",${JSON.stringify(Array.from(regular))},${JSON.stringify(Array.from(capture))});`;
    const replayScript = createScript(doc, replayScriptContents, nonce);
    eventDispatchScript.after(replayScript);
  }
  stopMeasuring(measuringLabel);
}
function renderInternal(platformRef, applicationRef) {
  return __async(this, null, function* () {
    const platformState = platformRef.injector.get(PlatformState);
    prepareForHydration(platformState, applicationRef);
    appendServerContextInfo(applicationRef);
    const environmentInjector = applicationRef.injector;
    const callbacks = environmentInjector.get(BEFORE_APP_SERIALIZED, null);
    if (callbacks) {
      const asyncCallbacks = [];
      for (const callback of callbacks) {
        try {
          const callbackResult = callback();
          if (callbackResult) {
            asyncCallbacks.push(callbackResult);
          }
        } catch (e) {
          console.warn("Ignoring BEFORE_APP_SERIALIZED Exception: ", e);
        }
      }
      if (asyncCallbacks.length) {
        for (const result of yield Promise.allSettled(asyncCallbacks)) {
          if (result.status === "rejected") {
            console.warn("Ignoring BEFORE_APP_SERIALIZED Exception: ", result.reason);
          }
        }
      }
    }
    return platformState.renderToString();
  });
}
function asyncDestroyPlatform(platformRef) {
  return new Promise((resolve) => {
    setTimeout(() => {
      platformRef.destroy();
      resolve();
    }, 0);
  });
}
var DEFAULT_SERVER_CONTEXT = "other";
var SERVER_CONTEXT = new InjectionToken("SERVER_CONTEXT");
function sanitizeServerContext(serverContext) {
  const context = serverContext.replace(/[^a-zA-Z0-9\-]/g, "");
  return context.length > 0 ? context : DEFAULT_SERVER_CONTEXT;
}
function renderModule(moduleType, options) {
  return __async(this, null, function* () {
    const {
      document,
      url,
      extraProviders: platformProviders
    } = options;
    const platformRef = createServerPlatform({
      document,
      url,
      platformProviders
    });
    try {
      const moduleRef = yield platformRef.bootstrapModule(moduleType);
      const applicationRef = moduleRef.injector.get(ApplicationRef);
      const measuringLabel = "whenStable";
      startMeasuring(measuringLabel);
      yield applicationRef.whenStable();
      stopMeasuring(measuringLabel);
      return yield renderInternal(platformRef, applicationRef);
    } finally {
      yield asyncDestroyPlatform(platformRef);
    }
  });
}
function renderApplication(bootstrap, options) {
  return __async(this, null, function* () {
    const renderAppLabel = "renderApplication";
    const bootstrapLabel = "bootstrap";
    const _renderLabel = "_render";
    startMeasuring(renderAppLabel);
    const platformRef = createServerPlatform(options);
    try {
      startMeasuring(bootstrapLabel);
      const applicationRef = yield bootstrap({
        platformRef
      });
      stopMeasuring(bootstrapLabel);
      startMeasuring(_renderLabel);
      const measuringLabel = "whenStable";
      startMeasuring(measuringLabel);
      yield applicationRef.whenStable();
      stopMeasuring(measuringLabel);
      const rendered = yield renderInternal(platformRef, applicationRef);
      stopMeasuring(_renderLabel);
      return rendered;
    } finally {
      yield asyncDestroyPlatform(platformRef);
      stopMeasuring(renderAppLabel);
    }
  });
}
var VERSION = new Version("21.2.7");

export {
  DominoAdapter,
  INITIAL_CONFIG,
  BEFORE_APP_SERIALIZED,
  ENABLE_DOM_EMULATION,
  PlatformState,
  INTERNAL_SERVER_PLATFORM_PROVIDERS,
  SERVER_RENDER_PROVIDERS,
  ServerModule,
  platformServer,
  provideServerRendering,
  renderInternal,
  SERVER_CONTEXT,
  renderModule,
  renderApplication,
  VERSION
};
//# sourceMappingURL=chunk-UEUENI2S.js.map
