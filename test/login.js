var test = require('tape');
var Https = require('https');
var QueryString = require('querystring');
var xmlToJson = require('xml2js').parseString;
test('Test login', function(t){
	var username = 'jxg6160';
	var password = 'asdf';
	var body = QueryString.stringify({callingProgram: 'dtcprofiles', j_username: username, j_password: password, j_storenumber: 9100});
	var request = Https.request({hostname: 'hdapps.homedepot.com'
		, port: '443'
		, path: '/MYTHDPassport/rs/identity/auth'
		, method: 'POST'
		, headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
		  , 'Content-Length': body.length
    	}
	}, function(response){
		response.setEncoding('utf8');
		response.on('data', function (chunk) {
			xmlToJson(chunk, function(err, data){
				t.ok(data.Auth.Error, data.Auth.Error[0]);
				t.end();
			});
		});
	});
	request.write(body);
	request.end();
	request.on('error', function(err){
		console.log(err);
		t.end();
	});
});