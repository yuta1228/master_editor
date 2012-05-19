(function() {
  var Main;

  Main = function() {
    return this.index = function(req, resp, params) {
      return this.respond(params, {
        format: "html",
        template: 'index'
      });
    };
  };

  exports.Main = Main;

}).call(this);
