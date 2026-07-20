export type OnboardingStepState = 'completed' | 'active' | 'locked';

type OnboardingProgress = {
  tutorCreated: boolean;
  petRegistered: boolean;
  careStarted: boolean;
};

function getStepCompletion(step: number, onboarding: OnboardingProgress) {
  if (step === 1) return onboarding.tutorCreated;
  if (step === 2) return onboarding.petRegistered;
  return onboarding.careStarted;
}

function isPreviousStepComplete(step: number, onboarding: OnboardingProgress) {
  if (step === 1) return true;
  if (step === 2) return onboarding.tutorCreated;
  return onboarding.petRegistered;
}

export function getOnboardingStepState(
  step: number,
  onboarding: OnboardingProgress,
): OnboardingStepState {
  if (getStepCompletion(step, onboarding)) {
    return 'completed';
  }

  if (!isPreviousStepComplete(step, onboarding)) {
    return 'locked';
  }

  return 'active';
}
