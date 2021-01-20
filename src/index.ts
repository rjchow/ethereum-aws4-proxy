const express = require('express');
const morgan = require("morgan");
import fetch from 'node-fetch';

import aws4 from 'aws4';
import {json } from 'body-parser';

require('dotenv').config()
const app = express();

// Configuration
const PORT = 3000;
const HOST = "localhost";

// Logging
app.use(morgan('dev'));
app.use(json())

app.post('/proxy', async (req: any, res: any) => {
    const timerLabel = "request id: " + JSON.stringify(Math.floor(Math.random()*100)) 
    console.log(`body: ${timerLabel}`, req.body)
    const signed = aws4.sign({
        hostname: process.env.AMB_HOST,
        service: 'managedblockchain',
        region: 'ap-southeast-1',
        method: 'POST',
        headers: {'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
    }, {
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID
    })
    console.time(timerLabel)
    const rr = await fetch(process.env.AMB_HTTP_ENDPOINT || "go away typescript", signed)
    console.timeEnd(timerLabel)
    const results =  await rr.json()
    console.log(`res ${timerLabel}`, results)
    
    res.send(results)
})

// Start Proxy
app.listen(PORT, HOST, () => {
    console.log(`Starting Proxy at ${HOST}:${PORT}`);
});