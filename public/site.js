class App {
  constructor() {
    this.id = document.location.search.substring(1);
    this.game = null;
    this.resetTime = 2000 * 1;
    this.config = null;
    this.resetMode = false;
    this.mode = "main";
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
    }
  };
  alert() {
    this.resetMode = false;
    let s = `<h1>Dir wurde folgende Karte gezeigt:</h1><a href="#" onclick="app.resetAlert()">
        ${this.paintCard(this.game.alert.index, this.game.alert.type)}</a>`;
    s += `<a href="#" onclick="app.resetAlert()" class="mainButton">Zurück</a><br>`;
    $("body").html(s);
  }
  myCards = () => {
    this.resetMode = true;
    let diff = new Date().getTime() - this.reset;
    let width =
      Math.floor((100 * (this.resetTime - diff)) / this.resetTime) + "%";
    let s = `<img class="titleImg" src="img/titleMy.png"><div class="progressbarOuter"><div class="progressbarInner" style="width:${width}"></div></div>`;
    s += `<a href="#" onclick="app.clickBack()" class="mainButton">Zurück</a><br>`;
    this.game.cards.forEach((card) => {
      s += this.paintCard(card.index, card.type);
    });
    $("body").html(s);
  };
  allCards = (subMode) => {
    this.resetMode = true;
    let diff = new Date().getTime() - this.reset;
    let width =
      Math.floor((100 * (this.resetTime - diff)) / this.resetTime) + "%";
    let s = `<img class="titleImg" src="img/titleAll${subMode}.png"><div class="progressbarOuter"><div class="progressbarInner" style="width:${width}"></div></div>`;
    s += `<a href="#" onclick="app.clickBack()" class="mainButton">Zurück</a><br>`;
    this.config[subMode + "s"].forEach((card, index) => {
      let icon = "circle";
      let color = "red";
      let canGuess = 1;
      if (this.ifCardOwn(index, subMode, "cards")) {
        icon = "check2-circle";
        color = "green";
        canGuess = 0;
      } else if (this.ifCardOwn(index, subMode, "seen")) {
        icon = "eye";
        color = "green";
        canGuess = 0;
      } else if (this.ifCardOwn(index, subMode, "guess")) {
        icon = "question-circle";
        color = "orange";
        canGuess = -1;
      }
      let onClick = "";
      if (canGuess != 0)
        onClick = `onClick="app.guessCard(${index},'${subMode}',${canGuess})"`;
      s += `<div class="allCardsOuter" ${onClick}><div class="allCardsInner">${this.paintCard(
        index,
        subMode
      )}</div><div class="cardStatus"><i style="color:${color}" class="cardIcon bi-${icon}"></i></div></div>`;
    });
    $("body").html(s);
  };
  guessCard(cardId, type, mode) {
    $.getJSON(
      `/${mode == 1 ? "guess" : "forget"}Card/${this.id}/${type}/${cardId}`,
      (data) => {
        this.game = data;
        this.allCards(type);
      }
    );
  }
  ifCardOwn(index, type, group) {
    let result = false;
    this.game[group].forEach((card) => {
      result = result || (card.index == index && card.type == type);
    });
    return result;
  }
  show = () => {
    this.resetMode = false;
    let s = `<img class="titleImg" src="img/titleShow.png">`;
    s += `<a href="#" onclick="app.clickBack()" class="mainButton">Zurück</a><br>`;
    this.game.cards.forEach((card, index) => {
      s += `<a href="#" onclick="app.showCard('${index}')">${this.paintCard(
        card.index,
        card.type
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
  showCard(cardId) {
    $.getJSON(`/showCard/${this.id}/${cardId}`, (data) => {
      this.mode = "main";
      this.playerMain();
    });
  }
  playerMain = () => {
    this.resetMode = false;
    let s = `<img class="titleImg" src="img/title.png">
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
    $.getJSON(
      `/myGame/${this.id}/game/${
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
    );
  };
  getConfig = (cb) => {
    $.getJSON(`/myGame/${this.id}/config`, (data) => {
      this.config = data;
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
