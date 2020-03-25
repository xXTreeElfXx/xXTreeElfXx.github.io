(function() {
	var myConnector = tableau.makeConnector();
	var colsdistinct =[] 
	myConnector.getSchema = function(schemaCallback) {
      var paramObj = JSON.parse(tableau.connectionData);
      var paramString="?";
      for (const param of paramObj["parameters"]){ 
         if (param[0]=="start"){
            paramString+=param[0]+"="+(Math.round((new Date()).getTime() / 1000)).toString()+"&";
            continue;
         }
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
         cols.push({
            id: "timestamp",
            alias: "timestamp", 
            dataType: tableau.dataTypeEnum.int
         })
			var tableInfo = {
				id: "WDCDataGithub",
				alias: "WDCTestingGithub",
            columns: cols,
            incrementColumnId: "timestamp"
			};

			schemaCallback([tableInfo]);
		};
	};

	myConnector.getData = function(table, doneCallback) {
      var paramObj = JSON.parse(tableau.connectionData);
      var lastTime = parseInt(table.incrementValue || -1);
      var paramString="?";
      for (const param of paramObj["parameters"]){
         if (lastTime!=-1 && param[0]=="start"){
            paramString+=param[0]+"="+lastTime+"&";
            continue;
         }
         if (param[0].length>0 && param[1].length>0) {
            paramString+=param[0]+"="+param[1]+"&";
         };
      };
      paramString=paramString.slice(0,-1);
      var user_url = paramObj["user_url"] + paramString;
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
         var dataByRow = Papa.parse(data).data;
         for(var row_idx=1; row_idx<dataByRow.length;row_idx++){ 
            var d = 0
            rowTableData={};
            splitRow=dataByRow[row_idx];
            for (var col_idx = 0; col_idx<colsdistinct.length; col_idx++) { 
               rowTableData[colsdistinct[col_idx]]=splitRow[col_idx];
            };
              
            if (rowTableData["Date"]!=null && rowTableData["Time"]!=null){
               //alert("Time:"+rowTableData["Time"]+"  Date:"+rowTableData["Date"])  
               
               //alert("parse time: "+rowTableData["Date"].slice(0,4)+" "+rowTableData["Date"].slice(5,7)+" "+rowTableData["Date"].slice(8)+" "+parseInt(rowTableData["Time"].slice(0,2))+" "+parseInt(rowTableData["Time"].slice(3,5))+" "+parseInt(rowTableData["Time"].slice(6)))
               d=new Date(year=parseInt(rowTableData["Date"].slice(0,4)),month=(parseInt(rowTableData["Date"].slice(5,7))-1),day=parseInt(rowTableData["Date"].slice(8)),hour=parseInt(rowTableData["Time"].slice(0,2)),minute=parseInt(rowTableData["Time"].slice(3,5)),second=parseInt(rowTableData["Time"].slice(6)))
               //alert("d.getTime()= "+d.getTime()+ "     2*60*d.getTimezoneOffset():  "+2*60*d.getTimezoneOffset())
               var dttimestamp=d.getTime()-60*d.getTimezoneOffset()*1000
               var dt=new Date(dttimestamp) 
               //alert("Timestamp: "+Math.trunc(d2.getTime()/1000))
               //alert(s) 
               rowTableData["timestamp"]=Math.trunc(dt.getTime()/1000);
            } else if((rowTableData["Date"]!=null)){
               //alert("Date:"+rowTableData["Date"])
               d=new Date(parseInt(rowTableData["Date"].slice(0,4)),parseInt(rowTableData["Date"].slice(5,7)),parseInt(rowTableData["Date"].slice(8)))
               var dttimestamp=d.getTime()-120*d.getTimezoneOffset()
               var dt=new Date(dttimestamp)
               rowTableData["timestamp"]=Math.trunc(dt.getTime()/1000);
            } else { 
               rowTableData["timestamp"]=null
            }
            table.appendRows([rowTableData]);
            if (row_idx % 100 === 0) {
               tableau.reportProgress("Getting row: " + row_idx);
            }
         }
         doneCallback();

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