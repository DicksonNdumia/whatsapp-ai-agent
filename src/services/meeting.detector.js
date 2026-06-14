export function wantsMeeting(message) {
  if (!message) {
    return false;
  }
  const keywords = [
    "meet",
    "meeting",
    "schedule",
    "appointment",
    "call",
    "discuss",
  ];

  return keywords.some((keyword) => message.toLowerCase().includes(keyword));
}
