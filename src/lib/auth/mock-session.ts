import { sessionRepository } from "@/lib/storage/repositories";

export function getMockSession() {
  return sessionRepository.getSession();
}

export function signInWithMockSession() {
  return sessionRepository.signIn();
}

export function signOutWithMockSession() {
  return sessionRepository.signOut();
}

// Made with Bob
