import { describe, it, expect, afterEach } from "vitest";
import { t, setLocale, getLocale, getAvailableLocales } from "./i18n";

describe("i18n", () => {
  afterEach(() => setLocale("pt-BR"));

  it("defaults to pt-BR", () => {
    expect(getLocale()).toBe("pt-BR");
  });

  it("translates pt-BR keys", () => {
    expect(t("app.title")).toBe("VisionPro");
    expect(t("permission.button")).toBe("Permitir Camera");
  });

  it("switches to English", () => {
    setLocale("en");
    expect(getLocale()).toBe("en");
    expect(t("permission.button")).toBe("Allow Camera");
    expect(t("emotion.happy")).toBe("Happy");
  });

  it("returns key for missing translations", () => {
    expect(t("nonexistent.key")).toBe("nonexistent.key");
  });

  it("lists available locales", () => {
    const locales = getAvailableLocales();
    expect(locales).toContain("pt-BR");
    expect(locales).toContain("en");
  });
});
