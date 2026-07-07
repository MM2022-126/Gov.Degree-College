import http from 'http';

const API_BASE = 'http://localhost:3000/api';
const ADMIN_EMAIL = 'admin@college.edu.pk';
const ADMIN_PASSWORD = 'your_secure_password';

function makeRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function main() {
  try {
    console.log('\n========== SCHOLARSHINE CONNECT - TEST DATA SETUP ==========\n');

    // Step 1: Login
    console.log('1️⃣  Logging in admin...');
    const loginRes = await makeRequest('POST', '/api/auth/login', {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    const token = loginRes.token;
    console.log('✓ Login successful\n');

    // Step 2: Add News
    console.log('2️⃣  Adding news articles...');
    const newsArticles = [
      {
        title: 'Annual Academic Excellence Awards 2026',
        excerpt: 'Celebrating outstanding achievements of our students',
        content: 'The college held its annual academic excellence awards ceremony',
        category: 'Academic',
        priority: 1,
        date: '2026-04-15'
      },
      {
        title: 'Spring Admission Portal Now Open',
        excerpt: 'Apply now for undergraduate and postgraduate programs',
        content: 'The spring admission process for 2026 has officially started',
        category: 'Admission',
        priority: 1,
        date: '2026-04-10'
      },
      {
        title: 'Library Extended Hours During Exam Season',
        excerpt: 'Additional study spaces available',
        content: 'The library will remain open until 10 PM to support students',
        category: 'Facility',
        priority: 2,
        date: '2026-04-05'
      }
    ];

    for (const news of newsArticles) {
      const result = await makeRequest('POST', '/api/news', news, token);
      console.log(`  ✓ ${result.title} (slug: ${result.slug})`);
    }
    console.log();

    // Step 3: Add Events
    console.log('3️⃣  Adding events...');
    const events = [
      {
        title: 'Annual Sports Festival 2026',
        description: 'Join us for the biggest sports event of the year',
        date: '2026-05-01',
        location: 'College Grounds',
        imageUrl: 'https://via.placeholder.com/400x300?text=Sports'
      },
      {
        title: 'Annual Convocation Ceremony',
        description: 'Graduation ceremony for all graduating students',
        date: '2026-06-15',
        location: 'Main Auditorium',
        imageUrl: 'https://via.placeholder.com/400x300?text=Convocation'
      },
      {
        title: 'Cultural Festival 2026',
        description: 'Showcase of talent and cultural diversity',
        date: '2026-05-20',
        location: 'College Grounds',
        imageUrl: 'https://via.placeholder.com/400x300?text=Cultural'
      }
    ];

    for (const event of events) {
      const result = await makeRequest('POST', '/api/events', event, token);
      console.log(`  ✓ ${result.title} (slug: ${result.slug})`);
    }
    console.log();

    // Step 4: Add Announcements
    console.log('4️⃣  Adding announcements...');
    const announcements = [
      {
        title: 'Spring Semester Registration Open',
        content: 'All students are requested to complete course registration',
        type: 'important'
      },
      {
        title: 'Campus Closure Notice',
        content: 'The campus will be closed on May 1st for maintenance',
        type: 'notice'
      }
    ];

    for (const announcement of announcements) {
      const result = await makeRequest('POST', '/api/announcements', announcement, token);
      console.log(`  ✓ ${result.title}`);
    }
    console.log();

    console.log('✅ ALL TEST DATA ADDED SUCCESSFULLY!\n');
    console.log('📋 Next steps:');
    console.log('  1. Visit http://localhost:8081 to see the homepage');
    console.log('  2. Check News and Events pages for new content');
    console.log('  3. Test the chatbot widget');
    console.log('  4. Login to admin at http://localhost:8081/admin/login');
    console.log('     Email: admin@college.edu.pk');
    console.log('     Password: your_secure_password\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
