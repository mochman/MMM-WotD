/* global Module */

/* Magic Mirror v0.1
 * Module: MMM-WotD
 * MIT Licensed
 * By Luke Moch
 */

Module.register("MMM-WotD",{

	// Default module config.
	defaults: {
		url: '',
		updateInterval: 60 * 60 * 1000 * 1, // 1 Hour wait time 
		animationSpeed: 2000,
		retryDelay: 2500,
		initialLoadDelay: 1000
	},

	start: function() {
		Log.info("Starting module: " + this.name);
		this.wordName = "";
		this.wordDef = "";
		this.wordEt = "";
		this.loaded = false;
		this.scheduleUpdate(this.config.initialLoadDelay);		
	},

	getStyles: function() {
		return ["MMM-WotD.css"];
	},

	updateWotD: function() {
		var self = this;
		var wordRequest = new XMLHttpRequest();
		wordRequest.open("GET", this.config.url, true);
		wordRequest.responseType = 'document';
		wordRequest.overrideMimeType('text/xml');
		wordRequest.onload = function() {
			if (wordRequest.readyState === wordRequest.DONE) {
				if (wordRequest.status === 200) {
					var xml = wordRequest.responseXML;
					self.wordName = xml.getElementsByTagName("title")[1].childNodes[0].nodeValue;					
					var wordLink = xml.getElementsByTagName("link")[2].childNodes[0].nodeValue;
					self.wordDef = xml.getElementsByTagName("description")[1].childNodes[0].nodeValue;
					self.sendSocketNotification("DOWNLOAD", wordLink);
				} else {
					console.log(self.name + ": Could not load word.");
				}
			}
		};
		wordRequest.send(null);
	},

	processWord: function(url) {
		console.log("In processWord");

	},

	scheduleUpdate: function(delay) {
		var nextLoad = this.config.updateInterval;
		//if a valid delay > 0 was passed into the function use that for the delay
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}

		var self = this;
		setTimeout(function() {
			self.updateWotD();
		}, nextLoad);
	},

	socketNotificationReceived: function(notification, payload) {
		if (notification === "DOWNLOADED") {
			this.wordEt = payload;
			this.loaded = true;
			this.updateDom(this.config.animationSpeed);
		}	
	},

	getDom: function() {
		var wrapper = document.createElement("div");

		if (!this.loaded) {
                        wrapper.innerHTML = "Loading WotD...";
                        wrapper.className = "dimmed light small";
                        return wrapper;
                }
		
		var table = document.createElement("table");
		var row = document.createElement("tr");
		var theWord = document.createElement("td");
		theWord.className = "bold small uppercased";
		theWord.innerHTML = this.wordName;
		row.appendChild(theWord);
		table.appendChild(row);

		row = document.createElement("tr");
                var etTitle = document.createElement("td");
                etTitle.className = "underlined";
                etTitle.innerHTML = "Definition";
                row.appendChild(etTitle);
                table.appendChild(row);

		row = document.createElement("tr");
		var theDef = document.createElement("td");
                theDef.className = "light xsmall";
                theDef.innerHTML = this.wordDef;
                row.appendChild(theDef);
                table.appendChild(row);

		row = document.createElement("tr");
		etTitle = document.createElement("td");
		etTitle.className = "underlined";
		etTitle.innerHTML = "Etymology";
		row.appendChild(etTitle);
		table.appendChild(row);

		row = document.createElement("tr");
		var theEt = document.createElement("td");
                theEt.className = "light xsmall";
                theEt.innerHTML = this.wordEt;
                row.appendChild(theEt);
                table.appendChild(row);

		wrapper.appendChild(table);
		return wrapper;
	}
});
