var output = [];
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendfile('index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
  //socket.emit('updates','hello');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});




var results = [{
			number: 'F',
			'first_name': 'Anthony',
			'last_name': 'OSHODI',
			club: 'WOODFORD G',
			data: [15.50, 15.69, 15.89, 16.06, 16.44, 'X']
		}, {
			number: 'WW',
			'first_name': 'Joey',
			'last_name': 'WATSON',
			club: 'WSE HOUNS',
			data: [16.10, 'X', 15.60, 'X', 'X', 'X']
		}, {
			number: 'G',
			'first_name': 'Gareth',
			'last_name': 'WINTER',
			club: 'GLOUCESTER',
			data: ['X', 16.09, 16.16, 'X', 15.87, 'X']
		}, {
			number: 'N',
			'first_name': 'Jamie',
			'last_name': 'STEVENSON',
			club: 'NEWHAM EB',
			data: [16.17, 15.95, 'X', 'X', 15.67, 'X']
		}, {
			number: 'FF',
			'first_name': 'Youcef',
			'last_name': 'ZATAT',
			club: 'WOODFORD G',
			data: [16.25, 'X', 16.76, 'X', 16.62, 'X']
		}, {
			number: 'S',
			'first_name': 'Zane',
			'last_name': 'DUQUEMIN',
			club: 'SHAFTSBURY',
			data: [17.48, 'X', 'X', 'X', 17.81, 18.21]
		}, {
			number: 'B',
			'first_name': 'Scott',
			'last_name': 'RIDER',
			club: 'BIRCHFIELD',
			data: [17.39, 17.41, 17.58, 17.88, 17.70, 17.71]
		}, {
			number: 'Y',
			'first_name': 'Scott',
			'last_name': 'LINCOLN',
			club: 'YORK',
			data: [17.32, 17.87, 'X', 'X', 17.59, 18.54]
		}, {
			number: 'W',
			'first_name': 'Osman',
			'last_name': 'MUSKWE',
			club: 'WSE HOUNS',
			data: [14.73, 14.46, 13.90]
		}, {
			number: 'K',
			'first_name': 'Chris',
			'last_name': 'DACK',
			club: 'KINGSTON',
			data: [14.04, 14.90, 15.13]
		}, {
			number: 'V',
			'first_name': 'Jordan',
			'last_name': 'DAVIES',
			club: 'YEOVIL',
			data: [12.44, 12.63, 13.12]
		}, {
			number: 'H',
			'first_name': 'Lawrence',
			'last_name': 'GOODACRE',
			club: 'HAVERING',
			data: [14.11, 14.57, 15.16]
		}];

var ticker ;
var round ;
var maxround;
initiate();
function initiate(){
	output = [];
	ticker = 0;
	round = 0;
	maxround = 6;
	for(var x = 0;x<results.length;x++){
		output.push(JSON.parse(JSON.stringify(results[x])));
		output[output.length-1].data=[];
		//console.log(output[output.length-1]);
	}
	go();
}
function go(){
	var cont = true;
	if(results[ticker].data[round]){
		output[ticker].data[round] = results[ticker].data[round];
		io.emit('update', {results:output,head:{round:round,athlete:ticker}});
		//console.log(output);
		setTimeout(function(){
			ticker++;
			
			if(ticker==output.length){
				if(round<maxround-1){
					ticker = 0;
					round++;
				}else{
					cont = false;
				}
			}
			if(cont){
				go();
			}else{
				initiate();
			}

		},2000);
	}else{
		ticker++;
			var cont = true;
			if(ticker==output.length){
				if(round<maxround-1){
					ticker = 0;
					round++;
				}else{
					cont = false;
				}
			}
			if(cont){
				go();
			}else{
				initiate();
			}
	}
}