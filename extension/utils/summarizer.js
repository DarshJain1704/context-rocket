// The Compression Engine: Turns raw messages into a structured context string

function compressConversation(messages) {
  if (!messages || messages.length === 0) return "No context found.";

  let activeTask = "None";
  let recentProgress = "None";
  let importantCodeContext = [];
  let errorsOrBlockers = "None";

  // Reverse iterate to find the most recent user and assistant messages easily
  const reversedMessages = [...messages].reverse();

  // Find ACTIVE_TASK (latest user message)
  const lastUserMsg = reversedMessages.find(m => m.role === 'user');
  if (lastUserMsg) {
    activeTask = lastUserMsg.text;
  }

  // Find RECENT_PROGRESS (latest assistant message)
  const lastAstMsg = reversedMessages.find(m => m.role === 'assistant');
  if (lastAstMsg) {
    // Truncate to 500 chars to save tokens
    recentProgress = lastAstMsg.text.substring(0, 500);
    if (lastAstMsg.text.length > 500) recentProgress += "... [truncated]";
  }

  // Extract Code Blocks (from the last 4 messages only to keep it relevant)
  const recentMessages = reversedMessages.slice(0, 4);
  recentMessages.forEach(msg => {
    if (msg.codeBlocks && msg.codeBlocks.length > 0) {
      importantCodeContext.push(...msg.codeBlocks);
    }
  });

  // Find ERRORS_OR_BLOCKers (Regex on recent user messages)
  const errorRegex = /error|exception|fail|traceback|bug/i;
  const recentUserMessages = recentMessages.filter(m => m.role === 'user');
  const errorMsg = recentUserMessages.find(m => errorRegex.test(m.text));
  if (errorMsg) {
    errorsOrBlockers = errorMsg.text.substring(0, 300);
  }

  // Format into the structured output
  return `PROJECT=ContextRocket
CURRENT_STATE=Developing
ACTIVE_TASK=${activeTask}
RECENT_PROGRESS=${recentProgress}
ERRORS_OR_BLOCKERS=${errorsOrBlockers}
IMPORTANT_CODE_CONTEXT=${importantCodeContext.length > 0 ? '\n' + importantCodeContext.join('\n\n') : 'None'}
`;
}
