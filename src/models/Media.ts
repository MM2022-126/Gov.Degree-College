import mongoose from "mongoose";

const MediaSchema = new mongoose.Schema({
  url: { type: String, required: true },        // Cloudinary secure_url
  publicId: { type: String, required: true },   // Cloudinary public_id
  altText: { type: String, default: '' },       // Alt text for accessibility & SEO
  caption: { type: String, default: '' },       // Optional caption shown below image
  category: { 
    type: String, 
    required: true,
    enum: [
      'campus',        // Campus photos
      'events',        // Event photos
      'sports',        // Sports activities
      'academics',     // Classroom, labs, library
      'faculty',       // Faculty and staff
      'students',      // Student life
      'infrastructure',// Buildings, facilities
      'achievements',  // Awards, certificates
      'other'          // Miscellaneous
    ]
  },
  tags: [{ type: String }],                     // Optional searchable tags
  uploadedAt: { type: Date, default: Date.now }
}, { timestamps: true });

MediaSchema.index({ category: 1 });
MediaSchema.index({ uploadedAt: -1 });
MediaSchema.index({ tags: 1 });



export default mongoose.models.Media || mongoose.model('Media', MediaSchema)
