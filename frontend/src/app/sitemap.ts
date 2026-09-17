import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://cocheravecina.patodev.com";
  const lastModified = new Date();

  const cities = [
    "León",
    "Silao",
    "Guadalajara",
    "Monterrey",
    "Santiago de Querétaro",
    "Ciudad de México",
    "Puebla",
    "Toluca",
    "Cancún",
    "Mérida",
    "Tijuana",
  ];

  const cityUrls: MetadataRoute.Sitemap = cities.map((city) => ({
    url: `${baseUrl}/search?city=${encodeURIComponent(city)}`,
    lastModified,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/search`,
      lastModified,
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    ...cityUrls,
  ];
}
