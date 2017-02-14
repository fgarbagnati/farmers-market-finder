import Ember from 'ember';

export default Ember.Controller.extend({
	actions: {
		search: function() {
			alert(this.get('zipCode'));
		}
	}
});
