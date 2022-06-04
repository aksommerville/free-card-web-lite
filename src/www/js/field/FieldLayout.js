/* FieldLayout.js
 * Service that creates DOM elements from a Field.
 */
 
import { Dom } from "../base/Dom.js";

// Below this size, we don't bother laying cards out, we just blank it.
const MINIMUM_WIDTH = 40;
const MINIMUM_HEIGHT = 40;

// Card's displayed height over width.
const CARD_ASPECT = 3/2;

const CARD_MARGIN = 5;
const STACK_STEP = 2;
const STACK_LIMIT = 10;

export class FieldLayout {
  static getDependencies() {
    return [Dom, Window];
  }
  constructor(dom, window) {
    this.dom = dom;
    this.window = window;
    
    this.PILE_HEIGHT_LIMIT = 10;
  }
  
  buildUi(parent, field) {
    if (!parent) return;
    parent.innerHTML = "";
    if (!field) return;
    
    /* Sort the piles into (south,west,north,east,middle).
     */
    const boundPiles = this.bindPiles(field);
    
    /* Determine the required dimensions, in card widths.
     * Anything in the edge slots, we display card by card.
     * Hidden piles in the middle, we display as a stack.
     * Treat it as a 9x9 grid, where the corners will always be empty.
     */
    let columnWidths = [
      boundPiles.west.length * CARD_ASPECT,
      Math.max(
        ...boundPiles.north.map(p => (p.cards?.length || p.hiddenCount || 0)),
        ...boundPiles.south.map(p => (p.cards?.length || p.hiddenCount || 0)),
      ),
      boundPiles.east.length * CARD_ASPECT,
    ], rowHeights = [
      boundPiles.north.length * CARD_ASPECT,
      Math.max(
        ...boundPiles.west.map(p => (p.cards?.length || p.hiddenCount || 0)),
        ...boundPiles.east.map(p => (p.cards?.length || p.hiddenCount || 0)),
      ),
      boundPiles.south.length * CARD_ASPECT,
    ];
    let middleRowCount = 1, middleHiddenPileCount = 0;
    for (const pile of boundPiles.middle) {
      if (pile.cards) {
        middleRowCount++;
        if (pile.cards.length > columnWidths[1]) {
          columnWidths[1] = pile.cards.length;
        }
      } else {
        middleHiddenPileCount++;
      }
    }
    if (middleHiddenPileCount > columnWidths[1]) {
      columnWidths[1] = middleHiddenPileCount;
    }
    rowHeights[1] = Math.max(rowHeights[1], middleRowCount * CARD_ASPECT);
    
    /* Scale to fit in the available space.
     */
    const normWidth = columnWidths.reduce((a, v) => a + v, 0);
    const normHeight = rowHeights.reduce((a, v) => a + v, 0);
    if ((normWidth < 1) || (normHeight < 1)) return;
    const { width: maxWidth, height: maxHeight } = parent.getBoundingClientRect();
    if ((maxWidth < 1) || (maxHeight < 1)) return;
    let scale;
    let widthForMaxHeight = (normWidth * maxHeight) / normHeight;
    if (widthForMaxHeight <= maxWidth) scale = maxHeight / normHeight;
    else scale = maxWidth / normWidth;
    for (let i=0; i<3; i++) {
      columnWidths[i] *= scale;
      rowHeights[i] *= scale;
    }
    let x0 = (maxWidth / 2) - (normWidth * scale / 2);
    let y0 = (maxHeight / 2) - (normHeight * scale / 2);
    const cardWidth = Math.floor(scale);
    const cardHeight = Math.floor(scale * CARD_ASPECT);
    
    const layoutPilesHorizontally = (piles, x, y, w, h) => {
      if (piles.length < 1) return;
      let rowHeight = h / piles.length;
      let yp = y + rowHeight / 2 - cardHeight / 2;
      for (let pi=0; pi<piles.length; pi++, yp+=rowHeight) {
        const pile = piles[pi];
        const cardCount = pile.hiddenCount || pile.cards?.length || 0;
        let usedWidth = cardCount * cardWidth;
        let xp = x + (w / 2) - (usedWidth / 2);
        for (let ci=0; ci<cardCount; ci++, xp+=cardWidth) {
          const card = this.makeCard(parent, pile.cards?.[ci]);
          card.style.left = `${xp + CARD_MARGIN / 2}px`;
          card.style.top = `${yp + CARD_MARGIN / 2}px`;
          card.style.width = `${cardWidth - CARD_MARGIN}px`;
          card.style.height = `${cardHeight - CARD_MARGIN}px`;
        }
      }
    }
    const layoutPilesVertically = (piles, x, y, w, h) => {
      if (piles.length < 1) return;
      let columnWidth = w / piles.length;
      let xp = x + columnWidth / 2 - cardHeight / 2;
      for (let pi=0; pi<piles.length; pi++, xp+=columnWidth) {
        const pile = piles[pi];
        const cardCount = pile.hiddenCount || pile.cards?.length || 0;
        let usedHeight = cardCount * cardWidth;
        let yp = y + (h / 2) - (usedHeight / 2);
        for (let ci=0; ci<cardCount; ci++, yp+=cardWidth) {
          const card = this.makeCard(parent, pile.cards?.[ci]);
          card.classList.add("turn");
          card.style.left = `${xp + CARD_MARGIN / 2}px`;
          card.style.top = `${yp + CARD_MARGIN / 2}px`;
          card.style.width = `${cardHeight - CARD_MARGIN}px`;
          card.style.height = `${cardWidth - CARD_MARGIN}px`;
        }
      }
    }
    const layoutStackedPilesHorizontally = (piles, x, y, w, h) => {
      if (piles.length < 1) return;
      const y0 = y + h / 2 - cardHeight / 2;
      let xp = x + w / 2 - cardWidth * piles.length / 2;
      for (let pi=0; pi<piles.length; pi++, xp+=cardWidth) {
        const pile = piles[pi];
        let cardCount = pile.hiddenCount || 0;
        if (cardCount > STACK_LIMIT) cardCount = STACK_LIMIT;
        let yp = y0;
        for (let i=cardCount; i-->0; yp-=STACK_STEP) {
          const card = this.makeCard(parent);
          card.style.left = `${xp + CARD_MARGIN / 2}px`;
          card.style.top = `${yp + CARD_MARGIN / 2}px`;
          card.style.width = `${cardWidth - CARD_MARGIN}px`;
          card.style.height = `${cardHeight - CARD_MARGIN}px`;
        }
      }
    }
    
    layoutPilesHorizontally(
      boundPiles.north,
      x0 + columnWidths[0], y0,
      columnWidths[1], rowHeights[0]
    );
    layoutPilesHorizontally(
      boundPiles.south,
      x0 + columnWidths[0], y0 + rowHeights[0] + rowHeights[1],
      columnWidths[1], rowHeights[2]
    );
    layoutPilesVertically(
      boundPiles.west,
      x0, y0 + rowHeights[0],
      columnWidths[0], rowHeights[1]
    );
    layoutPilesVertically(
      boundPiles.east,
      x0 + columnWidths[0] + columnWidths[1], y0 + rowHeights[0],
      columnWidths[2], rowHeights[1]
    );
    
    const middleHiddenPiles = [];
    const middleShownPiles = [];
    for (const pile of boundPiles.middle) {
      if (pile.cards) middleShownPiles.push(pile);
      else middleHiddenPiles.push(pile);
    }
    const middleHeight = middleRowCount * cardHeight;
    const middleY0 = y0 + rowHeights[0] + rowHeights[1] / 2 - middleHeight / 2;
    layoutStackedPilesHorizontally(
      middleHiddenPiles,
      x0 + columnWidths[0], middleY0,
      columnWidths[1], cardHeight
    );
    layoutPilesVertically(
      middleShownPiles,
      x0 + columnWidths[0], middleY0 + cardHeight,
      columnWidths[1], middleHeight - cardHeight
    );
  }
  
