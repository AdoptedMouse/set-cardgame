async function jsonFile(type, data) {
    try {
        if (type == 'read') {
            const cardData = await fetch('http://forb.tech/fetch.php?data')
            const obj = await cardData.json();
            selectThing('ul').innerHTML = '';
            Object.keys(obj).forEach(name => {
                selectThing('ul').innerHTML += `<li>${name} - ${obj[name]}</li>`
            })

        } else if (type == 'write') {
            let formData = new FormData();
            formData.append('name', data.name)
            formData.append('score', data.score);
            const cardData = await fetch('http://forb.tech/fetch.php', {
                method: 'POST',
                body: formData
            })
            console.log(cardData);
        }
    } catch (err) {
        console.error('Error:', err.message)
    }
}

jsonFile('read');

const selectThing = e => document.querySelector(e);
const board = selectThing('.board');
const scoreBoard = selectThing('span');

let selected = 0;
let selectedArray = [];
let score = 0;

selectThing('button').addEventListener('click', () => new game().start());

class deck {
    constructor() {
        this.deckLength = 81;
        this.cards = [];
    }

    start() {
        for (let i = 0; i < this.deckLength; i++) {
            this.cards.push(new Card().new(i));
        }
        this.shake();
        return this.cards;
    }

    shake() {
        let array = this.cards
        let currentIndex = array.length,
            temporaryValue, randomIndex;

        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        this.cards = array;
    }

}

class Card {
    constructor() {
        this.attributes = ['number', 'fill', 'color', 'shape'],
            this.count = [1, 2, 3],
            this.fill = ['filled', 'empty', 'shaded'],
            this.color = ['blue', 'red', 'green'],
            this.shape = ['pill', 'rhomb', 'tilde'];
    }

    new(number) {
        number = number.toString(3)
        let value = number.split('').map(i => parseInt(i))
        while (value.length < 4) { value.unshift(0) }

        return {
            value: value,
            count: this.count[value[0]],
            fill: this.fill[value[1]],
            color: this.color[value[2]],
            shape: this.shape[value[3]],
            id: value.join('')
        }
    }
}

class game {
    start() {
        this.name = prompt('Enter your name');
        this.hints = 3;
        selectThing('#hintsLeft').textContent = this.hints;
        this.deck = new deck().start().splice(0, 15);
        this.deal();
        selectThing('#hint').addEventListener('click', () => {
            this.hint();
        })
    }

    deal() {
        this.sets = [];
        this.table = this.deck.splice(0, 12);
        this.checkAmount();
        this.display();
    }

    display() {
        board.innerHTML = "";
        let count = 0;

        this.table.forEach(card => {
            let div = document.createElement('div');
            div.className = 'card';
            let img = document.createElement('img');
            img.src = `cards/${card.shape}_${card.color}_${card.fill}_${card.count}.svg`;

            img.setAttribute('data-index', count);
            count += 1;

            div.append(img);
            board.append(div);

            if (card == this.table[this.table.length - 1]) {
                let cards = document.querySelectorAll('.card img');
                cards.forEach(divCard => {
                    divCard.addEventListener('click', () => {
                        this.selectSet(divCard, cards);
                    })
                });
            }
        });
    }

    selectSet(clickedCard, cards) {
        if (clickedCard.dataset.selected != undefined && clickedCard.dataset.selected == 1) {

            let arrIndex = selectedArray.findIndex(selectedCard => selectedCard === this.table[clickedCard.dataset.index]);
            selectedArray.splice(arrIndex, 1);

            clickedCard.removeAttribute('data-selected');

            selected -= 1;
        } else {
            if (selected < 2) {
                selectedArray.push(this.table[clickedCard.dataset.index]);
                clickedCard.setAttribute('data-selected', 1);
                selected += 1;
            } else {
                selectedArray.push(this.table[clickedCard.dataset.index]);

                if (!this.pickSet(selectedArray[0], selectedArray[1], selectedArray[2])) {
                    alert("That wasn't a set");
                    cards.forEach(AnotherCard => {
                        if (AnotherCard.dataset.selected != undefined && AnotherCard.dataset.selected == 1) {
                            AnotherCard.removeAttribute('data-selected');
                        }
                    });

                } else {
                    score += 1;
                    scoreBoard.textContent = score;
                }

                selected = 0;
                selectedArray = [];
            }
        }
    }

