export async function sendWhatsAppAlert(clientNom: string): Promise<boolean> {
  const phone = process.env.CALLMEBOT_PHONE;
  const apikey = process.env.CALLMEBOT_APIKEY;

  if (!phone || !apikey) {
    console.error("CALLMEBOT_PHONE ou CALLMEBOT_APIKEY manquant");
    return false;
  }

  const prenom = clientNom.trim().split(/\s+/)[0] || clientNom;
  const text = `${prenom} a commandé un produit`;

  const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(apikey)}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error("CallMeBot error:", await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("CallMeBot fetch error:", err);
    return false;
  }
}
