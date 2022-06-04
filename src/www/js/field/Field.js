/* Field.js
 * Abstract model of the game field: All the cards, where they are, etc.
 */
 
/* Pile {
 *  usage: string // for machines: deck, hand, discard, play, trick
 *  desc: string // for display
 *  hiddenCount: number
 *  cards: number[]
 *  playerId: string // who owns it, optional. uuid
 *  order: number // order of play, for usage=="hand"
 * }
 */
 
/*
export enum Card {
  AS,
  TWOS,
  THREES,
  FOURS,
  FIVES,
  SIXS,
  SEVENS,
  EIGHTS,
  NINES,
  TENS,
  JACKS,
  QUEENS,
  KINGS,
  AH,
  TWOH,
  THREEH,
  FOURH,
  FIVEH,
  SIXH,
  SEVENH,
  EIGHTH,
  NINEH,
  TENH,
  JACKH,
  QUEENH,
  KINGH,
  AC,
  TWOC,
  THREEC,
  FOURC,
  FIVEC,
  SIXC,
  SEVENC,
  EIGHTC,
  NINEC,
  TENC,
  JACKC,
  QUEENC,
  KINGC,
  AD,
  TWOD,
  THREED,
  FOURD,
  FIVED,
  SIXD,
  SEVEND,
  EIGHTD,
  NINED,
  TEND,
  JACKD,
  QUEEND,
  KINGD,
  JOKER
}
*/

export class Field {
  constructor() {
    this.piles = [];
  }
  
  /**
   * Probably won't be a real thing.
   * I need this for testing.
   */
  static generateRandom() {
    const field = new Field();
    const draw = {
      usage: "deck",
      desc: "Draw",
      hiddenCount: 30,
    };
    const discard = {
      usage: "discard",
      desc: "Discard",
      hiddenCount: 2,
    };
    const north = {
      usage: "hand",
      playerId: "111-111-111",
      desc: "North",
      hiddenCount: 5,
      order: 2,
    };
    const west = {
      usage: "hand",
      playerId: "222-222-222",
      desc: "West",
      hiddenCount: 5,
      order: 1,
    };
    const east = {
      usage: "hand",
      playerId: "333-333-333",
      desc: "East",
      hiddenCount: 5,
      order: 3,
    };
    const south = {
      usage: "hand",
      desc: "My Hand",
      cards: [8, 10, 17, 33, 40],
      order: 0,
    };
    field.piles = [draw, discard, north, west, east, south];
    return field;
  }
}
