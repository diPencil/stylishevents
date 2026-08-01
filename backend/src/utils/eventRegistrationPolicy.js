export const REGISTRATION_APPROVAL_MODES = ['automatic', 'manual_review'];
export const REGISTRATION_ACCESS_MODES = ['guest_allowed', 'login_required'];

export function normalizeEventPolicy(event = {}) {
  const maxPerCheckout = Number(event.max_tickets_per_checkout || 1);
  const holdOverride = Number(event.capacity_hold_hours_override || 0);
  return {
    publicRegistrationEnabled: Number(event.public_registration_enabled ?? 1) === 1,
    approvalMode: REGISTRATION_APPROVAL_MODES.includes(event.registration_approval_mode) ? event.registration_approval_mode : 'automatic',
    access: REGISTRATION_ACCESS_MODES.includes(event.registration_access) ? event.registration_access : 'guest_allowed',
    maxTicketsPerCheckout: Math.max(1, Math.min(Number.isFinite(maxPerCheckout) ? maxPerCheckout : 1, 1)),
    capacityHoldHoursOverride: Number.isFinite(holdOverride) && holdOverride > 0 ? Math.min(holdOverride, 720) : null,
    manualPaymentEnabled: Number(event.manual_payment_enabled ?? 1) === 1,
  };
}

export function checkoutInitialState({ isFree, hasPaymentProof, approvalMode }) {
  if (isFree) {
    return {
      registrationStatus: approvalMode === 'manual_review' ? 'pending_review' : 'approved',
      paymentStatus: 'approved',
      orderStatus: 'paid',
      shouldIssueTicket: approvalMode !== 'manual_review',
    };
  }

  return {
    registrationStatus: hasPaymentProof ? 'pending_verification' : 'pending_payment',
    paymentStatus: 'pending',
    orderStatus: 'pending_payment',
    shouldIssueTicket: false,
  };
}

export function paymentApprovalState({ approvalMode }) {
  return {
    registrationStatus: approvalMode === 'manual_review' ? 'pending_review' : 'approved',
    paymentStatus: 'approved',
    orderStatus: 'paid',
    shouldIssueTicket: approvalMode !== 'manual_review',
  };
}
