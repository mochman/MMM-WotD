/* Magic Mirror
 * Module: MMM-WotD
 *
 * By fewieden https://github.com/mochman/MMM-WotD
 * MIT Licensed.
 */

const NodeHelper = require("node_helper");
var fs = require('fs');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;

module.exports = NodeHelper.create({

    start: function() {
        console.log("Starting module: " + this.name);
    },

    socketNotificationReceived: function(notification, payload) {
        if(notification === 'DOWNLOAD'){
            this.getData(payload);
        }
    },

    getData: function(url) {
	var self = this;
	var file = fs.createWriteStream("./modules/MMM-WotD/wotd.html");
	var curl = spawn('curl', [url]);
	curl.stdout.on('data', function(data) { file.write(data); });
	curl.stdout.on('end', function(data) {
		file.end();
	});
	curl.on('exit', function(code) {
        	if (code != 0) {
            		console.log('Failed: ' + code);
        	} else {
			self.getMessage();
		}
    	});
    },
	
    getMessage: function() {
	var self = this;
	var child = exec("cat ./modules/MMM-WotD/wotd.html | sed '1,/GY:/d;/<br>/,$d' | sed '1d' | sed -e 's/^[ \\t]*//' | tr '\n' ' ' > ./modules/MMM-WotD/message.txt", function (error, stdout, stderr) {
       	if (error) throw error;
       	});
	self.getEtymology();
    },

    getEtymology: function() {
	var message = "";
	var self = this;
	fs.readFile('./modules/MMM-WotD/message.txt', 'utf8', function (err, data) {
               	if (err) {
                       throw err;
		} else if (data == "") {
                        console.log("No Data");
                        setTimeout(function() {
                                self.getEtymology();
                        }, 5000);
                }else {
			message = data;
			//console.log("Message - " + message);
			self.sendSocketNotification("DOWNLOADED", message);
               }
        });
    }

});
