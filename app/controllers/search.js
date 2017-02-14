import Ember from 'ember';

export default Ember.Controller.extend({
	actions: {
		search: function() {
			$.ajax({
				url: "http://search.ams.usda.gov/farmersmarkets/v1/data.svc/zipSearch?zip=" + this.get('zipCode'),
				dataType: 'json',
				cache: false,
				success: function(data) {
					console.log(data);
				}.bind(this),
				error: function(xhr, status, err) {
					alert(err);
				}.bind(this)
			});
		}
	}
});
