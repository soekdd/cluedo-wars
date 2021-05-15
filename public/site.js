class App {
  constructor() {
    this.id = document.location.search.substring(1);
    this.game = null;
    this.resetTime = 2000 * 1;
    this.config = null;
    this.resetMode = false;
    this.mode = "splash";
    this.main();
    this.resetTimer();
  }
  main = () => {
    if (this.id == "master") this.getGame(this.master);
    else if (this.id == "debug") this.getGame(this.debug);
    else this.setPlayerFirst();
  };
  setPlayerFirst() {
    this.getConfig();
    setInterval(this.getPlayer.bind(this), 100);
  }
  player = () => {
    let mode = this.mode.split("|");
    if (mode[0] == "main") {
      this.playerMain();
    } else if (mode[0] == "myCards") {
      this.myCards();
    } else if (mode[0] == "allCards") {
      this.allCards(mode[1]);
    } else if (mode[0] == "alert") {
      this.alert();
    } else if (mode[0] == "show") {
      this.show();
    } else if (mode[0] == "invalid") {
      this.invalid();
    } else if (mode[0] == "splash") {
      this.splash();
    }
  };
  alert() {
    this.resetMode = false;
    let s = `<h2>Dir wurde folgende Karte gezeigt:</h2><a href="#" onclick="app.resetAlert()">
        ${this.paintCard(this.game.alert.index, this.game.alert.type)}</a>`;
    s += `<a href="#" onclick="app.resetAlert()" class="mainButton">Zurück</a><br>`;
    $("body").html(s);
  }
  splash = () => {
    this.resetMode = true;
    let diff = new Date().getTime() - this.reset;
    let width =
      Math.floor((100 * (this.resetTime - diff)) / this.resetTime) + "%";
    let s = `<h1>Cluedo Wars</h1><div class="progressbarOuter"><div class="progressbarInner" style="width:${width}"></div></div>`;
    s += `<h2 style="margin-top:2em">Möge die Macht<br>&nbsp;<br>mit Dir sein,<br>&nbsp;<br>${this.game.name.replace(
      "#",
      ""
    )}!</h2>`;
    $("body").html(s);
  };
  myCards = () => {
    this.resetMode = true;
    let diff = new Date().getTime() - this.reset;
    let width =
      Math.floor((100 * (this.resetTime - diff)) / this.resetTime) + "%";
    let s = `<h1>Meine Karten</h1><div class="progressbarOuter"><div class="progressbarInner" style="width:${width}"></div></div>`;
    s += `<a href="#" onclick="app.clickBack()" class="mainButton">Zurück</a><br>`;
    this.config.figures.forEach((figure, index) => {
      if (this.game.figures[index] == "own")
        s += this.paintCard(index, "figure");
    });
    this.config.weapons.forEach((weapon, index) => {
      if (this.game.weapons[index] == "own")
        s += this.paintCard(index, "weapon");
    });
    this.config.rooms.forEach((room, index) => {
      if (this.game.rooms[index] == "own") s += this.paintCard(index, "room");
    });
    $("body").html(s);
  };
  allCards = (subMode) => {
    this.resetMode = true;
    let diff = new Date().getTime() - this.reset;
    let width =
      Math.floor((100 * (this.resetTime - diff)) / this.resetTime) + "%";
    let s = `<h1>Alle ${
      { figure: "Figuren", room: "Räume", weapon: "Waffen" }[subMode]
    }</h1><div class="progressbarOuter"><div class="progressbarInner" style="width:${width}"></div></div>`;
    s += `<a href="#" onclick="app.clickBack()" class="mainButton">Zurück</a><br>`;
    this.config[subMode + "s"].forEach((card, index) => {
      let icon = "circle";
      let color = "red";
      let canGuess = "guess1";
      if (this.ifCardTagged(index, subMode, "own")) {
        icon = "check2-circle";
        color = "green";
        canGuess = 0;
      } else if (this.ifCardTagged(index, subMode, "seen")) {
        icon = "eye";
        color = "green";
        canGuess = 0;
      } else if (this.ifCardTagged(index, subMode, "guess1")) {
        icon = "question-circle";
        color = "orange";
        canGuess = "guess2";
      } else if (this.ifCardTagged(index, subMode, "guess2")) {
        icon = "exclamation-circle";
        color = "green";
        canGuess = "unknown";
      }
      let onClick = "";
      if (canGuess != 0)
        onClick = `onClick="app.guessCard(${index},'${subMode}','${canGuess}')"`;
      s += `<div class="allCardsOuter" ${onClick}><div class="allCardsInner">${this.paintCard(
        index,
        subMode
      )}</div><div class="cardStatus"><i style="color:${color}" class="cardIcon bi-${icon}"></i></div></div>`;
    });
    $("body").html(s);
  };
  guessCard(cardId, type, mode) {
    $.getJSON(`/tagCard/${this.id}/${type}/${cardId}/${mode}`, (data) => {
      this.game = data;
      this.allCards(type);
    });
  }
  ifCardTagged(index, type, tag) {
    return this.game[type + "s"][index] == tag;
  }
  invalid = () => {
    this.resetMode = false;
    let s = `<h1>Cluedo Wars</h1>`;
    s += `<h2 style="margin-top:2em">Das Spiel ist nicht mehr aktuell, bitte neu scannen!<h2>`;
    $("body").html(s);
  };
  show = () => {
    this.resetMode = false;
    let s = `<h1>zEige Karte</h1>`;
    s += `<a href="#" onclick="app.clickBack()" class="mainButton">Zurück</a><br>`;

    this.config.figures.forEach((figure, index) => {
      if (this.game.figures[index] == "own")
        s += `<a href="#" onclick="app.showCard('${index}',\'figure\')">${this.paintCard(
          index,
          "figure"
        )}</a>`;
    });
    this.config.weapons.forEach((weapon, index) => {
      if (this.game.weapons[index] == "own")
        s += `<a href="#" onclick="app.showCard('${index}',\'weapon\')">${this.paintCard(
          index,
          "weapon"
        )}</a>`;
    });
    this.config.rooms.forEach((room, index) => {
      if (this.game.rooms[index] == "own")
        s += `<a href="#" onclick="app.showCard('${index}',\'room\')">${this.paintCard(
          index,
          "room"
        )}</a>`;
    });
    $("body").html(s);
  };
  resetAlert() {
    $.getJSON(`/resetAlert/${this.id}`, (data) => {
      this.mode = "main";
      this.playerMain();
    });
  }
  showCard(cardId, type) {
    $.getJSON(`/showCard/${this.id}/${type}/${cardId}`, (data) => {
      this.mode = "main";
      this.playerMain();
    });
  }
  playerMain = () => {
    this.resetMode = false;
    let s = `<h1>Cluedo Wars</h1>
    <input id="playerId" onblur="app.changeUserName($('#playerId').val())" value="${this.game.name}"/>
    <a href="#" onclick="app.clickMyCards()" class="mainButton"><img class="cardSymbol" src="img/my.png"/><span class="text">Meine Karten</span><img class="cardSymbolR" src="img/my.png"></a><br>
    <a href="#" onclick="app.clickAllCards('figure')" class="mainButton"><img class="cardSymbol" src="img/figure.png"/><span class="text">Alle Figuren</span><img class="cardSymbolR" src="img/figure.png"></a><br>
    <a href="#" onclick="app.clickAllCards('weapon')" class="mainButton"><img class="cardSymbol" src="img/weapon.png"/><span class="text">Alle Waffen</span><img class="cardSymbolR" src="img/weapon.png"></a><br>
    <a href="#" onclick="app.clickAllCards('room')" class="mainButton"><img class="cardSymbol" src="img/room.png"/><span class="text">Alle Räume</span><img class="cardSymbolR" src="img/room.png"></a><br>
    <a href="#" onclick="app.clickShow()" class="mainButton"><img class="cardSymbol" src="img/show.png"/><span class="text">Zeige Karte</span><img class="cardSymbolR" src="img/show.png"></a><br>`;
    $("body").html(s);
  };
  paintCard(id, type) {
    let s = "";
    let card = this.config[type + "s"][id];
    s += `<div class="card" style="border:2vw solid #${card.color}"><img class="cardPhoto" src="img/${card.image}"/><img class="cardSymbol" src="img/${type}.png"/><p class="cardTitle">${card.name}</p></div>`;
    return s;
  }
  clickBack() {
    this.mode = "main";
    this.playerMain();
  }
  clickShow() {
    this.mode = "show";
    this.show();
  }
  clickMyCards = () => {
    this.mode = "myCards";
    this.myCards();
  };
  clickAllCards = (subMode) => {
    this.mode = "allCards|" + subMode;
    this.allCards(subMode);
  };
  getPlayer = (cb) => {
    let that = this;
    $.getJSON(
      `/api/${this.id}/game/${
        this.game == null || this.game.rev == undefined ? -1 : this.game.rev
      }`,
      (data) => {
        let diff = new Date().getTime() - this.reset;
        let width =
          Math.floor((100 * (this.resetTime - diff)) / this.resetTime) + "%";
        $(".progressbarInner").css("width", width);
        if (this.resetMode && diff > this.resetTime) {
          this.mode = "main";
          this.player();
        }
        if (data == "") return;
        else if (
          data.alert != undefined &&
          data.alert != null &&
          this.mode != "alert"
        ) {
          console.log("found alert", this.id);
          this.mode = "alert";
          this.game = data;
          this.alert();
        } else if (this.game == null || this.game.rev < data.rev) {
          console.log("refresh");
          this.game = data;
          this.player();
        }
      }
    ).fail(function (e) {
      if (e.responseText == "unknown player") that.mode = "invalid";
      that.player();
    });
  };
  getConfig = (cb) => {
    let that = this;
    $.getJSON(`/api/${this.id}/config`, (data) => {
      this.config = data;
    }).fail(function (e) {
      if (e.responseText == "unknown player") that.mode = "invalid";
      that.player();
    });
  };
  getGame(cb) {
    $.getJSON("/game/", (data) => {
      this.game = data;
      this.config = data;
      if (cb) cb();
    });
  }
  startGame(num) {
    $.getJSON(`/startGame/${num}`, (data) => {
      this.game = data;
      this.master();
    });
  }
  endGame() {
    this.resetMode = false;
    let s = "";
    ["figure", "weapon", "room"].forEach((group) => {
      s += this.paintCard(this.game.murder[group].index, group);
    });
    $("body").html(s);
  }
  master = () => {
    let s = "";
    for (let i = 3; i < 7; i++) {
      s += `<a href="#" onclick="app.startGame(${i})">${i}</a>&nbsp;`;
    }
    s += `<a href="#" onclick="app.endGame()">Ende</a><br>`;
    for (let i = 0; i < this.game.playerNum; i++) {
      s += `<div class="qrPlayerFrame"><div class="qrPlaceholder" id="placeholder${i}">&nbsp;</div></div>`;
    }
    $("body").html(s);
    for (let i = 0; i < this.game.playerNum; i++) {
      let playerId = Object.keys(this.game.players)[i];
      let url = document.location.origin + "/?" + playerId;
      let qr = qrcode(0, "M");
      qr.addData(url);
      qr.make();
      document.getElementById("placeholder" + i).innerHTML = qr.createImgTag(
        10,
        0
      ); //createImgTag();
    }
  };
  debug = () => {
    let s = "";
    for (let i = 0; i < this.game.playerNum; i++) {
      let playerId = Object.keys(this.game.players)[i];
      let url = document.location.origin + "/?" + playerId;
      s += `<div class="iPlayerFrame"><iframe src="${url}"></iframe></div>`;
    }
    $("body").html(s);
  };

  changeUserName = (newName) => {
    $.getJSON(`/setName/${this.id}/${newName}`, (data) => {
      //alert(data);
    });
  };

  resetTimer = () => {
    this.reset = new Date().getTime();
    console.log("reset timer");
  };
}
