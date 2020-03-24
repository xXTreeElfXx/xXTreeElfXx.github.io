(function() {
	var myConnector = tableau.makeConnector();
	var colsdistinct =[] 
	myConnector.getSchema = function(schemaCallback) {
      var paramObj = JSON.parse(tableau.connectionData);
      var paramString="?";
      paramObj["parameters"][0][1]=(Math.round((new Date()).getTime() / 1000)).toString();
      for (const param of paramObj["parameters"]){ 
         if (param[0].length>0 && param[1].length>0) { 
            paramString+=param[0]+"="+param[1]+"&";  
         };
      };
   
      paramString=paramString.slice(0,-1);
      var user_url = paramObj["user_url"] + paramString;
      apiCall={
         url: user_url,
         type: "GET",
         beforeSend: function(xhr){
            for (const head of paramObj["headers"]){
               if (head[0].length>0 && head[1].length>0) {
                  xhr.setRequestHeader(head[0], head[1]);
               };  
            }},
         success: function() { alert('Success!'); }
      }
      alert(user_url)
      $.ajax(apiCall).done(successFunction);
 
		function successFunction(data) {
         alert(data)
         var firstLine = data.split('\n')[0];
         var columns = firstLine.replace(/\s+/g, '_').split(",");
         var cols=[]
         function checkDistinct(list, str, num) {
            if(num==0){
               if (list.includes(str)){ 
                  return checkDistinct(list,str,num+1)
               }
               else {
                  return str;
               }
            } 
            if (list.includes(str+"_"+num)){
               return checkDistinct(list,str,num+1);
            }else{
               return str+"_"+num;
            };
         };  
         for (var x = 0; x<columns.length; x++){ //columns.length
            var res=checkDistinct(colsdistinct,columns[x],0);
            colsdistinct.push(res);
            y = {  
               id: colsdistinct[colsdistinct.length-1],
               alias: colsdistinct[colsdistinct.length-1], 
               dataType: tableau.dataTypeEnum.string
            };
            cols.push(y);
         }; 
         alert(colsdistinct)
         alert(cols)
			var tableInfo = {
				id: "WDCDataGithub",
				alias: "WDCTestingGithub",
				columns: cols
			};

			schemaCallback([tableInfo]);
		};
	};

	myConnector.getData = function(table, doneCallback) {
      var paramObj = JSON.parse(tableau.connectionData);
      var paramString="?";
      for (const param of paramObj["parameters"]){
         if (param[0].length>0 && param[1].length>0) {
            paramString+=param[0]+"="+param[1]+"&";
         };
      };
      paramString=paramString.slice(0,-1);
      var user_url = paramObj["user_url"] + paramString;
      alert(user_url);
      apiCall={
         url: user_url,
         //data: { signature: authHeader },
         type: "GET",
         beforeSend: function(xhr){xhr.setRequestHeader('Authorization', "Token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1ODczNTk5MTIsImlhdCI6MTU4NDc2NzkxMiwiaXNzIjoiYXV0aDpwcm9kdWN0aW9uIiwic2VyYTpzaWQiOiIxNzk1MTcxOC0xNzBjLTRhMmEtOGYwNi05NWI3MzhhMGY5OTYiLCJzZXJhOnRlYW1JZCI6IiIsInNlcmE6dHlwIjoiYXV0aCIsInN1YiI6IjNkNDQ3ZTNmLWI5MWYtNDgyNi04YjZiLTA4M2VjYWZmMGU1NyJ9.6nRSHLncB8hIgX6Sreh-MvwwfjaKXS3Hhm_ej-VHMKA");},
         success: function() { alert('Success!'); }
      }  
      apiCall={
         url: user_url,
         type: "GET",
         beforeSend: function(xhr){
            for (const head of paramObj["headers"]){
               if (head[0].length>0 && head[1].length>0) {
                  xhr.setRequestHeader(head[0], head[1]);
               };
            }},
         success: function() { alert('Success!'); }
      }
      $.ajax(apiCall).done(successFunction);
		function successFunction(data) {
         var dataByRow = Papa.parse(data, {header: true});
         for(var row_idx=0; row_idx<dataByRow.length;row_idx++){
            table.appendRows([dataByRow[row_idx]]);
            if (row_idx % 100 === 0) {
               tableau.reportProgress("Getting row: " + row_idx);
            }
         }
         doneCallback();

         /*
         for (var row_idx = 0; row_idx<dataByRow.length ; row_idx++){
            rowTableData={};
            splitRow=dataByRow[row_idx].split(",");
            //alert(colsdistinct+"   "+colsdistinct.length)
            for (var col_idx = 0; col_idx<colsdistinct.length; col_idx++) { 
               //alert(colsdistinct[col_idx]+": "+splitRow[col_idx]);
               rowTableData[colsdistinct[col_idx]]=splitRow[col_idx];
            };
            //finalDataTableRows.push(rowTableData);
            table.appendRows([rowTableData]);
            if (row_index % 100 === 0) {
               tableau.reportProgress("Getting row: " + row_index);
            }
         };
         //table.appendRows(finalDataTableRows);
			doneCallback();
			*/
		}
	}; 

   tableau.registerConnector(myConnector);

   $(document).ready(function() {
      $("#submitButton").click(function() {
         var paramObj = { "parameters": [
            [$('#param-1').val().trim(),$('#param-value-1').val().trim()], //param-1
            [$('#param-2').val().trim(),$('#param-value-2').val().trim()], //param-2 
            [$('#param-3').val().trim(),$('#param-value-3').val().trim()], //param-3
            [$('#param-4').val().trim(),$('#param-value-4').val().trim()], //param-4
            [$('#param-5').val().trim(),$('#param-value-5').val().trim()]], //param-5
            'user_url': $('#user_url').val().trim(),
            "headers": [
            [$('#head-1').val().trim(),$('#head-value-1').val().trim()],
            [$('#head-2').val().trim(),$('#head-value-2').val().trim()],
            [$('#head-3').val().trim(),$('#head-value-3').val().trim()],
            [$('#head-4').val().trim(),$('#head-value-4').val().trim()],
            [$('#head-5').val().trim(),$('#head-value-5').val().trim()],
            ] 
         };
         tableau.connectionData = JSON.stringify(paramObj);
         tableau.connectionName = "Parsable WDC"; // This will be the data source name in Tableau
         tableau.submit(); 
		});
	});
})();