class Notification {
    constructor(userId, subject, message) {
        this.userId = userId || null;
        this.subject = subject || null;
        this.message = message || null;
    }
}

module.exports = Notification;
