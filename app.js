const express = require('express');
require('dotenv').config({ path: __dirname + '/.env' })
const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send("Server Is Working......");
});

// Instantiates a session client
const sessionClient = new dialogflow.SessionsClient();


async function detectIntent(
    projectId,
    sessionId,
    query,
    contexts,
    languageCode
) {
    // The path to identify the agent that owns the created intent.
    const sessionPath = sessionClient.projectAgentSessionPath(
        projectId,
        sessionId
    );

    // The text query request.
    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: query,
                languageCode: languageCode,
            },
        },
    };

    if (contexts && contexts.length > 0) {
        request.queryParams = {
            contexts: contexts,
        };
    }

    const responses = await sessionClient.detectIntent(request);
    return responses[0];
}

async function executeQueries(projectId, sessionId, query, languageCode) {
    // Keeping the context across queries let's us simulate an ongoing conversation with the bot
    let context;
    let intentResponse;
        try {
            console.log(`Sending Query: ${query}`);
            intentResponse = await detectIntent(
                projectId,
                sessionId,
                query,
                context,
                languageCode
            );
            // Use the context from this response for next queries
            context = intentResponse.queryResult.outputContexts;
            return intentResponse.queryResult.fulfillmentText;
        } catch (error) {
            console.log(error);
        }
}

app.post('/getChat', async (req, res) => {
    const projectId = 'myportfolio-hc9g';
    const query = req.body.text;
    const languageCode = 'en';
    const sessionId = uuid.v4();
    const reply = await executeQueries(projectId, sessionId, query, languageCode);
    res.send(reply);
});

/**
* now listing the server on port number 3000 :)
* */
app.listen(3000, () => {
    console.log("Server is Running on port 3000");
})