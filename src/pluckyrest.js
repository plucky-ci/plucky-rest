const {Task} = require('plucky-pipeliner');
const async = require('async');
const Boom = require('boom');
let request = require('request');

const RequestET = (options, callback)=>{ // Request with basic error trapping built in
  if(options.host){
	options.headers = options.headers || {};
	options.headers.host = options.host;
  }
  options.url = ((url)=>{
	let parts = url.split('?');
	const prefix = parts.shift();
	let prefixParts = prefix.split('://');
	const protocol = prefixParts.shift();
	prefixParts = prefixParts.map((s)=>s.replace(/\/\//g, '\/'));
	prefixParts.unshift(protocol);
	parts.unshift(prefixParts.join('://'));
	return parts.join('?');
  })(options.url);
  request(options, (error, resp, payload)=>{
	if(error){
	  let err = Boom.badRequest(error);
	  err.output.statusCode = 500;
	  return callback(error);
	}
	if(!payload){
	  return callback(null, payload);
	}
	if(options.returnRaw){
	  return callback(null, payload);
	}
	try{
	  const info = JSON.parse(payload);
	  if(info && info.error){
		const err = Boom.badRequest(info.error);
		err.output.statusCode = 500;
		return callback(err);
	  }
	  return callback(null, info);
	} catch(e) {
	  if(payload.indexOf('HTTP ERROR ')>-1){
		const reCode = /HTTP ERROR ([0-9]+)/;
		const reReason = /Reason:\n<pre>(.*?)<\/pre>/;
		const code = reCode.exec(payload)[1];
		const reason = reReason.exec(payload)[1].trim();
		let err = Boom.badRequest(reason);
		err.output.statusCode = +code;
		return callback(err);
	  }
	  const err = Boom.badRequest(payload);
	  return callback(err);
	}
  });
};

class PluckyRest extends Task {
	handler(state, next) {
		const {
			params = {},
		} = state;
		if(!params.url) {
			return next(1, {status: 'No url configured'});
		}

		RequestET(params, (err, result) => {
			if(err) {
				return next(1, {status: err.output});
			}
			return next(0, {result});
		});
	}
}

module.exports = { PluckyRest, RequestET };