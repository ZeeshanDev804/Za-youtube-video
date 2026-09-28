const APPROVAL_STATUSES = {
  AUTO_APPROVED: 'AUTO_APPROVED',
  PENDING_REVIEW: 'PENDING_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
};

export function evaluateApproval({
  safety,
  originality,
  quality,
  publishRequested = false
} = {}) {
  const reasons = [];

  if (
    safety &&
    safety.status === 'REJECT'
  ) {
    return {
      status:
        APPROVAL_STATUSES.REJECTED,
      approved: false,
      reasons: [
        'Safety gate rejected the content.'
      ]
    };
  }

  if (
    originality &&
    originality.duplicate
  ) {
    return {
      status:
        APPROVAL_STATUSES.REJECTED,
      approved: false,
      reasons: [
        'Duplicate content detected.'
      ]
    };
  }

  if (
    safety &&
    safety.risk === 'MEDIUM'
  ) {
    reasons.push(
      'Medium safety risk requires human review.'
    );
  }

  if (
    quality &&
    quality.valid === false
  ) {
    reasons.push(
      'Video quality checks have not passed.'
    );
  }

  if (reasons.length > 0) {
    return {
      status:
        APPROVAL_STATUSES.PENDING_REVIEW,
      approved: false,
      reasons
    };
  }

  if (publishRequested) {
    return {
      status:
        APPROVAL_STATUSES.AUTO_APPROVED,
      approved: true,
      reasons: [
        'All current approval gates passed.'
      ]
    };
  }

  return {
    status:
      APPROVAL_STATUSES.APPROVED,
    approved: true,
    reasons: [
      'Content is approved for the next pipeline stage.'
    ]
  };
}

export function requireApproval(
  result
) {
  if (
    !result ||
    !result.approved
  ) {
    throw new Error(
      `[ApprovalGate] Approval required: ${
        result?.reasons?.join(' ') ||
        'Unknown approval issue.'
      }`
    );
  }

  return result;
}

export function getApprovalStatuses() {
  return {
    ...APPROVAL_STATUSES
  };
}

export default {
  evaluateApproval,
  requireApproval,
  getApprovalStatuses
};