  makeCard(parent, model) {
    const card = this.dom.spawn(parent, "DIV", ["card"]);
    if (model) {
      card.innerText = model;
      card.setAttribute("data-cardid", model);
    } else {
      card.classList.add("facedown");
    }
    return card;
  }
  
  /* Split the field's piles based on their spatial anchor.
   * Each pile anchors to one of five points: north, south, east, west, middle.
   * Returns { north: Pile[], south: ...etc }
   */
  bindPiles(field) {
    const layout = {
      north: [],
      south: [],
      west: [],
      east: [],
      middle: [],
    };
    
    /* Get all the "hand" piles, put in play order, and put the local player first.
     * There is a hand for each player, even if it's empty.
     */
    const hands = field.piles.filter(p => p.usage === "hand");
    hands.sort((a, b) => a.order - b.order);
    const selfPlayerId = ""; //TODO need to get this from somewhere
    const selfIndex = hands.findIndex(p => p.playerId === selfPlayerId);
    if (selfIndex > 0) {
      const early = hands.splice(0, selfIndex);
      hands.splice(hands.length, 0, ...early);
    }
    
    function placePlayer(ix, edge) {
      layout[edge].push(hands[ix]);
      const playerId = hands[ix].playerId;
      for (const pile of field.piles.filter(p => ((p.usage === "play") && (p.playerId === playerId)))) {
        layout[edge].push(pile);
      }
      for (const pile of field.piles.filter(p => ((p.usage === "trick") && (p.playerId === playerId)))) {
        layout[edge].push(pile);
      }
    }
    
    // First hand and associated plays on the south edge.
    if (hands.length >= 1) {
      placePlayer(0, "south");
    }
    
    // In a 2-player game, second player goes on the north edge.
    if (hands.length === 2) {
      placePlayer(1, "north");
      
    // More than 2 players, go west, north, east.
    //TODO There will eventually be more than 4 players allowed, and we'll have to get smarter than just cardinal directions.
    } else if (hands.length > 2) {
      placePlayer(1, "west");
      placePlayer(2, "north");
      if (hands.length >= 4) {
        placePlayer(3, "east");
        if (hands.length > 4) {
          this.window.console.warn(`Too many players (${hands.length}>4)`);
        }
      }
    }
    
    /* Now all "hand", "play", and "trick" are accounted for.
     * Everything else goes in the middle.
     * TODO Probably want to enforce some order on these.
     */
    for (const pile of field.piles) {
      if (pile.usage === "hand") continue;
      if (pile.usage === "play") continue;
      if (pile.usage === "trick") continue;
      layout.middle.push(pile);
    }
    
    return layout;
  }
}

FieldLayout.singleton = true;
