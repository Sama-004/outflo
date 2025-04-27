import { Request, Response } from "express";
import Message from "../interfaces/message.model";
import { Groq } from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function generateAIMessage(profile: {
  name: string;
  job_title: string;
  company: string;
  location?: string;
  summary?: string;
}): Promise<string> {
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
    });

    if (!completion?.choices?.[0]?.message?.content) {
      throw new Error(
        "Failed to generate message: No content returned from API",
      );
    }

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error generating message with Groq:", error);
    return `Hi ${profile.name}, I noticed you're a ${profile.job_title} at ${profile.company}. Outflo can help automate your outreach to increase meetings and sales. Let's connect!`;
  }
}

export const personalizedMessageController = {
  createMessage: async (
    req: Request,
    res: Response,
  ): Promise<Response | any> => {
    try {
      const { name, job_title, company, location, summary } = req.body;
      if (!name || !job_title || !company) {
        return res.status(400).json({
          error: "Name, job title, and company are required fields",
        });
      }

      const generatedMessage = await generateAIMessage({
        name,
        job_title,
        company,
        location,
        summary,
      });

      const newMessage = new Message({
        name,
        job_title,
        company,
        location,
        summary,
        generated_message: generatedMessage,
      });
      await newMessage.save();

      res.status(201).json({ message: generatedMessage });
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
};
