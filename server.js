const express = require("express");
var cors = require("cors");
const app = express();
const port = 5000;
const OpenAI = require("openai");

require("dotenv").config();


const messages = [];
const sessionQuestions = {}; // Store asked questions per session
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


async function main(input) {
  messages.push({ role: "user", content: input });
  console.log(messages);
  const completion = await openai.chat.completions.create({
    messages: messages,
    model: "gpt-3.5-turbo",
  });

  // console.log(completion.choices);
  return completion.choices[0]?.message?.content;
}

async function analyzeAnswer(input) {
    const messages = [
      { role: 'system', content: 'You are an interview assistant. Please evaluate the following answer and provide feedback. The feedback should include strengths, weaknesses, and suggestions for improvement.' },
      { role: 'user', content: input }
    ];
  
    const completion = await openai.chat.completions.create({
      messages: messages,
      model: 'gpt-3.5-turbo',
    });
  
    return completion.choices[0]?.message?.content.trim();
  }


  async function generateUniqueQuestion(topic, sessionId) {
    const messages = [
      { role: 'system', content: `You are an expert technical interviewer. Generate a unique and challenging interview question for a candidate with intermediate to advanced knowledge in ${topic}. The question should test the candidate's understanding and ability to explain technical concepts in detail. Do not include coding tasks or instructions. Ensure the question is not similar to previously asked questions in this session.` },
    ];
  
    const completion = await openai.chat.completions.create({
      messages: messages,
      model: 'gpt-3.5-turbo',
    });
  
    const question = completion.choices[0]?.message?.content.trim();
  
    // Check if the question is already in the session
    if (sessionQuestions[sessionId]?.includes(question)) {
      return generateUniqueQuestion(topic, sessionId); // Recursively generate a new question
    }
  
    // Store the new question in the session
    if (!sessionQuestions[sessionId]) {
      sessionQuestions[sessionId] = [];
    }
    sessionQuestions[sessionId].push(question);
  
    return question;
  }
  
app.post("/generate-question", async (req, res) => {
  const { topic } = req.body;
  try {
    const question = await generateUniqueQuestion(topic);
    res.json({ success: true, question });
  } catch (error) {
    console.error("Error generating question:", error);
    res
      .status(500)
      .json({ success: false, message: "Error generating question" });
  }
});

app.post("/analyze-answer", async (req, res) => {
  const { answer } = req.body;
  try {
    const feedback = await analyzeAnswer(answer);
    res.json({ success: true, feedback });
  } catch (error) {
    console.error("Error analyzing answer:", error);
    res.status(500).json({ success: false, message: "Error analyzing answer" });
  }
});

app.post("/common-api", async function (req, res, next) {
  const mes = await main(req.body.input);
  res.json({ success: true, message: mes, input: req.body.input });
});

app.post("/generate-question", async (req, res) => {
  const { topic } = req.body;
  try {
    const question = await generateQuestion(topic);
    res.json({ success: true, question });
  } catch (error) {
    console.error("Error generating question:", error);
    res
      .status(500)
      .json({ success: false, message: "Error generating question" });
  }
});

app.listen(port, () => {
  console.log("Running...");
});
