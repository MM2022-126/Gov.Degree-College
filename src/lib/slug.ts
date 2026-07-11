export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function findByIdOrSlug<T>(
  model: { findById: (id: string) => { lean: () => Promise<T | null> }; findOne: (q: object) => { lean: () => Promise<T | null> } },
  id: string,
  slugField = 'slug'
): Promise<T | null> {
  if (/^[0-9a-fA-F]{24}$/.test(id)) {
    const doc = await model.findById(id).lean()
    if (doc) return doc
  }
  return model.findOne({ [slugField]: id }).lean()
}
