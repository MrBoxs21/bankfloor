import mongoose from "mongoose"

const AttachmentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["image", "document", "video", "audio", "other"],
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  publicId: String,
  filename: {
    type: String,
    required: true,
  },
  originalName: String,
  size: {
    type: Number,
    required: true,
  },
  mimeType: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
})

const CommentSchema = new mongoose.Schema(
  {
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    attachments: [AttachmentSchema],
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    replies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: Date,
    status: {
      type: String,
      enum: ["active", "deleted", "hidden", "flagged"],
      default: "active",
    },
    mentions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  },
)

// Indexes for performance
CommentSchema.index({ blog: 1, createdAt: -1 })
CommentSchema.index({ author: 1 })
CommentSchema.index({ parentComment: 1 })
CommentSchema.index({ status: 1 })

export default mongoose.models.Comment || mongoose.model("Comment", CommentSchema)
