import mongoose from "mongoose"

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.provider || this.provider === "credentials"
      },
    },
    avatar: {
      url: String,
      publicId: String,
    },
    bio: String,
    role: {
      type: String,
      enum: ["user", "admin", "editor"],
      default: "user",
    },
    provider: {
      type: String,
      enum: ["credentials", "google"],
      default: "credentials",
    },
    googleId: String,
    socialLinks: {
      twitter: String,
      linkedin: String,
      github: String,
      website: String,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.User || mongoose.model("User", UserSchema)
