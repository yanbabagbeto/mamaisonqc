import { describe, expect, it } from "vitest";

import { safeNextPath, signInSchema, signUpSchema } from "./auth-schema";

describe("signInSchema", () => {
  it("validates and normalises the email", () => {
    const parsed = signInSchema("fr").safeParse({ email: "  SYLVIE@Exemple.CA ", password: "x" });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.email).toBe("sylvie@exemple.ca");
  });

  it("returns French then English messages for the same invalid input", () => {
    const fr = signInSchema("fr").safeParse({ email: "pas-un-courriel", password: "" });
    const en = signInSchema("en").safeParse({ email: "not-an-email", password: "" });
    expect(fr.success).toBe(false);
    expect(en.success).toBe(false);
    if (fr.success || en.success) return;
    expect(fr.error.issues.map((issue) => issue.message)).toContain("Adresse courriel invalide.");
    expect(en.error.issues.map((issue) => issue.message)).toContain("Invalid email address.");
  });
});

describe("signUpSchema", () => {
  it("requires a 10-character password and a matching confirmation", () => {
    const result = signUpSchema("fr").safeParse({
      name: "Sylvie",
      email: "sylvie@exemple.ca",
      password: "court",
      confirm: "different",
      claim: "",
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    const messages = result.error.issues.map((issue) => issue.message);
    expect(messages).toContain("Le mot de passe doit contenir au moins 10 caractères.");
    expect(messages).toContain("Les deux mots de passe ne correspondent pas.");
  });

  it("accepts the claim deep-link matricule as an optional field", () => {
    const result = signUpSchema("en").safeParse({
      name: "Sylvie",
      email: "sylvie@exemple.ca",
      password: "phrase-de-passe-solide",
      confirm: "phrase-de-passe-solide",
      claim: "1234-56-7890",
    });
    expect(result.success).toBe(true);
  });
});

describe("safeNextPath", () => {
  it("accepts same-site paths, including the English prefix", () => {
    expect(safeNextPath("/proprietaire/tableau-de-bord")).toBe("/proprietaire/tableau-de-bord");
    expect(safeNextPath("/en/proprietaire/equite?matricule=1")).toBe(
      "/en/proprietaire/equite?matricule=1",
    );
  });

  it("rejects protocol-relative, absolute and backslash paths", () => {
    expect(safeNextPath("//evil.example")).toBeUndefined();
    expect(safeNextPath("/\\evil.example")).toBeUndefined();
    expect(safeNextPath("https://evil.example")).toBeUndefined();
    expect(safeNextPath("proprietaire")).toBeUndefined();
    expect(safeNextPath("")).toBeUndefined();
    expect(safeNextPath(undefined)).toBeUndefined();
  });
});
