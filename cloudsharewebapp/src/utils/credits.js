// Credit system utilities
import { useUser } from '@clerk/clerk-react';

const CREDITS_KEY_PREFIX = 'cloudshare_credits_';
const DEFAULT_CREDITS = 499;

// Simple function to get user ID - will be called from components with user context
export const getCredits = (userId = 'default') => {
  const credits = localStorage.getItem(CREDITS_KEY_PREFIX + userId);
  if (!credits) {
    setCredits(DEFAULT_CREDITS, userId);
    return DEFAULT_CREDITS;
  }
  return parseInt(credits);
};

export const setCredits = (credits, userId = 'default') => {
  localStorage.setItem(CREDITS_KEY_PREFIX + userId, credits.toString());
  window.dispatchEvent(new Event('creditsUpdated'));
};

export const addCredits = (amount, userId = 'default') => {
  const current = getCredits(userId);
  setCredits(current + amount, userId);
};

export const deductCredits = (amount, userId = 'default') => {
  const current = getCredits(userId);
  const newCredits = Math.max(0, current - amount);
  setCredits(newCredits, userId);
  return newCredits;
};

export const hasEnoughCredits = (amount, userId = 'default') => {
  return getCredits(userId) >= amount;
};
