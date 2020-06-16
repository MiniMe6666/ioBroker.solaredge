"use strict";

/*
 * Solaredge Monitoring
 * github.com/92lleo/ioBroker.solaredge
 *
 * (c) 2019 Leonhard Kuenzler (MIT)
 *
 * Created with @iobroker/create-adapter v1.18.0
 */

const utils = require("@iobroker/adapter-core");
const request = require('request');

/**
 * The adapter instance
 * @type {ioBroker.Adapter}
 */
let adapter;

/**
 * Starts the adapter instance
 * @param {Partial<ioBroker.AdapterOptions>} [options]
 */
function startAdapter(options) {
    // Create the adapter and define its methods
    return adapter = utils.adapter(Object.assign({}, options, {
        name: "solaredge",

        // The ready callback is called when databases are connected and adapter received configuration.
        // start here!
        ready: main, // Main method defined below for readability

        // is called when adapter shuts down - callback has to be called under any circumstances!
        unload: (callback) => {
            try {
                adapter.log.info("cleaned everything up...");
                callback();
            } catch (e) {
                callback();
            }
        },
    }));
}

function main() {

	var siteid = adapter.config.siteid;
    var apikey = adapter.config.apikey;

    adapter.log.info("site id: " + siteid);
    adapter.log.info("api key: " + (apikey ? (apikey.substring(0, 4) + "...") : "not set"));

    // adapter only works with siteid and api key set
    if((!siteid) || (!apikey)) {
        adapter.log.error("siteid or api key not set")
    } else {
        var resource = "overview";

        // for some other resources the url itself might change
        var url = "https://monitoringapi.solaredge.com/site/"+siteid+"/"+resource+".json?api_key="+apikey;

        request({  url: url,
                   json: true },
	            function (error, response, content) {
	                if (!error && response.statusCode == 200) {
	                    if (content) {

                            var callback = function(val){}

	                        var overview = content.overview;

	                        adapter.log.info("Current power for "+siteid+": "+overview.currentPower.power+" W");

	                        // last update time
	                        adapter.createState('', siteid, 'lastUpdateTime', {
	                            name: "lastUpdateTime",
	                            def: overview.lastUpdateTime,
	                            type: 'string',
	                            read: 'true',
	                            write: 'false',
	                            role: 'value',
	                            desc: 'Last update from inverter'
	                        }, callback);

	                        adapter.createState('', siteid, 'currentPower', {
	                            name: "currentPower",
	                            def: overview.currentPower.power,
	                            type: 'number',
	                            read: 'true',
	                            write: 'false',
	                            role: 'value',
	                            desc: 'current power in W'
	                        }, callback);

	                        adapter.createState('', siteid, 'lifeTimeData', {
	                            name: "lifeTimeData",
	                            def: overview.lifeTimeData.energy,
	                            type: 'number',
	                            read: 'true',
	                            write: 'false',
	                            role: 'value',
	                            desc: 'Lifetime energy in Wh'
	                        }, callback);

	                        adapter.createState('', siteid, 'lastYearData', {
	                            name: "lastYearData",
	                            def: overview.lastYearData.energy,
	                            type: 'number',
	                            read: 'true',
	                            write: 'false',
	                            role: 'value',
	                            desc: 'last year energy in Wh'
	                        }, callback);

	                        adapter.createState('', siteid, 'lastMonthData', {
	                            name: "lastMonthData",
	                            def: overview.lastMonthData.energy,
	                            type: 'number',
	                            read: 'true',
	                            write: 'false',
	                            role: 'value',
	                            desc: 'last month energy in Wh'
	                        }, callback);

	                        adapter.createState('', siteid, 'lastDayData', {
	                            name: "lastDayData",
	                            def: overview.lastDayData.energy,
	                            type: 'number',
	                            read: 'true',
	                            write: 'false',
	                            role: 'value',
	                            desc: 'last day energy in Wh'
	                        }, callback);

	                    } else {
	                        adapter.log.warn('Response has no valid content. Check your data and try again. '+response.statusCode);
	                    }
	                } else {
	                    adapter.log.warn(error);
	                }

	            });
	var resource = "currentPowerFlow";
	var url = "https://monitoringapi.solaredge.com/site/"+siteid+"/"+resource+".json?api_key="+apikey;
	request({  url: url,
                  json: true },
            function (error, response, content) {
                if (!error && response.statusCode == 200) {
                    if (content) {

                           var callback = function(val){}

                        var currentPowerFlow = content.siteCurrentPowerFlow;
//			console.log(currentPowerFlow);
                        adapter.log.info("Current power for "+siteid);
// Create negative Values if Powerflow from PV to GRID
			var gpower = currentPowerFlow.connections[0];
			gpower = JSON.stringify(gpower);
			if (gpower.includes('"from":"GRID"')) { var gridpower = currentPowerFlow.GRID.currentPower} else { var gridpower = 0 - currentPowerFlow.GRID.currentPower};
                        
			    
			    adapter.createState('', siteid, 'GRID', {
                            name: "GRID currentPower",
                            def: gridpower,
                            type: 'number',
                            read: 'true',
                            write: 'false',
                            role: 'value',
                            desc: 'current power in W'
                        }, callback);

			adapter.createState('', siteid, 'LOAD', {
                            name: "LOAD currentPower",
                            def: currentPowerFlow.LOAD.currentPower,
                            type: 'number',
                            read: 'true',
                            write: 'false',
                            role: 'value',
                            desc: 'current power in W'
                        }, callback);

			adapter.createState('', siteid, 'PV', {
                            name: "PV currentPower",
                            def: currentPowerFlow.PV.currentPower,
                            type: 'number',
                            read: 'true',
                            write: 'false',
                            role: 'value',
                            desc: 'current power in W'
                        }, callback);
			
			if (currentPowerFlow.STORAGE) {

                        adapter.createState('', siteid, 'StorageCurPower', {
                            name: "Storage currentPower",
                            def: currentPowerFlow.STORAGE.currentPower,
                            type: 'number',
                            read: 'true',
                            write: 'false',
                            role: 'value',
                            desc: 'current power in W'
                        }, callback);

			adapter.createState('', siteid, 'StorageChargeLevel', {
                            name: "Storage Charging Level",
                            def: currentPowerFlow.STORAGE.chargeLevel,
                            type: 'number',
                            read: 'true',
                            write: 'false',
                            role: 'value',
                            desc: 'Storage Charge Level in W'
                        }, callback);
			
			
			
			}
                    } else {
                        adapter.log.warn('Response has no valid content. Check your data and try again. '+response.statusCode);
                    }
                } else {
                    adapter.log.warn(error);
                }

                adapter.log.info("Done, stopping...");
                adapter.stop();
            });


	}

    // (force) stop adapter after 15s
    setTimeout(function() {
        adapter.log.warn("Timeout, stopping...");
        adapter.stop();
    }, 15000);
}

// @ts-ignore parent is a valid property on module
if (module.parent) {
    // Export startAdapter in compact mode
    module.exports = startAdapter;
} else {
    // otherwise start the instance directly
    startAdapter();
}
