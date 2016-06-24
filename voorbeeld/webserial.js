/*
webgpio.js 2.00 Web GPIO switch
---------------------------------------------------------------------------------                             
 Visit projects.privateeyepi.com for full details                                 
                                                                                  
 J. Evans December 2013       
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, 
 WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN 
 CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.                                                       
                                                                                  
 Revision History                                                                  
 V1.00 - New                                                             
 ----------------------------------------------------------------------------------
*/

var IPAddress;
var http = require('http'); 
var gpio = require("pi-gpio");
var connect = require('connect');
	serveStatic = require('serve-static');
var os=require('os');
var ifaces=os.networkInterfaces();

function LightSerialOn() {
var SerialPort = require("serialport").SerialPort
var serialPort = new SerialPort("/dev/ttyAMA0", {
  baudrate: 9600
});
	console.log('in lightserialon');
	serialPort.on("open", function () {
	  console.log('open');
	  serialPort.on('data', function(data) {
	    console.log('data received: ' + data);
	  });
	  console.log('writing serial port');
	  serialPort.write("a--RELAYAON-", function(err, results) {
	    console.log('err ' + err);
	    console.log('results ' + results);
	  });
	});	
}

function LightSerialOff() {
var SerialPort = require("serialport").SerialPort
var serialPort = new SerialPort("/dev/ttyAMA0", {
  baudrate: 9600
});
	serialPort.on("open", function () {
	  console.log('open');
	  serialPort.on('data', function(data) {
	    console.log('data received: ' + data);
	  });
	  serialPort.write("a--RELAYAOFF", function(err, results) {
	    console.log('err ' + err);
	    console.log('results ' + results);
	  });
	});	
}

function LightOn() {
gpio.open(12, "output", function(err) {        
	gpio.write(12, 1, function() {          
        gpio.close(12);                       
        });
    });
}

function LightOff() {
gpio.open(12, "output", function(err) {
	gpio.write(12, 0, function() {            
        gpio.close(12);                        
        });	
    });
}

for (var dev in ifaces) {
  ifaces[dev].forEach(function(details){
    if (details.family=='IPv4') {
    	if (details.address!="127.0.0.1"){
      		IPAddress=details.address;
      	}
    }
  });
}

http.createServer(function (request, response) { 
    if( request.method == 'GET' ) {
        id = request.url.substring(request.url.search("cmd=")+4,request.url.length);
	    if (id=="ON") {
	    	console.log('on clicked');
	    	LightSerialOn();	
	    	}
	    if (id=="OFF") {
	    	LightSerialOff();	
	    	}
	    response.writeHead(200);
	    response.write("<script type='text/javascript'>location.href = 'http://"+IPAddress+":8000'</script>");
	    response.end();
        }
    }).listen(8080,IPAddress);

var app = connect();
app.use(serveStatic(__dirname));
app.listen(8000);

console.log('Server running at http://'+IPAddress+'/');
   
