import type { HTTPNodeData, NodeExecutionOutput } from "../engine/types/index.js";
import { parseTemplate } from "@repo/shared/parser.js";

export async function executeHTTPNode(
    data: HTTPNodeData,
    _nodeRunId: string,
    runMetadata: Record<string, NodeExecutionOutput>
): Promise<NodeExecutionOutput> {

    const { url, method, headers, body } = data;

    let parsedBody;
    if (body && typeof body === 'string') {
        parsedBody = parseTemplate(body, runMetadata as Record<string, string>);
    } else {
        parsedBody = body;
    }

    const requestOptions: RequestInit = {
        method,
        headers: headers || {},
    };

    if (method !== 'GET' && parsedBody !== undefined) {
        requestOptions.body = JSON.stringify(parsedBody);
    }

    const response = await fetch(url, requestOptions);

    if(!response.ok) {
        throw new Error(`HTTP request failed: ${response.statusText}`);
    }

    return response.json();
}