import mongoose from 'mongoose'

const mediaSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    altText: { type: String, default: '' },
    caption: { type: String, default: '' },
    category: {
      type: String,
      required: true,
      enum: [
        'campus',
        'events',
        'sports',
        'academics',
        'faculty',
        'students',
        'infrastructure',
        'achievements',
        'other',
      ],
    },
    tags: [{ type: String }],
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

mediaSchema.index({ category: 1 })
mediaSchema.index({ uploadedAt: -1 })
mediaSchema.index({ tags: 1 })

export default mongoose.models.Media || mongoose.model('Media', mediaSchema)
