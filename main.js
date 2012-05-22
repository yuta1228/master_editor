(function() {
  var app, fs, server;

  app = require("express");

  fs = require("fs");

  server = app.createServer();

  server.get('/', function(req, res) {
    return fs.readFile('./tpl/index.html', function(error, content) {
      if (error) {
        res.writeHead(500);
        return res.end(error);
      } else {
        res.writeHead(200, {
          'Content-Type': 'text/html'
        });
        return res.end(content, 'utf-8');
      }
    });
  });

  server.get('/testdata', function(req, res) {
    var body, supplement, weapon_table;
    supplement = {
      enums: {
        element: ["None", "Fire", "Water", "Earth", "Thunder"],
        attribute: ["None", "Slash", "Pierce", "Smash", "Magic"],
        bool: ["No", "Yes"],
        buff: ["None", "Poison", "StrongPoison", "Wet", "Freeze", "ArmorDown", "ArmorUp", "AttackDown", "AttackUp", "Regeneration", "Paralyze", "LastStand"],
        rarity: ["Common", "Uncommon", "Heroic", "Legend", "Mythic"],
        userType: ["All", "Player", "Monster"],
        weaponCategory: ["Monster", "Sword", "BigSword", "Katana", "Knife", "Bow", "Spear", "Rod", "Book"],
        growthType: ["slow", "normal", "fast"],
        itemType: ["Weapon", "Material"]
      }
    };
    weapon_table = {
      data: [
        {
          name_ja: "ショートソード",
          name_en: "ShortSword",
          category: 1,
          durability: "10",
          growthType: 0,
          atk: "100",
          skill1: "スラッシュ",
          skill2: "None",
          skill3: "None",
          rarity: 0,
          userType: 0
        }, {
          name_ja: "ショートソード",
          name_en: "ShortSword",
          category: 1,
          durability: "10",
          growthType: 1,
          atk: "100",
          skill1: "スラッシュ",
          skill2: "None",
          skill3: "None",
          rarity: 0,
          userType: 0
        }, {
          name_ja: "ショートソード",
          name_en: "ShortSword",
          category: 1,
          durability: "10",
          growthType: 2,
          atk: "100",
          skill1: "スラッシュ",
          skill2: "None",
          skill3: "None",
          rarity: 0,
          userType: 0
        }
      ],
      reference:[["name_ja", "名前","Name",null,"text"],
          ["name_en", "名前","Name",null,"text"],
          ["category", "カテゴリ","Category","weaponCategory","combo"],
          ["durability", "耐久値", "Durability", null, "int"],
          ["growthType", "成長タイプ", "GrowthType", "growthType", "combo"],
          ["atk", "攻撃力", "Atk",null, "int"],
          ["skill1", "スキル１", "Skill1",null, "combo"],
          ["skill2", "スキル２", "Skill2",null, "combo"],
          ["skill3", "スキル３", "Skill3",null, "combo"],
          ["rarity", "レア度", "rarity","rarity", "combo"],
          ["userType", "使用者", "UserType", "userType", "combo" ]]
    };
    weapon_table.enums = supplement.enums;
    body = JSON.stringify(weapon_table);
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8'
    });
    return res.end(body);
  });

  server.listen(8080);

}).call(this);
