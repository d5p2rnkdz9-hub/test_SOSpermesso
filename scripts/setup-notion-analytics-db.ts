/**
 * One-time setup: creates the required columns in the Notion analytics database.
 *
 * Usage:
 *   NOTION_API_KEY=ntn_xxx npx tsx scripts/setup-notion-analytics-db.ts
 */

const DB_ID = '32f7355e7f7f80389649f072fdec08e1';

async function main() {
  const key = process.env.NOTION_API_KEY;
  if (!key) {
    console.error('Set NOTION_API_KEY env var');
    process.exit(1);
  }

  console.log('Updating Notion database schema...');

  const res = await fetch(`https://api.notion.com/v1/databases/${DB_ID}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({
      properties: {
        'Tree Type': { select: { options: [
          { name: 'posso_avere', color: 'blue' },
          { name: 'conversione', color: 'green' },
          { name: 'rinnovo_conversione', color: 'purple' },
        ]}},
        'Outcome ID': { rich_text: {} },
        'Outcome Slug': { rich_text: {} },
        'Steps': { number: { format: 'number' } },
        'Locale': { select: { options: [
          { name: 'it', color: 'green' },
          { name: 'en', color: 'blue' },
          { name: 'ar', color: 'orange' },
          { name: 'fr', color: 'red' },
          { name: 'zh', color: 'yellow' },
        ]}},
        'Duration (min)': { number: { format: 'number' } },
        'User Name': { rich_text: {} },
        'Date': { date: {} },
        'Answers': { rich_text: {} },
        'Path': { rich_text: {} },
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    console.error('Failed:', err);
    process.exit(1);
  }

  console.log('Done! Columns created in Notion DB.');
}

main().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});
