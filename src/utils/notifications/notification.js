const { NOTIFICATION } = require('../../configs/rabbitmq/constants');
const { send } = require('../../configs/rabbitmq/producer');
const Notification = require('../../models/notification');

function createAndSendNotification(userId, prototypeName, template, customMessage) {
    const subject = prototypeName + template.subject;
    const message = customMessage || template.defaultMessage;

    const notification = new Notification(userId, subject, message);
    send(NOTIFICATION, notification);
}

module.exports = { createAndSendNotification };
