/*
webgpio.js 1.00 Web GPIO switch
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
 V2    - Uses rpi-gpio library so we no longer need Quick2Wire                                                          
 ----------------------------------------------------------------------------------
*/

var IPAddress;
var http = require('http'); 
var gpio = require("rpi-gpio");
var connect = require('connect');
	serveStatic = require('serve-static');
var os=require('os');
var ifaces=os.networkInterfaces();
var err;

gpio.setup(12, gpio.DIR_OUT);
 
function LightOn() {
    gpio.write(12, true, function(err) {
        if (err) console.log('Error writing to pin');
        console.log('Written to pin');
    });
}


function LightOff() {
    gpio.write(12, false, function(err) {
        if (err) console.log('Error writing to pin');
        console.log('Written to pin');
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
	    	LightOn();	
	    	}
	    if (id=="OFF") {
	    	LightOff();	
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
   
