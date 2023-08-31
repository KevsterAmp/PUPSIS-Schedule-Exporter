console.log("listening");

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('Received message:', request);
    if (request.type === 'getschedule') {

        const tableData = document.getElementById('Subject');
        const schedule = parseTableData(tableData);

        chrome.runtime.sendMessage({ 
            type: "receiveschedule",
            schedule: schedule });

        console.log("response sent");
    }
});

function parseTableData(tableContent) {
    const rows = tableContent.getElementsByTagName("tbody")[0].getElementsByTagName("tr")
    const scheduleEntries = [];

    for (let i = 0; i < rows.length; i +=1) {
        let data = rows[i].getElementsByTagName("td");
        const entry = {
            subject: data[1].textContent.trim(),
            schedule: data[6].textContent.trim()
        }
        scheduleEntries.push(entry);
    }

    return scheduleEntries;
}
