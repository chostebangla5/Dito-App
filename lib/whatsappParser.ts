export interface ParsedWhatsApp {
  totalMessages: number;
  theirMessages: string[];
  phrases: string[];
  toneSummary: string;
}

export function parseWhatsAppExport(content: string, theirName: string): ParsedWhatsApp {
  const lines = content.split('\n');
  // Matches multiple WhatsApp export formats:
  // 1/2/23, 10:00 AM - Name: message
  // 01/02/2023, 10:00 - Name: message
  // [1/2/23, 10:00:00 AM] Name: message
  const messageRegex = /^[\[]?\d{1,2}\/\d{1,2}\/\d{2,4},?\s*\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM|am|pm)?\s*[\]]?\s*[-–]?\s*(.+?):\s*(.+)$/i;

  const theirMessages: string[] = [];
  const nameFirstWord = theirName.toLowerCase().split(' ')[0].toLowerCase();

  for (const line of lines) {
    const match = line.match(messageRegex);
    if (match) {
      const sender = match[1].trim();
      const message = match[2].trim();
      // Fuzzy match: check if the sender's name contains the first word of their name
      if (sender.toLowerCase().includes(nameFirstWord)) {
        if (
          message !== '<Media omitted>' &&
          message !== 'This message was deleted' &&
          message !== 'You deleted this message' &&
          !message.startsWith('http') &&
          message.length > 2 &&
          message.length < 200
        ) {
          theirMessages.push(message);
        }
      }
    }
  }

  // Extract characteristic phrases (messages under 60 chars — likely natural expressions)
  const phrases = theirMessages
    .filter(m => m.length < 60 && !m.startsWith('http'))
    .slice(0, 50);

  // Tone detection
  const allText = theirMessages.join(' ').toLowerCase();
  const avgWordCount = theirMessages.length > 0
    ? allText.split(' ').length / theirMessages.length
    : 5;

  let tone = 'warm and caring';

  const emojiCount = (allText.match(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu) || []).length;
  const hasLaughter = allText.includes('haha') || allText.includes('lol') || allText.includes('😂') || allText.includes('🤣');
  const hasLove = allText.includes('love you') || allText.includes('miss you') || allText.includes('❤') || allText.includes('💕');

  if (hasLove && hasLaughter) {
    tone = 'deeply loving and playful — mixes affection with humor';
  } else if (hasLove) {
    tone = 'deeply loving and expressive';
  } else if (hasLaughter) {
    tone = 'playful and funny';
  } else if (avgWordCount < 5) {
    tone = 'brief and direct — texts in short bursts';
  } else if (emojiCount > theirMessages.length * 0.3) {
    tone = 'expressive and emoji-heavy';
  }

  return {
    totalMessages: theirMessages.length,
    theirMessages: theirMessages.slice(0, 100),
    phrases: phrases.slice(0, 20),
    toneSummary: tone,
  };
}
