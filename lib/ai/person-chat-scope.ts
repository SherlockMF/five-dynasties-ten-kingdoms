import { people } from "@/data/seed";
import { fiveDynastiesSeedData } from "@/data/seed/five-dynasties";

const supportedIds = new Set(fiveDynastiesSeedData.people.map((person) => person.id));
// Names are used only to detect unsupported subjects, never as answer evidence.
const unsupportedNames = people.filter((person) => !supportedIds.has(person.id)).map((person) => person.name);

export function supportsPersonChat(personId: string, message: string): boolean {
  return supportedIds.has(personId) && !unsupportedNames.some((name) => message.includes(name));
}
