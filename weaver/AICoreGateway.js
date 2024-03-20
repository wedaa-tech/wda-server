const syncFetch = require('sync-fetch');

function callLiquibaseAPI(data) {
    try {
        const response = syncFetch(process.env.AI_CORE_URL + '/liquibase', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            console.error(`HTTP error! Status: ${response.status}`);
            return;
        }
        return response.json();
    } catch (error) {
        console.error('Error calling Liquibase API:', error);
        return;
    }
}

// Example usage
const data = {
    dbml: "Table medical_imaging {\n  id int [pk]\n  data blob\n  diagnostic_report_id int [ref: > diagnostic_reports.id]\n}\n\nTable diagnostic_reports {\n  id int [pk]\n  report_text text\n}"
};


module.exports = callLiquibaseAPI;

