import type React from "react";

import { useState } from "react";
import type { LinkedInProfile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import API_URL from "@/lib/api";

const sampleProfile: LinkedInProfile = {
  name: "John Doe",
  job_title: "Software Engineer",
  company: "TechCorp",
  location: "San Francisco, CA",
  summary: "Experienced in AI & ML with 5+ years in software development",
};

export function MessageGenerator() {
  const [profile, setProfile] = useState<LinkedInProfile>(sampleProfile);
  //   @ts-ignore
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(`${API_URL}/personalized-message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        throw new Error("Failed to start message generation");
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No reader available for streaming");
      }

      const decoder = new TextDecoder();
      let messageSoFar = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((line) => line.trim() !== "");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.replace("data: ", "");
            try {
              const parsed = JSON.parse(data);
              if (parsed.chunk) {
                messageSoFar += parsed.chunk;
                setMessage(messageSoFar);
              }
            } catch (e) {
              console.error("Error parsing chunk:", e);
            }
          }
        }
      }
    } catch (error) {
      toast.error("Error generating message", {
        description:
          error instanceof Error ? error.message : "Please try again later",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    toast("Copied to clipboard", {
      description: "Message has been copied to your clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>LinkedIn Profile Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={profile.name}
              onChange={handleChange}
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="job_title">Job Title</Label>
            <Input
              id="job_title"
              name="job_title"
              value={profile.job_title}
              onChange={handleChange}
              placeholder="Software Engineer"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              name="company"
              value={profile.company}
              onChange={handleChange}
              placeholder="TechCorp"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              value={profile.location}
              onChange={handleChange}
              placeholder="San Francisco, CA"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Profile Summary</Label>
            <Textarea
              id="summary"
              name="summary"
              value={profile.summary}
              onChange={handleChange}
              placeholder="Experienced in AI & ML..."
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate Message
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generated Message</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border p-4 min-h-[200px]">
            {message ? (
              <p className="whitespace-pre-wrap">{message}</p>
            ) : (
              <p className="text-muted-foreground text-center mt-10">
                Your personalized message will appear here
              </p>
            )}
          </div>
        </CardContent>
        {message && (
          <CardFooter>
            <Button onClick={handleCopy} className="w-full" variant="outline">
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy to Clipboard
                </>
              )}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
