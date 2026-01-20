import { parseTemplate } from "@repo/shared/parser.js";
import type { DiscordNodeData, NodeExecutionOutput } from "../engine/types/index.js";


export async function executeDiscordNode(
    data: DiscordNodeData,
    _nodeRunId: string,
    runMetadata: Record<string, NodeExecutionOutput>
): Promise<NodeExecutionOutput> {
    const { webhookUrl, message, username } = data;
    
    if (!message) {
        return {
            success: true,
            skipped: true,
            reason: 'Node not configured'
        };
    }

    const parsedMessage = parseTemplate(message, runMetadata as Record<string, string>);
    const parsedUsername = parseTemplate(username || 'FlowGrid Bot', runMetadata as Record<string, string>);

    const discordWebhook = webhookUrl || process.env.DISCORD_WEBHOOK_URL;

    if (!discordWebhook) {
        throw new Error('Discord webhook URL not configured');
    }

    const response = await fetch(discordWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: parsedMessage, username: parsedUsername }),
    });
    if (!response.ok) {
        throw new Error(`Failed to send Discord message: ${response.statusText}`);
    }
    return {
        success: true,
        message: 'Discord message sent',
    };
}