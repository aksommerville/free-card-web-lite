/* SessionService.js
 * Coordinates the connection's model layer.
 * User ID, lobby, game state, etc.
 */
 
import { Comm } from "../base/Comm.js";

export class SessionService {
  static getDependencies() {
    return [Comm];
  }
  constructor(comm) {
    this.comm = comm;
    
    this.state = {
      connected: false,
      playerName: "",
      playerId: "",
      lobbyName: "",
      lobbyCode: "",
      gameType: "",
      isPublic: false,
      players: [], // { name, playerId, socketId } including the local one
    };
    
    this.listeners = [];
    this.nextListenerId = 1;
    
    this.wsListenerId = this.comm.listenWebSocket(msg => this.onWsMessage(msg));
  }
  
  listen(cb, initialize) {
    const id = this.nextListenerId++;
    this.listeners.push({ id, cb });
    if (initialize) cb(this.state);
    return id;
  }
  
  unlisten(id) {
    const p = this.listeners.findIndex(l => l.id === id);
    if (p >= 0) this.listeners.splice(p, 1);
  }
  
  broadcast() {
    for (const { cb } of this.listeners) cb(this.state);
  }
  
  replaceState(changes) {
    if (!changes) return;
    let changed = false;
    const newState = { ...this.state };
    for (const k of Object.keys(newState)) {
      if (!changes.hasOwnProperty(k)) continue;
      if (this.stateFieldEquivalent(k, changes[k], newState[k])) continue;
      newState[k] = changes[k];
      changed = true;
    }
    if (!changed) return;
    this.state = newState;
    this.broadcast();
  }
  
  stateFieldEquivalent(k, a, b) {
    if (a === b) return true;
    switch (k) {
    
      case "players": {
          // If it's not an array, we're not interested, so call them equivalent.
          // TODO This is probably going to bite me in the ass eventually.
          if (!(a instanceof Array)) return true;
          if (!(b instanceof Array)) return true;
          // Treat a change of order as a real change, that's probably correct behavior, and easier.
          if (a.length !== b.length) return false;
          for (let i=a.length; i-->0; ) {
            if (!this.playersEquivalent(a[i], b[i])) return false;
          }
          return true;
        }
        
    }
    return false;
  }
  
  playersEquivalent(a, b) {
    if (a === b) return true;
    // Either is not an object, we're not interested, call them equivalent.
    if (typeof(a) !== "object") return true;
    if (typeof(b) !== "object") return true;
    // Compare only the known fields, they are all scalar.
    if (a.name !== b.name) return false;
    if (a.playerId !== b.playerId) return false;
    if (a.socketId !== b.socketId) return false;
    return true;
  }
  
  onWsMessage(msg) {
  }
}

SessionService.singleton = true;
