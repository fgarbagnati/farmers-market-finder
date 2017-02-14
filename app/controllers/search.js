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
						this._actions.sortData(data);
					}
				}.bind(this),
				error: function(xhr, status, err) {
					alert(err);
				}.bind(this)
			});
		},
		sortData: function(data) {
			console.log('sorting');
			var len = data.results.length;
			for (var i = 0; i < len; i ++) {
				this.lookUpById(data.results[i].id);
			}
			console.log(this.farMars);
		},
		lookUpById: function(id) {
			console.log('lookUpById');
			return $.ajax({
				url: "http://search.ams.usda.gov/farmersmarkets/v1/data.svc/mktDetail?id=" + id,
				dataType: 'json',
				cache: false,
				success: function(data) {
					var market = {
						key: id,
						address: data.marketdetails.Address,
						products: data.marketdetails.Products,
						schedule: data.marketdetails.Schedule,
						gmap: data.marketdetails.GoogleLink
					};
					console.log(market);
				}.bind(this),
				error: function(xhr, status, err) {
					alert(err);
				}.bind(this)
			});
		}
	}
});
