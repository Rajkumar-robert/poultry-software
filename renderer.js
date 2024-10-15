const { ipcRenderer } = require('electron');
const XLSX = require('xlsx');
const jsPDF = require('jspdf').jsPDF;
const html2canvas = require('html2canvas');
// const {downloadPDF} = require('./pdfDownload');


const queryForm = document.querySelector('#queryForm');
const csvForm = document.querySelector('#csvUploadForm');
const queryButton = document.querySelector('#queryButton');



function queryRecords(e) {
    e.preventDefault(); // Prevent default form submission

    const formData = new FormData(queryForm);
    const fromDate = formData.get('fromDate');
    const toDate = formData.get('toDate');
    const reportType = formData.get('reportType');

    if (!reportType) {
        alert('Please select a report type.');
        return;
    }
    const selectedReportType = reportType.split('-')[0];
    const shiftType = reportType.split('-')[1];

    

    // Function to determine time range based on report type
    function getTimeRange(shiftType) {
        let startTime, endTime;
        
        if (shiftType === 'day') {
            startTime = '06:00';  // 6 AM
            endTime = '06:00';    // 6 AM next day
        } else if (shiftType === 'shift1') {
            startTime = '06:00';  // 6 AM
            endTime = '14:00';    // 2 PM
        } else if (shiftType === 'shift2') {
            startTime = '14:00';  // 2 PM
            endTime = '22:00';    // 10 PM
        } else if (shiftType === 'shift3') {
            startTime = '22:00:00';  // Start from 10 PM
    endTime = '23:59:59'; 
        }
        
        return { startTime, endTime };
    }

    let selectedShift;

    switch(shiftType) {
        case 'day':
            selectedShift = getTimeRange('day');
            break;
        case 'shift1':
            selectedShift = getTimeRange('shift1');
            break;
        case 'shift2':
            selectedShift = getTimeRange('shift2');
            break;
        case 'shift3':
            selectedShift = getTimeRange('shift3');
            break;
        default:
            alert('Please select a report type.');
            break;
    }

    // Log the selected report type and its corresponding time range for debugging
    console.log('Selected Report:', selectedReportType, 'Start:', selectedShift.startTime, 'End:', selectedShift.endTime);

    // Send the selected report type and time range to the backend via ipcRenderer
    ipcRenderer.send('query-reports', {
        fromDate,
        toDate,
        reportType: selectedReportType,
        startTime: selectedShift.startTime,
        endTime: selectedShift.endTime,
        shiftType
    });
}



function uploadXls(e) {
    e.preventDefault();
    const formData = new FormData(csvForm);
    const xlsFile = formData.get('xlsFile');

    if (!xlsFile) {
        alert('Please upload an XLS file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Assuming you want to parse the first sheet
        const firstSheetName = workbook.SheetNames[0];
        const jsonObj = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName]);

        jsonObj.forEach(record => {
            if (record.TIME) {
                console.log(record.TIME);
                // Assuming TIME is a number representing hours as a decimal
                const totalSeconds = record.TIME * 24 * 60 * 60; // Convert days to seconds
                const hours = Math.floor(totalSeconds / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);
                const seconds = Math.floor(totalSeconds % 60);
                record.TIME = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            }
        });

        console.log(jsonObj);

        // Send the parsed data to the main process
        ipcRenderer.send('add-new-records', jsonObj);
    };

    reader.readAsArrayBuffer(xlsFile); // Read as ArrayBuffer for XLSX
}


// Function to get all records
function getAllRecords() {
  console.log('Getting all records');
    ipcRenderer.send('get-all-reports');
}


