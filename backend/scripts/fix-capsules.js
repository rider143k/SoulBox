// /backend/scripts/fix-capsules.js
const dotenv = require('dotenv');
dotenv.config();

// Use the same connection as your main app
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'rajkumar1234@',
  database: process.env.DB_NAME || 'soulbox',
  timezone: "+05:30"
});

async function fixAutoUnlockedCapsules() {
  return new Promise((resolve, reject) => {
    console.log('🔧 Checking for auto-unlocked capsules...\n');
    
    // 1. First, show what will be fixed
    const checkQuery = `
      SELECT 
        id, 
        user_id,
        title, 
        DATE_FORMAT(unlock_date, '%Y-%m-%d') as unlock_date, 
        TIME_FORMAT(unlock_time, '%H:%i:%s') as unlock_time, 
        DATE_FORMAT(unlocked_at, '%Y-%m-%d %H:%i:%s') as unlocked_at,
        is_unlocked,
        TIMESTAMPDIFF(SECOND, 
          CONCAT(unlock_date, ' ', unlock_time), 
          unlocked_at
        ) as time_diff_seconds
      FROM capsules 
      WHERE is_unlocked = 1 
        AND unlocked_at IS NOT NULL
        AND ABS(TIMESTAMPDIFF(SECOND, 
              CONCAT(unlock_date, ' ', unlock_time), 
              unlocked_at)) < 300
      ORDER BY id DESC
    `;
    
    connection.query(checkQuery, (err, rows) => {
      if (err) {
        console.error('❌ Database error:', err.message);
        connection.end();
        return reject(err);
      }
      
      console.log(`📊 Found ${rows.length} suspicious auto-unlocked capsules\n`);
      
      if (rows.length === 0) {
        console.log('✅ No auto-unlocked capsules found. Everything looks good!');
        connection.end();
        return resolve();
      }
      
      // Display the capsules
      console.log('📋 Capsules to be fixed:');
      console.log('='.repeat(60));
      rows.forEach((capsule, index) => {
        console.log(`${index + 1}. ID: ${capsule.id} - "${capsule.title}"`);
        console.log(`   User: ${capsule.user_id} | Unlock: ${capsule.unlock_date} ${capsule.unlock_time}`);
        console.log(`   Auto-unlocked at: ${capsule.unlocked_at}`);
        console.log(`   Time difference: ${capsule.time_diff_seconds} seconds`);
        console.log('');
      });
      console.log('='.repeat(60));
      
      // Ask for confirmation
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      readline.question(`\n⚠️  Do you want to fix these ${rows.length} capsules? (y/n): `, (answer) => {
        readline.close();
        
        if (answer.toLowerCase() !== 'y') {
          console.log('❌ Operation cancelled.');
          connection.end();
          return resolve();
        }
        
        console.log('\n🔄 Fixing capsules...');
        
        // 2. Fix the auto-unlocked capsules
        const fixQuery = `
          UPDATE capsules 
          SET is_unlocked = 0, unlocked_at = NULL 
          WHERE is_unlocked = 1 
            AND unlocked_at IS NOT NULL
            AND ABS(TIMESTAMPDIFF(SECOND, 
                  CONCAT(unlock_date, ' ', unlock_time), 
                  unlocked_at)) < 300
        `;
        
        connection.query(fixQuery, (err, result) => {
          if (err) {
            console.error('❌ Error fixing capsules:', err.message);
            connection.end();
            return reject(err);
          }
          
          console.log(`✅ Successfully fixed ${result.affectedRows} capsules`);
          
          // 3. Also fix any other inconsistent capsules
          const fixInconsistentQuery = `
            UPDATE capsules 
            SET is_unlocked = 0 
            WHERE is_unlocked = 1 AND unlocked_at IS NULL
          `;
          
          connection.query(fixInconsistentQuery, (err, result2) => {
            if (err) {
              console.error('❌ Error fixing inconsistent capsules:', err.message);
              connection.end();
              return reject(err);
            }
            
            if (result2.affectedRows > 0) {
              console.log(`✅ Also fixed ${result2.affectedRows} inconsistent capsules`);
            }
            
            // 4. Show summary
            console.log('\n📈 Summary:');
            console.log(`   Total capsules fixed: ${result.affectedRows + result2.affectedRows}`);
            console.log(`   - Auto-unlocked: ${result.affectedRows}`);
            console.log(`   - Inconsistent: ${result2.affectedRows}`);
            
            console.log('\n🎉 Fix completed successfully!');
            console.log('\n💡 Next steps:');
            console.log('   1. Restart your backend server');
            console.log('   2. Refresh your dashboard page');
            console.log('   3. Capsules will now stay in "READY" section until code is entered');
            
            connection.end();
            resolve();
          });
        });
      });
    });
  });
}

// Run the script
fixAutoUnlockedCapsules()
  .then(() => {
    console.log('\n✨ Script finished. Press Ctrl+C to exit.');
    // Don't auto-exit, let user see the results
  })
  .catch(err => {
    console.error('💥 Script failed:', err.message);
    process.exit(1);
  });