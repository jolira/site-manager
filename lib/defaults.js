/*jshint white: false, node: true, vars: true, indent: 4 */
(function (module, __dirname) {
    "use strict";

    var path = require("path");

    module.exports = {
        /**
         * The options to be passed to connect.static
         */
        "staticOptions":{ /* maxAge: oneDay */ },
        /**
         *    {{#each metas}}
         *    <meta name="{{name}}" content="{{content}}">
         *    {{/each}}
         */
        "metas":[
            {
                name: "viewport",
                content: "width=device-width"
            }
        ],
        /**
         * The directories to be searched for public artifacts.
         */
        "public":[
            path.join(__dirname, "..", "public")
        ],
        /**
         *    {{#each links}}
         *    <link rel="{{rel}}" {{#if sizes}}sizes="{{sizes}}"{{#if}} href="{{href}}" />
         *    {{/each}}
         */
        "links":[
            {
                rel: "apple-touch-icon",
                href: "apple-touch-icon-precomposed.png"
            },
            {
                rel: "apple-touch-icon",
                sizes: "57x57",
                href: "apple-touch-icon-57x57-precomposed.png"
            },
            {
                rel: "apple-touch-icon",
                sizes: "72x72",
                href: "apple-touch-icon-72x72-precomposed.png"
            },
            {
                rel: "apple-touch-icon",
                sizes: "114x114",
                href: "apple-touch-icon-114x114-precomposed.png"
            }
        ],
        /**
         *    {{#each stylesheets}}
         *    <link rel="stylesheet" href="{{this}}">
         *    {{/each}}
         */
        "stylesheets":["css/style.css"],
        /**
         *  Be default we are using require.js; not quite a mainstream tool, so please set this property to false
         *  unless you want to spend the time using it.
         */
        "useRequireJS":true,
        /**
         * The array of HTML-files defines the html fragments that should be imported
         * into the main body of the document in order. The values in this array can either
         * be a string, which will be assumed to be a file-name that is search in all "public"
         * directories. The value can also be a function. If it is a function, it has to take
         * one parameter, which is a callback(err, content). Use content to return the text
         * that should be included.
         */
        "htmlFiles":[],
        /**
         * Loading scripts at the end of the file. Unless there is a good reason not to do it,
         * you should put all your scripts here.
         *
         * {{#each tailingScripts}}
         *  <script src="{{this}}"></script>
         * {{/each}}
         */
        "trailingScripts":[
            "js/app-cache.js"
        ],
        /**
         * Adding scripts in the head. Only modernizer should go here. The rest of the scripts
         * should go to traillingScripts.
         *
         * {{#each scripts}}
         *  <script src="{{this}}"></script>
         * {{/each}}
         */
        "scripts":[
            "js/libs/modernizr-2.5.2.min.js"
        ],
        /**
         * This setting control the script tags of type "text/template" that will be inserted
         * into the document for use by jQuery/Zepto.
         *
         * The values in this array can either be a string, which will be assumed to
         * be a file-name that is search in all "templates" directories. The value
         * can also be a function. If it is a function, it has to take one parameter,
         * which is a callback(err, content). Use content to return the text
         * that should be included.
         */
        "templateFiles":[],
        /**
         * allow users to register server-side functions
         * @Deprecated
         */
        "dispatcher":{
            /* projects: {
             "GET": function (cb, param1, param2, param3) {
             return cb(undefined, { success: true });
             }
             }*/
        }
    };
})(module, __dirname);
