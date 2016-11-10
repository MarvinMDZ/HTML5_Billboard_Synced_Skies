// *********************************************************
//   This class is part of the Sizmek HTML5 JS Sync Feature 
//   ALL RIGHTS RESERVED TO © 2016 Sizmek, Inc.
// *********************************************************
// *********************************************************

jsSync = function (c) {
	// Save Reference to Script Name 
	this.scriptName		= "JS_Sync";
	// Script Version
	var scriptVersion	= "2.0.0";
	// Last Modified
	var lastModified	= "2016-3-08";
	// Block Id
	this.blockId			= 6213;
    // Establish Reference to config object Campaign Id
    this.numAds = c.numAds;
    // Establish Reference to config object Campaign Id
    this.adNum = c.adName;
    // Establish Boolean for tracking
    this.trackOnce = true;
    // Establish Reference to Panel name is available
    this.panelName = c.panelName;    
    // Establish Reference to this
    var self = this;
    // Call Init Method once AdKit is loaded    
    adkit.onReady(function() { self.init(); });
};

jsSync.prototype = {
	// Function That Creates Element Var
    d: function (id) { return document.getElementById(id); },
    
	// Initialize Feature
    init: function () {
    	// Establish Reference to script
    	var self = this;
    	// Handle Feature Tracking
		this.trackAdFeatures('impression', 'AF_' + this.scriptName + '_' + this.blockId);
    	
    	// Listen for EB Messages
		window.addEventListener("message", function (event) {
			// Evaluate JSON first before proceeding. When the jsonstring can't be evaluated, do not proceed.
        	try { var obj = eval(JSON.parse(event.data)); } catch(e){ return; };
		    // Handle Messages
			self.handleData(obj);
		});
		
		this.connect();
    },
	
    // DO NOT REMOVE THE FOLLOWING 
    // Track Ad Features - accepts interaction name and impression type
    trackAdFeatures: function(_interaction, _noun) { 
    	// Establish var to track local mode
    	var isServed;
    	// Verify ad is not local
    	try { isServed = EB._isServingMode(); } catch (err) {};
    	
		if (isServed && this.trackOnce) { 
			try {
				// Update Boolean
				this.trackOnce = false;	 
				// Grab Ad ID
				var adId = EB._adConfig.adId;
				// Grab Session ID
				var sId = EB._adConfig.sID; 
				// Build Tracking Pixel
				var trackingPixel = "https://bs.serving-sys.com/BurstingPipe/adServer.bs?cn=tf&c=19&mc=imp&pli=16479316&PluID=0&ord=%time%&rtu=-1&pcp=$$sID=" + sId + "|adID=" + adId + "|interactionName=" + _interaction + "|noun=" + _noun + "$$"; 
				// Fire Tracking Pixel by creating a new image.
				new Image().src = trackingPixel; 
				
			}  catch (err) {}
		}
    },  
    
    // Handle Messages from Listener
	handleData: function(_obj) {
		// Listen for Custom Script for Connection Message
		if (_obj.type === 'jsSyncStatus') {
	    	// Call Connection Message
		    this.handleStatusUpdate(_obj.data);
	    } else if (_obj.type === 'jsSyncMethod') {
	    	// Call Method that is passed through Sync Action Message
	        window[_obj.data.methodName] && window[_obj.data.methodName](_obj);
	    }
	}, 
	
	// Handle Connection Status and Update Events
	handleStatusUpdate: function(_obj) {
		// Establish var for event
		var e = document.createEvent("Event");
		// Check Status
		if (_obj.success == true){
			// Init Event
			e.initEvent("connection_established", true, false);
			// Pass Success Message
			e.detail =  { 'success': true };
			// Dispatch Event
			window.dispatchEvent(e);
			// Handle Tracking
			EB.automaticEventCounter('FEAT_HTML5_6213_JSSYNC_CONNECT');
		} else if (_obj.success == false){
			// Init Event
			e.initEvent("connection_failed", true, false);
			// Pass Detail Information with event
			e.detail =  { 'success': false, 'adId': _obj.syncedAdId || '' };
			// Dispatch Event
			window.dispatchEvent(e);
			// Handle Tracking
			EB.automaticEventCounter('FEAT_HTML5_6213_JSSYNC_DISCONNECT');
		}
	},
	
	// Handle Events
	addEventListener: function(_e, _m, _b) {
		// Listen for EB Messages
		window.addEventListener(_e, _m, _b); 
	},
	
	// Handle Connection Call to Custom Script
	connect: function() {
		// Establish Object
		var obj = {};
		
		// Add Ad Id
		obj.ebAdId = EB._adConfig.adId;
		// Add Unique Id
		obj.uid = EB._adConfig.uid;
		// Add Sync Ad Id
        obj.syncedAdId = this.adNum;
        // Add Total Number of Sync Ads
		obj.totalSyncedAds = this.numAds;
		
		// Check if Targeting Panel and add Panel Name
		if (this.panelName){ obj.panelName = this.panelName; };		
		
	    // Send loaded message to Sync Script
	    EB._sendMessage('jsSyncConnect', obj);	
	},
	
	// Handle the Disconnect call to Custom Script
	disconnect: function(){
		// Send Disconnect Message 
		EB._sendMessage('jsSyncDisconnect', { syncedAdId: this.adNum });
	},
	
	// Handle Messages
	sendMessage: function(_tar, _method){ 
		// Send Message
		EB._sendMessage('jsSyncMethod', { targetId: _tar, methodName: _method }); 
	}
		
}