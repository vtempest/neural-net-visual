
concept = 'government' 


function request(url, callback){
  var req = new XMLHttpRequest();
  req.onload=function() {
    callback(req.responseText)
  };
  req.open("GET", url, true);
  req.send();
}



function conceptNet(concept, callback){

  c = '/c/en/';
  limit = 20
  request("http://conceptnet5.media.mit.edu/data/5.4"+c+concept+"?&filter="+c+"&limit="+limit, (body)=>{


    edges=JSON.parse(body).edges;


    conceptJSON = []


    for (var i in edges){

      var {start, end, rel, weight} = edges[i];

      // term = start.startsWith(c+concept) ? end : start;


      if (start.startsWith(c)  && rel != "/r/TranslationOf"){


        start = start.replace(c,'').replace(/_/g,' ').replace(/\/.+/g,'')
        end = end.replace(c,'').replace(/_/g,' ').replace(/\/.+/g,'')


        rel = rel.replace('/r/','');

        //reversed <>
        conceptJSON.push({source: end, target: start, type: rel})


        
      }




    }


    callback(conceptJSON);


  })  

}


//INIT

var links, raw =[];

conceptNet(concept, function(conceptJSON){

  raw = conceptJSON;

  console.log(JSON.stringify(raw))

  links = JSON.parse(JSON.stringify(raw))



  update(); 
  
})

var w = window.innerWidth-10,
    h = window.innerHeight-20;

    

var svg = d3.select("body").append("svg:svg")
    .attr("width", w)
    .attr("height", h);





function update(){


var nodes = {};

// Compute the distinct nodes from the links.
links.forEach(function(link) {
  link.source = nodes[link.source] || (nodes[link.source] = {name: link.source});
  link.target = nodes[link.target] || (nodes[link.target] = {name: link.target});
});


var force = d3.layout.force()
    .nodes(d3.values(nodes))
    .links(links)
    .size([w, h])
    .linkDistance(120)
    .charge(-300)
    .on("tick", tick)
    .start();


// Per-type markers, as they don't inherit styles.
svg.html("").append("svg:defs").selectAll("marker")
    .data(["RelatedTo","IsA","PartOf","MemberOf","HasA","UsedFor","CapableOf","AtLocation","Causes","CausesDesire", "HasSubevent","HasFirstSubevent","HasLastSubevent","HasPrerequisite","HasProperty","MotivatedByGoal","ObstructedBy","Desires","CreatedBy","Synonym","Antonym","DefinedAs"])
  .enter().append("svg:marker")
    .attr("id", String)
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 15)
    .attr("refY", -1.5)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
  .append("svg:path")
    .attr("d", "M0,-5L10,0L0,5");

    var link = svg.append("svg:g").selectAll("g.link")
        .data(force.links())
      .enter().append('g')
        .attr('class', 'link');
    
    var linkPath = link.append("svg:path")
        .attr("class", function(d) { return "link " + d.type; })
        .attr("marker-end", function(d) { return "url(#" + d.type + ")"; });
    
    var textPath = link.append("svg:path")
        .attr("id", function(d) { return d.source.index + "_" + d.target.index; })
        .attr("class", "textpath");

var circle = svg.append("svg:g").selectAll("circle")
    .data(force.nodes())
  .enter().append("svg:circle")

      .on("click", click)
    .attr("r", 6)
    .call(force.drag);

var text = svg.append("svg:g").selectAll("g")
    .data(force.nodes())
      .on("click", click)
  .enter().append("svg:g");

// A copy of the text with a thick white stroke for legibility.
text.append("svg:text")
    .attr("x", 8)
    .attr("y", ".31em")
    .attr("class", "shadow")
    .text(function(d) { return d.name; });

text.append("svg:text")
    .attr("x", 8)
    .attr("y", ".31em")
    .text(function(d) { return d.name; });

var path_label = svg.append("svg:g").selectAll(".path_label")
    .data(force.links())
  .enter().append("svg:text")
    .attr("class", "path_label")
    .append("svg:textPath")
      .attr("startOffset", "50%")
      .attr("text-anchor", "middle")
      .attr("xlink:href", function(d) { return "#" + d.source.index + "_" + d.target.index; })
      .style("fill", "#000")
      .style("font-family", "Arial")
      .text(function(d) { return d.type; });

    function arcPath(leftHand, d) {
        var start = leftHand ? d.source : d.target,
            end = leftHand ? d.target : d.source,
            dx = end.x - start.x,
            dy = end.y - start.y,
            dr = Math.sqrt(dx * dx + dy * dy),
            sweep = leftHand ? 0 : 1;
        return "M" + start.x + "," + start.y + "A" + dr + "," + dr + " 0 0," + sweep + " " + end.x + "," + end.y;
    }

// Use elliptical arc path segments to doubly-encode directionality.
function tick() {
  linkPath.attr("d", function(d) {
    return arcPath(false, d);
  });
    
  textPath.attr("d", function(d) {
    return arcPath(d.source.x < d.target.x, d);
  });

  circle.attr("transform", function(d) {
    return "translate(" + d.x + "," + d.y + ")";
  });

  text.attr("transform", function(d) {
    return "translate(" + d.x + "," + d.y + ")";
  });
}




// Toggle children on click.
function click(d) {
  // alert(d)

  if (d3.event.defaultPrevented) return; // ignore drag
  // if (d.children) {
  //   d._children = d.children;
  //   d.children = null;
  // } else {
  //   d.children = d._children;
  //   d._children = null;
  // }




  conceptNet(d.name.replace(/ /g,'_'), function(conceptJSON){

    document.querySelector('svg').style.display='none';

    console.log(JSON.stringify(raw,null,2))

    raw = raw.concat(conceptJSON)

    // console.log(JSON.stringify(raw,null,2))
    
    links = JSON.parse(JSON.stringify(raw))



    update();


    setTimeout(()=>{
      document.querySelector('svg').style.display='block'
    },2000)
    
  })




}


}