/* Validation.js
 * UI and API model validation utilities.
 */
 
export class Validation {
  static getDependencies() {
    return [];
  }
  constructor() {
  }
  
  /* Data format for API requests.
   ***************************************************/
   
  validLobbyCode(code) {
    if (!code) return false;
    return code.match(/[^-]{4,}/);
  }
  
  validLobbyName(name) {
    if (!name) return false;
    return true;
  }
  
  validLobbyIsPublic(flag) {
    return (typeof(flag) === "boolean");
  }
  
  validPlayers(players) {
    if (!(players instanceof Array)) return false;
    for (const player of players) {
      if (!player) return false;
      if (typeof(player) !== "object") return false;
      // Assert type of the three player fields. Is this overkill? Will they always be present?
      if (typeof(player.name) !== "string") return false;
      if (typeof(player.playerId) !== "string") return false;
      if (typeof(player.socketId) !== "string") return false;
    }
    return true;
  }
  
  validPlayerId(id) {
    if (!id) return false;
    return id.match(/[^-]/);//TODO could be more specific; it's a UUID
  }
}

Validation.singleton = true;
