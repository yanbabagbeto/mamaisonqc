import { describe, expect, it } from "vitest";

import { messagesFor } from "./messages";
import { FAQ_ITEMS, FAQ_ITEMS_EN } from "../../../content/faq";

describe("dictionnaire de contenu", () => {
  it("fr et en ont la même forme de premier niveau", () => {
    const fr = messagesFor("fr");
    const en = messagesFor("en");
    expect(Object.keys(en).sort()).toEqual(Object.keys(fr).sort());
    expect(en.faq.title).not.toBe(fr.faq.title);
    expect(en.donnees.labels.feeds).not.toBe(fr.donnees.labels.feeds);
  });

  it("les textes conditionnels interpolent la même valeur", () => {
    expect(messagesFor("fr").common.readingTime(3)).toContain("3");
    expect(messagesFor("en").common.readingTime(3)).toContain("3");
    expect(messagesFor("fr").common.sourceCount(2)).toContain("2");
    expect(messagesFor("en").common.sourceCount(2)).toContain("2");
  });

  it("les pages légales existent dans les deux langues avec le même nombre de sections", () => {
    for (const page of ["conditions", "confidentialite"] as const) {
      const fr = messagesFor("fr")[page];
      const en = messagesFor("en")[page];
      expect(en.sections).toHaveLength(fr.sections.length);
      expect(en.sections.length).toBeGreaterThanOrEqual(9);
      for (const section of en.sections) {
        expect(section.paragraphs.length).toBeGreaterThan(0);
        expect(section.heading.length).toBeGreaterThan(3);
      }
    }
  });
});

describe("FAQ bilingue", () => {
  it("10 questions dans chaque langue, mêmes ancres", () => {
    expect(FAQ_ITEMS).toHaveLength(10);
    expect(FAQ_ITEMS_EN).toHaveLength(10);
    expect(FAQ_ITEMS_EN.map((item) => item.id)).toEqual(FAQ_ITEMS.map((item) => item.id));
  });

  it("chaque réponse anglaise est rédigée (pas une copie du français)", () => {
    for (let index = 0; index < FAQ_ITEMS.length; index += 1) {
      const fr = FAQ_ITEMS[index]!;
      const en = FAQ_ITEMS_EN[index]!;
      expect(en.question.length).toBeGreaterThan(8);
      expect(en.answer.length).toBeGreaterThan(80);
      expect(en.answer).not.toBe(fr.answer);
    }
  });
});
