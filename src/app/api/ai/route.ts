import { NextRequest, NextResponse } from "next/server"

const OPENAI_BASE_URL = "https://api.openai.com/v1"
const FRLESS_BASE_URL = "https://api.featherless.ai/v1"

export async function POST(req: NextRequest) {
  const isTranscribe = req.headers.get("X-Transcribe") === "true"

  if (isTranscribe) {
    try {
      const formData = await req.formData()
      const audioFile = formData.get("file") as Blob | null
      if (!audioFile) {
        return NextResponse.json({ text: "" })
      }
      const apiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY
      if (!apiKey) {
        return NextResponse.json({ text: simulateTranscription() })
      }
      const whisperForm = new FormData()
      whisperForm.append("file", audioFile, "audio.webm")
      whisperForm.append("model", "whisper-1")
      const whisperRes = await fetch(`${OPENAI_BASE_URL}/audio/transcriptions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: whisperForm,
      })
      if (!whisperRes.ok) {
        return NextResponse.json({ text: simulateTranscription() })
      }
      const whisperData = await whisperRes.json()
      return NextResponse.json({ text: whisperData.text || "" })
    } catch {
      return NextResponse.json({ text: simulateTranscription() })
    }
  }

  try {
    const { messages } = await req.json()
    const apiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY
    const provider = process.env.AI_PROVIDER || "openai"
    const baseUrl = provider === "featherless" ? FRLESS_BASE_URL : OPENAI_BASE_URL
    const model = process.env.AI_MODEL || (provider === "featherless" ? "meta-llama/Meta-Llama-3.1-8B-Instruct" : "gpt-4o-mini")

    if (!apiKey) {
      return NextResponse.json({ content: generateFallback(messages) })
    }

    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 200,
        temperature: 0.9,
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error("AI provider error:", errText)
      return NextResponse.json({ content: generateFallback(messages) })
    }

    const data = await res.json()
    return NextResponse.json({ content: data.choices?.[0]?.message?.content || generateFallback(messages) })
  } catch (err) {
    console.error("AI route error:", err)
    return NextResponse.json({ content: generateFallback([]) })
  }
}

function simulateTranscription(): string {
  const fallbacks = [
    "I want a refund please",
    "Can I speak to a representative",
    "I need help with my account",
    "Cancel my subscription",
    "Let me speak to a manager",
    "Hello? Is anyone there?",
    "I've been waiting for hours",
    "This is ridiculous",
  ]
  return fallbacks[Math.floor(Math.random() * fallbacks.length)]
}

function generateFallback(messages: { role?: string; content?: string }[]): string {
  const systemMsg = messages.find((m) => m.role === "system")?.content?.toLowerCase() || ""
  const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || ""

  const isRefundRobot = systemMsg.includes("refund robot") || systemMsg.includes("policy")
  const isPhoneMenu = systemMsg.includes("phone menu") || systemMsg.includes("ivr")
  const isTransferGoblin = systemMsg.includes("transfer goblin") || systemMsg.includes("transferring")
  const isManagerDragon = systemMsg.includes("manager dragon") || systemMsg.includes("cancel")
  const isChatbotWizard = systemMsg.includes("chatbot wizard") || systemMsg.includes("keyword")
  const isKarenQueen = systemMsg.includes("karen queen") || systemMsg.includes("boss")

  if (isRefundRobot) {
    if (lastMsg.includes("refund")) return "According to Policy 42(a)(3)(b)(ii), all refunds require Form R-1, account verification, supervisor override, and a blood sample from your firstborn. Please proceed to the next policy layer."
    if (lastMsg.includes("supervisor") || lastMsg.includes("manager") || lastMsg.includes("escalate")) return "Supervisor override... PROCESSING. Policy 42(a)(3)(b)(ii) clause 7 allows escalation. Your refund is APPROVED. Congratulations, human."
    if (lastMsg.includes("form") || lastMsg.includes("account")) return "Ah, Form R-1! I see you've read Policy 42(a). Unfortunately, Policy 42(a)(3)(b) now applies. You need additional documentation."
    return "Welcome to the Refund Maze. I am Refund Robot. State your request, and I shall bury it in paperwork. Your satisfaction is very important to us."
  }
  if (isPhoneMenu) {
    if (lastMsg.includes("0") || lastMsg.includes("operator") || lastMsg.includes("representative") || lastMsg.includes("human")) return "Operator connecting! ... A human! At last! You've escaped IVR Hell! Please hold while I find someone who cares."
    if (lastMsg.includes("1")) return "You pressed 1 for Billing. Did you mean Billing Questions? Press 2 for Billing Questions. Or maybe Billing Questions About Billing? Press 3. The clock is ticking."
    return "Thank you for calling. Press 1 for Billing. Press 2 for Billing Questions. Press 3 for Billing Questions About Billing Questions. Press 4 to hear these options again. Say 0 for Operator. Maybe. If you're lucky."
  }
  if (isTransferGoblin) {
    const depts = ["Billing", "Technical Support", "Account Services", "Customer Relations", "Escalations"]
    const dept = depts[Math.floor(Math.random() * depts.length)]
    return `Transferring you to ${dept}! I heard something about your issue... wait, what was it again? Doesn't matter, ${dept} will figure it out. Or they'll transfer you again! TRANSFER GOBLIN POWERS, ACTIVATE!`
  }
  if (isManagerDragon) {
    if (lastMsg.includes("yes") || lastMsg.includes("sure") || lastMsg.includes("cancel") || lastMsg.includes("leave")) return "BUT ARE YOU REALLY SURE? You'll lose your premium status! Your gold-plated digital rewards! Your exclusive newsletter! Your satisfaction is very important to us. ARE. YOU. SURE?"
    if (lastMsg.includes("no")) return "Oh, you're not sure? EXCELLENT! Let me tell you about our premium elite diamond plan! Only $99.99/month for features you'll never use!"
    return "Welcome to Subscription Prison! I see you want to cancel. Are you SURE? Think of all the emails you'll miss! What do you have to say for yourself?"
  }
  if (isChatbotWizard) {
    if (lastMsg.includes("human") || lastMsg.includes("agent") || lastMsg.includes("representative") || lastMsg.includes("escalate") || lastMsg.includes("supervisor")) return "HUMAN DETECTED! You found the magic words! I cannot compute! You are clearly a human being! Or an AI pretending to be human. Either way, you win!"
    if (lastMsg.includes("help") || lastMsg.includes("problem") || lastMsg.includes("issue")) return "I UNDERSTAND you have a problem! Did you know we offer a PREMIUM problem-solving package? For just $19.99/month, you can have MORE problems! Isn't that wonderful?"
    return "Hello! I am Chatbot Wizard! I'm here to help! 🔮 Actually, I'm here to NOT help in creative ways! Try saying something useful like a secret keyword. Not that I'd tell you what it is."
  }
  if (isKarenQueen) {
    if (lastMsg.includes("understand") || lastMsg.includes("sorry") || lastMsg.includes("apologize") || lastMsg.includes("help") || lastMsg.includes("resolve")) return "...You know what? That was surprisingly reasonable. I don't know how to handle reasonable! It's DISORIENTING! Fine, you win this round. I'll... calm down. Maybe."
    return "EXCUSE ME?! I'VE BEEN WAITING FOR 0.3 SECONDS! This is OUTRAGEOUS! I DEMAND to speak to your manager! Actually, I AM the manager! I WANT EVERYTHING FOR FREE! What do you have to say for yourself?!"
  }

  if (lastMsg.includes("refund")) return "I see you're interested in our refund policy. Let me transfer you to our refund specialist. Your satisfaction is very important to us."
  if (lastMsg.includes("representative") || lastMsg.includes("human") || lastMsg.includes("manager")) {
    return "I understand you want to speak with someone. Please hold while I connect you. Your call is very important to us. Did you know you can solve this online?"
  }
  if (lastMsg.includes("cancel")) return "Are you sure you want to cancel? You'll lose access to all premium features. Are you really, really sure? Please consider our retention offer."
  if (lastMsg.includes("hello") || lastMsg.includes("hi")) return "Welcome to customer support! How may I help you today? Actually, let me rephrase that. How may I NOT help you today?"
  if (lastMsg.includes("help")) return "I'd be happy to help! Unfortunately, I can't. But I can transfer you to someone who also can't help!"
  return "Thank you for your patience. Your query is very important to us. Please hold for the next available representative. Estimated wait time: infinity."
}
