$(document).ready(function() {

  // The event listener for the file upload
  document.getElementById('csvFileUpload').addEventListener('change', csvUpload, false);
  document.getElementById('dhcpFileUpload').addEventListener('change', dhcpUpload, false);

  var csvRecs = {};
  var outRecs = [];

  // Method that checks that the browser supports the HTML5 File API
  function browserSupportFileUpload() {
    var isCompatible = false;
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      isCompatible = true;
    }
    return isCompatible;
  }

  // read and process the selected 3CX file
  function csvUpload(evt) {
    if (!browserSupportFileUpload()) {
      alert('The File APIs are not fully supported in this browser!');
    } else {

      var data = null;
      var file = evt.target.files[0];
      var reader = new FileReader();

      reader.readAsText(file);
      reader.onload = function(event) {
        var csvData = event.target.result;
        data = $.csv.toArrays(csvData);
        if (data && data.length > 0) {
          //alert('Imported -' + data.length + '- rows successfully!');

          data.forEach(function(line, i) {
            // skip the header line
            if (i > 0) {
              var csvRec = {};
              csvRecs[line[35]] = line[6];
            }
          });
          console.log('dhcp show');
          $('#dhcpUpload').show();
        } else {
          alert('No data to import. This does not appear to be a valid 3CX data file!');
        }
      };
      reader.onerror = function() {
        alert('Unable to read ' + file.fileName);
      };
    }
  }

  // read and process the selected DHCP file
  function dhcpUpload(evt) {
    if (!browserSupportFileUpload()) {
      alert('The File APIs are not fully supported in this browser!');
    } else {

      var data = null;
      var file = evt.target.files[0];
      var reader = new FileReader();

      reader.readAsText(file);
      reader.onload = function(event) {
        data = $.csv.toArrays(event.target.result);
        if (data && data.length > 0) {
          //alert('Imported -' + data.length + '- DHCP rows successfully!');
          var record = {};
          data.forEach(function(line, i) {
            var dhcpLine = line.join('').match(/^(\d*\.\d*\.\d*\.\d*).*(.{2}-.{2}-.{2}-.{2}-.{2}-.{2}).*/)
            if(dhcpLine) {
              var ipa = dhcpLine[1];
              var mac = dhcpLine[2].replace(/\-/g,'').toUpperCase();
              outRecs.push([ipa, 'admin', csvRecs[mac]].join(','));
            }
          });

          if(outRecs.length) {
            let csvContent = "data:text/csv;charset=utf-8,";
            outRecs.forEach(function(outRec){
              csvContent += outRec + "\r\n"; // add carriage return
            });

            var today = getDate();
            var resultFileName = today + "_DHCP_3CX.csv";
            var encodedUri = encodeURI(csvContent);
            var link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", resultFileName);
            link.setAttribute("id", "downloadCSV");
            link.innerHTML = "3: Download " + resultFileName;
            $('#resultFile').append(link);
            $('#resultFile').show();
          } else {
            alert('No outRecs');
          }

        } else {
          alert('No data to import. This does not appear to be a valid DHCP file!');
        }
      };
      reader.onerror = function() {
        alert('Unable to read ' + file.fileName);
      };
    }
  }

  function getDate() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();

    if(dd<10) {
      dd = '0'+dd
    }

    if(mm<10) {
      mm = '0'+mm
    }

    return [yyyy,mm,dd].join('');
  }

});

