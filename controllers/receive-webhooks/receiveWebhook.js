const { catchAsync, failed_response } = require("../../middlewares/responses");
const DigioWebhookResp = require("../../models/digio_webhook_resp.js");
const rabbit = require("amqplib");
const rabbitMqUrl = process.env.RABBIT_MQ_URL;
const directExchangeName =
  process.env.NODE_ENVIRONMENT === "PROD"
    ? process.env.EXCHANGE_NAME
    : process.env.TEST_EXCHANGE_NAME;
const routingKey =
  process.env.NODE_ENVIRONMENT === "PROD"
    ? process.env.ROUTING_KEY
    : process.env.TEST_ROUTING_KEY;
const _ = require("lodash");

const receiveWebhook = catchAsync(async (req, res) => {
  try {
    const data = req.body;

    console.log("EXCHANGE NAME", directExchangeName);

    if (_.isEmpty(data)) {
      return res.status(400).send("data is empty");
    }

    const kidId = data?.payload?.kyc_request?.id;

    const newDigioResp = await DigioWebhookResp.create({
      requestData: data || { message: "data is empty" },
      kidId: kidId,
    });

    try {
      const connection = await rabbit.connect(rabbitMqUrl);

      const channel = await connection.createChannel();

      //exchange setup
      await initiateExchangesAndQueues(channel);

      //sending message to exchange
      await channel.publish(
        directExchangeName,
        routingKey,
        Buffer.from(JSON.stringify(data))
      );

      console.log("Webhook sent to exchange successfully");

      await channel.close();
      await connection.close();

      newDigioResp.status = "SENT";
      await newDigioResp.save();

      return res.status(200).send("ok");
    } catch (error) {
      console.log("Error in sending webhook to exchange", error.message);
      return res
        .status(400)
        .json(
          failed_response(
            400,
            "Something went wrong while initializing rabbit mq server for sending message to queues",
            { message: error.message },
            false
          )
        );
    }
  } catch (error) {
    console.log("Error in receiving webhook", error.message);
    return res.status(400).json(
      failed_response(
        400,
        "Something went wrong while receiving webhook",
        {
          message: error.message,
        },
        false
      )
    );
  }
});

const initiateExchangesAndQueues = async (channel) => {
  try {
    //DLX SETUP
    const dlxExchangeName =
      process.env.NODE_ENVIRONMENT === "PROD"
        ? process.env.DLX_EXCHANGE
        : process.env.TEST_DLX_EXCHANGE;
    const dlxQueueName =
      process.env.NODE_ENVIRONMENT === "PROD"
        ? process.env.DLX_QUEUE
        : process.env.TEST_DLX_QUEUE;

    await channel.assertExchange(dlxExchangeName, "fanout", { durable: true });
    await channel.assertQueue(dlxQueueName, { durable: true });
    await channel.bindQueue(dlxQueueName, dlxExchangeName, "");

    //DIRECT EXCHANGE SETUP

    const directQueueName =
      process.env.NODE_ENVIRONMENT === "PROD"
        ? process.env.QUEUE_NAME
        : process.env.TEST_QUEUE_NAME;

    await channel.assertExchange(directExchangeName, "direct", {
      durable: true,
    });
    await channel.assertQueue(directQueueName, {
      durable: true,
      deadLetterExchange: dlxExchangeName,
    });

    await channel.bindQueue(directQueueName, directExchangeName, routingKey);

    console.log("EXCHANGES SETUP COMPLETED");
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = receiveWebhook;
