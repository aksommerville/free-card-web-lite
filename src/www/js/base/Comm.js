/* Comm.js
 * Wraps Fetch API and WebSocket.
 * Maintains a WebSocket connection and regulates its use.
 */
 
export class Comm {
  static getDependencies() {
    return [Window];
  }
  constructor(window) {
    this.window = window;
    
    this.webHost = this.window.location.hostname;
    this.webPort = this.window.location.port;
    this.webProtocol = this.window.location.protocol;
    this.httpHost = this.webHost;
    this.httpPort = 1234;
    this.httpProtocol = this.webProtocol;
    this.wsHost = this.webHost;
    this.wsPort = 1234;
    this.wsProtocol = (this.webProtocol === "https:") ? "wss:" : "ws:";
    
    this.ws = null;
    this.wsPending = null;
    this.wsListeners = [];
    this.wsListenerNextId = 1;
    this.socketId = ""; // required, but I'd like to get rid of it. TODO
  }
  
  /* HTTP, to the configured "httpHost" only.
   ************************************************************/
   
  fetch(method, path, query, headers, body) {
    return this.window.fetch(
      this.composeHttpUrl(path, query),
      this.composeHttpParams(method, headers, body)
    ).then((response) => {
      if (!response.ok) throw response;
      // Server currently has some ops that return plain text -- TODO Can we make the server JSON always?
      //return response.json();
      return response.text();
    }).then((text) => {
      try {
        text = JSON.parse(text);
      } catch (e) {}
      return text;
    });
  }
  
  composeHttpUrl(path, query) {
    let url = `${this.httpProtocol}//${this.httpHost}:${this.httpPort}${path}`;
    if (query) {
      let separator = '?';
      for (const key in query) {
        const value = query[key];
        url += `${separator}${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
        separator = '&';
      }
    }
    return url;
  }
  
  composeHttpParams(method, headers, body) {
    const params = { method };
    if (headers) params.headers = headers;
    if (body) params.body = JSON.stringify(body);
    return params;
  }
  
  /* WebSocket, managed connection.
   ***************************************************/
  
  /* Listeners get called with any of:
   *  - Packet body, evaluated as JSON.
   *  - Packet body as a string (non JSON).
   *  - "connected"
   *  - "disconnected"
   */
  listenWebSocket(cb) {
    const id = this.wsListenerNextId++;
    this.wsListeners.push({ cb, id });
    return id;
  }
  
  unlistenWebSocket(id) {
    const p = this.wsListeners.findIndex(l => l.id === id);
    if (p >= 0) {
      this.wsListeners.splice(p, 1);
    }
  }
  
  sendWebSocket(event) {
    return this.requireWebSocket().then(() => {
      this.ws.send(JSON.stringify({ ...event, socketId: this.socketId }));
    });
  }
   
  requireWebSocket() {
    if (this.ws) return Promise.resolve(this.ws);
    if (this.wsPending) return this.wsPending;
    this.wsPending = new Promise((resolve, reject) => {
      const ws = new WebSocket(this.composeWebSocketUrl());
      ws.addEventListener("open", (event) => this.onWsOpen(event, ws, resolve, reject));
      ws.addEventListener("close", (event) => this.onWsClose(event, ws, resolve, reject));
      ws.addEventListener("error", (event) => this.onWsError(event, ws, resolve, reject));
      ws.addEventListener("message", (event) => this.onWsMessage(event, ws));
    });
    return this.wsPending;
  }
  
  closeWebSocket() {
    if (this.ws) {
      this.ws.close();
    }
  }
  
  composeWebSocketUrl() {
    return `${this.wsProtocol}//${this.wsHost}:${this.wsPort}/ws`;
  }
  
  onWsOpen(event, ws, resolve, reject) {
    this.ws = ws;
    if (this.wsPending) {
      this.wsPending = null;
      resolve();
    }
    this.broadcastWs("connected");
  }
  
  onWsClose(event, ws, resolve, reject) {
    if (this.ws) {
      this.ws = null;
      this.broadcastWs("disconnected");
    }
    if (this.wsPending) {
      this.wsPending = null;
      reject('closed');
    }
  }
  
  onWsError(event, ws, resolve, reject) {
    if (this.ws) {
      this.ws = null;
      this.broadcastWs("disconnected");
    }
    if (this.wsPending) {
      this.wsPending = null;
      reject('WebSocket error');
    }
  }
  
  onWsMessage(event, ws) {
    console.log(`onWsMessage`, event);
    let body = null;
    try {
      body = JSON.parse(event.data) || ""; // don't let it be null
    } catch (e) {
      console.log(`failed to evaluate ws message body`, e);
      body = event.data || "";
      if ((body === "connected") || (body === "disconnected")) {
        // don't let it match our connection-marker events
        body = "_" + body;
      }
    }
    if (body.socketId) {
      this.socketId = body.socketId;
    }
    this.broadcastWs(body);
  }
  
  broadcastWs(body) {
    for (const { cb } of this.wsListeners) {
      cb(body);
    }
  }
}

Comm.singleton = true;
