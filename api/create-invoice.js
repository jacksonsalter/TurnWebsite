import { createServerSupabaseClient } from "../lib/supabase"

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const { invoiceId, paymentMethod } = req.body

    if (!invoiceId || !paymentMethod) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from("invoices")
      .insert([
        {
          invoice_id: invoiceId,
          payment_method: paymentMethod,
          amount: 25.0,
          status: "pending",
        },
      ])
      .select()

    if (error) {
      console.error("Error creating invoice:", error)
      return res.status(500).json({ error: "Failed to create invoice" })
    }

    return res.status(200).json({ success: true, invoice: data[0] })
  } catch (error) {
    console.error("Server error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}
