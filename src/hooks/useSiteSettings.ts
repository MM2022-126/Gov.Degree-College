import { useState, useEffect } from "react";

interface SiteSettings {
  contact_address: string;
  contact_phone: string;
  contact_email: string;
  contact_hours: string;
  [key: string]: string;
}

const defaults: SiteSettings = {
  contact_address: "Ravi Road, Shahdara, Lahore, Punjab 54000",
  contact_phone: "+92-42-XXXXXXX",
  contact_email: "info@ggc.edu.pk",
  contact_hours: "Mon - Sat: 8:00 AM - 3:00 PM",
};

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(defaults);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/settings`);
        if (response.ok) {
          const data = await response.json();
          // Handle both object and array responses
          if (typeof data === "object" && data !== null) {
            const map: SiteSettings = { ...defaults };
            if (Array.isArray(data)) {
              // Array format: [{ key, value }, ...]
              data.forEach((row: any) => {
                map[row.key] = row.value;
              });
            } else {
              // Object format: { key: value, ... }
              Object.entries(data).forEach(([key, value]) => {
                map[key] = String(value);
              });
            }
            setSettings(map);
          }
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
        // Use defaults if fetch fails
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const updateSetting = async (key: string, value: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/settings/${key}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("admin_token") || ""}`,
        },
        body: JSON.stringify({ value }),
      });

      if (response.ok) {
        setSettings(prev => ({ ...prev, [key]: value }));
        return { error: null };
      } else {
        const error = await response.json();
        return { error };
      }
    } catch (error) {
      console.error("Failed to update setting:", error);
      return { error };
    }
  };

  return { settings, loading, updateSetting };
}
