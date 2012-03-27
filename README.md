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

Node.js 0.6 or better needs to be installed on your system. If you do not have node installed yet, please go to
http://nodejs.org/, download the package for your operating system, and install it.

One node is install, you can install the site-manaer using `sudo npm install -g site-manager`.

The site-manager runs third party modules. Examples for such modules can be found in the `examples` direcctory.
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

When running in single-site mode, there is no vhosting (as only one site is served). To run the site-manager in
single-site mode, point it to a site directory as in:

```
site-manager examples/simple # use the examples directory from the repo
```

As there is no virtual hosting, we do not have to define any entry in `/etc/hosts` and can access the example at
`http://localhost:3000`.

## Enable Debug Output

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

[MIT License](https://raw.github.com/jolira/site-manager/master/LICENSE.txt) file.

