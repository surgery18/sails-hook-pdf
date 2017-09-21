var ejs = require('ejs');
var fs = require('fs');
var path = require('path');
var async = require('async');
var _ = require('lodash');
var pdf = require('html-pdf');


module.exports = function PDF(sails){

  var self;

  var compileTemplate = function (view, data, cb) {
    // Use Sails View Hook if available
    if (sails.hooks.views && sails.hooks.views.render) {
      var relPath = path.relative(sails.config.paths.views, view);
      sails.hooks.views.render(relPath, data, cb);
      return;
    }

    // No Sails View hook, fallback to ejs
    fs.readFile(view + '.ejs', function (err, source) {
      if (err) return cb(err);

      try {
        var compileFn = ejs.compile((source || "").toString(), {
          cache: true, filename: view
        });

        cb(null, compileFn(data));
      } catch (e) {
        return cb(e);
      }
    });
  };

  return {

    defaults: {
      __configKey__: {
        templateDir: path.resolve(sails.config.appPath, 'views/pdfTemplates'),
      }
    },

    configure: function () {
      // Ensure we have the full path, relative to app directory
      sails.config[this.configKey].templateDir = path.resolve(sails.config.appPath, sails.config[this.configKey].templateDir);
    },

    initialize: function (cb) {
      self = this;
      return cb();
    },

    make: function (template, data, options, cb) {
      data = data || {};

      // Turn off layouts by default
      if (typeof data.layout === 'undefined') data.layout = false;

      var templateDir = sails.config[self.configKey].templateDir;
      var templatePath = path.join(templateDir, template);
      var defaults = {
        output: ""
      };
      var opt = _.defaults(options, defaults);

      sails.log.verbose('Making PDF:', options);

      async.auto({
        compileHtmlTemplate: function (next) {
          compileTemplate(templatePath + "/pdf", data, function (err, html) {
            if (err) {
              next(err);
            } else {
              next(null, html);
            }
          });
        },

        genPdf: ["compileHtmlTemplate", function(results, next) {
          var html = results.compileHtmlTemplate;
          pdf.create(html, opt).toFile(path.resolve(sails.config.appPath, opt.output), function(err, res) {
            if (err) {
              next(err);
            } else {
              next(null, res);
            }
          });
        }]

      },
      // ASYNC callback
      function (err, results) {
        if (err) return cb(err);
        cb(null, results.genPdf);
      });
    }
  };
};
