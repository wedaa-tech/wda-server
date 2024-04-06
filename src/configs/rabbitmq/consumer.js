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
        // const queue = 'code_generation';
        await channel.assertQueue(queue, { durable: false });
        console.log(`[consumer] [${queue}] Waiting for messages in ${queue}.`);
        channel.consume(
            queue,
            msg => {
                console.log(`[consumer] [${queue}] Received:'${msg.content.toString()}'`);
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
