import Ember from 'ember';

export default Ember.Component.extend({
	insertMap: function() {
		var container = this.$('#map')[0];
		var options = {
			center: new window.google.maps.LatLng(
				this.get('latitude'),
				this.get('longitude')
			),
			zoom: 4
		};
		new window.google.maps.Map(container, options);
	}.on('didInsertElement')
});
