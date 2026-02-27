import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";
import { AIServiceFactory } from "./server/services/ai-service";
import { prisma } from "./src/lib/prisma";
import { estimateTokens, calculateCost } from "./server/lib/token-counter";
import { broadcastChannelMessage } from "./server/services/channel-service";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "TeleGen AI Backend is active" });
  });

  app.post("/api/chat", async (req, res) => {
    const { messages, provider, modelId, userId = "default-user" } = req.body;

    if (!messages || !provider || !modelId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      // 1. Ensure User exists and has credits (Mocking user for now)
      let user = await prisma.user.findUnique({ where: { id: userId } });
      
      if (!user) {
        // Auto-create a default user for testing if not exists
        user = await prisma.user.create({
          data: {
            id: userId,
            email: `${userId}@example.com`,
            credits: 10.0,
          }
        });
      }

      if (user.credits <= 0) {
        return res.status(402).json({ error: "Insufficient Credits. Please top up your account." });
      }

      const aiService = AIServiceFactory.getService(provider);

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      let accumulatedContent = "";
      const inputTokens = messages.reduce((acc: number, m: any) => acc + estimateTokens(m.content), 0);

      await aiService.streamResponse(
        messages,
        modelId,
        (chunk) => {
          accumulatedContent += chunk;
          res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
        },
        (error) => {
          console.error("AI Service Error:", error);
          res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        }
      );

      // 2. Post-response: Calculate usage and update DB
      const outputTokens = estimateTokens(accumulatedContent);
      const totalTokens = inputTokens + outputTokens;
      const cost = calculateCost(totalTokens, modelId);

      // Transaction to update user credits and log usage
      await prisma.$transaction([
        prisma.user.update({
          where: { id: userId as string },
          data: { credits: { decrement: cost } }
        }),
        prisma.tokenLog.create({
          data: {
            user: { connect: { id: userId as string } },
            tokensUsed: totalTokens,
            cost,
            provider: provider as string,
            modelId: modelId as string,
            message: {
              create: {
                content: accumulatedContent,
                conversation: {
                  create: {
                    type: "PRIVATE",
                  }
                },
                senderType: "AGENT",
                tokenUsage: totalTokens
              }
            }
          }
        })
      ]);

      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error: any) {
      console.error("Chat API Error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: error.message });
      } else {
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
      }
    }
  });

  app.post("/api/channels/broadcast", async (req, res) => {
    const { channelId, topic } = req.body;
    try {
      const message = await broadcastChannelMessage(channelId, topic);
      res.json({ success: true, message });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TeleGen AI running at http://localhost:${PORT}`);
  });
}

startServer();
