import fs from 'fs';
import path from 'path';

function ensureDirectory(dir) {
  fs.mkdirSync(dir, {
    recursive: true
  });
}

export function createPipelineReport(
  data = {},
  options = {}
) {
  const outputDir =
    path.resolve(
      options.outputDir ||
      'output_artifacts'
    );

  ensureDirectory(outputDir);

  const report = {
    generatedAt:
      new Date().toISOString(),

    status:
      data.status || 'UNKNOWN',

    videoNumber:
      data.videoNumber || 1,

    title:
      data.title || '',

    topic:
      data.topic || '',

    story:
      data.story || null,

    scenes:
      Array.isArray(data.scenes)
        ? data.scenes
        : [],

    voice:
      data.voice || null,

    video:
      data.video || null,

    quality:
      data.quality || null,

    safety:
      data.safety || null,

    originality:
      data.originality || null,

    approval:
      data.approval || null,

    errors:
      Array.isArray(data.errors)
        ? data.errors
        : []
  };

  const reportPath =
    path.join(
      outputDir,
      `pipeline-report-${String(
        report.videoNumber
      ).padStart(2, '0')}.json`
    );

  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      report,
      null,
      2
    ),
    'utf8'
  );

  console.log(
    `[PipelineReport] Report created: ${reportPath}`
  );

  return {
    path: reportPath,
    report
  };
}

export default {
  createPipelineReport
};
