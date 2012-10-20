var endpointURL = 'http://localhost:8998/'; // where ab-proxy.py serves

$(document).ready(function() {
	$("#lookup-ab").click(function(event) { // on button click
		queryAB($('#ab-term').val());
	});
	$('#ab-term').keypress(function(e) { // on ENTER
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
		buf += '<h3>'+ results[i].o.value + '</h3>';
		buf += '<p>' + queryAliases(results[i].s.value) + '</p>';
		buf += '</div></div>';
	}
	$("#out").append(buf);
	$("#result").slideDown('200');
}


function queryAliases(entityID) {
	var q = 'SELECT * WHERE { <' + entityID +'> <http://www.w3.org/2002/07/owl#sameAs> ?alias . }';
	var buf = '';
	
	console.log('EXECUTING: ' + q);
	$.ajax({
		url: endpointURL + 'dydra' + '/' + escape(q),
		success: function(data){
			if(data) {
				var results = data.results.bindings;
				for (var i=0; i < results.length; i++) {
					buf += '<div class="ab">';
					buf += '<h3>'+ results[i].o.value + '</h3>';
					buf += '<p>' + aliases(results[i].s.value) + '</p>';
					buf += '</div></div>';
				}
				return buf;
			}
			else return 'No aliases found ...';
		},
		error:  function(msg){
			return 'Error executing aliases query.';
		} 
	});
}