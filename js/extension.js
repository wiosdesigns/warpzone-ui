extension = {   
  _send(message) {
    window.parent.postMessage(message,"*");
  },
  _onReceived(event) {
    if(this._promises[event.data.callId]){
      if(event.data.success){
        this._promises[event.data.callId].resolve(event.data.response);
      } else {
        this._promises[event.data.callId].reject(event.data.response);
      }
    }
  },
  _callId: 0,
  _promises: {},
  _call(functionName, params){
    return new Promise((resolve, reject)=>{
      this._callId++;
      try{
        this._send({callId: this._callId, functionName, params});
        this._promises[this._callId] = {resolve, reject};      
      } catch(e) {
        reject(e);
      }
    })
  },
  isAvailable(){
    try{
      return window!=window.parent;    
    } catch (e) {
      return true;
    }
  },
  async init() {  
    window.addEventListener("message", async (event) => {
      this._onReceived(event);
    }, false);
    console.log("initialized extension");
    console.log(await this._call("echo", "echo test done"));
  },
  getBuildNumber(){
    return this._call("getBuildNumber");
  },
  async getTopSites() {
    let results = (await this._call("getTopSites"))||[];
    results.forEach(result => {
      result.type="topSites";
    });
    return results;
  },
  async getBookmarks(query) {
    let results = (await this._call("getBookmarks", query))||[];
    results.forEach(result => {
      result.type="bookmarks";
    });
    return results.slice(0,10);
  },
  async getHistory(query) {
    let results = (await this._call("getHistory", query))||[];
    results.forEach(result => {
      result.type="history";
    });
    return results.slice(0,10);
  }
}

