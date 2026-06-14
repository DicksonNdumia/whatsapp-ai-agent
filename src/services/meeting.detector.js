export function wantsMeeting(message) {
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
