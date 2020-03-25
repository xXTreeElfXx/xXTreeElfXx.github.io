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
      alert(lastTime)
      for (const param of paramObj["parameters"]){
         alert("param[0] "+param[0] + typeof param[0]+" param[1] "+param[1]+typeof param[1])
         if (lastTime!=-1 && param[0]=="start"){
            paramString+=param[0]+"="+(lastTime+1)+"&";
            continue;
         }
         if (lastTime!=-1 && param[0]=="end"){
            continue;
         }
         if (param[0].length>0 && param[1].length>0) {
            alert("paramString!: param[0] "+param[0]+" param[1] "+param[1])
            paramString+=param[0]+"="+param[1]+"&";
         };
      };
      paramString=paramString.slice(0,-1);
      var user_url = paramObj["user_url"] + paramString;
      alert(user_url)
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
               d=new Date(year=parseInt(rowTableData["Date"].slice(0,4)),month=(parseInt(rowTableData["Date"].slice(5,7))-1),day=parseInt(rowTableData["Date"].slice(8)),hour=parseInt(rowTableData["Time"].slice(0,2)),minute=parseInt(rowTableData["Time"].slice(3,5)),second=parseInt(rowTableData["Time"].slice(6)))
               var dttimestamp=d.getTime()-60*d.getTimezoneOffset()*1000
               var dt=new Date(dttimestamp) 
               rowTableData["timestamp"]=Math.trunc(dt.getTime()/1000);
            } else if((rowTableData["Date"]!=null)){
               d=new Date(parseInt(rowTableData["Date"].slice(0,4)),parseInt(rowTableData["Date"].slice(5,7)),parseInt(rowTableData["Date"].slice(8)))
               var dttimestamp=d.getTime()-60*d.getTimezoneOffset()*1000
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
   function retrieveTimestamp(value,date){
      if (value!=""){
         return value
      } else if (date!=""){
         d=new Date(year=parseInt(date.slice(0,4)),month=(parseInt(date.slice(5,7))-1),day=parseInt(date.slice(8,10)),hour=parseInt(date.slice(11,13)),minute=parseInt(date.slice(14,16)),second=parseInt(date.slice(17)))
         var dttimestamp=d.getTime()-60*d.getTimezoneOffset()*1000
         var dt=new Date(dttimestamp) 
         console.log(Math.trunc(dt.getTime()/1000))
         return Math.trunc(dt.getTime()/1000)+"";
      }
      return ""
      
   }
   $(document).ready(function() {
      $("#submitButton").click(function() {  
         var paramObj = { "parameters": [
            [$('#param-1').val().trim(), retrieveTimestamp($('#param-value-1').val().trim(), $('#param-date-1').val().trim())], //param-1
            [$('#param-2').val().trim(), retrieveTimestamp($('#param-value-2').val().trim(), $('#param-date-2').val().trim())], //param-2 
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