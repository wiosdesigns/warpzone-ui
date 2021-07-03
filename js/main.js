$ = (selector) => document.querySelector(selector);
$$ = (selector) => document.querySelectorAll(selector);

function init() {
  $(".title").onclick = () => router.goto("home");

  const vueApp = {
    data() {
      return {
        mode: "web", // web for site and ext when in iframe
        screen: "home",
        buildNumber: "",
        version: "0.0",
        results: [],
        query: "",
        activeIndex: 0,
        updateId: 0,
        bgImage: "/assets/bg.jpg",
        bgDarken: 0,
        notes: "You can type some notes here. They will stay.\n\nThis fancy Fira Code font also has some cool arrows: -> => ~> |> . Have fun :>"  
      }
    },
    watch: {
      query(){ this.search(); },
      bgDarken() { 
        this.setBgDarkness(this.bgDarken);
        localStorage.setItem("bgDarken", this.bgDarken); 
      },
      notes() { localStorage.setItem("notes", this.notes); }
    },
    methods: {
      goto(screen) {
        this.screen = screen;
      },  
      async getTopSites() {
        this.results = [];
        if(this.mode=="web"){
          this.results.push({
            type: "topSites",
            url: "https://wios.xyz",
            title: "This could be your chrome new tab page. Download the extension now!"
          });
          return;
        }
        try {
          this.updateId++;
          const updateId = this.updateId;  
          const results = await extension.getTopSites()||[];
          if(this.updateId==updateId){            
            this.results = results;
          }
        } catch(e) {
          console.error(e);
          this.results = [];
        }
        this.activateFirstResult();
      },
      async search(){
        this.results = [];
        const query = this.query.trim();
        if(this.mode=="web"){
          if(query){
            this.results.push({
              type: "bookmarks",
              url: "https://wios.xyz",
              title: "Results from your bookmarks will appear here."
            });
            this.results.push({
              type: "history",
              url: "https://wios.xyz",
              title: "Results from your history will appear here."
            });
          } else {
            this.getTopSites();
          }
          return;
        }
        if(query){
          try{
            this.updateId++;
            const updateId = this.updateId;
            const bookmarkResults = await extension.getBookmarks(query)||[];
            const historyResults = await extension.getHistory(query)||[];
            if(this.updateId==updateId){            
              this.results = bookmarkResults.concat(historyResults);
            }
          } catch(e){
            console.error(e);
          }
          this.activateFirstResult();
        } else {
          await this.getTopSites();
        }
      },
      async navigate(e){
        if(e.key=="ArrowDown"){
          e.preventDefault();          
          if(this.activeIndex<(this.results.length-1)){
            this.activeIndex++;
          }
        } else if (e.key=="ArrowUp") {
          e.preventDefault();          
          if(this.activeIndex>0){
            this.activeIndex--;
          }
        }
        $(`#result-link-${this.activeIndex}`)?.scrollIntoViewIfNeeded();
      },
      activateFirstResult() {
        this.activeIndex = 0;
      },
      openActiveLink() {
        const link = this.results[this.activeIndex];
        if(link){
          if(this.linkTarget=="_self"){
            location.href = link.url;
          } else {            
            top.location.href = link.url; 
          }
        }
      },
      setBgImage(path) {
        $(".backdrop").style.background = `url(${path})`;
        $(".backdrop").style.backgroundPosition = "bottom center";
        $(".backdrop").style.backgroundSize = "cover";
      },
      setBgDarkness(val) {
        $(".backdrop-cover").style.opacity = val/100;
      },
      changeBgImage(){
        this.bgImage = this.bgImage||"/assets/bg.jpg";
        this.setBgImage(this.bgImage);
        localStorage.setItem("bgImage", this.bgImage);
      },
      async getVersion(){
        const response = await fetch("/version");
        const version = await response.text();
        this.version = version;
      }
    },
    computed: {
      topSites() {
        return this.results.map((result,idx) => {
          result.idx = idx;
          return result;
        }).filter(result => result.type=="topSites");
      },
      bookmarkResults() {
        return this.results.map((result,idx) => {
          result.idx = idx;
          return result;
        }).filter(result => result.type=="bookmarks");
      },
      historyResults() {
        return this.results.map((result,idx) => {
          result.idx = idx;
          return result;
        }).filter(result => result.type=="history");
      },
      linkTarget() {
        return this.mode=="web"?"_self":"_top";
      }
    },
    async mounted() {
      
      this.bgImage = localStorage.getItem("bgImage")||this.bgImage;
      this.bgDarken = localStorage.getItem("bgDarken")||this.bgDarken;
      this.notes = localStorage.getItem("notes")||this.notes;
      
      this.setBgImage(this.bgImage);
      this.setBgDarkness(this.bgDarken);
      
      if(extension.isAvailable()){
        extension.init();
        this.mode = "ext";
        this.buildNumber = await extension.getBuildNumber();
      } else {
        this.mode = "web";
      }
      doCacheBusiness(this.getVersion);
      this.getTopSites();
    }
  }
  
  window.vueApp = Vue.createApp(vueApp);
  window.vueApp.mount("#appContainer");
  
  
}

function doCacheBusiness(versionCallback){
  navigator.serviceWorker && navigator.serviceWorker.register('./sw.js').then(function(registration) {
    registration.addEventListener('updatefound',function(){
      caches.delete('the-magic-cache');
      window.location.reload(true);
    })
    console.log('Service worker registered with scope: ', registration.scope);
    setTimeout(()=>{    
      versionCallback();
    }, 2000);
  });
}
