export async function createNotification(
  userId: string,
  title: string,
  message: string
) {
  await fetch("/api/notifications/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, title, message }),
  }).catch(console.error);
}
