

concept = 'earth' 
final = 'internet'

// conceptNet( concept, parseLinks, [])




function request(url, callback){
  var req = new XMLHttpRequest();
  req.onload=function() {
    callback(req.responseText)
  };
  req.open("GET", url, true);
  req.send();
}



function conceptNet(concept, callback, historyChain){

  c = '/c/en/';
  limit = 10
  request("http://conceptnet5.media.mit.edu/data/5.4"+c+concept.replace(/ /g,'_') +"?&filter="+c+"&limit="+limit, (body)=>{


    edges=JSON.parse(body).edges;


    conceptJSON = []


    for (var i in edges){

      var {start, end, rel, weight, surfaceText} = edges[i];

      // term = start.startsWith(c+concept) ? end : start;


      if (start.startsWith(c)  && rel != "/r/TranslationOf"){


        start = start.replace(c,'').replace(/_/g,' ').replace(/\/.+/g,'')
        end = end.replace(c,'').replace(/_/g,' ').replace(/\/.+/g,'')


        rel = rel.replace('/r/','');

        //reversed <>
        conceptJSON.push({source: end, target: start, type: rel, surfaceText})


        
      }




    }

    //call the parser function
    callback(conceptJSON, historyChain);


  })  

}


var overall = [];


var isFoundStopAllOthers = false;

var alreadyChecked = [concept];

var parseLinks=function(links, historyChain){
  if (isFoundStopAllOthers) return;

  // overall=overall.concat(JSON.parse(JSON.stringify(links)));

  console.log(JSON.stringify(links))



  for (var i in links){

    historyForNextCall = JSON.parse(JSON.stringify(historyChain)).concat(links[i])

    if (links[i].source == final || links[i].target == final){
      isFoundStopAllOthers=1;


    results.innerHTML = (historyForNextCall.map(({target, source, type, surfaceText})=>surfaceText || target +" " + type.replace(/([A-Z])/g,' $1').trim() +" " +  source )
        .join('<br>').replace(/\[\[/g,'<b>').replace(/\]\]/g,'</b>'))


      return historyForNextCall;

    }

    other = links[i].source == concept ? links[i].target : links[i].source;

    if(alreadyChecked.indexOf(other)==-1 && historyForNextCall.length < 4){ //if not already checked temr


        alreadyChecked.push(other)

        conceptNet(other, parseLinks,    historyForNextCall)

    }




  }
  
}



var isFoundStopAllOthers = false;

var alreadyChecked = [concept];



startbutton.onclick=function(){

  concept = term1.value
  final = term2.value

var isFoundStopAllOthers = false;

var alreadyChecked = [concept];

  conceptNet( concept, parseLinks, [])

}
