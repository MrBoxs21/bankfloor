import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const generateSignature = (publicId: string, timestamp: number) => {
  return cloudinary.utils.api_sign_request(
    {
      public_id: publicId,
      timestamp: timestamp,
    },
    process.env.CLOUDINARY_API_SECRET!,
  )
}

export const getSignedUploadUrl = () => {
  const timestamp = Math.round(new Date().getTime() / 1000)
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp: timestamp,
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
    },
    process.env.CLOUDINARY_API_SECRET!,
  )

  return {
    timestamp,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
  }
}

export default cloudinary
