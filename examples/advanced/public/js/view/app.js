define([
    'jquery',
    'underscore',
    'backbone',
    'handlebars',
    'text!templates/layout.html'
], function($, _, Backbone, handlebars, layoutTemplate){
    var AppView = Backbone.View.extend({
        el: '.container',
        intialize: function () {
        },
        render: function () {

            console.log('layoutTemplate: ' + layoutTemplate);
            var template = handlebars.compile(layoutTemplate);
            var data = {header1:'this is a test'};
            $(this.el).html(template(data));

        }
    })

    return AppView;
});
