import { createServerSupabaseClient } from "../lib/supabase"

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const { name, email, subject, message } = req.body

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    const supabase = createServerSupabaseClient()

    // Save to Supabase
    const { data, error } = await supabase.from("contact_messages").insert([{ name, email, subject, message }]).select()

    if (error) {
      console.error("Error saving contact message:", error)
      return res.status(500).json({ error: "Failed to save contact message" })
    }

    // Also send to Discord webhook
    try {
      const webhookUrl =
        "https://discord.com/api/webhooks/1365551426754973817/C0kZ-daH4mNlKKqmzs11BBk2No7YU6iJ4tlRLXiqJbbBqyDXW7qZ2sO7lRHu_pmqlkIe"

      const payload = {
        embeds: [
          {
            title: "New Contact Form Submission",
            color: 1127128, // Blue color
            fields: [
              {
                name: "Name",
                value: name,
                inline: true,
              },
              {
                name: "Email",
                value: email,
                inline: true,
              },
              {
                name: "Subject",
                value: subject,
              },
              {
                name: "Message",
                value: message,
              },
            ],
            timestamp: new Date().toISOString(),
          },
        ],
      }

      await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
    } catch (webhookError) {
      console.error("Discord webhook error:", webhookError)
      // Continue even if Discord webhook fails
    }

    return res.status(200).json({ success: true, message: data[0] })
  } catch (error) {
    console.error("Server error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}
