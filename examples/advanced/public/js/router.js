// Filename: router.js
define([
    'jquery',
    'underscore',
    'backbone'
], function ($, _, Backbone) {
    var AppRouter = Backbone.Router.extend({
        routes:{
            // Pages
            '/services':'services',
            //'/company':'company',

            //'/technology':'technology',

            // Default - catch all
            '*actions':'defaultAction'
        },
        services:function () {
            require(['views/services/page'], function (Page) {
                var servicesPage = new Page();
                servicesPage.render();
            });
        },
//        company:function () {
//            require(['views/company/page'], function (Page) {
//                var companyPage = new Page();
//                companyPage.render();
//            });
//        },
//        technology:function () {
//            require(['views/technology/page'], function (Page) {
//                var page = new Page();
//                page.render();
//            });
//        },
        home:function () {
            require(['view/home/page'], function (Page) {
                var homePage = new Page();
                homePage.render();
            });
        },
        defaultAction:function (actions) {
            // We have no matching route, lets display the dashboard
            this.home();
        }
    });

    var initialize = function () {
        var app_router = new AppRouter();
        Backbone.history.start();
    };
    return {
        initialize:initialize
    };
});