// Listen for all records from the main process and display them in a table
ipcRenderer.on('display-reports', (event, reports) => {
  console.log(reports);
  const postContainer = document.getElementById('postContainer');
  const resultTitle = document.getElementById('postContainerTitle');
  resultTitle.innerText = 'Query Results';
  postContainer.innerHTML = ''; // Clear the container before
  // Create a table element
  const table = document.createElement('table');
  table.setAttribute('border', '5'); // Optional: Add border for visibility
  table.setAttribute('cellpadding', '10'); // Optional: Add padding for better spacing
  table.setAttribute('width', '100%'); // Optional: Make table width 100%

  // Create table header
  const header = document.createElement('thead');
  const headerRow = document.createElement('tr');
  headerRow.innerHTML = `
      <th>NO</th>
      <th>DATE</th>
      <th>TIME</th>
      <th>BATCH NO</th>      
      <th>FEED NAME</th>
      <th>SCALE1_ITEM_1</th>
  `;
  header.appendChild(headerRow);
  table.appendChild(header);

  // Create table body
  const body = document.createElement('tbody');
  reports.forEach(post => {
      const postRow = document.createElement('tr');
      postRow.innerHTML = `
          <td>${post.dataValues.id}</td>
          <td>${new Date(post.dataValues.DATE).toLocaleDateString()}</td>
          <td>${post.dataValues.TIME}</td>
          <td>${post.dataValues.BATCH_NO}</td>
          <td>${post.dataValues.FEED_NAME}</td>
          <td>${post.dataValues.SCALE1_ITEM_1_SET}</td>
      `;
      body.appendChild(postRow);
  });

  table.appendChild(body);
  postContainer.appendChild(table); // Append the table to the container
});

