var IPAddress;
var http = require('http');
var gpio = require("rpi-gpio");
var sensor = require('ds18x20');
var connect = require('connect');
        serveStatic = require('serve-static');
var os=require('os');
var ifaces=os.networkInterfaces();
var err;
var verwarmingStatus = "I";
var ketelStatus= "I";
var temp;
gpio.setup(16, gpio.DIR_OUT);
gpio.setup(18, gpio.DIR_OUT);

 function VerwarmingAan() {
	 verwarmingStatus = "I";
    gpio.write(16, true, function(err) {
        if (err) console.log('Error writing to pin 16 true');
        console.log('Written to pin');
    });
}


function VerwarmingUit() {
	verwarmingStatus = "O";
    gpio.write(16, false, function(err) {
        if (err) console.log('Error writing to pin 16 false');
        console.log('Written to pin');
    });
}

function KetelAan(){
		ketelStatus= "I";
        gpio.write(18,true,function(err){
        if(err) console.log('Error writing to pin 18 true');
        console.log('Writing to pin');
        });
}

function KetelUit(){
		ketelStatus= "O";
        gpio.write(18,false,function(err){
        if(err) console.log('Error writing to pin 18 false');
        console.log('Writing to pin');
        });
}


sensor.isDriverLoaded(function(err,isLoaded){
        if(err)console.log('Something went wrong loading the driver', err)
        else console.log('driver is loaded');
});

sensor.list(function(err,listOfDeviceIds){
        console.log(listOfDeviceIds);
});

sensor.getAll(function(err,tempObj){
  console.log(tempObj);
});

function Temperatuur(){
    temp = sensor.get('28-000007604538');
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
            if (id=="VerwarmingAan") {
                VerwarmingAan();
                }
            if (id=="VerwarmingUit") {
                VerwarmingUit();
                }
            if(id=="KetelAan"){
                KetelAan();
                }
            if(id=="KetelUit"){
                KetelUit();
                }
			if(id=="Temperatuur"){
				Temperatuur();
			}
            response.writeHead(200);
            response.write("<script type='text/javascript'>location.href = 'http://"+IPAddress+":8000ans="+ketelStatus+verwarmingStatus+temp"'</script>");
            response.end();
        }
    }).listen(8080,IPAddress);

var app = connect();
app.use(serveStatic(__dirname));
app.listen(8000);

console.log('Server running at http://'+IPAddress+'/');
