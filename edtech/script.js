require("dotenv").config();
const express = require("express");
const path = require("path");
const OpenAI = require("openai");
const app = express();
const port = 3000;

app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/courses", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "courses.html"));
});

app.get("/quiz", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "quiz.html"));
});

app.post("/api/aimessage", async (req, res) => {
  try {
    const data = await req.body;

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Please Generate 10 questions to test the candidate knowledge on subject ${data.prompt}. your output should be array of objects with question, options, answer and explanation
         here is example set of output object.
         [
           {
            "question" : "Your question here",
            "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
            "answer": "Correct answer",
            "explanation": "Explanation for the correct answer"
            }
         ]
            only return the array of objects with 10 questions, options, answer and explanation.
         `,
        },
      ],
    });

    const aires = completion.choices[0].message.content;
    res.json({ aires });
    // console.log(aires);
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    res.status(500).send("Ahh fuck Error");
  }
});

app.post("/api/reviewMyPerformance", async (req, res) => {
  const data = await req.body;
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const responseMessage = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `
               User has answered these questions ${data.wrongAnsweredQuestions} incorrect so you have to guide the user on which topics he should study and improve his knowledege and recommend youtube video link related to the weaker section of the user. In nicely formatted manner. 

               your response should be nearly 80 words.
            `,
      },
    ],
  });

  const response = responseMessage.choices[0].message.content;
  res.json({ response });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