ipcRenderer.on('display-query-results-batch', (event, reports) => {
    
    const reportTableBody = document.getElementById('resultTable');
    const resultTitle = document.getElementById('resultTitle');
    
    // Clear previous table data
    reportTableBody.innerHTML = '';
    resultTitle.innerText = 'Query Results';
    
    const downloadPDFButton = document.getElementById('downloadButton'); // Create PDF download button
    downloadPDFButton.innerHTML = "Download Excel";
    downloadPDFButton.style.display = 'block';
    downloadPDFButton.classList.add('rounded-md','bg-blue-500','px-8','py-2');
    downloadPDFButton.onclick = () => {
        downloadPDF("batch");  
    }; 
    
    // const printPDFButton = document.getElementById('printButton'); // Create PDF print button
    // printPDFButton.innerHTML = "Print PDF";
    // printPDFButton.style.display = 'block';
    // printPDFButton.classList.add('rounded-md','bg-green-500','px-8','py-2');
    // printPDFButton.onclick = () => {
    //     printPDF();  
    // }; 

    // Create a new table
    const table = document.createElement('table');
    table.setAttribute('border', '5'); // Optional: Add border for visibility
    table.setAttribute('cellpadding', '10'); // Optional: Add padding for better spacing
    table.setAttribute('width', '100%'); // Optional: Make table width 100%

    // Create table header
    const header = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = `
        <th>NO</th>
        <th style="width: 150px;">DATE</th>
        <th>TIME</th>
        <th>BATCH_NO</th>
        <th>FEED_NAME</th>
        <th>SCALE1_ITEM_1</th>
        <th>SCALE1_ITEM_1_SET</th>
        <th>SCALE1_ITEM_1_ACT</th>
        <th>SCALE1_ITEM_2</th>
        <th>SCALE1_ITEM_2_SET</th>
        <th>SCALE1_ITEM_2_ACT</th>
        <th>SCALE1_ITEM_3</th>
        <th>SCALE1_ITEM_3_SET</th>
        <th>SCALE1_ITEM_3_ACT</th>
        <th>SCALE1_ITEM_4</th>
        <th>SCALE1_ITEM_4_SET</th>
        <th>SCALE1_ITEM_4_ACT</th>
        <th>SCALE1_ITEM_5</th>
        <th>SCALE1_ITEM_5_SET</th>
        <th>SCALE1_ITEM_5_ACT</th>
        <th>SCALE2_ITEM_1</th>
        <th>SCALE2_ITEM_1_SET</th>
        <th>SCALE2_ITEM_1_ACT</th>
        <th>SCALE2_ITEM_2</th>
        <th>SCALE2_ITEM_2_SET</th>
        <th>SCALE2_ITEM_2_ACT</th>
        <th>SCALE2_ITEM_3</th>
        <th>SCALE2_ITEM_3_SET</th>
        <th>SCALE2_ITEM_3_ACT</th>
        <th>SCALE2_ITEM_4</th>
        <th>SCALE2_ITEM_4_SET</th>
        <th>SCALE2_ITEM_4_ACT</th>
        <th>SCALE2_ITEM_5</th>
        <th>SCALE2_ITEM_5_SET</th>
        <th>SCALE2_ITEM_5_ACT</th>
        <th>SCALE3_ITEM_1</th>
        <th>SCALE3_ITEM_1_SET</th>
        <th>SCALE3_ITEM_1_ACT</th>
        <th>SCALE3_ITEM_2</th>
        <th>SCALE3_ITEM_2_SET</th>
        <th>SCALE3_ITEM_2_ACT</th>
        <th>SCALE3_ITEM_3</th>
        <th>SCALE3_ITEM_3_SET</th>
        <th>SCALE3_ITEM_3_ACT</th>
        <th>SCALE3_ITEM_4</th>
        <th>SCALE3_ITEM_4_SET</th>
        <th>SCALE3_ITEM_4_ACT</th>
        <th>SCALE3_ITEM_5</th>
        <th>SCALE3_ITEM_5_SET</th>
        <th>SCALE3_ITEM_5_ACT</th>`;
    
    header.appendChild(headerRow);
    table.appendChild(header);

    // Create table body
    const body = document.createElement('tbody');

    // Assuming reports is an array containing the queried results
    if (reports.length > 0) {
        // Iterate over each report to display the data in the table
        reports.forEach(report => {
            const formattedDate = new Date(report.dataValues.DATE).toISOString().split('T')[0]; 
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${report.dataValues.NO}</td>
                <td class="mx-10">${formattedDate}</td>
                <td>${report.dataValues.TIME}</td>
                <td>${report.dataValues.BATCH_NO}</td>
                <td>${report.dataValues.FEED_NAME}</td>
                <td>${report.dataValues.SCALE1_ITEM_1}</td>
                <td>${report.dataValues.SCALE1_ITEM_1_SET}</td>
                <td>${report.dataValues.SCALE1_ITEM_1_ACT}</td>
                <td>${report.dataValues.SCALE1_ITEM_2}</td>
                <td>${report.dataValues.SCALE1_ITEM_2_SET}</td>
                <td>${report.dataValues.SCALE1_ITEM_2_ACT}</td>
                <td>${report.dataValues.SCALE1_ITEM_3}</td>
                <td>${report.dataValues.SCALE1_ITEM_3_SET}</td>
                <td>${report.dataValues.SCALE1_ITEM_3_ACT}</td>
                <td>${report.dataValues.SCALE1_ITEM_4}</td>
                <td>${report.dataValues.SCALE1_ITEM_4_SET}</td>
                <td>${report.dataValues.SCALE1_ITEM_4_ACT}</td>
                <td>${report.dataValues.SCALE1_ITEM_5}</td>
                <td>${report.dataValues.SCALE1_ITEM_5_SET}</td>
                <td>${report.dataValues.SCALE1_ITEM_5_ACT}</td>
                <td>${report.dataValues.SCALE2_ITEM_1}</td>
                <td>${report.dataValues.SCALE2_ITEM_1_SET}</td>
                <td>${report.dataValues.SCALE2_ITEM_1_ACT}</td>
                <td>${report.dataValues.SCALE2_ITEM_2}</td>
                <td>${report.dataValues.SCALE2_ITEM_2_SET}</td>
                <td>${report.dataValues.SCALE2_ITEM_2_ACT}</td>
                <td>${report.dataValues.SCALE2_ITEM_3}</td>
                <td>${report.dataValues.SCALE2_ITEM_3_SET}</td>
                <td>${report.dataValues.SCALE2_ITEM_3_ACT}</td>
                <td>${report.dataValues.SCALE2_ITEM_4}</td>
                <td>${report.dataValues.SCALE2_ITEM_4_SET}</td>
                <td>${report.dataValues.SCALE2_ITEM_4_ACT}</td>
                <td>${report.dataValues.SCALE2_ITEM_5}</td>
                <td>${report.dataValues.SCALE2_ITEM_5_SET}</td>
                <td>${report.dataValues.SCALE2_ITEM_5_ACT}</td>
                <td>${report.dataValues.SCALE3_ITEM_1}</td>
                <td>${report.dataValues.SCALE3_ITEM_1_SET}</td>
                <td>${report.dataValues.SCALE3_ITEM_1_ACT}</td>
                <td>${report.dataValues.SCALE3_ITEM_2}</td>
                <td>${report.dataValues.SCALE3_ITEM_2_SET}</td>
                <td>${report.dataValues.SCALE3_ITEM_2_ACT}</td>
                <td>${report.dataValues.SCALE3_ITEM_3}</td>
                <td>${report.dataValues.SCALE3_ITEM_3_SET}</td>
                <td>${report.dataValues.SCALE3_ITEM_3_ACT}</td>
                <td>${report.dataValues.SCALE3_ITEM_4}</td>
                <td>${report.dataValues.SCALE3_ITEM_4_SET}</td>
                <td>${report.dataValues.SCALE3_ITEM_4_ACT}</td>
                <td>${report.dataValues.SCALE3_ITEM_5}</td>
                <td>${report.dataValues.SCALE3_ITEM_5_SET}</td>
                <td>${report.dataValues.SCALE3_ITEM_5_ACT}</td>`;
            
            body.appendChild(row);
        });
    } else {
        // If no reports are found, display a message
        const rowEmpty = document.createElement('tr');
        rowEmpty.innerHTML = `<td colspan="53" class="text-center">No reports found.</td>`;
        body.appendChild(rowEmpty);
    }

    // Append the body to the table
    table.appendChild(body);
    
    // Append the table to the reportTableBody
    reportTableBody.appendChild(table);

  

    // Function to download CSV
    // function downloadCSV(reports) {
    //     const csvRows = [];
    //     const headers = [
    //         "NO", "DATE", "TIME", "BATCH_NO", "FEED_NAME",
    //         "SCALE1_ITEM_1", "SCALE1_ITEM_1_SET", "SCALE1_ITEM_1_ACT",
    //         "SCALE1_ITEM_2", "SCALE1_ITEM_2_SET", "SCALE1_ITEM_2_ACT",
    //         "SCALE1_ITEM_3", "SCALE1_ITEM_3_SET", "SCALE1_ITEM_3_ACT",
    //         "SCALE1_ITEM_4", "SCALE1_ITEM_4_SET", "SCALE1_ITEM_4_ACT",
    //         "SCALE1_ITEM_5", "SCALE1_ITEM_5_SET", "SCALE1_ITEM_5_ACT",
    //         "SCALE2_ITEM_1", "SCALE2_ITEM_1_SET", "SCALE2_ITEM_1_ACT",
    //         "SCALE2_ITEM_2", "SCALE2_ITEM_2_SET", "SCALE2_ITEM_2_ACT",
    //         "SCALE2_ITEM_3", "SCALE2_ITEM_3_SET", "SCALE2_ITEM_3_ACT",
    //         "SCALE2_ITEM_4", "SCALE2_ITEM_4_SET", "SCALE2_ITEM_4_ACT",
    //         "SCALE2_ITEM_5", "SCALE2_ITEM_5_SET", "SCALE2_ITEM_5_ACT",
    //         "SCALE3_ITEM_1", "SCALE3_ITEM_1_SET", "SCALE3_ITEM_1_ACT",
    //         "SCALE3_ITEM_2", "SCALE3_ITEM_2_SET", "SCALE3_ITEM_2_ACT",
    //         "SCALE3_ITEM_3", "SCALE3_ITEM_3_SET", "SCALE3_ITEM_3_ACT",
    //         "SCALE3_ITEM_4", "SCALE3_ITEM_4_SET", "SCALE3_ITEM_4_ACT",
    //         "SCALE3_ITEM_5", "SCALE3_ITEM_5_SET", "SCALE3_ITEM_5_ACT"
    //     ];
    
    //     // Create the CSV header
    //     csvRows.push(headers.join(','));
    
    //     // Create CSV rows from reports data
    //     reports.forEach(report => {
    //         const formattedDate = new Date(report.dataValues.DATE).toISOString().split('T')[0]; 
    //         const values = [
    //             report.dataValues.NO,
    //             formattedDate,
    //             report.dataValues.TIME,
    //             report.dataValues.BATCH_NO,
    //             report.dataValues.FEED_NAME,
    //             report.dataValues.SCALE1_ITEM_1,
    //             report.dataValues.SCALE1_ITEM_1_SET,
    //             report.dataValues.SCALE1_ITEM_1_ACT,
    //             report.dataValues.SCALE1_ITEM_2,
    //             report.dataValues.SCALE1_ITEM_2_SET,
    //             report.dataValues.SCALE1_ITEM_2_ACT,
    //             report.dataValues.SCALE1_ITEM_3,
    //             report.dataValues.SCALE1_ITEM_3_SET,
    //             report.dataValues.SCALE1_ITEM_3_ACT,
    //             report.dataValues.SCALE1_ITEM_4,
    //             report.dataValues.SCALE1_ITEM_4_SET,
    //             report.dataValues.SCALE1_ITEM_4_ACT,
    //             report.dataValues.SCALE1_ITEM_5,
    //             report.dataValues.SCALE1_ITEM_5_SET,
    //             report.dataValues.SCALE1_ITEM_5_ACT,
    //             report.dataValues.SCALE2_ITEM_1,
    //             report.dataValues.SCALE2_ITEM_1_SET,
    //             report.dataValues.SCALE2_ITEM_1_ACT,
    //             report.dataValues.SCALE2_ITEM_2,
    //             report.dataValues.SCALE2_ITEM_2_SET,
    //             report.dataValues.SCALE2_ITEM_2_ACT,
    //             report.dataValues.SCALE2_ITEM_3,
    //             report.dataValues.SCALE2_ITEM_3_SET,
    //             report.dataValues.SCALE2_ITEM_3_ACT,
    //             report.dataValues.SCALE2_ITEM_4,
    //             report.dataValues.SCALE2_ITEM_4_SET,
    //             report.dataValues.SCALE2_ITEM_4_ACT,
    //             report.dataValues.SCALE2_ITEM_5,
    //             report.dataValues.SCALE2_ITEM_5_SET,
    //             report.dataValues.SCALE2_ITEM_5_ACT,
    //             report.dataValues.SCALE3_ITEM_1,
    //             report.dataValues.SCALE3_ITEM_1_SET,
    //             report.dataValues.SCALE3_ITEM_1_ACT,
    //             report.dataValues.SCALE3_ITEM_2,
    //             report.dataValues.SCALE3_ITEM_2_SET,
    //             report.dataValues.SCALE3_ITEM_2_ACT,
    //             report.dataValues.SCALE3_ITEM_3,
    //             report.dataValues.SCALE3_ITEM_3_SET,
    //             report.dataValues.SCALE3_ITEM_3_ACT,
    //             report.dataValues.SCALE3_ITEM_4,
    //             report.dataValues.SCALE3_ITEM_4_SET,
    //             report.dataValues.SCALE3_ITEM_4_ACT,
    //             report.dataValues.SCALE3_ITEM_5,
    //             report.dataValues.SCALE3_ITEM_5_SET,
    //             report.dataValues.SCALE3_ITEM_5_ACT
    //         ];
    //         csvRows.push(values.join(','));
    //     });
    
    //     // Create the CSV string
    //     const csvString = csvRows.join('\n');
    
    //     // Encode the CSV string for download
    //     const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvString);
        
    //     const link = document.createElement('a');
    //     link.setAttribute('href', encodedUri);
    //     link.setAttribute('download', 'query_results.csv'); // Filename for download
    //     document.body.appendChild(link); // Required for Firefox
    //     link.click(); // Trigger the download
    //     document.body.removeChild(link); // Cleanup
    // }
    
});

ipcRenderer.on('display-query-results-material', (event, reports) => {
    
    const reportTableBody = document.getElementById('resultTable');
    const resultTitle = document.getElementById('resultTitle');
    
    // Clear previous table data
    reportTableBody.innerHTML = '';
    resultTitle.innerText = 'Query Results';

    const downloadPDFButton = document.getElementById('downloadButton'); // Create PDF download button
    downloadPDFButton.innerHTML = "Download PDF";
    downloadPDFButton.style.display = 'block';
    downloadPDFButton.classList.add('rounded-md','bg-blue-500','px-8','py-2');
    downloadPDFButton.onclick = () => {
        downloadPDF("material");  
    };

    const printPDFButton = document.getElementById('printButton'); // Create PDF print button
    printPDFButton.innerHTML = "Print PDF";
    printPDFButton.style.display = 'block';
    printPDFButton.classList.add('rounded-md','bg-green-500','px-8','py-2');
    printPDFButton.onclick = () => {
        printPDF();  
    }; 
   
    // Create a new table
    const table = document.createElement('table');
    table.setAttribute('border', '5'); // Optional: Add border for visibility
    table.setAttribute('cellpadding', '10'); // Optional: Add padding for better spacing
    table.setAttribute('width', '100%'); // Optional: Make table width 100%

    // Create table header
    const header = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = `
        <th>Material Name</th>
        <th>Set Weight</th>
        <th>Act Weight</th>
        <th>Difference</th>      
        <th>Error Percentage</th>`;
    header.appendChild(headerRow);
    table.appendChild(header);

    // Create table body
    const body = document.createElement('tbody');

    // Assuming reports is an array containing the queried results
    if (reports.length > 0) {
        
        // Iterate over each report to display the data in the table
        reports.forEach(report => {
            const total_SET = report.SET;
            const total_ACT = report.ACT;

            // Calculate the difference and error percentage
            const difference = total_SET - total_ACT;
            const errorPercentage = total_SET !== 0 ? (difference / total_SET) * 100 : 0;

            // Create a new row for the metrics
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${report.material}</td>
                <td>${total_SET}</td>
                <td>${total_ACT}</td>
                <td>${difference}</td>
                <td>${errorPercentage.toFixed(2)}%</td>
            `;
            body.appendChild(row);
        });
    } else {
        // If no reports are found, display a message
        const rowEmpty = document.createElement('tr');
        rowEmpty.innerHTML = `<td colspan="5" class="text-center">No reports found.</td>`;
        body.appendChild(rowEmpty);
    }

    // Append the body to the table
    table.appendChild(body);
    
    // Append the table to the reportTableBody
    reportTableBody.appendChild(table);

    // Set up the download functionality
  

    // function downloadCSV(reports) {
    //     // Create CSV content
    //     const csvContent = 'data:text/csv;charset=utf-8,'
    //         + 'Material Name,Set Weight,Act Weight,Difference,Error Percentage\n' // Header row
    //         + reports.map(report => {
    //             const total_SET = report.SET;
    //             const total_ACT = report.ACT;
    //             const difference = total_SET - total_ACT;
    //             const errorPercentage = total_SET !== 0 ? (difference / total_SET) * 100 : 0;
    //             return `${report.material},${total_SET},${total_ACT},${difference},${errorPercentage.toFixed(2)}`;
    //         }).join('\n');

    //     // Encode CSV content and create a download link
    //     const encodedUri = encodeURI(csvContent);
    //     const link = document.createElement('a');
    //     link.setAttribute('href', encodedUri);
    //     link.setAttribute('download', 'query_results.csv'); // Filename for download
    //     document.body.appendChild(link); // Required for Firefox
    //     link.click(); // Trigger the download
    //     document.body.removeChild(link); // Cleanup
    // }
});

