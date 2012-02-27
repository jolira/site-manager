define([
    'jquery',
    'underscore',
    'backbone',
    'handlebars'
], function($, _, Backbone, handlebars){
    var AppView = Backbone.View.extend({
        el: '.container',
        intialize: function () {
        },
        render: function () {


            var source   = $("#layout-template").html();
            console.log('source: ' + source);
            var template = Handlebars.compile(source);
            var data = { users: "hello header"};
            $(this.el).html(template(data));

//            console.log('layoutTemplate: ' + layoutTemplate);
//            var template = handlebars.compile(layoutTemplate);
//            var data = {header1:'this is a test'};
//            $(this.el).html(template(data));

        }
    })

    return AppView;
});
