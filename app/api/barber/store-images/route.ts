import { type NextRequest, NextResponse } from "next/server"
import { getStoreImages, addStoreImage } from "@/lib/db"
import { requireBarber } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    await requireBarber()
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get("storeId")

    if (!storeId) {
      return NextResponse.json({ error: "Store ID is required" }, { status: 400 })
    }

    const images = await getStoreImages(storeId)
    return NextResponse.json({ images })
  } catch (error) {
    console.error("Get store images error:", error)
    return NextResponse.json({ error: "Failed to fetch store images" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireBarber()
    const { storeId, imageData, imageName, imageType, imageSize, isPrimary } = await request.json()

    if (!storeId || !imageData || !imageName || !imageType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate image size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (imageSize > maxSize) {
      return NextResponse.json({ error: "Image size too large. Maximum 5MB allowed." }, { status: 400 })
    }

    // Validate image type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowedTypes.includes(imageType)) {
      return NextResponse.json({ error: "Invalid image type. Only JPEG, PNG, and WebP are allowed." }, { status: 400 })
    }

    const image = await addStoreImage(storeId, imageData, imageName, imageType, imageSize, isPrimary)
    return NextResponse.json({ image })
  } catch (error) {
    console.error("Add store image error:", error)
    return NextResponse.json({ error: "Failed to add store image" }, { status: 500 })
  }
}
