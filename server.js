import config from "./config.js";
const socket = require("socket.io");
const http = require("http");

const compression = require("compression");
const express = require("express");
export class App {
  constructor() {
    window.setNavigationBarColor(0);
    this._app = express();
    this._app.use(compression());
    this.use = this._app.use.bind(this._app);
    this.put = this._app.put.bind(this._app);
    this.get = this._app.get.bind(this._app);
    this.post = this._app.post.bind(this._app);
    this.patch = this._app.patch.bind(this._app);
    this.delete = this._app.delete.bind(this._app);
    this.all = this._app.all.bind(this._app);

    this._server = http.createServer(this._app);
    this.io = socket(this._server);
    this.pause = true;
    this.io.on("connection", (/*client*/) => {
      this.log.enable();
      console.log("Socket IO client connected...");
    });
    this.io.on("error", (...par) => {
      console.error(par);
    });

    this.port = process.env.PORT || 8765;

    this._server.listen(this.port, () =>
      console.log(
        `\u2713 application cluedo started successfully on port ${this.port}.`
      )
    );
    this.use(
      "/",
      express.static("public", {
        index: "index.html",
      })
    );
    this.use("/lib/", express.static("node_modules"));
    this.use(express.json());
    this.use(express.urlencoded({ extended: true }));
    this.get("/ready", async (req, res) => {
      this.happyEnd(res, "hello world");
    });
    this.routes();
    this.startGame(5);
  }

