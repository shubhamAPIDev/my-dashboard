# Task backups

`tasks-latest.json` is an automatic daily snapshot of every task in the
Supabase database, written by [`scripts/backup-tasks.mjs`](../scripts/backup-tasks.mjs)
and committed by the [backup-keepalive](../.github/workflows/backup-keepalive.yml)
GitHub Action.

Two jobs in one:

- **Backup** — a full JSON copy of your tasks lands here every day, so git
  history is a time machine you can restore from if anything goes wrong.
- **Keep-alive** — reading the database each day counts as activity, which
  stops the free-tier Supabase project from auto-pausing after ~7 days idle.

To back up manually at any time:

```bash
node --env-file=.env.local scripts/backup-tasks.mjs
```
