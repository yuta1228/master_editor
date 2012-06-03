app = require("express")
fs = require("fs")
path = require('path')
url = require('url')

mongo = require('mongodb')
server = new mongo.Server('localhost', 27017, {auto_reconnect: true})
db = new mongo.Db("tinyquest", server)



server = app.createServer()
server.get('/', (req,res)->

  fs.readFile('./tpl/index.html', (error, content)->
    if error
      res.writeHead(500)
      res.end(error)
    else
      res.writeHead(200, {'Content-Type': 'text/html'})
      res.end(content, 'utf-8')
  )
)

server.get('/static/*', (req,res)->
  filePath = '.' + req.url.replace('static','htdocs');
  path.exists(filePath, (exists) ->
    if exists
      fs.readFile(filePath, (error, content)->
        if error
          res.writeHead(500)
          res.end()
        else
          ext = path.basename(filePath).split(".").pop()
          if ext == "js"
            res.writeHead(200, { 'Content-Type': 'application/javascript' })
            res.end(content, 'utf-8')
          else if ext == "png"
            res.writeHead(200, { 'Content-Type': 'image/png' })
            res.end(content, 'utf-8')
          else
            res.writeHead(200, { 'Content-Type': 'text/html' })
            res.end(content, 'utf-8')
      )
    else
      res.writeHead(404)
      res.end()
  )
)
db.open((err, db)->

  server.post('/api/*', (req,res)->
    body = '';
    req.on('data', (data)->
      body += data;
    )
    req.on('end', ()->
      context = url.parse(req.url)['pathname'].split("/api/")[1]
      if !err
        db.collection(context, (err, collection)->
          update_data = (data)->
            if data._id
              id = mongo.ObjectID(data._id)
              delete data._id
              collection.findOne({_id:id}, (err,item)->
              )
              collection.update({'_id':id}, data,{upsert:true, safe:true}, (err, result)->
              )
            else
              delete data._id
              collection.insert(data, (err, result)->
                console.log("inserted", data)
              )
          body = JSON.parse(body)
          if body.length > 0
            update_data i for i in body
          else
            update_data(body)

        )
    )
  )
  check_data = (context, res)->
    d = context
    if d.data !=undefined && d.reference != undefined && d.enums != undefined && d.total != undefined
      body = JSON.stringify(d)
      res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'})
      res.end(body)
  #

  server.get('/api/*', (req,res)->
    context = url.parse(req.url)['pathname'].split("/api/")[1]
    param = req.query
    ret_data = {}
    ret_data[context] = {}
    db.collection("reference").findOne({name:context},(err, item) ->
      if !err
        if item != null
          ret_data[context].reference = item.data
        else
          ret_data[context].reference = {}
      else
        console.trace()
#        console.log(err)
      check_data(ret_data[context], res)
    )
    db.collection(context).find({},{skip:param.start, limit:param.limit}).toArray((err,item)->
      if !err
        ret_data[context].data = item
      else
        console.trace()
#        console.log(err)
      check_data(ret_data[context], res)
      )
    db.collection("enums").findOne({},{fields:{_id:0}},(err,item)->
      if !err
        console.log(item);
        ret_data[context].enums = item
      else
        console.trace()
#        console.log(err)
      check_data(ret_data[context],res)
      )
    db.collection(context).count((err,count)->
      if !err
        if count != null
          ret_data[context].total = count
        else
          ret_data[context].total = 0

      else
        console.trace()
#        console.log(err)
      check_data(ret_data[context], res)
    )
#
#    weapon_table = {
#    data:[
#      {name_ja:"ショートソード",name_en:"ShortSword",category:1,durability:"10",growthType:0,atk:"100",skill1:"スラッシュ",skill2:"None",skill3:"None",rarity:0,userType:0},
#      {name_ja:"ショートソード",name_en:"ShortSword",category:1,durability:"10",growthType:1,atk:"100",skill1:"スラッシュ",skill2:"None",skill3:"None",rarity:0,userType:0},
#      {name_ja:"ショートソード",name_en:"ShortSword",category:1,durability:"10",growthType:2,atk:"100",skill1:"スラッシュ",skill2:"None",skill3:"None",rarity:0,userType:0},
#      {name_ja:"ショートソード",name_en:"ShortSword",category:1,durability:"10",growthType:2,atk:"100",skill1:"スラッシュ",skill2:"None",skill3:"None",rarity:0,userType:0},
#      {name_ja:"ショートソード",name_en:"ShortSword",category:1,durability:"10",growthType:2,atk:"100",skill1:"スラッシュ",skill2:"None",skill3:"None",rarity:0,userType:0},
#      {name_ja:"ショートソード",name_en:"ShortSword",category:1,durability:"10",growthType:2,atk:"100",skill1:"スラッシュ",skill2:"None",skill3:"None",rarity:0,userType:0},
#      {name_ja:"ショートソード",name_en:"ShortSword",category:1,durability:"10",growthType:2,atk:"100",skill1:"スラッシュ",skill2:"None",skill3:"None",rarity:0,userType:0},
#      {name_ja:"ショートソード",name_en:"ShortSword",category:1,durability:"10",growthType:2,atk:"100",skill1:"スラッシュ",skill2:"None",skill3:"None",rarity:0,userType:0},
#      {name_ja:"ショートソード",name_en:"ShortSword",category:1,durability:"10",growthType:2,atk:"100",skill1:"スラッシュ",skill2:"None",skill3:"None",rarity:0,userType:0},
#      {name_ja:"ショートソード",name_en:"ShortSword",category:1,durability:"10",growthType:2,atk:"100",skill1:"スラッシュ",skill2:"None",skill3:"None",rarity:0,userType:0}
#
#    ],
#    reference:[["name_ja", "名前","Name",null,"text"],
#      ["name_en", "名前","Name",null,"text"],
#      ["category", "カテゴリ","Category","weaponCategory","combo"],
#      ["durability", "耐久値", "Durability", null, "int"],
#      ["growthType", "成長タイプ", "GrowthType", "growthType", "combo"],
#      ["atk", "攻撃力", "Atk",null, "int"],
#      ["skill1", "スキル１", "Skill1",null, "combo"],
#      ["skill2", "スキル２", "Skill2",null, "combo"],
#      ["skill3", "スキル３", "Skill3",null, "combo"],
#      ["rarity", "レア度", "rarity","rarity", "combo"],
#      ["userType", "使用者", "UserType", "userType", "combo" ]],
#    };
#    weapon_table.enums = supplement.enums
#    param = req.query
#    weapon_table.total = weapon_table.data.length;
#    weapon_table.data = weapon_table.data.slice(param.start, parseInt(param.start)+parseInt(param.limit))
#
#    body = JSON.stringify(weapon_table)
#    res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'})
#    res.end(body)
  )
)


server.listen(8080)