  startGame(playerNum) {
    this.pause = true;
    let game = JSON.parse(JSON.stringify(config));
    let roomCards = this.shuffle(
      config.rooms.map((room, index) => {
        return { ...room, index, type: "room", shown: false };
      })
    );
    let weaponCards = this.shuffle(
      config.weapons.map((weapon, index) => {
        return { ...weapon, index, type: "weapon", shown: false };
      })
    );
    let figureCards = this.shuffle(
      config.figures.map((figure, index) => {
        return { ...figure, index, type: "figure", shown: false };
      })
    );
    this.game = {
      ...game,
      playerNum,
      murder: {
        figure: figureCards[0],
        weapon: weaponCards[0],
        room: roomCards[0],
      },
    };
    this.game.rooms[roomCards[0].index].owner = "-1";
    this.game.weapons[weaponCards[0].index].owner = "-1";
    this.game.figures[figureCards[0].index].owner = "-1";
    figureCards.shift();
    weaponCards.shift();
    roomCards.shift();
    let allCards = figureCards.concat(weaponCards, roomCards);
    let players = {};
    let leftPlayer = 0;
    for (let i = 0; i < playerNum; i++) {
      let playerID =
        "ID" +
        Math.floor(Math.random() * 100000000000000)
          .toString(16)
          .toUpperCase();
      players[playerID] = {
        rev: 0,
        name: "Spieler #" + (i + 1),
        cards: [],
        seen: [],
        guess: [],
        leftPlayer,
      };
      leftPlayer = playerID;
    }
    players[Object.keys(players)[0]].leftPlayer = leftPlayer;
    let i = 0;
    do {
      players[Object.keys(players)[i]].cards.push(allCards[0]);
      if (allCards[0].type == "room")
        this.game.rooms[allCards[0].index].owner = i;
      else if (allCards[0].type == "weapon")
        this.game.weapons[allCards[0].index].owner = i;
      else this.game.figures[allCards[0].index].owner = i;
      allCards.shift();
      i = (i + 1) % playerNum;
    } while (allCards.length > 0);
    this.game.players = players;
    this.pause = false;
  }
  routes() {
    this.get(["/config", "/config/:param"], async (req, res) => {
      if (this.pause) {
        this.happyEnd(res, "");
        return;
      }
      if (req.params.param != undefined)
        this.happyEnd(res, config[req.params.param]);
      else this.happyEnd(res, config);
    });
    this.get("/startGame/:playerNum", async (req, res) => {
      if (this.pause) {
        this.happyEnd(res, "");
        return;
      }
      if (
        req.params.playerNum != undefined &&
        !isNaN(req.params.playerNum) &&
        req.params.playerNum > 2 &&
        req.params.playerNum < 7
      ) {
        this.startGame(req.params.playerNum);
        this.happyEnd(res, this.game);
      } else this.end500(res, "not a valid player number");
    });
    this.get("/game", async (req, res) => {
      this.happyEnd(res, this.game);
    });
    this.get(
      [
        "/myGame/:playerID",
        "/myGame/:playerID/:option",
        "/myGame/:playerID/:option/:rev",
      ],
      async (req, res) => {
        if (this.pause) {
          this.happyEnd(res, "");
          return;
        }
        if (this.game.players[req.params.playerID] == undefined)
          this.end404(res, "unknown player");
        else {
          if (
            req.params.rev != undefined &&
            req.params.rev == this.game.players[req.params.playerID].rev &&
            this.game.players[req.params.playerID].alert == null
          ) {
            this.happyEnd(res, "");
            return;
          }
          let player = this.game.players[req.params.playerID];
          let out = {
            config: config,
            game: {
              rev: player.rev,
              name: player.name,
              cards: player.cards,
              seen: player.seen,
              guess: player.guess,
              alert: player.alert,
            },
          };
          if (req.params.option == undefined) this.happyEnd(res, out);
          else this.happyEnd(res, out[req.params.option]);
        }
      }
    );
    this.get("/setName/:playerID/:newName", async (req, res) => {
      if (this.pause) {
        this.happyEnd(res, "");
        return;
      }
      if (this.game.players[req.params.playerID] == undefined)
        this.end404(res, "unknown player");
      else {
        this.game.players[req.params.playerID].name = req.params.newName;
        this.game.players[req.params.playerID].rev++;
        this.happyEnd(res, "ok");
      }
    });
    this.get("/resetAlert/:playerID", async (req, res) => {
      if (this.pause) {
        this.happyEnd(res, "");
        return;
      }
      if (this.game.players[req.params.playerID] == undefined)
        this.end404(res, "unknown player");
      else {
        this.game.players[req.params.playerID].alert = null;
        this.game.players[req.params.playerID].rev++;
        this.happyEnd(res, "ok");
      }
    });
    this.get("/showCard/:playerID/:cardID", async (req, res) => {
      if (this.pause) {
        this.happyEnd(res, "");
        return;
      }
      if (this.game.players[req.params.playerID] == undefined)
        this.end404(res, "unknown player");
      else {
        let player = this.game.players[req.params.playerID];
        if (player.cards[req.params.cardID] == undefined)
          this.end404(res, "unknown card");
        else {
          this.game.players[player.leftPlayer].seen.push(
            player.cards[req.params.cardID]
          );
          console.log("set alert on ", player.leftPlayer);
          this.game.players[player.leftPlayer].alert =
            player.cards[req.params.cardID];
          this.game.players[player.leftPlayer].rev++;
          player.cards[req.params.cardID].shown = true;
          player.rev++;
          this.happyEnd(res, "ok");
        }
      }
    });
    this.get("/guessCard/:playerID/:cardType/:cardNumber", async (req, res) => {
      if (this.pause) {
        this.happyEnd(res, "");
        return;
      }
      if (this.game.players[req.params.playerID] == undefined)
        this.end404(res, "unknown player");
      else {
        let player = this.game.players[req.params.playerID];
        if (
          config[req.params.cardType + "s"] == undefined ||
          config[req.params.cardType + "s"][req.params.cardNumber] == undefined
        )
          this.end404(res, "unknown card");
        else {
          let gotAllready = -1;
          player.guess.forEach((card, index) => {
            if (
              card.type == req.params.cardType &&
              card.index == req.params.cardNumber
            )
              gotAllready = index;
          });
          if (gotAllready == -1)
            player.guess.push({
              ...config[req.params.cardType + "s"][req.params.cardNumber],
              index: req.params.cardNumber,
              type: req.params.cardType,
            });
          player.rev++;
          this.happyEnd(res, player);
        }
      }
    });
    this.get(
      "/forgetCard/:playerID/:cardType/:cardNumber",
      async (req, res) => {
        if (this.pause) {
          this.happyEnd(res, "");
          return;
        }
        if (this.game.players[req.params.playerID] == undefined)
          this.end404(res, "unknown player");
        else {
          let player = this.game.players[req.params.playerID];
          if (
            config[req.params.cardType + "s"] == undefined ||
            config[req.params.cardType + "s"][req.params.cardNumber] ==
              undefined
          )
            this.end404(res, "unknown card");
          else {
            let gotAllready = -1;
            player.guess.forEach((card, index) => {
              if (
                card.type == req.params.cardType &&
                card.index == req.params.cardNumber
              )
                gotAllready = index;
            });
            if (gotAllready != -1) player.guess.splice(gotAllready, 1);
            player.rev++;
            this.happyEnd(res, player);
          }
        }
      }
    );
  }

  happyEnd(res, data) {
    //this.log.debug(data);
    res.set({
      "content-type": "application/json; charset=utf-8",
    });
    res.end(JSON.stringify(data));
  }

  end404(res, message) {
    res.status(404);
    console.error("End width 404", message);
    res.end(message);
    return false;
  }

  end403(res, userName) {
    res.status(403);
    console.error(`Token for user ${userName} invalid`);
    res.end(`Token for user ${userName} invalid`);
    return false;
  }

  end500(res, message) {
    res.status(500);
    console.error("End width 500", message);
    res.end(message);
    return false;
  }

  shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
}
let app = new App();
