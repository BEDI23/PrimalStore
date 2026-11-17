// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.stubEnv("NEXT_PUBLIC_META_PIXEL_ID", "123");

describe("meta-pixel", () => {
  let mod: typeof import("./meta-pixel");

  beforeEach(async () => {
    vi.resetModules();
    localStorage.clear();
    window.fbq = vi.fn();
    mod = await import("./meta-pixel");
  });
  afterEach(() => {
    mod.setTrackingBlocked(false);
  });

  it("n'envoie rien sans consentement", () => {
    mod.trackViewContent({ id: 1, nom: "A", prix: 100 });
    expect(window.fbq).not.toHaveBeenCalled();
    expect(mod.getMetaServerContext()).toEqual({ metaConsent: false });
  });

  it("envoie ViewContent avec consentement", () => {
    mod.setConsent("granted");
    mod.trackViewContent({ id: 1, nom: "A", prix: 100 });
    expect(window.fbq).toHaveBeenCalledWith("consent", "grant");
    expect(window.fbq).toHaveBeenCalledWith(
      "track",
      "ViewContent",
      expect.objectContaining({ currency: "XOF", content_ids: ["1"] }),
      undefined,
    );
  });

  it("Purchase porte l'event_id partagé avec l'API", () => {
    mod.setConsent("granted");
    mod.trackPurchase({ commandeId: 42, produitId: 1, total: 500, quantite: 1 });
    expect(window.fbq).toHaveBeenCalledWith(
      "track",
      "Purchase",
      expect.anything(),
      { eventID: "purchase-42" },
    );
  });

  it("bloque tout suivi sur un contenu 18+, même avec consentement", () => {
    mod.setConsent("granted");
    vi.mocked(window.fbq!).mockClear(); // ignore l'appel consent/grant
    mod.setTrackingBlocked(true);
    mod.trackPageView();
    mod.trackPurchase({ commandeId: 1, produitId: 1, total: 1, quantite: 1 });
    expect(window.fbq).not.toHaveBeenCalled();
    expect(mod.getMetaServerContext()).toEqual({ metaConsent: false });
  });
});
