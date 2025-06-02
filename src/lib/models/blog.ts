import mongoose from "mongoose"

const MediaFileSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  publicId: String,
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    default: 0,
  },
  format: String,
  alt: String,
})

const BlogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    content: {
      type: String,
      required: true,
    },
    excerpt: {
      type: String,
      maxlength: 300,
    },
    featuredImage: {
      url: String,
      publicId: String,
      alt: String,
    },
    mediaFiles: [MediaFileSchema],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    status: {
      type: String,
      enum: ["draft", "published", "scheduled"],
      default: "draft",
    },
    visibility: {
      type: String,
      enum: ["public", "private", "friends"],
      default: "public",
    },
    publishedAt: Date,
    scheduledAt: Date,
    readingTime: {
      type: Number,
      default: 1,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        content: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
        replies: [
          {
            author: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
            },
            content: String,
            createdAt: {
              type: Date,
              default: Date.now,
            },
          },
        ],
      },
    ],
    seo: {
      metaTitle: String,
      metaDescription: String,
      canonicalUrl: String,
      keywords: [String],
    },
    language: {
      type: String,
      default: "en",
    },
    commentsEnabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for performance
BlogSchema.index({ title: "text", content: "text", tags: "text" })
BlogSchema.index({ author: 1, status: 1 })
BlogSchema.index({ category: 1, publishedAt: -1 })
// Remove this line that's causing duplicate index warning:
// BlogSchema.index({ slug: 1 }, { unique: true })

export default mongoose.models.Blog || mongoose.model("Blog", BlogSchema)
