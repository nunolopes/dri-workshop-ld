var WRAPPER_URL = 'http://localhost:8998/'; // where ab-proxy.py serves
var ENTITY_LIMIT = 50;

$(document).ready(function() {
	$("#lookup-ab").click(function(event) { // on 'Lookit up!' button click
		queryAB($('#ab-term').val());
	});
	$('#ab-term').keypress(function(e) { // on ENTER in search input field
		if (e.keyCode == 13) {
			e.preventDefault();
			queryAB($(this).val());
			return false;
		}
	});
})

function queryAB(abTerm) {
	var q = 'SELECT * WHERE { ?s ?p ?o . FILTER regex(?o, "' + abTerm +'", "i") }';
	
	console.log('EXECUTING: ' + q);
	$.ajax({
		url: WRAPPER_URL + 'dydra' + '/' + escape(q),
		success: function(data){
			if(data.results.bindings.length > 0) {
				renderABResults(data);
			}
			else {
				$("#out").html("<p>Sorry, I didn't find anything that matches <code>" + abTerm + "</code>, please try again with <code>Goethe</code> or <code>moby</code>.");
			}
		},
		error:  function(msg){
			$("#out").html("<p>There was a problem executing the query:</p><code>" + msg.responseText + "</code>");
		} 
	});
}

// renders the SPARQL result set for author or books
function renderABResults(data) {
	var abresult = $('<div class="ab"></div>');
	var results = data.results.bindings;

	$("#out").html("");
	for (var i=0; i < results.length; i++) {
		abresult.append('<h3>'+ results[i].o.value + ' <small><a class="muted" href="' + results[i].s.value + '" title="' + results[i].s.value + '">#</a></small></h3>');
		findAliases(results[i].s.value, abresult);
		$("#out").append(abresult);
	}
	$("#result").slideDown('200');
}

function findAliases(entityID, element) {
	var q = 'SELECT * WHERE { <' + entityID +'> <http://www.w3.org/2002/07/owl#sameAs> ?alias . }';
	var buf = '';
	
	console.log('EXECUTING: ' + q);
	$.ajax({
		url: WRAPPER_URL + 'dydra' + '/' + escape(q),
		success: function(data){
			if(data) {
				var results = data.results.bindings;
				var ds = '';
				buf = '<div class="more-details">';
				for (var i=0; i < results.length; i++) {
					// buf += '<div><span class="badge badge-info">' + i + '</span> <a href="' + results[i].alias.value + '" target="_blank">' + results[i].alias.value  + '</a></div>';
					ds = getDataspace(results[i].alias.value); // determine from which dataspace the alias originates
					if(ds == 'dbpedia') {
						renderDBPediaEntity(results[i].alias.value, element)
					}
					else {
						renderEuropeanaEntity(results[i].alias.value, element);
					}
				}
				buf += '</div>';
				element.append(buf);
			}
			else element.append('No aliases found ...');
		},
		error:  function(msg){
			return element.append('Error executing aliases query.');
		} 
	});
}

function renderDBPediaEntity(entityID, element){
	var q = 'SELECT * WHERE { <' + entityID + '> <http://dbpedia.org/ontology/abstract> ?abstract . OPTIONAL {  <' + entityID + '> <http://xmlns.com/foaf/0.1/depiction> ?pic } . FILTER(langMatches(lang(?abstract), "en")) }';
	var buf = '';

	console.log('EXECUTING: ' + q);
	$.ajax({
		url: WRAPPER_URL + 'dbpedia' + '/' + escape(q),
		success: function(data){
			if(data) {
				var results = data.results.bindings;
				buf = '<div class="src"><small><span class="label label-inverse"><i class="icon-comment icon-white"></i> Source</span> <strong><a href="' + entityID + '" target="_blank">DBpedia</a></strong></small></div><div class="dbpedia-abstract">';
				for (var i=0; i < results.length; i++) {
					if(results[i].pic) {
						buf += '<img src="' + results[i].pic.value + '" alt="depiction of entity" />';
					}
					buf +=  results[i].abstract.value;
				}
				buf += '</div>';
				element.append(buf);
			}
			else element.append('No entity details found in DBpedia.');
		},
		error:  function(msg){
			return element.append('Error executing entity query in DBpedia.');
		} 
	});
}

function renderEuropeanaEntity(entityID, element){
	var q = 'SELECT * WHERE { <' + entityID +'> <http://purl.org/dc/elements/1.1/subject> ?subject . }';
	var buf = '';

	console.log('EXECUTING: ' + q);
	$.ajax({
		url: WRAPPER_URL + 'europeana' + '/' + escape(q),
		success: function(data){
			if(data) {
				var results = data.results.bindings;
				buf = '<div class="src"><small><span class="label label-inverse"><i class="icon-comment icon-white"></i> Source</span> <strong><a href="' + entityID + '" target="_blank">Europeana</a></strong></small></div><div class="europeana-subject">';
				for (var i=0; i < results.length; i++) {
					buf +=  '<div><strong>Subject:</strong> ' + results[i].subject.value + '</div>';
				}
				buf += '</div>';
				element.append(buf);
			}
			else element.append('No entity details found in Europeana.');
		},
		error:  function(msg){
			return element.append('Error executing entity query in Europeana.');
		} 
	});
}

function renderEntity(entityID, element, limit){
	var q = 'SELECT * WHERE { <' + entityID +'> ?p ?o . }';
	var buf = '';
	var ep = getDataspace(entityID);
	
	// make sure we don't hammer endpoints, esp. if they are not ours
	if(limit) q += ' LIMIT ' + limit;
	else q += ' LIMIT ' + ENTITY_LIMIT;
	
	console.log('EXECUTING: ' + q + '\n against ' + ep);
	$.ajax({
		url: WRAPPER_URL + ep + '/' + escape(q),
		success: function(data){
			if(data) {
				var results = data.results.bindings;
				buf = '<table class="table table-striped">\n<thead><tr><th>property</th><th>object</th></tr></thead><tbody>';
				for (var i=0; i < results.length; i++) {
					buf += '<tr><td>' + results[i].p.value + '</td><td>' + results[i].o.value  + '</td></tr>';
				}
				buf += '</tbody></table>';
				element.append(buf);
			}
			else element.append('No entity details found.');
		},
		error:  function(msg){
			return element.append('Error executing entity query.');
		} 
	});
}

// determine the dataspace/endpoint to use, based on the entity characteristic
function getDataspace(entityID){
	if(entityID.indexOf('http://dbpedia.org/') == 0) { // we have an entity from DBpedia
		return 'dbpedia';
	}
	else {
		if(entityID.indexOf('http://data.europeana.eu/') == 0) { // we have an entity from Europeana
			return 'europeana';
		}
		else { // ... in our own dataspace
			return'dydra'; 
		}
	}
}
