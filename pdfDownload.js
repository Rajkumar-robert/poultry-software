const jsPDF = require('jspdf').jsPDF;
const html2canvas = require('html2canvas');

// Function to download the table as a PDF
function downloadPDF() {
    const reportTableBody = document.getElementById('resultTable');
    
    if (!reportTableBody) {
        console.error('Table element not found');
        return;
    }

    // Use html2canvas to capture the table content
    html2canvas(reportTableBody).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210; // Width of A4 page
        const pageHeight = 297; // Height of A4 page
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        // Add image to PDF and handle multi-page content
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        // Save the PDF with a filename
        pdf.save('report.pdf');
    }).catch((error) => {
        console.error('Error generating PDF:', error);
    });
}

// Export the function so it can be used elsewhere
module.exports = {
    downloadPDF
};
