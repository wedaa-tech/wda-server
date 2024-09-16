// consumer.js
const amqp = require('amqplib');
const { CODE_GENERATION } = require('./constants');
const { prototype } = require('../../designer/core');

async function consume(queue) {
    try {
        const { RABBITMQ_USERNAME, RABBITMQ_PASSWORD, RABBITMQ_HOST, RABBITMQ_PORT } = process.env;
        const connectionString = `amqp://${RABBITMQ_USERNAME}:${RABBITMQ_PASSWORD}@${RABBITMQ_HOST}:${RABBITMQ_PORT}`;
        const connection = await amqp.connect(connectionString);
        const channel = await connection.createChannel();
        await channel.assertQueue(queue, { durable: true });
        console.log(`[consumer] [${queue}] Waiting for messages in ${queue}.`);
        channel.consume(
            queue,
            msg => {
                // Updating the logMsg to remove sensitive information
                const jsonMsg = JSON.parse(msg.content.toString());
                var logMsg = jsonMsg;
                delete logMsg.accessToken;
                logMsg = JSON.stringify(logMsg);
                console.log(`[consumer] [${queue}] Received:'${logMsg}'`);
                if (queue === CODE_GENERATION) {
                    // Parse the message content to a JSON object
                    const blueprint = JSON.parse(msg.content.toString());
                    prototype(blueprint);
                }
            },
            { noAck: true },
        );
    } catch (error) {
        console.error(error);
    }
}

module.exports = { consume };
