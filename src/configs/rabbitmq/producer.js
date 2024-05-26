// publisher.js
const amqp = require('amqplib');

async function send(queue, msg) {
    try {
        const { RABBITMQ_USERNAME, RABBITMQ_PASSWORD, RABBITMQ_HOST, RABBITMQ_PORT } = process.env;
        const connectionString = `amqp://${RABBITMQ_USERNAME}:${RABBITMQ_PASSWORD}@${RABBITMQ_HOST}:${RABBITMQ_PORT}`;
        const connection = await amqp.connect(connectionString);
        const channel = await connection.createChannel();
        await channel.assertQueue(queue, { durable: false });
        // Convert the JSON object to a string
        const jsonMsg = JSON.stringify(msg);
        channel.sendToQueue(queue, Buffer.from(jsonMsg));
        console.log(`[producer] [${queue}] Sent:    '${jsonMsg.length > 30 ? jsonMsg.substring(0, 30) + '...' : jsonMsg}'`);
        setTimeout(() => {
            connection.close();
        }, 500);
    } catch (error) {
        console.error(error);
        throw error;
    }
}

module.exports = { send };
