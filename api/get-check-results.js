import { createClient } from "@supabase/supabase-js"

// Create client for server-side usage with service role key
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    // Get pagination parameters
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const offset = (page - 1) * limit

    // Get total count
    const { count, error: countError } = await supabase
      .from("check_results")
      .select("*", { count: "exact", head: true })

    if (countError) {
      throw countError
    }

    // Get paginated data
    const { data, error } = await supabase
      .from("check_results")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      throw error
    }

    return res.status(200).json({
      data,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    })
  } catch (error) {
    console.error("Server error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}
