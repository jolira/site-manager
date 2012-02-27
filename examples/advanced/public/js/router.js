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
            require(['views/services/page'], function (ServicesPage) {
                var servicesPage = new ServicesPage();
                servicesPage.render();
            });
        },
//        company:function () {
//            require(['views/optimize/page'], function (ModulePage) {
//                var modulePage = new ModulePage();
//                modulePage.render();
//            });
//        },
//        technology:function () {
//            require(['views/dashboard/page'], function (DashboardPage) {
//                var dashboardPage = new DashboardPage();
//                dashboardPage.render();
//            });
//        },
        home:function () {
            require(['view/home/page'], function (HomePage) {
                var homePage = new HomePage();
                homePage.render();
            });
        },
        defaultAction:function (actions) {
            // We have no matching route, lets display the dashboard

            this.home();
        }
    });

    var initialize = function () {
        var app_router = new AppRouter;
        Backbone.history.start();
    };
    return {
        initialize:initialize
    };
});