ipcRenderer.on('display-query-results-recipe', (event, reports) => {
    console.log("recipeType", reports);
    
    const reportTableBody = document.getElementById('resultTable');
    const resultTitle = document.getElementById('resultTitle');
  
    
    // Clear previous table data
    reportTableBody.innerHTML = '';
    resultTitle.innerText = 'Query Results';
    
    
    const downloadPDFButton = document.getElementById('downloadButton'); // Create PDF download button
    downloadPDFButton.innerHTML = "Download PDF";
    downloadPDFButton.style.display = 'block';
    downloadPDFButton.classList.add('rounded-md','bg-blue-500','px-8','py-2');
    downloadPDFButton.onclick = () => {
        downloadPDF("recipe");  
    }; 

    const printPDFButton = document.getElementById('printButton'); // Create PDF print button
    printPDFButton.innerHTML = "Print PDF";
    printPDFButton.style.display = 'block';
    printPDFButton.classList.add('rounded-md','bg-green-500','px-8','py-2');
    printPDFButton.onclick = () => {
        printPDF();  
    }; 

    // Create a new table
    const table = document.createElement('table');
    table.setAttribute('border', '5'); // Optional: Add border for visibility
    table.setAttribute('cellpadding', '10'); // Optional: Add padding for better spacing
    table.setAttribute('width', '100%'); // Optional: Make table width 100%

    // Create table header
    const header = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = `
        <th>Feeder Type</th>
        <th>SET</th>
        <th>ACT</th>
        <th>Difference</th>      
        <th>Error Percentage</th>`;
    header.appendChild(headerRow);
    table.appendChild(header);

    // Create table body
    const body = document.createElement('tbody');

    // Assuming reports is an array containing the queried results
    if (reports.length > 0) {
        // Iterate over each report to display the data in the table
        reports.forEach(report => {
            const total_SET = report.Set;
            const total_ACT = report.Act;

            // Calculate the difference and error percentage
            const difference = total_SET - total_ACT;
            const errorPercentage = total_SET !== 0 ? (difference / total_SET) * 100 : 0;
            console.log(total_ACT, total_SET, difference, errorPercentage);

            // Create a new row for the metrics
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${report.feedName}</td>
                <td>${total_SET}</td>
                <td>${total_ACT}</td>
                <td>${difference}</td>
                <td>${errorPercentage.toFixed(2)}%</td>
            `;
            body.appendChild(row);
        });
    } else {
        // If no reports are found, display a message
        const rowEmpty = document.createElement('tr');
        rowEmpty.innerHTML = `<td colspan="5" class="text-center">No reports found.</td>`;
        body.appendChild(rowEmpty);
    }

    // Append the body to the table
    table.appendChild(body);
    
    // Append the table to the reportTableBody
    reportTableBody.appendChild(table);
});


async function downloadPDF(type) {
    const reportTableBody = document.getElementById('resultTable');
    if (type === "batch") {
        console.log("Batch");
        // Extract table data and generate an Excel file
        try {
            if (!reportTableBody) {
                console.error('Table element not found');
                return;
            }

            // Extract the table data into a 2D array
            const tableData = [];
            const rows = reportTableBody.querySelectorAll('tr'); // Select all table rows

            rows.forEach((row) => {
                const rowData = [];
                const cells = row.querySelectorAll('th, td'); // Select all header or data cells
                cells.forEach((cell) => {
                    rowData.push(cell.innerText); // Push the cell content into row data array
                });
                tableData.push(rowData); // Push the row data array into table data array
            });

            // Create a new workbook and add the table data to a worksheet
            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.aoa_to_sheet(tableData); // aoa_to_sheet converts 2D array to worksheet
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

            // Open save dialog to choose the location for saving the XLSX file
            const filePath = await ipcRenderer.invoke('dialog:openSaveDialog', 'excel');
            if (filePath) {
                // Save the XLSX file to the chosen location
                XLSX.writeFile(workbook, filePath);
                alert('Excel file saved successfully');
            }

        } catch (error) {
            console.error('Error generating Excel file:', error);
        }

    } else {
        const reportTableBody = document.getElementById('resultTable');
        if (!reportTableBody) {
            console.error('Table element not found');
            return;
        }
    
        // Use html2canvas to capture the table content
        try {
            const canvas = await html2canvas(reportTableBody);
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            const imgWidth = 210 - 20; // Width of A4 page minus margins (10mm margin each side)
            const pageHeight = 297; // Height of A4 page
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 10; // Starting position with top margin
    
            // Add image to PDF with margins
            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight); // 10mm left margin
            heightLeft -= pageHeight - 20; // Subtracting page height and bottom margin (10mm)
    
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight + 10; // Adjusting for top margin
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight); // 10mm left margin
                heightLeft -= pageHeight - 20; // Adjust for margins
            }
    
            // Open save dialog
            const filePath = await ipcRenderer.invoke('dialog:openSaveDialog', 'pdf');
            if (filePath) {
                pdf.save(filePath); // Save the PDF to the chosen location
                alert('PDF saved successfully');
            }
    
    
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    }
    
   
}

async function printPDF() {
    const reportTableBody = document.getElementById('resultTable');
    
    if (!reportTableBody) {
        console.error('Table element not found');
        return;
    }

    // Use html2canvas to capture the table content
    try {
        const canvas = await html2canvas(reportTableBody);
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const imgWidth = 210 - 20; // Width of A4 page minus margins (10mm margin each side)
        const pageHeight = 297; // Height of A4 page
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 10; // Starting position with top margin

        // Add image to PDF with margins
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight); // 10mm left margin
        heightLeft -= pageHeight - 20; // Subtracting page height and bottom margin (10mm)

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight + 10; // Adjusting for top margin
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight); // 10mm left margin
            heightLeft -= pageHeight - 20; // Adjust for margins
        }

        // Open save dialog
        const filePath = await ipcRenderer.invoke('dialog:openSaveDialog');
        if (filePath) {
            pdf.save(filePath); // Save the PDF to the chosen location
            await ipcRenderer.invoke('open-pdf', filePath);

        }


    } catch (error) {
        console.error('Error generating PDF:', error);
    }
}


// Handle errors if any
ipcRenderer.on('error', (event, message) => {
    alert(message);
});

csvForm.addEventListener('submit', uploadXls);
queryForm.addEventListener('submit', queryRecords);
// queryButton.addEventListener('click', getAllRecords);

