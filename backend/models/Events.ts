import mongoose from "mongoose";

const eventsSchema = new mongoose.Schema({
  
  // --- BASIC INFO ---
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true, sparse: true },
  tagline: { type: String, default: '' },
  category: { type: String, default: 'general' },
  status: { 
    type: String, 
    enum: ['upcoming', 'ongoing', 'completed'],
    default: 'upcoming'
  },
  isPublished: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  
  // --- DATE AND LOCATION ---
  eventDate: { type: Date, required: true },
  endDate: { type: Date },
  time: { type: String, default: '' },
  venue: { type: String, default: '' },
  venueAddress: { type: String, default: '' },
  organizer: { type: String, default: '' },
  
  // --- CONTENT SECTIONS ---
  shortDescription: { type: String, default: '' },
  
  sections: [{
    type: { 
      type: String, 
      enum: ['text', 'highlight_box', 'quote', 'speakers', 'schedule', 'sponsors'],
      default: 'text'
    },
    heading: { type: String, default: '' },
    body: { type: String, default: '' },
    items: [{ 
      label: { type: String },
      value: { type: String },
      icon: { type: String }
    }]
  }],
  
  // --- IMAGES ---
  coverImage: {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' },
    altText: { type: String, default: '' }
  },
  images: [{
    url: { type: String },
    publicId: { type: String, default: '' },
    altText: { type: String, default: '' },
    caption: { type: String, default: '' }
  }],
  
  // --- VIDEO ---
  videoUrl: { type: String, default: '' },
  videoTitle: { type: String, default: '' },
  
  // --- HIGHLIGHTS ---
  highlights: [{
    icon: { type: String, default: '' },
    label: { type: String, default: '' },
    value: { type: String, default: '' }
  }],
  
  // --- SPEAKERS / PERFORMERS ---
  speakers: [{
    name: { type: String },
    role: { type: String, default: '' },
    bio: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    imageAlt: { type: String, default: '' }
  }],
  
  // --- SCHEDULE ---
  schedule: [{
    time: { type: String },
    activity: { type: String },
    speaker: { type: String, default: '' }
  }],
  
  // --- GALLERY SECTION HEADING ---
  galleryHeading: { type: String, default: 'Event Photos' },
  
  // --- REGISTRATION ---
  registrationOpen: { type: Boolean, default: false },
  registrationLink: { type: String, default: '' },
  registrationDeadline: { type: Date },
  
  // --- META ---
  tags: [{ type: String }],
  
  // Legacy fields for compatibility
  description: { type: String, default: '' },
  fullContent: { type: String, default: '' },
  imageUrl: { type: String },
  date: { type: Date },
  
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

// Auto-generate slug from title
eventsSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-');
  }
  next();
});

eventsSchema.index({ eventDate: -1 });
eventsSchema.index({ date: -1 });
eventsSchema.index({ slug: 1 });
eventsSchema.index({ category: 1 });
eventsSchema.index({ isFeatured: -1 });

export const Events = mongoose.model("Events", eventsSchema);

