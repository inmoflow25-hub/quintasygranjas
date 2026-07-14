export type AttributionPayload = {
  affiliate_slug: string | null
  campaign_source: string | null
  landing_path: string | null
  attribution_label: string | null
}

export const CANDELA_ATTRIBUTION: AttributionPayload = {
  affiliate_slug: "candela-baez",
  campaign_source: "influencer",
  landing_path: "/candela-baez",
  attribution_label: "Candela Báez"
}

export function saveAttribution(attribution: AttributionPayload) {
  if (typeof window === "undefined") return

  if (attribution.affiliate_slug) {
    localStorage.setItem("qyg_affiliate_slug", attribution.affiliate_slug)
  }

  if (attribution.campaign_source) {
    localStorage.setItem("qyg_campaign_source", attribution.campaign_source)
  }

  if (attribution.landing_path) {
    localStorage.setItem("qyg_landing_path", attribution.landing_path)
  }

  if (attribution.attribution_label) {
    localStorage.setItem("qyg_attribution_label", attribution.attribution_label)
  }
}

export function getStoredAttribution(): AttributionPayload {
  if (typeof window === "undefined") {
    return {
      affiliate_slug: null,
      campaign_source: null,
      landing_path: null,
      attribution_label: null
    }
  }

  return {
    affiliate_slug: localStorage.getItem("qyg_affiliate_slug"),
    campaign_source: localStorage.getItem("qyg_campaign_source"),
    landing_path: localStorage.getItem("qyg_landing_path"),
    attribution_label: localStorage.getItem("qyg_attribution_label")
  }
}

export function isCandelaAttribution(attribution: AttributionPayload) {
  return attribution.affiliate_slug === "candela-baez"
}
