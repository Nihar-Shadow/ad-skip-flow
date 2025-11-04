// Ad Funnel Configuration and State Management

export interface Ad {
  id: string;
  title: string;
  imageURL: string;
  linkURL: string;
  assignedPage: number;
}

export interface PageConfig {
  id: number;
  countdown: number;
  ads: Ad[];
}

export interface Analytics {
  pageVisits: Record<number, number>;
  adClicks: Record<string, number>;
  totalDownloads: number;
}

export interface AdFunnelConfig {
  pages: PageConfig[];
  analytics: Analytics;
  downloadURL: string;
  softwareName: string;
}

const DEFAULT_CONFIG: AdFunnelConfig = {
  pages: [
    {
      id: 1,
      countdown: 10,
      ads: [
        {
          id: "ad1",
          title: "Premium VPN Service",
          imageURL: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=400&h=300&fit=crop",
          linkURL: "https://example.com/vpn",
          assignedPage: 1,
        },
        {
          id: "ad2",
          title: "Cloud Storage Solution",
          imageURL: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=300&fit=crop",
          linkURL: "https://example.com/storage",
          assignedPage: 1,
        },
      ],
    },
    {
      id: 2,
      countdown: 8,
      ads: [
        {
          id: "ad3",
          title: "Antivirus Protection",
          imageURL: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop",
          linkURL: "https://example.com/antivirus",
          assignedPage: 2,
        },
      ],
    },
    {
      id: 3,
      countdown: 10,
      ads: [
        {
          id: "ad4",
          title: "System Optimizer",
          imageURL: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
          linkURL: "https://example.com/optimizer",
          assignedPage: 3,
        },
      ],
    },
    {
      id: 4,
      countdown: 12,
      ads: [
        {
          id: "ad5",
          title: "Password Manager",
          imageURL: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400&h=300&fit=crop",
          linkURL: "https://example.com/password",
          assignedPage: 4,
        },
      ],
    },
  ],
  analytics: {
    pageVisits: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    adClicks: {},
    totalDownloads: 0,
  },
  downloadURL: "https://example.com/download/software.exe",
  softwareName: "Premium Software Suite v2.0",
};

const STORAGE_KEY = "adFunnelConfig";

export const loadConfig = (): AdFunnelConfig => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error loading config:", error);
  }
  return DEFAULT_CONFIG;
};

export const saveConfig = (config: AdFunnelConfig): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error("Error saving config:", error);
  }
};

export const updatePageVisit = (pageId: number): void => {
  const config = loadConfig();
  config.analytics.pageVisits[pageId] = (config.analytics.pageVisits[pageId] || 0) + 1;
  saveConfig(config);
};

export const updateAdClick = (adId: string): void => {
  const config = loadConfig();
  config.analytics.adClicks[adId] = (config.analytics.adClicks[adId] || 0) + 1;
  saveConfig(config);
};

export const updateDownloadCount = (): void => {
  const config = loadConfig();
  config.analytics.totalDownloads += 1;
  saveConfig(config);
};

export const exportConfig = (): string => {
  const config = loadConfig();
  return JSON.stringify(config, null, 2);
};

export const importConfig = (jsonString: string): boolean => {
  try {
    const config = JSON.parse(jsonString);
    saveConfig(config);
    return true;
  } catch (error) {
    console.error("Error importing config:", error);
    return false;
  }
};

export const resetConfig = (): void => {
  saveConfig(DEFAULT_CONFIG);
};
