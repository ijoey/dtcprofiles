module.exports = {
  dataPath: __dirname + '/data'
  , site: {
    title: 'A Profiles App'
  }
  , theme: 'default'
  , cookie: {
	  key: 'dtcprofiles'
	  , secret: 'this secret is used for signed coookies, differnt than auth signing.'
  }
  , port: 3000
  , secret: "this secret is used for signing the authenticated token for a user"
  , auth: {
	  host: 'something.authhost.com'
	  , port: '443'
	  , path: '/auth'
	  , method: 'POST'
  }
};
