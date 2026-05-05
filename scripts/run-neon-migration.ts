import { neon } from '@neondatabase/serverless';

const url = process.env.NEON_DATABASE_URL;
if (!url) { console.error('Set NEON_DATABASE_URL'); process.exit(1); }
const sql = neon(url);

async function migrate() {
  await sql`ALTER TABLE tree_sessions ADD COLUMN IF NOT EXISTS tree_type TEXT NOT NULL DEFAULT 'posso_avere'`;
  console.log('Added tree_type');

  await sql`ALTER TABLE tree_sessions ADD COLUMN IF NOT EXISTS completed BOOLEAN NOT NULL DEFAULT FALSE`;
  console.log('Added completed');

  await sql`ALTER TABLE tree_sessions ADD COLUMN IF NOT EXISTS last_node_id TEXT`;
  console.log('Added last_node_id');

  await sql`ALTER TABLE tree_sessions ADD COLUMN IF NOT EXISTS user_name TEXT`;
  console.log('Added user_name');

  await sql`ALTER TABLE tree_sessions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`;
  console.log('Added updated_at');

  await sql`UPDATE tree_sessions SET completed = TRUE, last_node_id = outcome_id, updated_at = now() WHERE completed = FALSE AND outcome_id IS NOT NULL`;
  console.log('Back-filled existing rows');

  console.log('Migration complete!');
}

migrate().catch(e => { console.error(e); process.exit(1); });
