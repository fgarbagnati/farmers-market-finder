"use strict";

/* jshint ignore:start */



/* jshint ignore:end */

define('farmers-market-finder/app', ['exports', 'ember', 'farmers-market-finder/resolver', 'ember-load-initializers', 'farmers-market-finder/config/environment'], function (exports, _ember, _farmersMarketFinderResolver, _emberLoadInitializers, _farmersMarketFinderConfigEnvironment) {

  var App = undefined;

  _ember['default'].MODEL_FACTORY_INJECTIONS = true;

  App = _ember['default'].Application.extend({
    modulePrefix: _farmersMarketFinderConfigEnvironment['default'].modulePrefix,
    podModulePrefix: _farmersMarketFinderConfigEnvironment['default'].podModulePrefix,
    Resolver: _farmersMarketFinderResolver['default']
  });

  (0, _emberLoadInitializers['default'])(App, _farmersMarketFinderConfigEnvironment['default'].modulePrefix);

  exports['default'] = App;
});
define('farmers-market-finder/components/google-map', ['exports', 'ember'], function (exports, _ember) {
	exports['default'] = _ember['default'].Component.extend({
		insertMap: (function () {
			var container = this.$('#map')[0];
			var options = {
				center: new window.google.maps.LatLng(this.get('latitude'), this.get('longitude')),
				zoom: 4,
				styles: [{
					"featureType": "landscape", "stylers": [{ "hue": "#FFA800" }, { "saturation": 0 }, { "lightness": 0 }, { "gamma": 1 }]
				}, {
					"featureType": "road.highway",
					"stylers": [{ "hue": "#53FF00" }, { "saturation": -73 }, { "lightness": 40 }, { "gamma": 1 }]
				}, {
					"featureType": "road.arterial",
					"stylers": [{ "hue": "#FBFF00" }, { "saturation": 0 }, { "lightness": 0 }, { "gamma": 1 }]
				}, {
					"featureType": "road.local",
					"stylers": [{ "hue": "#00FFFD" }, { "saturation": 0 }, { "lightness": 30 }, { "gamma": 1 }]
				}, {
					"featureType": "water",
					"stylers": [{ "hue": "#00BFFF" }, { "saturation": 6 }, { "lightness": 8 }, { "gamma": 1 }]
				}, {
					"featureType": "poi",
					"stylers": [{ "hue": "#679714" }, { "saturation": 33.4 }, { "lightness": -25.4 }, { "gamma": 1 }]
				}]
			};
			window.map = new window.google.maps.Map(container, options);
		}).on('didInsertElement')
	});
});
define("farmers-market-finder/controllers/search", ["exports", "ember"], function (exports, _ember) {
	exports["default"] = _ember["default"].Controller.extend({
		baseUri: "http://search.ams.usda.gov/farmersmarkets/v1/data.svc",
		bounds: new google.maps.LatLngBounds(),
		markers: [],
		actions: {
			search: function search() {
				this.clearPreviousData();
				$.ajax({
					url: this.baseUri + "/zipSearch?zip=" + this.get('zipCode'),
					dataType: 'json',
					cache: false,
					success: (function (data) {
						if (data.results[0].id == "Error") {
							alert('Didn\'t find that zipcode. Please try again');
							this.setProperties({ zipCode: '' });
						} else {
							this.sortData(data);
						}
					}).bind(this),
					error: (function (xhr, status, err) {
						alert(err);
					}).bind(this)
				});
			}
		},
		clearPreviousData: function clearPreviousData() {
			var bounds = new google.maps.LatLngBounds();
			this.bounds = bounds;
			this.deleteMarkers();
		},
		sortData: function sortData(data) {
			var len = data.results.length;
			for (var i = 0; i < len; i++) {
				this.lookUpById(data.results[i].id);
			}
		},
		lookUpById: function lookUpById(id) {
			return $.ajax({
				url: this.baseUri + "/mktDetail?id=" + id,
				dataType: 'json',
				cache: false,
				success: (function (data) {
					var market = {
						key: id,
						name: this.getNameFromGoogleMapsLink(data.marketdetails.GoogleLink),
						address: data.marketdetails.Address,
						products: data.marketdetails.Products,
						schedule: data.marketdetails.Schedule,
						gmap: data.marketdetails.GoogleLink,
						latLng: this.getLatLngFromGoogleMapsLink(data.marketdetails.GoogleLink)
					};
					this.placeMarkerOnMap(market);
				}).bind(this),
				error: (function (xhr, status, err) {
					alert(err);
				}).bind(this)
			});
		},
		getNameFromGoogleMapsLink: function getNameFromGoogleMapsLink(googleMapsLink) {
			var x = googleMapsLink.split('?q=')[1].split('%20').pop();
			x = decodeURI(x.replace(/^\(/, '').replace(/\)$/, '')).replace(/\+/g, ' ');

			return x.substring(1, x.length - 1);
		},
		getLatLngFromGoogleMapsLink: function getLatLngFromGoogleMapsLink(googleMapsLink) {
			var x = googleMapsLink.split('?q=')[1].split('%20');
			x[0] = x[0].replace(/%2C$/, '');

			return x.slice(0, -1).map(parseFloat);
		},
		placeMarkerOnMap: function placeMarkerOnMap(market) {
			var position = new google.maps.LatLng(market.latLng[0], market.latLng[1]);
			this.bounds.extend(position);
			var marker = new google.maps.Marker({
				position: position,
				map: window.map,
				title: market.name
			});
			this.markers.push(marker);
			window.map.fitBounds(this.bounds);
		},
		deleteMarkers: function deleteMarkers() {
			for (var i = 0; i < this.markers.length; i++) {
				this.markers[i].setMap(null);
			}
			this.markers = [];
		}
	});
});
define('farmers-market-finder/helpers/app-version', ['exports', 'ember', 'farmers-market-finder/config/environment'], function (exports, _ember, _farmersMarketFinderConfigEnvironment) {
  exports.appVersion = appVersion;
  var version = _farmersMarketFinderConfigEnvironment['default'].APP.version;

  function appVersion() {
    return version;
  }

  exports['default'] = _ember['default'].Helper.helper(appVersion);
});
define('farmers-market-finder/helpers/pluralize', ['exports', 'ember-inflector/lib/helpers/pluralize'], function (exports, _emberInflectorLibHelpersPluralize) {
  exports['default'] = _emberInflectorLibHelpersPluralize['default'];
});
define('farmers-market-finder/helpers/singularize', ['exports', 'ember-inflector/lib/helpers/singularize'], function (exports, _emberInflectorLibHelpersSingularize) {
  exports['default'] = _emberInflectorLibHelpersSingularize['default'];
});
define('farmers-market-finder/initializers/app-version', ['exports', 'ember-cli-app-version/initializer-factory', 'farmers-market-finder/config/environment'], function (exports, _emberCliAppVersionInitializerFactory, _farmersMarketFinderConfigEnvironment) {
  var _config$APP = _farmersMarketFinderConfigEnvironment['default'].APP;
  var name = _config$APP.name;
  var version = _config$APP.version;
  exports['default'] = {
    name: 'App Version',
    initialize: (0, _emberCliAppVersionInitializerFactory['default'])(name, version)
  };
});
define('farmers-market-finder/initializers/browser/ember-cli-webfontloader', ['exports', 'ember', 'farmers-market-finder/config/environment', 'ember-cli-webfontloader/initializers/browser/ember-cli-webfontloader'], function (exports, _ember, _farmersMarketFinderConfigEnvironment, _emberCliWebfontloaderInitializersBrowserEmberCliWebfontloader) {
    exports['default'] = {
        name: 'ember-cli-webfontloader',
        initialize: function initialize() {
            var config = _ember['default'].get(_farmersMarketFinderConfigEnvironment['default'], 'webFontConfig') || {};
            (0, _emberCliWebfontloaderInitializersBrowserEmberCliWebfontloader['default'])(config);
        }
    };
});
define('farmers-market-finder/initializers/container-debug-adapter', ['exports', 'ember-resolver/container-debug-adapter'], function (exports, _emberResolverContainerDebugAdapter) {
  exports['default'] = {
    name: 'container-debug-adapter',

    initialize: function initialize() {
      var app = arguments[1] || arguments[0];

      app.register('container-debug-adapter:main', _emberResolverContainerDebugAdapter['default']);
      app.inject('container-debug-adapter:main', 'namespace', 'application:main');
    }
  };
});
define('farmers-market-finder/initializers/data-adapter', ['exports', 'ember'], function (exports, _ember) {

  /*
    This initializer is here to keep backwards compatibility with code depending
    on the `data-adapter` initializer (before Ember Data was an addon).
  
    Should be removed for Ember Data 3.x
  */

  exports['default'] = {
    name: 'data-adapter',
    before: 'store',
    initialize: function initialize() {}
  };
});
define('farmers-market-finder/initializers/ember-data', ['exports', 'ember-data/setup-container', 'ember-data/-private/core'], function (exports, _emberDataSetupContainer, _emberDataPrivateCore) {

  /*
  
    This code initializes Ember-Data onto an Ember application.
  
    If an Ember.js developer defines a subclass of DS.Store on their application,
    as `App.StoreService` (or via a module system that resolves to `service:store`)
    this code will automatically instantiate it and make it available on the
    router.
  
    Additionally, after an application's controllers have been injected, they will
    each have the store made available to them.
  
    For example, imagine an Ember.js application with the following classes:
  
    App.StoreService = DS.Store.extend({
      adapter: 'custom'
    });
  
    App.PostsController = Ember.Controller.extend({
      // ...
    });
  
    When the application is initialized, `App.ApplicationStore` will automatically be
    instantiated, and the instance of `App.PostsController` will have its `store`
    property set to that instance.
  
    Note that this code will only be run if the `ember-application` package is
    loaded. If Ember Data is being used in an environment other than a
    typical application (e.g., node.js where only `ember-runtime` is available),
    this code will be ignored.
  */

  exports['default'] = {
    name: 'ember-data',
    initialize: _emberDataSetupContainer['default']
  };
});
define('farmers-market-finder/initializers/export-application-global', ['exports', 'ember', 'farmers-market-finder/config/environment'], function (exports, _ember, _farmersMarketFinderConfigEnvironment) {
  exports.initialize = initialize;

  function initialize() {
    var application = arguments[1] || arguments[0];
    if (_farmersMarketFinderConfigEnvironment['default'].exportApplicationGlobal !== false) {
      var theGlobal;
      if (typeof window !== 'undefined') {
        theGlobal = window;
      } else if (typeof global !== 'undefined') {
        theGlobal = global;
      } else if (typeof self !== 'undefined') {
        theGlobal = self;
      } else {
        // no reasonable global, just bail
        return;
      }

      var value = _farmersMarketFinderConfigEnvironment['default'].exportApplicationGlobal;
      var globalName;

      if (typeof value === 'string') {
        globalName = value;
      } else {
        globalName = _ember['default'].String.classify(_farmersMarketFinderConfigEnvironment['default'].modulePrefix);
      }

      if (!theGlobal[globalName]) {
        theGlobal[globalName] = application;

        application.reopen({
          willDestroy: function willDestroy() {
            this._super.apply(this, arguments);
            delete theGlobal[globalName];
          }
        });
      }
    }
  }

  exports['default'] = {
    name: 'export-application-global',

    initialize: initialize
  };
});
define('farmers-market-finder/initializers/injectStore', ['exports', 'ember'], function (exports, _ember) {

  /*
    This initializer is here to keep backwards compatibility with code depending
    on the `injectStore` initializer (before Ember Data was an addon).
  
    Should be removed for Ember Data 3.x
  */

  exports['default'] = {
    name: 'injectStore',
    before: 'store',
    initialize: function initialize() {}
  };
});
define('farmers-market-finder/initializers/store', ['exports', 'ember'], function (exports, _ember) {

  /*
    This initializer is here to keep backwards compatibility with code depending
    on the `store` initializer (before Ember Data was an addon).
  
    Should be removed for Ember Data 3.x
  */

  exports['default'] = {
    name: 'store',
    after: 'ember-data',
    initialize: function initialize() {}
  };
});
define('farmers-market-finder/initializers/transforms', ['exports', 'ember'], function (exports, _ember) {

  /*
    This initializer is here to keep backwards compatibility with code depending
    on the `transforms` initializer (before Ember Data was an addon).
  
    Should be removed for Ember Data 3.x
  */

  exports['default'] = {
    name: 'transforms',
    before: 'store',
    initialize: function initialize() {}
  };
});
define("farmers-market-finder/instance-initializers/ember-data", ["exports", "ember-data/-private/instance-initializers/initialize-store-service"], function (exports, _emberDataPrivateInstanceInitializersInitializeStoreService) {
  exports["default"] = {
    name: "ember-data",
    initialize: _emberDataPrivateInstanceInitializersInitializeStoreService["default"]
  };
});
define('farmers-market-finder/resolver', ['exports', 'ember-resolver'], function (exports, _emberResolver) {
  exports['default'] = _emberResolver['default'];
});
define('farmers-market-finder/router', ['exports', 'ember', 'farmers-market-finder/config/environment'], function (exports, _ember, _farmersMarketFinderConfigEnvironment) {

  var Router = _ember['default'].Router.extend({
    location: _farmersMarketFinderConfigEnvironment['default'].locationType,
    rootURL: _farmersMarketFinderConfigEnvironment['default'].rootURL
  });

  Router.map(function () {
    this.route('search');
  });

  exports['default'] = Router;
});
define('farmers-market-finder/routes/search', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({});
});
define('farmers-market-finder/services/ajax', ['exports', 'ember-ajax/services/ajax'], function (exports, _emberAjaxServicesAjax) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberAjaxServicesAjax['default'];
    }
  });
});
define("farmers-market-finder/templates/application", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "am4phim8", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"container\"],[\"flush-element\"],[\"text\",\"\\n\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n\\t\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12\"],[\"flush-element\"],[\"text\",\"\\n\\t\\t\\t\"],[\"append\",[\"unknown\",[\"outlet\"]],false],[\"text\",\"\\n\\t\\t\"],[\"close-element\"],[\"text\",\"\\n\\t\"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "farmers-market-finder/templates/application.hbs" } });
});
define("farmers-market-finder/templates/components/google-map", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "LJqq0a1Y", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"id\",\"map\"],[\"flush-element\"],[\"close-element\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "farmers-market-finder/templates/components/google-map.hbs" } });
});
define("farmers-market-finder/templates/index", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "lQF+PpTu", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12\"],[\"flush-element\"],[\"text\",\"\\n\\t\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"greeting\"],[\"flush-element\"],[\"text\",\"\\n\\t\\t\\t\"],[\"open-element\",\"h1\",[]],[\"flush-element\"],[\"text\",\"Find a nearby farmer's market\"],[\"close-element\"],[\"text\",\"\\n\\t\\t\\t\"],[\"block\",[\"link-to\"],[\"search\"],[[\"class\"],[\"btn btn-lg btn-success\"]],0],[\"text\",\"\\n\\t\\t\"],[\"close-element\"],[\"text\",\"\\n\\t\"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"Lettuce get started!\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "farmers-market-finder/templates/index.hbs" } });
});
define("farmers-market-finder/templates/search", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "uJ5XopJD", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-4\"],[\"flush-element\"],[\"text\",\"\\n\\t\\t\"],[\"open-element\",\"form\",[]],[\"static-attr\",\"id\",\"search\"],[\"static-attr\",\"class\",\"form-inline\"],[\"flush-element\"],[\"text\",\"\\n\\t\\t\\t\"],[\"open-element\",\"h3\",[]],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"ion-leaf\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"Nothing beets locally grown!\"],[\"close-element\"],[\"text\",\"\\n\\t\\t\\t\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"Use the search bar to find your nearby FarMar's!\"],[\"close-element\"],[\"text\",\"\\n\\t\\t\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n\\t\\t\\t\\t\"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"class\",\"value\",\"placeholder\"],[\"text\",\"form-control input-lg\",[\"get\",[\"zipCode\"]],\"Enter your zipcode\"]]],false],[\"text\",\"\\n\\t\\t\\t\"],[\"close-element\"],[\"text\",\"\\n\\t\\t\\t\"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn btn-lg btn-success\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"search\"]],[\"flush-element\"],[\"text\",\"Search\"],[\"close-element\"],[\"text\",\"\\n\\t\\t\"],[\"close-element\"],[\"text\",\"\\n\\t\"],[\"close-element\"],[\"text\",\"\\n\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-8\"],[\"flush-element\"],[\"text\",\"\\n\\t\\t\"],[\"append\",[\"helper\",[\"google-map\"],null,[[\"latitude\",\"longitude\"],[\"37.09024\",\"-95.712891\"]]],false],[\"text\",\"\\n\\t\"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "farmers-market-finder/templates/search.hbs" } });
});
/* jshint ignore:start */



/* jshint ignore:end */

/* jshint ignore:start */

define('farmers-market-finder/config/environment', ['ember'], function(Ember) {
  var prefix = 'farmers-market-finder';
/* jshint ignore:start */

try {
  var metaName = prefix + '/config/environment';
  var rawConfig = document.querySelector('meta[name="' + metaName + '"]').getAttribute('content');
  var config = JSON.parse(unescape(rawConfig));

  var exports = { 'default': config };

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

/* jshint ignore:end */

});

/* jshint ignore:end */

/* jshint ignore:start */

if (!runningTests) {
  require("farmers-market-finder/app")["default"].create({"name":"farmers-market-finder","version":"0.0.0+0afab1b2"});
}

/* jshint ignore:end */
//# sourceMappingURL=farmers-market-finder.map
