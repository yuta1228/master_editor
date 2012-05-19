
Main = () ->
  this.index = (req,resp,params)->
    this.respond(params,{
      format:"html",
      template: 'index'
    })


exports.Main = Main