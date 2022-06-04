/* Injector.js
 */
 
export class Injector {
  static getDependencies() {
    return [Window, Document];
  }
  constructor(window, document) {
    this.instances = {
      Window: window,
      Document: document,
      Injector: this,
    };
    this.pending = [];
  }
  
  getInstance(clazz, override) {
  
    let instance = this.instances[clazz.name];
    if (instance) {
      // NB (override) is deliberately ignored for singleton classes
      return instance;
    }
    
    if (override) {
      for (const oinst of override) {
        if (oinst instanceof clazz) return oinst;
      }
    }
    
    if (this.pending.indexOf(clazz.name) >= 0) {
      throw new Error(`dependency cycle involving these: ${this.pending.join(',')}`);
    }
    this.pending.push(clazz.name);
    
    try {
      const deps = [];
      if (clazz.getDependencies) {
        for (const dclazz of clazz.getDependencies()) {
          const dinst = this.getInstance(dclazz, override);
          deps.push(dinst);
        }
      }
      instance = new clazz(...deps);
    } finally {
      const p = this.pending.indexOf(clazz.name);
      if (p >= 0) this.pending.splice(p, 1);
    }
    
    if (clazz.singleton) {
      this.instances[clazz.name] = instance;
    }
    
    return instance;
  }
}

Injector.singleton = true;
