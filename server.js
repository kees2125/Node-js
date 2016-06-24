var net = require('net');
float tempratuur;
int relay;
boolean verwarming =true;
boolean ketel = true;
var gpio = require("pi-gpio");
var server = net.createServer(function(socket) {
	socket.write('Echo server\r\n');
	socket.pipe(socket);
});
void setRelay()
{
	int temp =0;
	if(verwarming)
	{
		temp++;
		
	}
	if(ketel)
	{
		temp +=2;
	}
	relay = temp;
}
void update()
{
	gpio.open(16, "output", function(err) {		// Open pin 16 for output 
	gpio.write(16,verwarming, function() {			// Set pin 16 high (1) 
		gpio.close(16);						// Close pin 16 
	});
	gpio.open(16, "output", function(err) {		// Open pin 16 for output 
	gpio.write(16,ketel, function() {			// Set pin 16 high (1) 
		gpio.close(16);						// Close pin 16 
	});
	gpio.read(12,function(err,value){
		
	}
}
server.on('getData',function(){
	server.write(temp);
	server.write(relay);
}
server.on('turnVerOff',function()
{
	verwarming = false;
	setRelay();
}
server.on('turnVerOn',function()
{
	verwarming = true;
	setRelay();
}
server.on('turnKetelOff',function()
{
	ketel = false;
	setRelay();
}
server.on('turnKetelOn',function()
{
	ketel = true;
	setRelay();
}
server.listen(1337, '127.0.0.1');