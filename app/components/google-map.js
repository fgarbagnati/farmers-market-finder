import Ember from 'ember';

export default Ember.Component.extend({
	insertMap: function() {
		var container = this.$('#map')[0];
		var options = {
			center: new window.google.maps.LatLng(
				this.get('latitude'),
				this.get('longitude')
			),
			zoom: 4,
			styles: [
				{
					"featureType": "landscape", "stylers": [
						{"hue": "#FFA800"},
						{"saturation": 0},
						{"lightness": 0},
						{"gamma": 1}
					]
				},
				{
					"featureType": "road.highway",
					"stylers": [
						{"hue": "#53FF00"},
						{"saturation": -73},
						{"lightness": 40},
						{"gamma": 1}
					]
				},
				{
					"featureType": "road.arterial",
					"stylers": [
						{"hue": "#FBFF00"},
						{"saturation": 0},
						{"lightness": 0},
						{"gamma": 1}
					]
				},
				{
					"featureType": "road.local",
					"stylers": [
						{"hue": "#00FFFD"},
						{"saturation": 0},
						{"lightness": 30},
						{"gamma": 1}
					]
				},
				{
					"featureType": "water",
					"stylers": [
						{"hue": "#00BFFF"},
						{"saturation": 6},
						{"lightness": 8},
						{"gamma": 1}
					]
				},
				{
					"featureType": "poi",
					"stylers": [
						{"hue": "#679714"},
						{"saturation": 33.4},
						{"lightness": -25.4},
						{"gamma": 1}
					]
				}
			]
		};
		new window.google.maps.Map(container, options);
	}.on('didInsertElement')
});
