Ext.define('Zermelo.store.ZStore', {
    extend: 'Ext.data.Store',
    requires: ['Ext.data.proxy.LocalStorage'],
    config: {
        proxy: {
            type: 'localstorage'
        },
        autoSort: false
    },

    loadFromLocalStorage: function (storeId) {
        this.load(function() {
            var entries = localStorage.getItem(storeId);
            entries = entries ? entries.split(',') : [];
            for (var key in entries) {
                // setTimeout(0) to prevent long waits for the UI
                setTimeout(function() {
                    localStorage.removeItem(storeId + '-' + key)
                }, 0);
            }
            // The order of above removes and this one doesn't matter, so don't worry about the race condition
            localStorage.removeItem(storeId);
        });
    },

    loadFromLocalForage: function () {
        this.suspendEvents();
        this.clearFilter();
        var successCallback = function (err, result) {
            if(result) {
                var decoded = JSON.parse(result, function(key, value) {
                    if(key == 'start' || key == 'end') {
                        return new Date(value)
                    }
                    return value;
                });
                decoded.forEach(function(record) {
                    this.add(record);
                }, this);
            }
            this.resetFilters();
            this.resumeEvents();
            this.fireEvent('refresh');
            if(this.getCount() == 0) {
                this.fetch();
            }
        };
        successCallback = successCallback.bind(this);
        localforage.getItem(Ext.getClassName(this), successCallback);
    },


    loadFromLocalForageOrStorage: function() {
        var storeId = this.getStoreId();
        storeId = storeId.slice(0, -1) + 'Store';
        // One time transition from localStorage to localforage
        if (localStorage.getItem(storeId)) {
            this.loadFromLocalStorage(storeId);
        }
        else {
            this.loadFromLocalForage();
        }
    },

    saveToLocalForage: function() {
        dataArray = [];
        this.each(function(record) {
            dataArray.push(record.getData());
        });
        var keys = this.getModel().getFields().keys;
        var toSave = JSON.stringify(dataArray, function(key, value) {
            // Save the root object
            if(!key)
                return value;
            // We're saving an array, so if key is a number, we're looking at a model instance
            if(!isNaN(key))
                return value;
            // Drop unnecessary attributes
            if(!keys.includes(key))
                return;
            // Serialize dates
            if(key == 'start' || key == 'end')
                return Date.parse(value);
            return value;
        });
        localforage.setItem(Ext.getClassName(this), toSave, function() {dataArray.length = 0;});
    }
});