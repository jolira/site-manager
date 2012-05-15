site-manager [<img src="https://secure.travis-ci.org/jolira/site-manager.png" />](http://travis-ci.org/#!/jolira/site-manager)
========================================

A simple server for developing single-page applictions quickly in a team environment.

The core of the server are handlebar templates. Here is one handlebar template that comes with the site-manager at
[``public/index.html``](https://github.com/jolira/site-manager/blob/master/public/index.html).


A Very Simple Example
-----------------------------

Create a new directory demo appliation in a new directory, such as

```
mkdir mydemoapp
cd mydemoapp
```

Create a new ``package.json`` declaring site-manager as a dependency.

```
{
  "name": "mydemoapp",
  "version": "0.0.1",
  "dependencies": {
    "site-manager": "*"
  },
  "main":"index",
  "engines":{
    "node":">= 0.6.0 < 0.7.0"
  }
}
```

Declaring the site-manager is not strictly required, but makes deploying to many systems such as Heroku much
easier. Instead of declaring the dependency, one case also install the site-manager globally using
``npm install -g site-manager``.


Next, we need a ``index.js`` file:

```
(function (__dirname, module) {
    "use strict";
    var path = require("path");
    module.exports = function (defaults, cb, properties, app) {
        defaults.useRequireJS = false; // disable the site-manager support for requireJS
        defaults.hostname = "mydemoapp.jolira.com"; // define the name of the site
        defaults.title = "My Demo App"; // The title to be displayed in the titlebar
        defaults.htmlFiles = [
            path.join(__dirname, "content.html") // add some content
        ];
        return cb(undefined, defaults);
    };
})(__dirname, module);
```

Now, all that is remaining is to specify the html-fragment to be displayed when we run the site-manager.

```
<h1>Hello World!!!</h1>
```

To install the dependencies:

```
npm install -d
```

To run the example:

```
node_modules/.bin/site-manager --debug --port=3000 .
```

To run the example on Heroku you need the folowing ``Procfile`.

```
web: node_modules/.bin/site-manager --debug --port=$PORT --watch-dirs=false .
```

Go to ``http://localhost:3000/`` to the example running.

Configuring a Site
------------------------

As shown in the example, every site-manager site has configures the site by exporting a function. This function
looks like this:

```
    "use strict";
    module.exports = function (defaults, cb, properties, app) {
        // configure the defaults object here
        return cb(undefined, defaults);
    };
```

The default object takes the following parameters:

* ``defaults``: The defaults object to be configured. A detailed description of the properties
   of this object can be found at
   [``lib/defaults.json``](https://github.com/jolira/site-manager/blob/master/lib/defaults.js).
   The [``public/index.html``](https://github.com/jolira/site-manager/blob/master/public/index.html) shows
   how may of these values are used.
* ``cb`` the the callback function, which takes two parameters ``cb(err, vals)``. The first parameter
  should be set to ``undefined``unless there is an error to report. The second parameter should be used
  to pass the configured default object back to the site-manager.
* ``properties`` loaded from a ``.config.json`` file in the project directory.
* ``app`` the [express.js](http://expressjs.com/) object used by the site-manager.

Other Features
------------------------

Key features of this package are:

* _Teams_: Break the the app into many html fragments to make team development easier.
* _HTML5Boilerplate_: Our default templates incorporate the latest & greatest boilerplate.
* _RequireJS_: Teams can (optionally) use [Asynchronous Module Definition](https://github.com/amdjs/amdjs-api/wiki/AMD)
  to organize their JavaScript.
* _Auto Reloads_: The site-manager watches the file system for changes and automatically reloads a site when a
  change is detected.
* _Less_: Automatically compiles .less files to ``text/css using``.
* _Properties_: The site-manager loads ``.config.json`` files from the site directory. The site-manager also loads
  properties from a ``~/.sitemanager.json`` file and passes the data to the different sites it serves.
* _Manifest_: The site-manager automatically updates [html5
  manifest](http://www.html5rocks.com/en/tutorials/appcache/beginner/) when changes are detected the require reloading
  the site.
* _Developer Support_: The server monitors files and automatically restarts when changes are detected.

### Multi-Site Mode

The site-manager can run in multi-site mode, which creates virtual hosts for each module. The hostname is defined in
the site is used as the server name of the vhost.

In order to run in multi-site mode, point the site-manager to a directory that contains mutiple sites, such as in

```
site-manager examples # use the examples directory from the repo
```

To test sites you have to define the correct hostname. In order to do so, you have to add these names to `/etc/hosts`.
To define the hostames used by examples from the site-manager github repo, add the following line to `/etc/hosts`
(assuming you are running the site-manager on your machine):

```
127.0.0.1	simple.jolira.com advanced.jolira.com
```

Once this entry has been added, you can access the advanced example as `http://advanced.jolira.com:3000` and the simple
example at `http://simple.jolira.com:3000`.

### Single-Site Mode

When running in single-site mode, there is no vhosting (as only one site is served). To run the site-manager in
single-site mode, point it to a site directory as in:

```
site-manager examples/simple # use the examples directory from the repo
```

As there is no virtual hosting, we do not have to define any entry in `/etc/hosts` and can access the example at
`http://localhost:3000`.

### Enable Debug Output

Debug output is generated when the string `site-manager` is part of the value of the ``NODE_DEBUG`` environment
variable.

```
export NODE_DEBUG=site-manager
```

Testing
-----------------

Install jake: `npm install -g jake`

Note that Jake is a system-level tool, and wants to be installed globally.

To execute tests execute: `jake test`

License
-----------------

[MIT License](https://raw.github.com/jolira/site-manager/master/LICENSE.txt)

