const express = require('express')
var cors = require('cors')
const app = express()
const port = 5000
const OpenAI = require('openai');
require('dotenv').config()

const messages = []
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(cors())

async function main(input) {
  messages.push({ role: 'user', content: input })
  console.log(messages)
  const completion = await openai.chat.completions.create({
    messages: messages,
    model: 'gpt-3.5-turbo',
  });

  // console.log(completion.choices);
  return completion.choices[0]?.message?.content 
}


app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true }))


app.post('/api', async function (req, res, next) {
  console.log(req.body)
  const mes = await main(req.body.input)
  res.json({success: true, message: mes,input: req.body.input})
})


app.listen(port, () => {
  console.log("Running...")
  // Code.....
})