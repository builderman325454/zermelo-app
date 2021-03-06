Ext.define("Zermelo.view.UserSearch", {
	xtype: 'UserSearch',
	extend: 'Ext.Container',
	requires: ['Ext.field.Search', 'Zermelo.view.UserSelect', 'Zermelo.model.User', 'Zermelo.store.UserStore'],
	config: {
		layout: 'vbox',
		items: [
			{
				xtype: 'searchfield',
				placeHolder: 'Zoeken...',
				autoComplete: false,
				autoCorrect: false,
				autoCapitalize: false,
				spellcheck: false,
				config: {
					docked: 'bottom',
					height: '42px',
					width: '100%'
				}
			},
			{
				xtype: 'button',
				ui: 'plain',
				height: '47px',
				width: '100%',
				html: '<div class="z-calendar-list-parent z-center-text z-border-top-bottom-narrow">Eigen rooster</div>',
				handler: function(dataview, ix, target, record, event, options) {
					Zermelo.UserManager.setUser();
					dataview.up('home').selectItem('lastView');
					dataview.up('UserSearch').clear();
				}

			},
			{
				xtype: 'UserSelect',
				flex: 1,
				config: {
					docked: 'top'
				}
			}
		],
		listeners: {
			initialize: function() {
				var userStore = Ext.getStore('Users');
				var selectList = this.down('UserSelect');
				var searchfield = this.down('searchfield');

				Zermelo.AjaxManager.loadOrGetUsers();

				searchfield.on({
					action: {
						fn: userStore.onAction,
						scope: userStore
					}
				});

				this.onAfter('painted', function() {
					searchfield.focus()
				});
			}
		}
	},

	clear: function() {
		this.down('searchfield').setValue('');
		Ext.getStore('Users').search('');
	}
});