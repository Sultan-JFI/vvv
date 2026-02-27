import { AIServiceFactory } from './ai-service';
import { prisma } from '../../src/lib/prisma';
import { estimateTokens, calculateCost } from '../lib/token-counter';

export async function broadcastChannelMessage(channelId: string, topic: string) {
  try {
    // 1. Get Channel Info
    const channel = await prisma.conversation.findUnique({
      where: { id: channelId },
      include: { participants: { include: { agent: true } } }
    });

    if (!channel || channel.type !== 'CHANNEL') {
      throw new Error('Channel not found or invalid type');
    }

    // Find the agent assigned to this channel
    const agentParticipant = channel.participants.find(p => p.agentId !== null);
    if (!agentParticipant || !agentParticipant.agent) {
      throw new Error('No agent assigned to this channel');
    }

    const agent = agentParticipant.agent;
    const aiService = AIServiceFactory.getService(agent.provider);

    const prompt = `Generate a high-quality Telegram channel post about: ${topic}. 
    Use markdown, emojis, and keep it engaging. 
    The post should be professional and informative.`;

    let content = "";
    
    // We use a non-streaming approach for background broadcasts for simplicity, 
    // or we can collect chunks.
    await aiService.streamResponse(
      [{ role: 'user', content: prompt }],
      agent.modelId,
      (chunk) => { content += chunk; },
      (err) => { throw err; }
    );

    // 2. Save to DB
    const tokens = estimateTokens(content);
    const cost = calculateCost(tokens, agent.modelId);

    const message = await prisma.message.create({
      data: {
        content,
        conversationId: channelId,
        senderType: 'AGENT',
        senderAgentId: agent.id,
        tokenUsage: tokens,
      }
    });

    return message;
  } catch (error) {
    console.error('Channel Broadcast Error:', error);
    throw error;
  }
}
