async function addTransaction(data, accessToken) {
    try {
        const response = await fetch(process.env.CREDIT_SERVICE_URL + '/api/transaction', {
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
        console.log(new Date(), 'ADDED TRANSACTION');
        return response.json();
    } catch (error) {
        throw error; // Rethrow the error to be handled by the caller
    }
}

async function updateTransaction(data, accessToken) {
    try {
        const response = await fetch(process.env.CREDIT_SERVICE_URL + '/api/transaction', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        console.log(new Date(), 'UPDATED TRANSACTION');
        return response.json();
    } catch (error) {
        throw error; // Rethrow the error to be handled by the caller
    }
}

async function updateUserCredit(data, accessToken) {
    try {
        const response = await fetch(process.env.CREDIT_SERVICE_URL + '/api/credits', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        console.log(new Date(), 'UPDATED USER CREDIT');
        return response.json();
    } catch (error) {
        throw error; // Rethrow the error to be handled by the caller
    }
}


module.exports = {
    addTransaction,
    updateTransaction,
    updateUserCredit,
};
