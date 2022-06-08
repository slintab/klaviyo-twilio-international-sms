# Twilio SMS Integration for Klaviyo

This repository contains sample code for integrating Klaviyo with Twilio Programmable SMS.


## Design
### Building blocks

The solution involves three main components:
- **Twilio Messaging Service**: responsible for sending out the SMS to the indended recipient. You can read more about the Messaging Service [here](https://www.twilio.com/docs/messaging/services).
- **Twilio SMS Function**: a serverless function deployed on Twilio, which calls the Messaging Service to initiate the sending of messages. The code of the function is included in this repository.
- **Klaviyo Flow**: configured within Klaviyo, the Flow includes a webhook action that calls the Twilio SMS Function with the desired message body and the recipient's phone number. 


### Architecture
![Architecture Diagram](architecture.png?raw=true)


## Setup

1. Configuring the Messaging Service for sending SMS
   1. (Optional) [Buy some numbers](https://support.twilio.com/hc/en-us/articles/223135247-How-to-Search-for-and-Buy-a-Twilio-Phone-Number-from-Console) for sending SMS. If you are sending SMS to multiple different countries, it is best to purchase a number from each of those countries. If you already have phone numbers, you can skip this step.
   2. Create a Messaging Service. This can be done via the [Console](https://www.twilio.com/console/sms/services) as well as the [API](https://www.twilio.com/docs/messaging/services/api). Take note of the service's unique identifier (`SID`). You will need it when setting up the SMS function. If sending SMS to multiple geographical desitnations, turn on [Country code geomatching](https://www.twilio.com/docs/messaging/services#country-code-geomatch) on the messaging service. This will ensure that when sending the SMS messages, the Service automatically picks a local number from the sender pool (e.g. SMS to France will be sent from your French number). 
   3. Add your numbers to the Messaging Service's [sender pool](https://support.twilio.com/hc/en-us/articles/223181308-Getting-started-with-Messaging-Services). The Messaging Service will use the numbers in its pool to send out messages.

2. Deploying the SMS function: 
   1. Rename the `.env.example` file to `.env`.
   2. Configure the environment variables listed in the `.env` file:
      - `ACCOUNT_SID`={YOUR TWILIO ACCOUNT SID}
      - `AUTH_TOKEN`={YOUR TWILIO AUTH TOKEN}
      - `MESSAGING_SERVICE_SID`={MESSAGING SERVICE SID FROM THE PREVIOUS STEP}
      - `AUTH_USERNAME`={USERNAME TO SECURE YOUR FUNCTION} - can be any string
      - `AUTH_PASSWORD`={PASSWORD TO SECURE YOUR FUNCTION} - can be any string
   3. Deploy the SMS function via the [Serverless Toolking](https://www.twilio.com/docs/labs/serverless-toolkit) by running the `twilio serverless:deploy` CLI command. After the deployment completes take note of your newly deployed function's URL. You will need it when setting up the Klaviyo webhook.

3. Setting up the Klaviyo flow to call the SMS function:
   1. [Create a Klaviyo flow](https://help.klaviyo.com/hc/en-us/articles/115002774932-Getting-started-with-flows) with the desired trigger.
   2. In the flow, add a webhook action with the following configuration:
      - **URL**: your Twilio SMS function URL from the previous step
      - **HEADERS**: add an authorization header:
         - **Key**: `Authorization`
         - **Value**: the value should be a base64 encoded string of your `AUTH_USERNAME` and `AUTH_PASSWORD`. You can use [this link](https://www.debugbear.com/basic-auth-header-generator) to generate that encoded string. The resulting string should begin with the word `Basic`.
      - **JSON BODY**: the body should contain two fields:
         - `recipient_phone_number`: storing the recipients phone number
         - `message`: storing the message body 

<img src="https://raw.githubusercontent.com/slintab/klaviyo-twilio-international-sms/main/example_klaviyo_webhook_config.jpg" width="200" height="400">

4. That's it! When your flow runs, it should sent an SMS via Twilio to the users assigned to it!