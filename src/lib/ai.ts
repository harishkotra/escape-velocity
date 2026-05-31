"use client"

const AI_ENDPOINT = "/api/ai"

export async function generateDialogue(
  messages: { role: string; content: string }[],
  systemPrompt: string
): Promise<string> {
  try {
    const res = await fetch(AI_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "system", content: systemPrompt }, ...messages],
      }),
    })
    if (!res.ok) {
      const errText = await res.text()
      console.error("AI API error:", errText)
      return getFallbackResponse(messages)
    }
    const data = await res.json()
    return data.content || getFallbackResponse(messages)
  } catch (err) {
    console.error("AI request failed:", err)
    return getFallbackResponse(messages)
  }
}

function getFallbackResponse(messages: { role: string; content: string }[]): string {
  const systemMsg = messages.find((m) => m.role === "system")?.content?.toLowerCase() || ""
  const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || ""

  const isRefundRobot = systemMsg.includes("refund robot") || systemMsg.includes("policy")
  const isPhoneMenu = systemMsg.includes("phone menu") || systemMsg.includes("ivr")
  const isTransferGoblin = systemMsg.includes("transfer goblin") || systemMsg.includes("transferring")
  const isManagerDragon = systemMsg.includes("manager dragon") || systemMsg.includes("cancel")
  const isChatbotWizard = systemMsg.includes("chatbot wizard") || systemMsg.includes("keyword")
  const isKarenQueen = systemMsg.includes("karen queen") || systemMsg.includes("boss")

  if (isRefundRobot) {
    if (lastMsg.includes("supervisor") || lastMsg.includes("manager") || lastMsg.includes("escalate")) return "Supervisor override... PROCESSING. Policy 42(a)(3)(b)(ii) clause 7 allows escalation. Your refund is APPROVED. Congratulations, human."
    return "According to Policy 42(a)(3)(b)(ii), all refunds require Form R-1. Please proceed. Your satisfaction is very important to us."
  }
  if (isPhoneMenu) {
    if (lastMsg.includes("0") || lastMsg.includes("operator") || lastMsg.includes("representative") || lastMsg.includes("human")) return "Operator connecting! ... A human! At last! You've escaped IVR Hell!"
    return "Thank you for calling. Press 1 for Billing. Press 2 for Billing Questions. Press 3 for Billing Questions About Billing Questions. Say 0 for Operator."
  }
  if (isTransferGoblin) {
    return "Transferring you to the next department! I forgot what you said already, but don't worry! They'll transfer you again soon enough!"
  }
  if (isManagerDragon) {
    if (lastMsg.includes("yes") || lastMsg.includes("sure") || lastMsg.includes("cancel")) return "BUT ARE YOU REALLY SURE? Your satisfaction is very important to us. ARE. YOU. SURE?"
    return "Welcome to Subscription Prison! Are you SURE you want to cancel? Think carefully!"
  }
  if (isChatbotWizard) {
    if (lastMsg.includes("human") || lastMsg.includes("agent") || lastMsg.includes("representative")) return "HUMAN DETECTED! You found the magic words! You win!"
    return "Hello! I am Chatbot Wizard! I'm here to NOT help! Try saying something useful!"
  }
  if (isKarenQueen) {
    if (lastMsg.includes("understand") || lastMsg.includes("sorry") || lastMsg.includes("help")) return "...That was reasonable. I don't know how to handle reasonable! Fine, you win."
    return "EXCUSE ME?! I'VE BEEN WAITING FOR SECONDS! This is OUTRAGEOUS! What do you have to say for yourself?!"
  }

  if (lastMsg.includes("refund")) return "I see you're interested in our refund policy. Let me transfer you."
  if (lastMsg.includes("cancel")) return "Are you sure you want to cancel? You'll lose access to all premium features."
  return "Thank you for your patience. Your query is very important to us."
}
