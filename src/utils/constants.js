const codeGenerationStatus = {
    SUBMITTED: 'SUBMITTED',
    IN_PROGRESS: 'IN-PROGRESS',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
};

const transactionStatus = {
    REQUESTED: 'REQUESTED',
    CREDITED: 'CREDITED',
    DEBITED: 'DEBITED',
    REJECTED: 'REJECTED',
    PENDING: 'PENDING',
};

module.exports = {
    codeGenerationStatus,
    transactionStatus,
};