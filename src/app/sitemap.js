export default async function sitemap() {
  return [
    {
      url: 'https://calyxo.fit',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
  ];
}
