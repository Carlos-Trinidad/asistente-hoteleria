/**
 * 
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var express = require('express'); // app server
var bodyParser = require('body-parser'); // parser for post requests
var AssistantV2 = require('ibm-watson/assistant/v2'); // watson sdk

var app = express();

// Bootstrap application settings
app.use(express.static('./public')); // load UI from public folder
app.use(bodyParser.json());

// Create the service wrapper

var assistant = new AssistantV2({
  iam_apikey: process.env.ASSISTANT_IAM_APIKEY,
  version: '2019-02-28',
  url: process.env.ASSISTANT_URL
});


// Endpoint to be call from the client side
app.post('/api/message', function (req, res) {
  let assistantId = process.env.ASSISTANT_ID || '<assistant-id>';

  if (!assistantId || assistantId === '<assistant-id>') {
    return res.json({
      'output': {
        'text': 'The app has not been configured with a <b>ASSISTANT_ID</b> environment variable. Please refer to the ' + '<a href="https://github.com/watson-developer-cloud/assistant-simple">README</a> documentation on how to set this variable. <br>' + 'Once a workspace has been defined the intents may be imported from ' + '<a href="https://github.com/watson-developer-cloud/assistant-simple/blob/master/training/car_workspace.json">here</a> in order to get a working application.'
      }
    });
  }

  var textIn = '';

  if (req.body.input) {
    textIn = req.body.input.text;
  }

  var payload = {
    assistant_id: assistantId,
    session_id: req.body.session_id,
    input: {
      message_type: 'text',
      text: textIn
    }
  };

  // Send the input to the assistant service
  assistant.message(payload)
    .then((data) => {
      return res.json(data);
    })
    .catch((err) => {
      const status = (err.code !== undefined && err.code > 0) ? err.code : 500;
      return res.status(status).json(err);
    });
});

app.get('/api/session', function (req, res) {
  let assistantId = process.env.ASSISTANT_ID || '{assistant_id}'
  assistant.createSession({ assistant_id: assistantId })
    .then((response) => {
      return res.send(response);
    })
    .catch((error) => {
      console.log(error);
      return res.send(error);
    });
});

module.exports = app;