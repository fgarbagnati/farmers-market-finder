import Ember from 'ember';

export default Ember.Controller.extend({
	actions: {
		search: function() {
			$.ajax({
				url: "http://search.ams.usda.gov/farmersmarkets/v1/data.svc/zipSearch?zip=" + this.get('zipCode'),
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
	sortData: function(data) {
		var len = data.results.length;
		for (var i = 0; i < len; i ++) {
			this.lookUpById(data.results[i].id);
		}
	},
	lookUpById: function(id) {
		return $.ajax({
			url: "http://search.ams.usda.gov/farmersmarkets/v1/data.svc/mktDetail?id=" + id,
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
				console.log(market);
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
	}
});
