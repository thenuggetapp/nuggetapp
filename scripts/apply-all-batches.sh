#!/bin/bash

echo "Starting batch import process..."
echo ""

batch_dir="supabase/migrations/batches"
total_batches=$(ls -1 $batch_dir/batch_*.sql | wc -l)
success_count=0
error_count=0

echo "Found $total_batches batch files to process"
echo "======================================"
echo ""

for batch_file in $batch_dir/batch_*.sql; do
  batch_name=$(basename "$batch_file")
  echo "Processing $batch_name..."

  if node -e "
    const { createClient } = require('@supabase/supabase-js');
    const fs = require('fs');

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const sql = fs.readFileSync('$batch_file', 'utf-8');

    (async () => {
      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
        if (error) throw error;
        console.log('  ✅ Successfully imported');
        process.exit(0);
      } catch (err) {
        console.error('  ❌ Error:', err.message);
        process.exit(1);
      }
    })();
  " 2>&1; then
    ((success_count++))
  else
    ((error_count++))
  fi

  echo ""
done

echo "======================================"
echo "Import Summary:"
echo "  ✅ Successful batches: $success_count"
echo "  ❌ Failed batches: $error_count"
echo "======================================"
