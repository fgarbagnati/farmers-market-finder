import Ember from 'ember';

export default Ember.Controller.extend({
	baseUri: "http://search.ams.usda.gov/farmersmarkets/v1/data.svc",
	bounds: new google.maps.LatLngBounds(),
	markers: [],
	actions: {
		search: function() {
			this.clearPreviousData();
			$.ajax({
				url: this.baseUri + "/zipSearch?zip=" + this.get('zipCode'),
				dataType: 'json',
				cache: false,
				success: function(data) {
					if(data.results[0].id == "Error") {
						alert('Didn\'t find that zipcode. Please try again');
						this.setProperties({zipCode: ''});
					} else {
						this.sortData(data);
					}
				}.bind(this),
				error: function(xhr, status, err) {
					alert(err);
				}.bind(this)
			});
		}
	},
	clearPreviousData: function() {
		var bounds = new google.maps.LatLngBounds();
		this.bounds = bounds;
		this.deleteMarkers();
	},
	sortData: function(data) {
		var len = data.results.length;
		for (var i = 0; i < len; i ++) {
			this.lookUpById(data.results[i].id);
		}
	},
	lookUpById: function(id) {
		return $.ajax({
			url: this.baseUri + "/mktDetail?id=" + id,
			dataType: 'json',
			cache: false,
			success: function(data) {
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
			}.bind(this),
			error: function(xhr, status, err) {
				alert(err);
			}.bind(this)
		});
	},
	getNameFromGoogleMapsLink: function(googleMapsLink) {
		var x = googleMapsLink.split('?q=')[1].split('%20').pop();
		x = decodeURI(x.replace(/^\(/, '').replace(/\)$/, '')).replace(/\+/g, ' ');

		return x.substring(1, x.length - 1);
	},
	getLatLngFromGoogleMapsLink: function(googleMapsLink) {
		var x = googleMapsLink.split('?q=')[1].split('%20');
		x[0] = x[0].replace(/%2C$/,'');
		
		return x.slice(0, -1).map(parseFloat);
	}, 
	placeMarkerOnMap: function(market) {
		var position = new google.maps.LatLng(market.latLng[0], market.latLng[1]);
		this.bounds.extend(position);
		var marker = new google.maps.Marker({
			position: position,
			map: window.map,
			title: market.name,
			icon: 'assets/images/turnip.png'
		});
		this.markers.push(marker);
		window.map.fitBounds(this.bounds);
	},
	deleteMarkers: function() {
		for (var i = 0; i < this.markers.length; i++) {
			this.markers[i].setMap(null);
		}
		this.markers = [];
	}
});
