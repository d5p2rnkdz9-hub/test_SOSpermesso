#!/usr/bin/env npx tsx
/**
 * Walks the IT tree data + Notion permit data and dumps every translatable
 * string to translations/source/it.json — one stable ID per string.
 *
 * Run: npx tsx scripts/extract-it-strings.ts
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

import { italianTree } from '../src/lib/tree-data';
import { conversioneTree } from '../src/lib/conversione-tree';
import { rinnovoConversioneTree } from '../src/lib/rinnovo-conversione-tree';
import { rinnovoPermits } from '../src/lib/rinnovo-notion-data.generated';
import type { TreeData } from '../src/types/tree';

const OUTPUT_PATH = join(__dirname, '..', 'translations', 'source', 'it.json');

type StringMap = Record<string, string>;

function addIfPresent(map: StringMap, id: string, value: string | undefined | null) {
  if (value && value.trim().length > 0) {
    map[id] = value;
  }
}

function extractTree(map: StringMap, treeName: string, tree: TreeData) {
  for (const [nodeId, node] of Object.entries(tree.nodes)) {
    addIfPresent(map, `tree:${treeName}:${nodeId}:question`, node.question);
    addIfPresent(map, `tree:${treeName}:${nodeId}:description`, node.description);
    addIfPresent(map, `tree:${treeName}:${nodeId}:title`, node.title);
    addIfPresent(map, `tree:${treeName}:${nodeId}:introText`, node.introText);
    if (node.sections) {
      node.sections.forEach((s, idx) => {
        addIfPresent(map, `tree:${treeName}:${nodeId}:section:${idx}:heading`, s.heading);
        addIfPresent(map, `tree:${treeName}:${nodeId}:section:${idx}:content`, s.content);
      });
    }
  }
  for (const edge of tree.edges) {
    addIfPresent(
      map,
      `tree:${treeName}:edge:${edge.from}:${edge.optionKey}:label`,
      edge.label,
    );
    addIfPresent(
      map,
      `tree:${treeName}:edge:${edge.from}:${edge.optionKey}:description`,
      edge.description,
    );
  }
}

function extractNotionPermits(map: StringMap) {
  for (const permit of rinnovoPermits) {
    const k = permit.treeKey;
    addIfPresent(map, `notion:${k}:notionName`, permit.notionName);
    addIfPresent(map, `notion:${k}:duration`, permit.duration);
    addIfPresent(map, `notion:${k}:infoExtra`, permit.infoExtra);
    addIfPresent(map, `notion:${k}:possoConvertire`, permit.possoConvertire);
    if (permit.docRinnovo) {
      permit.docRinnovo.forEach((d, idx) => {
        addIfPresent(map, `notion:${k}:doc:${idx}`, d);
      });
    }
  }
}

/**
 * Hardcoded fallback strings inside rinnovo-build-result.ts and other lib files.
 * These are not in any tree node but appear at runtime.
 */
function extractStaticFallbacks(map: StringMap) {
  // From rinnovo-build-result.ts
  map['static:duration:illimitata'] =
    'Il permesso **non ha scadenza**. Ogni 10 anni deve essere aggiornato con nuove fotografie, ma il rinnovo dovrebbe essere automatico.';
  map['static:duration:template'] = 'Il permesso dura {duration}.';
  map['static:section:durata:heading'] = '⏳ Durata';
  map['static:section:documenti:heading'] = '📄 Documenti necessari';
  map['static:section:note:heading'] = '⚠️ Note importanti';
  map['static:section:docs-familiari:heading'] = '📄 Documenti aggiuntivi per familiari';
}

function main() {
  // Pass 1: ID-keyed map (preserves provenance for debugging)
  const idMap: StringMap = {};
  extractTree(idMap, 'tree-data', italianTree);
  extractTree(idMap, 'conversione', conversioneTree);
  extractTree(idMap, 'rinnovo-conversione', rinnovoConversioneTree);
  extractNotionPermits(idMap);
  extractStaticFallbacks(idMap);

  // Pass 2: dedupe by IT text → text-keyed self-map (this is the runtime lookup format)
  const textMap: StringMap = {};
  // Provenance index: which IDs share each unique IT text (helps translators add context)
  const provenance: Record<string, string[]> = {};
  for (const [id, text] of Object.entries(idMap)) {
    textMap[text] = text;
    if (!provenance[text]) provenance[text] = [];
    provenance[text].push(id);
  }

  const sourceDir = join(__dirname, '..', 'translations', 'source');
  mkdirSync(sourceDir, { recursive: true });
  // Self-map: keys are IT text, values are IT text (templates for translators to overwrite per-locale)
  writeFileSync(join(sourceDir, 'it.json'), JSON.stringify(textMap, null, 2) + '\n', 'utf-8');
  // Provenance: IT text → list of IDs (where it appears)
  writeFileSync(join(sourceDir, 'provenance.json'), JSON.stringify(provenance, null, 2) + '\n', 'utf-8');
  // ID map: full ID → IT text (debugging / traceability)
  writeFileSync(join(sourceDir, 'by-id.json'), JSON.stringify(idMap, null, 2) + '\n', 'utf-8');

  console.log(`Total ID-keyed strings: ${Object.keys(idMap).length}`);
  console.log(`Unique IT texts (after dedup): ${Object.keys(textMap).length}`);
  console.log(`Wrote: translations/source/{it.json, provenance.json, by-id.json}`);

  // Bucket count
  const buckets: Record<string, number> = {
    'tree-data': 0, conversione: 0, 'rinnovo-conversione': 0, notion: 0, static: 0,
  };
  for (const id of Object.keys(idMap)) {
    if (id.startsWith('tree:tree-data')) buckets['tree-data']++;
    else if (id.startsWith('tree:conversione')) buckets.conversione++;
    else if (id.startsWith('tree:rinnovo-conversione')) buckets['rinnovo-conversione']++;
    else if (id.startsWith('notion:')) buckets.notion++;
    else if (id.startsWith('static:')) buckets.static++;
  }
  console.log('Buckets (ID-level):', buckets);
}

main();
