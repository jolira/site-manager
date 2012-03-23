site-manager [<img src="https://secure.travis-ci.org/jolira/site-manager.png" />](http://travis-ci.org/#!/jolira/site-manager)
========================================

Creating great single-page apps with HTML5 & CSS3 should not really be hard, so this project tries to make it simpler.

Key features of this package are:

* _Teams_: Break the the app into many html fragments to make team development easier.
* _HTML5Boilerplate_: Our default templates incorporate the latest & greatest boilerplate.
* _RequireJS_: Teams can (optionally) use [Asynchronous Module Definition](https://github.com/amdjs/amdjs-api/wiki/AMD)
  to organize their JavaScript.
* _Change Detection_: The site-manager watches the file system for changes and automatically reloads a site when a
  change is detected.
* _Manifest Generation_: The site-manager is creating a [html5
  manifest](http://www.html5rocks.com/en/tutorials/appcache/beginner/) on the the fly and regenerates it as needed.
* HTML/JS/CSS Compression: not implemented yet

Getting Started
-----------------

Install nodejs navigate to: http://nodejs.org/ and click Download. Once you've downloaded scroll down to the Build section to see how to configure and use it.

Install npm navigate to: http://npmjs.org/

From the site-manager directory install nodejs dependencies: `npm install -d`

Run the server with example sites: `node server.js /path/to/site-manager/examples`

To enable debugging add environment variable:
`NODE_DEBUG=site-manager`

## Developing with the Site Manager



Testing
-----------------

Install jake: `npm install -g jake`

Note that Jake is a system-level tool, and wants to be installed globally.

To execute tests execute: `jake test`

License
-----------------

View the [LICENSE](https://raw.github.com/jolira/site-manager/master/LICENSE.txt) file.

