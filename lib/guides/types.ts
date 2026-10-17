export type GuideFaq = {
  question: string;
  answer: string;
};

export type GuideLink = {
  title: string;
  href: string;
  description: string;
};

export type GuideHeading = {
  id: string;
  text: string;
};

export type Guide = {
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  updatedAt: string;
  image: string;
  imageAlt: string;
  primaryKeyword: string;
  summary: string[];
  faq: GuideFaq[];
  relatedLinks: GuideLink[];
  body: string;
  wordCount: number;
  readingTimeMinutes: number;
  headings: GuideHeading[];
};
