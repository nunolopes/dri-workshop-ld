var endpointURL = 'http://localhost:8998/'; // where ab-proxy.py serves

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
	
	$(".more").live('click', function(event) { // on 'More' button click
		var eID = $(this).attr('id');
		findAliases(eID, $(this).parent());
	});
	
})

function queryAB(abTerm) {
	var q = 'SELECT * WHERE { ?s ?p ?o . FILTER regex(?o, "' + abTerm +'", "i") }';
	
	console.log('EXECUTING: ' + q);
	$.ajax({
		url: endpointURL + 'dydra' + '/' + escape(q),
		success: function(data){
			if(data) {
				renderABResults(data);
			}
		},
		error:  function(msg){
			$("#out").html("<p>There was a problem executing the query:</p><code>" + msg.responseText + "</code>");
		} 
	});
}

// renders the SPARQL result set for author or books
function renderABResults(data) {
	var buf = '';
	var results = data.results.bindings;
	
	$("#out").html("");
	for (var i=0; i < results.length; i++) {
		buf += '<div class="ab">';
		buf += '<h3>'+ results[i].o.value + ' <small><a class="muted" href="' + results[i].s.value + '">#</a></small></h3> ';
		buf += '<button id="' + results[i].s.value + '" class="btn btn-info more">More ...</button>';
		buf += '</div>';
	}
	$("#out").append(buf);
	$("#result").slideDown('200');
}


function findAliases(entityID, element) {
	var q = 'SELECT * WHERE { <' + entityID +'> <http://www.w3.org/2002/07/owl#sameAs> ?alias . }';
	var buf = '';
	
	console.log('EXECUTING: ' + q);
	$.ajax({
		url: endpointURL + 'dydra' + '/' + escape(q),
		success: function(data){
			if(data) {
				var results = data.results.bindings;
				buf = '<div class="more-details">';
				for (var i=0; i < results.length; i++) {
					buf += '<div><span class="badge badge-info">' + i + '</span> <a href="' + results[i].alias.value + '" target="_blank">' + results[i].alias.value  + '</a></div>';
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