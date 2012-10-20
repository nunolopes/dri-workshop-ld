var endpointURL = 'http://localhost:8998/'


$(document).ready(function(){
	$("#lookup-beer-pref").click(function(event){
		sparqlQuery('dydra', 'SELECT * WHERE { ?s ?p ?o } LIMIT 1');
	});
	
})

function sparqlQuery(endpointPath, query) {
    
	$("#result").slideDown('200');

        var queryUrl = endpointURL + endpointPath + '/' + query;

	$.ajax({
		url: queryUrl,
		success: function(data){
			if(data) {
				renderResults(data);
			}
		},	
		error:  function(msg){
			$("#out").html("<p>There was a problem executing the query:</p><code>" + msg.responseText + "</code>");
		} 
	});
}


// renders the results
function renderResults(data){
	var vars =  Array();
	var buffer = "";
	$("#out").html("");

        buffer += "results";
	
	$("#out").append(buffer);
}


