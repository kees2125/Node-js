var IPAddress;
var http = require('http');
var gpio = require("rpi-gpio");
var sensor = require('ds18x20');
var connect = require('connect');
        serveStatic = require('serve-static');
var os=require('os');
var ifaces=os.networkInterfaces();
var err;
var verwarmingStatus = "ON";
var ketelStatus= "ON";
var temp ="tempratuur:??";
var StringBuilder = require("stringbuilder");
var AutoMode= false;
var AutoTemp= 22.0;
var myVar = setInterval(myTimer, 1000);
gpio.setup(16, gpio.DIR_OUT);
gpio.setup(18, gpio.DIR_OUT);
function getWebsite(req,resp){
	var sb = new StringBuilder({newline: "\r\n"});
	
	sb.appendLine("<html> ");
	sb.appendLine("<style>");
	sb.appendLine("body{background-color:lightgrey;}")
	sb.appendLine("</style>");
	sb.appendLine("<body>");
	sb.appendLine("<h2>Thermostaat Bediening</h2>");
	sb.appendLine("<table style = 'width:10%'> ");
	sb.appendLine("<tr>");
	sb.appendLine("<td><p>Verwarming:</p></td>");
	sb.appendLine("<td><input type='button' onclick='setVerwarming()'  id='verwarming' value="+verwarmingStatus+"></input></td>");
	sb.appendLine("</tr> ");
	sb.appendLine("<tr>");
	sb.appendLine("<td><p>Ketel:</p></td>");
	sb.appendLine("<td><input  type='button' onclick='setKetel()' id='ketel' value="+ketelStatus+"></input></td>");
	sb.appendLine("</tr>");
	sb.appendLine("</table>");
	sb.appendLine("<p>Temperatuur: "+temp+"&degC</p>");
	sb.appendLine("<input type='text' id='autoTempField'></input>");
	sb.appendLine("<input type='button' onClick='setAutoTemp()' id='setTemp' value='Zet Automatische Temperatuur in Celcius'></input>");
	if(AutoMode == true)
	{
		sb.appendLine("<p>Modus:Automatisch</p>");
	}
	else
	{
		sb.appendLine("<p>Modus:Handmatig</p>");
	}
	sb.appendLine("</body>");
	sb.appendLine("<script type='text/javascript'>");
	sb.appendLine("var IPAddress='192.168.0.21';");
	sb.appendLine("var start");
	sb.appendLine("var end;");
	sb.appendLine("var currentPageUrl = '';");
	sb.appendLine("if (typeof this.href === 'undefined') {");
	sb.appendLine("currentPageUrl = document.location.toString().toLowerCase();");
	sb.appendLine("}");
	sb.appendLine("else {");
	sb.appendLine("currentPageUrl = this.href.toString().toLowerCase();");
	sb.appendLine("}");
	sb.appendLine("start=currentPageUrl.search('http://')+7;");
	sb.appendLine("end=currentPageUrl.search(':80');");
	sb.appendLine("IPAddress=currentPageUrl.substring(start,end);");
	sb.appendLine("function setKetel() {");
	sb.appendLine("location.href = 'http://'+IPAddress+':8080?cmd=KetelSwitch';");
	sb.appendLine("};");
	sb.appendLine("function setVerwarming() {");
	sb.appendLine("location.href = 'http://'+IPAddress+':8080?cmd=VerwarmingSwitch';");
	sb.appendLine("};");
	sb.appendLine("function setAutoTemp(){");
	sb.appendLine("var gettemp = document.getElementById('autoTempField').value;")
	sb.appendLine("location.href = 'http://'+IPAddress+':8080?cmd='+gettemp;");
	sb.appendLine("};");
	sb.appendLine("</script>");
	sb.appendLine("</html>");
	
	sb.build(function(err,result){
		resp.writeHead(200,{"Content-Type":"text/html"});
		resp.write(result);
		resp.end();
	});
}
function myTimer() {
    if(AutoMode == true)
	{
		if(temp>= AutoTemp)
		{
			if(verwarmingStatus == "ON")
			{
				VerwarmingSwitch();
			}
		}
		else
		{
			if(verwarmingStatus == "OFF")
			{
				VerwarmingSwitch();
			}
		}
	}
}
 function VerwarmingSwitch() {
	 AutoMode = false;
	 if(verwarmingStatus == "OFF")
	 {
		 verwarmingStatus = "ON";
			gpio.write(16, false, function(err) {
			if (err) console.log('Error writing to pin 16 true');
			console.log('Written to pin');
		});
	 }
	 else
	 {
		 verwarmingStatus = "OFF";
		gpio.write(16, true, function(err) {
        if (err) console.log('Error writing to pin 16 false');
        console.log('Written to pin');
    });
	 }
}



function KetelSwitch(){
	AutoMode = false;
	if(ketelStatus == "OFF")
	{
		ketelStatus= "ON";
        gpio.write(18,false,function(err){
        if(err) console.log('Error writing to pin 18 true');
        console.log('Writing to pin');
        });
	}
	else
	{
		ketelStatus= "OFF";
        gpio.write(18,true,function(err){
        if(err) console.log('Error writing to pin 18 false');
        console.log('Writing to pin');
        });
	}
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
		Temperatuur();
            if (id=="VerwarmingSwitch") {
                VerwarmingSwitch();
                }
            else if(id=="KetelSwitch"){
                KetelSwitch();
                }
			else if(id != null)
			{
				if(id.length > 2 && id.length < 5)
				{
					var test;
					try{
						test = parseFloat(id);
						AutoMode = true;
						AutoTemp = test;
					}
					catch(err)
					{
						AutoMode = false;
					}
				}
			}
			getWebsite(request,response);
            //response.writeHead(200);
            //response.write("<script type='text/javascript'>location.href = 'http://"+IPAddress+":8000ans="+ketelStatus+""+verwarmingStatus+""+temp+"'</script>");
            //response.end();
        }
    }).listen(8080,IPAddress);

var app = connect();
app.use(serveStatic(__dirname));
app.listen(8000);

console.log('Server running at http://'+IPAddress+'/');
