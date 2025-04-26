import { createClient } from "@supabase/supabase-js"

// Create client for server-side usage with service role key
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const { invoiceId, score, message } = req.body

    if (!invoiceId || score === undefined) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    // First update the invoice status
    await supabase.from("invoices").update({ status: "completed" }).eq("invoice_id", invoiceId)

    // Then save the check result
    const { data, error } = await supabase
      .from("check_results")
      .insert([
        {
          invoice_id: invoiceId,
          score: score,
          message: message || "",
        },
      ])
      .select()

    if (error) {
      console.error("Error saving check result:", error)
      return res.status(500).json({ error: "Failed to save check result" })
    }

    return res.status(200).json({ success: true, result: data[0] })
  } catch (error) {
    console.error("Server error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}