    add3() {
        let newCards = this.deck.splice(0, 3);
        this.table = this.table.concat(newCards);
        this.checkAmount();

        if (this.table > 12) {
            console.log(`(add 3) Under 12 cards. Deck length: ${this.deck.length}`);
            this.checkAmount();
        }

        console.log(`(? 69) Deck length: ${this.deck.length}`);
    }

    checkAmount() {
        if (this.table.length !== 12) {
            console.log(`(!12) Table length: ${this.table.length}`)
            console.log(`(!12) Deck length before: ${this.deck.length}`)
            this.deck = this.deck.concat(this.table);
            this.table = this.deck.splice(0, 12);

            console.log(`(!12) Deck length after: ${this.deck.length}`)
        }

        this.ensureSet();
    }

    ensureSet() {
        while (!this.hasSet() && 0 < this.deck.length) {
            console.log(`(no set) Length before: ${this.deck.length + this.table.length}`);
            this.add3()
            console.log(`(no set) Length after: ${this.deck.length + this.table.length}`)
        }

        if (!this.hasSet() && this.deck.length == 0) {
            this.won();
        }
    }

    pickSet(card1, card2, card3) {
        if (this.isSet(card1, card2, card3)) {
            console.log(`(correct set) Deck length before: ${this.deck.length}`)
            this.replaceCards(card1, card2, card3)
            console.log(`(correct set) Deck length after: ${this.deck.length}`)
            return true;
        } else {
            return false;
        }
    }

    replaceCards(card1, card2, card3) {
        if (this.deck.length !== 0) {
            let newCards = this.deck.splice(0, 3);
            let removeCards = [card1, card2, card3];

            removeCards.forEach(removingCard => {
                let removeIndex = this.table.findIndex(card => card === removingCard);
                this.table[removeIndex] = newCards.pop();
            });
        } else {
            let removeCards = [card1, card2, card3];
            removeCards.forEach(removingCard => {
                let removeIndex = this.table.findIndex(card => card === removingCard);
                this.table.splice(removeIndex, 1);
            });
        }

        this.ensureSet();
        this.display();
    }

    hasSet(cards) {
        this.sets = [];

        cards = this.table.slice(0)
        while (3 < cards.length) {
            let card1 = cards.splice(0, 1)[0]
            let cardsLeft = cards.slice(0)

            while (2 < cardsLeft.length) {
                let card2 = cardsLeft.splice(0, 1)[0]

                let card3 = this.completeSet(card1.value, card2.value)

                cardsLeft.forEach(function(card, index) {
                    if (card.id == card3.id) {
                        this.sets.push([card1, card2, card])

                        cardsLeft.splice(index, 1)
                    }
                }.bind(this))
            }
        }

        return 0 < this.sets.length
    }

    isSet(card1, card2, card3) {
        return card3.id == this.completeSet(card1.value, card2.value).id
    }

    completeSet(card1, card2) {
        let values = card1.map(function(val, index) {

            if (val == card2[index]) return val

            return 3 - (val + card2[index])
        })

        return {
            value: values,
            id: values.join('')
        }
    }

    hint() {
        let cardDivs = document.querySelectorAll('.card img');
        if (this.hints !== 0) {
            this.sets[0].forEach(setCard => {
                let index = this.table.findIndex(card => card === setCard);
                cardDivs[index].setAttribute('data-hint', 1);
                setTimeout(() => {
                    if (cardDivs[index].dataset.hint !== undefined) cardDivs[index].removeAttribute('data-hint');
                }, 4000);
            });
            this.hints -= 1;
            selectThing('#hintsLeft').textContent = this.hints;
        }
    }

    won() {
        jsonFile('write', { name: this.name, score: score });
        alert('There are no sets left! You have won');
        jsonFile('read');
    }
}
