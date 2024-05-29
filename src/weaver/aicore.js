async function generateDbmlScript(data, accessToken) {
    try {
        const response = await fetch(process.env.AI_CORE_URL + '/dbml', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        console.log(new Date(), 'RECEIVED RESPONSE FROM DBML API');
        return response.json();
    } catch (error) {
        throw error; // Rethrow the error to be handled by the caller
    }
}

async function generateLiquibase(data, accessToken) {
    try {
        const response = await fetch(process.env.AI_CORE_URL + '/liquibase', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        console.log(new Date(), 'RECEIVED RESPONSE FROM LIQUIBASE API');
        return response.json();
    } catch (error) {
        throw error; // Rethrow the error to be handled by the caller
    }
}

async function generateEntities(data, accessToken) {
    try {
        const response = await fetch(process.env.AI_CORE_URL + '/entities', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        console.log(new Date(), 'RECEIVED RESPONSE FROM ENTITIES API');
        return response.json();
    } catch (error) {
        throw error; // Rethrow the error to be handled by the caller
    }
}

async function generateServiceCode(data, accessToken) {
    try {
        const response = await fetch(process.env.AI_CORE_URL + '/service-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        console.log(new Date(), 'RECEIVED RESPONSE FROM SERVICE CODE API');
        return response.json();
    } catch (error) {
        throw error; // Rethrow the error to be handled by the caller
    }
}

module.exports = {
    generateDbmlScript,
    generateLiquibase,
    generateEntities,
    generateServiceCode,
};
