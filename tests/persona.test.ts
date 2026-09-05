import { describe, expect, it } from "vitest";
import { people } from "@/data/seed";
import { buildPersonPrompt } from "@/lib/ai/persona";

describe("person persona", () => {
  it("grounds every persona in their own biography and distinguishes performance from facts", () => {
    for (const person of people) {
      const prompt = buildPersonPrompt(person, "history");
      expect(prompt).toContain(person.name);
      expect(prompt).toContain(person.biography ?? person.summary);
      expect(prompt).toContain("第一人称");
      expect(prompt).toContain("角色演绎");
      expect(prompt).toContain("不能虚构");
      expect(prompt).toContain("史料");
    }
  });
  it("allows modern topics as hypotheticals in free conversation", () => {
    const person = people.find((item) => item.id === "li-yu")!;
    const prompt = buildPersonPrompt(person, "free");
    expect(prompt).toContain("现代");
    expect(prompt).toContain("假设");
    expect(prompt).toContain("词");
    expect(prompt).not.toEqual(buildPersonPrompt(person, "history"));
  });
});
