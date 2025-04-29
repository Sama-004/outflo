import { Request, Response } from "express";
import Message from "../interfaces/message.model";
import { Groq } from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function* generateAIMessageStream(profile: {
  name: string;
  job_title: string;
  company: string;
  location?: string;
  summary?: string;
}): AsyncGenerator<string> {
  try {
    // Create a prompt for Groq
    const prompt = `
    Generate a personalized LinkedIn outreach message for:
    - Name: ${profile.name}
    - Job title: ${profile.job_title}
    - Company: ${profile.company}
    - Location: ${profile.location || "Not specified"}
    - Summary: ${profile.summary || "Not available"}
    
    The message should:
    - Be friendly and professional
    - Mention their name and role at their company
    - Briefly explain how Outflo can help automate their outreach to increase meetings and sales
    - End with a call to action to connect
    - Be concise (max 3-4 sentences)
    - Sound natural, not salesy
    
    Return ONLY the message text without any additional formatting or explanations.
    `;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are a professional sales assistant that creates personalized LinkedIn outreach messages.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
      stream: true,
    });

    for await (const chunk of completion) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        yield content;
      }
    }
  } catch (error) {
    console.error("Error generating message with Groq:", error);
    yield `Hi ${profile.name}, I noticed you're a ${profile.job_title} at ${profile.company}. Outflo can help automate your outreach to increase meetings and sales. Let's connect!`;
  }
}

export const personalizedMessageController = {
  createMessage: async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, job_title, company, location, summary } = req.body;
      if (!name || !job_title || !company) {
        res.status(400).json({
          error: "Name, job title, and company are required fields",
        });
        return;
      }

      // Set headers for streaming
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders();

      let fullMessage = "";
      const profile = { name, job_title, company, location, summary };

      for await (const chunk of generateAIMessageStream(profile)) {
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
        fullMessage += chunk;
        // Manually flush the response
        if (typeof (res as any).flush === "function") {
          (res as any).flush();
        }
      }

      // Save the complete message to database
      const newMessage = new Message({
        ...profile,
        generated_message: fullMessage,
      });
      await newMessage.save();

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      console.error("Error creating message:", error);
      if (!res.headersSent) {
        res.status(500).json({
          error: "Internal server error",
          details: error instanceof Error ? error.message : "Unknown error",
        });
      } else {
        res.write(
          `data: ${JSON.stringify({ error: "Error generating message" })}\n\n`
        );
        res.end();
      }
    }
  },
};
