import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'src');

const results = [];

function pass(name, detail = '') {
  results.push({
    status: 'PASS',
    name,
    detail
  });
}

function fail(name, detail = '') {
  results.push({
    status: 'FAIL',
    name,
    detail
  });
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];

  const output = [];

  for (const entry of fs.readdirSync(dir, {
    withFileTypes: true
  })) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      output.push(...walk(full));
    } else {
      output.push(full);
    }
  }

  return output;
}

function relative(file) {
  return path.relative(ROOT, file).replaceAll('\\', '/');
}

async function checkSyntax(files) {
  for (const file of files) {
    if (!/\.(mjs|js|cjs)$/.test(file)) continue;

    try {
      execFileSync(
        process.execPath,
        ['--check', file],
        {
          stdio: 'pipe'
        }
      );

      pass(
        `Syntax: ${relative(file)}`
      );
    } catch (error) {
      fail(
        `Syntax: ${relative(file)}`,
        error.stderr?.toString() ||
        error.message
      );
    }
  }
}

async function checkImports(files) {
  for (const file of files) {
    if (!/\.(mjs|js)$/.test(file)) continue;

    try {
      await import(
        pathToFileURL(file).href
      );

      pass(
        `Import: ${relative(file)}`
      );
    } catch (error) {
      fail(
        `Import: ${relative(file)}`,
        error.message
      );
    }
  }
}

function checkRequiredFiles(files) {
  const required = [
    'src/orchestrator.mjs',
    'src/store.mjs',
    'src/config/index.mjs',
    'src/modules/scriptEngine.mjs',
    'src/modules/visualEngine.mjs',
    'src/modules/voiceEngine.mjs',
    'src/modules/renderEngine.mjs',
    'src/modules/storyDirector.mjs',
    'src/modules/sceneDirector.mjs',
    'src/modules/promptDirector.mjs',
    'src/modules/storyQuality.mjs',
    'src/modules/videoProvider.mjs',
    'src/modules/sceneRenderer.mjs',
    'src/modules/captionRenderer.mjs',
    'src/modules/audioMixer.mjs',
    'src/modules/videoQuality.mjs',
    'src/modules/audienceDirector.mjs',
    'src/modules/youtubeCompliance.mjs',
    'src/modules/nicheDirector.mjs',
    'src/modules/characterBible.mjs',
    'src/modules/trendDirector.mjs',
    'src/modules/creativeDirector.mjs',
    'src/modules/metadataDirector.mjs',
    'src/modules/sceneContinuity.mjs',
    'src/modules/publishMetadata.mjs',
    'src/modules/originalityGuard.mjs',
    'src/modules/safetyGate.mjs',
    'src/modules/approvalGate.mjs',
    'src/modules/finalRenderer.mjs',
    'src/modules/productionController.mjs'
  ];

  for (const file of required) {
    const exists = files.includes(
      path.join(ROOT, file)
    );

    if (exists) {
      pass(`Required: ${file}`);
    } else {
      fail(
        `Required: ${file}`,
        'File is missing.'
      );
    }
  }
}

function checkPackage() {
  const packageFile = path.join(
    ROOT,
    'package.json'
  );

  if (!fs.existsSync(packageFile)) {
    fail(
      'package.json',
      'package.json is missing.'
    );
    return;
  }

  try {
    const pkg = JSON.parse(
      fs.readFileSync(packageFile, 'utf8')
    );

    pass(
      'package.json',
      `${pkg.name || 'unknown'} ${pkg.version || ''}`
    );
  } catch (error) {
    fail(
      'package.json',
      error.message
    );
  }
}

function checkFFmpeg() {
  try {
    const version = execFileSync(
      'ffmpeg',
      ['-version'],
      {
        encoding: 'utf8'
      }
    );

    pass(
      'FFmpeg',
      version.split('\n')[0]
    );
  } catch {
    fail(
      'FFmpeg',
      'FFmpeg is not installed or unavailable.'
    );
  }
}

function printReport(files) {
  const passed = results.filter(
    item => item.status === 'PASS'
  ).length;

  const failed = results.filter(
    item => item.status === 'FAIL'
  ).length;

  console.log('\n');
  console.log('==========================================');
  console.log(' ZEESHAN AI LABS - PROJECT DEEP TEST');
  console.log('==========================================');

  console.log(`\nTotal source files found: ${files.length}`);
  console.log(`PASS: ${passed}`);
  console.log(`FAIL: ${failed}`);

  console.log('\n------------------------------------------');
  console.log('RESULTS');
  console.log('------------------------------------------');

  for (const item of results) {
    const icon =
      item.status === 'PASS'
        ? '🟢'
        : '🔴';

    console.log(
      `${icon} ${item.name}`
    );

    if (item.detail) {
      console.log(
        `   ${item.detail}`
      );
    }
  }

  console.log('\n==========================================');

  if (failed === 0) {
    console.log(
      '🟢 ALL CURRENT TESTS PASSED'
    );
  } else {
    console.log(
      '🔴 PROJECT HAS ISSUES TO FIX'
    );
  }

  console.log('==========================================\n');

  process.exitCode =
    failed > 0 ? 1 : 0;
}

async function main() {
  const files = walk(SRC);

  checkPackage();
  checkRequiredFiles(files);
  checkFFmpeg();

  await checkSyntax(files);
  await checkImports(files);

  printReport(files);
}

main().catch(error => {
  console.error(
    '\n🔴 TEST RUNNER ERROR:',
    error
  );

  process.exitCode = 1;
});
