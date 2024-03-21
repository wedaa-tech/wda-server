
async function generateLiquibase(data) {
    try {
        const response = await fetch(process.env.AI_CORE_URL + '/liquibase', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        console.log("LIQUIBASE RESPONSE TIME:", new Date());
        return response.json();
    } catch (error) {
        console.error('Error calling Liquibase API:', error);
        throw error; // Rethrow the error to be handled by the caller
    }
}

async function generateEntities(data) {
    try {
        const response = await fetch(process.env.AI_CORE_URL + '/entities', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        console.log("ENTITIES RESPONSE TIME:", new Date());
        return response.json();
    } catch (error) {
        console.error('Error calling Entities API:', error);
        throw error; // Rethrow the error to be handled by the caller
    }
}

async function generateServiceCode(data) {
    try {
        const response = await fetch(process.env.AI_CORE_URL + '/service-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        console.log("SERVICE CODE RESPONSE TIME:", new Date());
        return response.json();
    } catch (error) {
        console.error('Error calling SERVICE CODE RESPONSE API:', error);
        throw error; // Rethrow the error to be handled by the caller
    }
}

module.exports = {
    generateLiquibase,
    generateEntities,
    generateServiceCode
};
