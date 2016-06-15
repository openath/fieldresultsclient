var express = require('express');
var request = require('request');
var fs = require('fs');
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

const ORION_SERVER = 'https://orion.reportlab.com:1026/v1/';
var app = express();
//var ssloptions = {
//        key:fs.readFileSync(__dirname+'/../dackportal-server/key2015_.key'),
//        cert:fs.readFileSync(__dirname+'/../dackportal-server/cert2015.pem')
//};
var ssloptions = {
        key:fs.readFileSync(__dirname+'/../dackportal-server/key2015_.key'),
        cert:fs.readFileSync(__dirname+'/../dackportal-server/bundle2015.crt')
};
var http= require('https').createServer(ssloptions,app);
var io = require('socket.io')(http);
var url = require('url');
var fs = require('fs');
var bodyParser = require('body-parser');
var socket;
var dataCache={};
//opentrack:length-event:cd5b84a3-a47f-4d32-afba-e1197ac8a4ee
app.use(bodyParser.urlencoded({
        extended: true,
     parameterLimit: 10000,
     limit: 1024 * 1024 * 10
}));
app.use(bodyParser.json({
        extended: true,
     parameterLimit: 10000,
     limit: 1024 * 1024 * 10
}));

app.post('/', function (req, response) {
	// console.log(JSON.stringify(req.body,null,'\t'));
	// var fname = new Date().getTime().toString();
	// fs.writeFile(__dirname+'/posts/'+fname + ".json",JSON.stringify(req.body,null,'\t'));
	// response.send('Received');
    //console.log(JSON.stringify(req.body,null,'\t'));
    var inter = req.body;
    if(inter && inter.contextResponses && inter.contextResponses[0].statusCode.code == '200' && inter.contextResponses[0].contextElement && inter.contextResponses[0].contextElement.id){
        //console.log(inter.contextResponses[0].contextElement.id);
        io.to(inter.contextResponses[0].contextElement.id).emit('update',inter);
        dataCache[inter.contextResponses[0].contextElement.id] = inter;
    }

    //socket.emit('update',req.body);

});
app.listen(3002, function () {
  console.log('Example app listening on port 3002!');
});

http.listen(3003, function(){
  console.log('listening on *:3003');
});
io.on('connection', function(mainSocket){
    for(var x in mainSocket.handshake){
   //     console.log(x);
    }
    mainSocket.on('update',function(data){

	if(mainSocket && mainSocket.handshake && mainSocket.handshake.query && mainSocket.handshake.query.id){
		if(dataCache[mainSocket.handshake.query.id]){
			var obj = (dataCache[mainSocket.handshake.query.id].contextResponses[0].contextElement.attributes);
			for(var x = 0;x<obj.length;x++){
				if(obj[x].name=="observations"){
					console.log('socket update');
					obj[x].value = data;
					io.to(mainSocket.handshake.query.id).emit('update',dataCache[mainSocket.handshake.query.id]);
				}
			}
		}
	}
    });
    //subscrie(ponses[0].contextElement.attributesopentrack:length-event:cd5b84a3-a47f-4d32-afba-e1197ac8a4ee');
  //console.log(mainSocket.handshake.query.id);
  if(mainSocket && mainSocket.handshake && mainSocket.handshake.query && mainSocket.handshake.query.id){
        mainSocket.join(mainSocket.handshake.query.id);
        //console.log('a user connected to ',mainSocket.handshake.query.id);
        if(dataCache[mainSocket.handshake.query.id]){

            mainSocket.emit('update',dataCache[mainSocket.handshake.query.id]);
        }else{
            subscribe(mainSocket.handshake.query.id);
            query(mainSocket.handshake.query.id,function(err,result){
                if(!err){
                    mainSocket.emit('update',result);
                }
            });
        }
  }


  //socket = mainSocket;
  // setInterval(function(){
  //   console.log('pon');
  //   mainSocket.emit('update','true');
  // },1000);

});
//id: "opentrack:length-event:156c1ee1-7954-4fa7-8430-2e83d0691fce",
//subscribe('opentrack:length-event:cd5b84a3-a47f-4d32-afba-e1197ac8a4ee');
//query('opentrack:length-event:cd5b84a3-a47f-4d32-afba-e1197ac8a4ee');



function query(id,callback){
    req('queryContext',
        {"entities":[{
            "type": "",
            "isPattern": "false",
            "id": id
        }]
        },function(err,result){
            callback(err,result);
            // console.log(err);
            // console.log(JSON.stringify(result,null,'\t'));
    });
}



function subscribe(id){
    req('subscribeContext',
        {
        "entities": [
            {
                "type": "",
                "isPattern": "false",
                "id": id
            }
        ],
        "attributes": [
            "match",
            "name",
            "observations",
            "starters",
            "slug",
            "status",
            "location"
        ],
        "reference": "http://52.17.157.187:3002",
        "duration": "P1M",
        "notifyConditions": [
            {
                "type": "ONCHANGE",
                "condValues": [
                    "match",
                    "name",
                    "observations",
                    "starters",
                    "slug",
                    "status",
                    "location"
                ]
            }
        ],
        "throttling": "PT5S"
        },function(err,result){
            // console.log(err);
            // console.log(JSON.stringify(result,null,'\t'));
    });
}



function req(type,data,callback){
    request({
        url: ORION_SERVER+type,
        method: "POST",
        json: true,
        headers: {
            "content-type": "application/json",
        },
        body: data
    },
    function (error, response, body) {
        if((body&&body.errorCode) || (body && body.statusCode!= 200)){
            error = body;
        }
        callback(error,body);
    });
}
