const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const rows = await p.$queryRawUnsafe(
    "SELECT tablename FROM pg_tables WHERE schemaname='public' AND rowsecurity ORDER BY tablename"
  );
  console.log('RLS tables:', JSON.stringify(rows.map((x) => x.tablename)));
  const policyCount = await p.$queryRawUnsafe(
    "SELECT tablename, count(*)::int AS n FROM pg_policies WHERE schemaname='public' GROUP BY tablename ORDER BY tablename"
  );
  console.log('Policies:', JSON.stringify(policyCount));
  await p.$disconnect();
})().catch((e) => { console.error('ERR', e.message); process.exit(1); });
