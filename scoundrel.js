const SUITS = ['HEARTS', 'CLUBS', 'DIAMONDS', 'SPADES'];
const VALUES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]

function createDeck() {
    let deck = []
    for (let suit of SUITS) {
        for (let value of VALUES) {
            deck.push({ suit, value })
        }
    }
    return deck;
}

function filterDeck(deck) {
    return deck.filter(card => {
        if (card.suit === 'HEARTS' && card.value >= 11) return false;
        if (card.suit === 'DIAMONDS' && card.value >= 11) return false;
        return true;
    });
}

function shuffle(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

function setupGame() {
    let deck = createDeck();
    deck = filterDeck(deck);
    deck = shuffle(deck);
    return {
        deck,
        health: 20,
        equippedWeapon: null,
        discardPile: [],
        lastRoomSkipped: false,
        usedHealthInRound: false,
        durability: 100,
        currentRoom: [],
    };
}

function generateCardHTML(card) {
    let cardElement = document.createElement('div');
    cardElement.classList.add('card');
    let img = document.createElement('img');
    img.src = `imgs/${card.suit} ${card.value}.png`;
    cardElement.appendChild(img);
    return (cardElement);
}

function renderRoomCards() {
    const dungeonDiv = document.querySelector('.Dungeon');
    dungeonDiv.innerHTML = '';
    for (let card of gameState.currentRoom) {
        let cardElement = generateCardHTML(card);
        cardElement.addEventListener('click', function () { handleCardClick(card, cardElement) })
        dungeonDiv.appendChild(cardElement);
    }
}

function revealRoom(quantity) {

    for (let i = 0; i < quantity && gameState.deck.length > 0; i++) {
        let card = gameState.deck.pop();
        gameState.currentRoom.push(card);
    }
    renderRoomCards();
}

// Card Interaction Logic
function handleCardClick(card, cardElement) {
    console.log(`Clicked on ${card.suit} ${card.value}`);

    if (card.suit === 'DIAMONDS') {
        console.log('Equipping Weapon:', card);
        gameState.equippedWeapon = card;
        gameState.discardPile = [];
    } else if (card.suit === 'HEARTS') {
        if (gameState.health < 20) {
            console.log('Using Health Potion:', card);
            gameState.health = Math.min(20, gameState.health + card.value);
        } else {
            console.log('Health already full, discarding potion');
        }
    } else if (card.suit === 'SPADES' || card.suit === 'CLUBS') {
        let damage = card.value;
        if (gameState.equippedWeapon) {
            canWeapon = false;
            if (gameState.discardPile.length == 0) {
                canWeapon = true;
            } else if (damage < gameState.discardPile[gameState.discardPile.length - 1].value) {
                canWeapon = true;
            }
            canWeapon = canWeapon ? confirm(`Do you want to use your weapon (${gameState.equippedWeapon.value}) against ${damage}?`) : false;
            if (canWeapon) {
                console.log(`Fighting with weapon ${gameState.equippedWeapon.value}`);
                damage -= gameState.equippedWeapon.value;
                gameState.discardPile.push(card);
            }
        }
        gameState.health -= Math.max(0, damage);
        console.log(`Took ${Math.max(0, damage)} damage, remaining health: ${gameState.health}`);
    }


    gameState.currentRoom = gameState.currentRoom.filter(c => c !== card);
    cardElement.remove();

    stateChecks();

}

function stateChecks() {
    checkGameOver();
    renderWeapon();
    if (gameState.currentRoom.length == 1) {
        revealRoom(3);
        gameState.lastRoomSkipped = false;
    }
    renderRoomCards();
    renderTextDetails();
}

function renderTextDetails() {
    let health = gameState.health;
    let cards_left = gameState.deck.length;
    const infoDiv = document.querySelector('.info');

    infoDiv.innerHTML = `Health: ${health}, Deck: ${cards_left}`

}

function renderWeapon() {
    const weaponDiv = document.querySelector('.Weapon');
    weaponDiv.innerHTML = '';
    if (gameState.equippedWeapon) {
        let card = gameState.equippedWeapon;

        // Weapon Card
        let cardElement = generateCardHTML(card);
        weaponDiv.appendChild(cardElement);

        for (let card of gameState.discardPile) {
            // Discarded Cards
            let cardElement = generateCardHTML(card);
            weaponDiv.appendChild(cardElement);
        }
    }
}

function run() {
    // Scoop
    if (gameState.lastRoomSkipped) {
        return;
    }
    gameState.currentRoom.push.apply(gameState.currentRoom, gameState.deck);
    gameState.deck = gameState.currentRoom;
    gameState.currentRoom = [];
    // redraw
    revealRoom(4);
    gameState.lastRoomSkipped = true;
}


// Check if game is over
function checkGameOver() {
    if (gameState.health <= 0) {
        alert('Game Over! You died.');
    }
}

const gameState = setupGame();
revealRoom(4);
console.log(gameState);

document.querySelector('#run').addEventListener('click', () => {
    run();
});

document.querySelector('#new-game').addEventListener('click', () => {
    Object.assign(gameState, setupGame());
    revealRoom(4);
    stateChecks();
});
