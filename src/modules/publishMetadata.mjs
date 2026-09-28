function clean(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function buildPublishPackage({
  videoPath = '',
  title = '',
  description = '',
  hashtags = [],
  compliance = {},
  approval = {}
} = {}) {
  const tags =
    Array.isArray(hashtags)
      ? [
          ...new Set(
            hashtags
              .map(tag =>
                clean(tag)
              )
              .filter(Boolean)
          )
        ].slice(0, 10)
      : [];

  return {
    videoPath:
      clean(videoPath),

    title:
      clean(title)
        .slice(0, 100),

    description:
      clean(description),

    hashtags:
      tags,

    approvalStatus:
      approval.status ||
      'PENDING',

    humanReviewRequired:
      Boolean(
        compliance.humanReviewRequired ||
        approval.approved === false
      ),

    aiDisclosureRequired:
      Boolean(
        compliance.disclosureRequired
      ),

    readyForUpload:
      Boolean(
        videoPath &&
        title &&
        approval.approved === true &&
        !compliance.humanReviewRequired
      )
  };
}

export function validatePublishPackage(
  publishPackage
) {
  const reasons = [];

  if (!publishPackage?.videoPath) {
    reasons.push(
      'Video path is missing.'
    );
  }

  if (!publishPackage?.title) {
    reasons.push(
      'Title is missing.'
    );
  }

  if (
    publishPackage?.humanReviewRequired
  ) {
    reasons.push(
      'Human review is required before upload.'
    );
  }

  if (
    publishPackage?.approvalStatus !==
    'AUTO_APPROVED'
  ) {
    reasons.push(
      'Upload approval has not been granted.'
    );
  }

  return {
    valid:
      reasons.length === 0,

    reasons
  };
}

export default {
  buildPublishPackage,
  validatePublishPackage
};
