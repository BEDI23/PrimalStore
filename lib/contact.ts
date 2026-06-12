import { CONTACT_EMAIL } from "./constants";

export function getContactEmail(): string {
  return process.env.NEXT_PUBLIC_CONTACT_EMAIL || CONTACT_EMAIL;
}
