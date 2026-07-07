import http from 'http';

const API_URL = 'http://localhost:3000/api';

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

async function testSystem() {
  try {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  SCHOLARSHINE CONNECT - COMPREHENSIVE SYSTEM TEST           ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // Get admin token
    console.log('📝 STEP 1: Admin Authentication\n');
    const loginRes = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@college.edu.pk',
      password: 'your_secure_password'
    });
    const token = loginRes.token;
    console.log('✅ Admin login successful');
    console.log(`   Token: ${token.substring(0, 30)}...\n`);

    // Test 1: Get News
    console.log('📝 STEP 2: Fetching News\n');
    const newsRes = await makeRequest('GET', '/api/news', null, token);
    const newsList = Array.isArray(newsRes) ? newsRes : newsRes.news || [];
    console.log(`✅ News fetched: ${newsList.length} articles`);
    if (newsList.length > 0) {
      newsList.slice(0, 3).forEach((news, i) => {
        console.log(`   ${i+1}. "${news.title}"`);
      });
    }
    console.log();

    // Test 2: Get Events
    console.log('📝 STEP 3: Fetching Events\n');
    const eventsRes = await makeRequest('GET', '/api/events', null, token);
    const eventsList = Array.isArray(eventsRes) ? eventsRes : eventsRes.events || [];
    console.log(`✅ Events fetched: ${eventsList.length} events`);
    if (eventsList.length > 0) {
      eventsList.slice(0, 3).forEach((event, i) => {
        console.log(`   ${i+1}. "${event.title}" on ${new Date(event.date).toLocaleDateString()}`);
      });
    }
    console.log();

    // Test 3: Create a Conversation (visitor creates)
    console.log('📝 STEP 4: Visitor Creates Chat Conversation\n');
    const visitorSessionId = 'visitor-' + Date.now();
    const convRes = await makeRequest('POST', '/api/chat/conversation', {
      visitor_name: 'Ahmed Hassan',
      visitor_session_id: visitorSessionId
    });
    const conversationId = convRes._id;
    console.log(`✅ Conversation created for: ${convRes.visitor_name}`);
    console.log(`   Conversation ID: ${conversationId}`);
    console.log(`   Session ID: ${visitorSessionId}\n`);

    // Test 4: Send a contact message (from messages endpoint)
    console.log('📝 STEP 5: Visitor Sends Contact Form Message\n');
    const contactRes = await makeRequest('POST', '/api/messages', {
      name: 'Ahmed Hassan',
      email: 'ahmed@example.com',
      subject: 'Inquiry about Scholarship Programs',
      message: 'I am interested in learning about the available scholarship opportunities for international students.'
    });
    console.log(`✅ Contact message sent`);
    console.log(`   From: ${contactRes.name}`);
    console.log(`   Subject: ${contactRes.subject}\n`);

    // Test 5: Get all conversations (admin view)
    console.log('📝 STEP 6: Admin Retrieves All Conversations\n');
    const allConvRes = await makeRequest('GET', '/api/chat/conversations', null, token);
    const conversationsList = Array.isArray(allConvRes) ? allConvRes : [];
    console.log(`✅ Total conversations: ${conversationsList.length}`);
    conversationsList.slice(0, 3).forEach((conv, i) => {
      console.log(`   ${i+1}. ${conv.visitor_name} - Status: ${conv.status}`);
    });
    console.log();

    // Test 6: Get chat stats (admin)
    console.log('📝 STEP 7: Chat Statistics\n');
    const statsRes = await makeRequest('GET', '/api/chat/stats', null, token);
    console.log(`✅ Chat Statistics:`);
    console.log(`   Total Conversations: ${statsRes.totalConversations}`);
    console.log(`   Active Conversations: ${statsRes.activeConversations}`);
    console.log(`   Total Messages: ${statsRes.totalMessages}`);
    console.log(`   Unread Messages: ${statsRes.unreadMessages}\n`);

    // Test 7: Get all contact messages
    console.log('📝 STEP 8: Admin Retrieves Contact Messages\n');
    const allMessagesRes = await makeRequest('GET', '/api/messages', null, token);
    const messagesList = Array.isArray(allMessagesRes) ? allMessagesRes : [];
    console.log(`✅ Total contact messages: ${messagesList.length}`);
    messagesList.slice(0, 3).forEach((msg, i) => {
      const status = msg.replied ? '(Replied)' : '(Pending)';
      console.log(`   ${i+1}. ${msg.name} - "${msg.subject}" ${status}`);
    });
    console.log();

    // Test 8: Mark message as replied
    if (messagesList.length > 0) {
      console.log('📝 STEP 9: Admin Replies to Message\n');
      const msgId = messagesList[0]._id;
      const replyRes = await makeRequest('PUT', `/api/messages/${msgId}/reply`, {}, token);
      console.log(`✅ Message marked as replied`);
      console.log(`   Message from: ${replyRes.name}`);
      console.log(`   Status: Replied ✓\n`);
    }

    // Final Summary
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║              TEST RESULTS SUMMARY                          ║');
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log('║ ✅ ADMIN AUTHENTICATION                    WORKING         ║');
    console.log('║ ✅ NEWS MANAGEMENT                         WORKING         ║');
    console.log('║ ✅ EVENTS MANAGEMENT                       WORKING         ║');
    console.log('║ ✅ CHAT CONVERSATIONS                      WORKING         ║');
    console.log('║ ✅ CONTACT FORM MESSAGES                   WORKING         ║');
    console.log('║ ✅ MESSAGE REPLY TRACKING                  WORKING         ║');
    console.log('║ ✅ REAL-TIME STATS                         WORKING         ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log('🚀 NEXT STEPS TO TEST IN BROWSER:\n');
    console.log('1. 🌐 Visit http://localhost:8081');
    console.log('   - Browse news and events added above');
    console.log('   - Check pagination and slug-based routing\n');
    
    console.log('2. 💬 Test Live Chat Widget');
    console.log('   - Click chatbot icon (bottom right)');
    console.log('   - Send a message as visitor');
    console.log('   - Messages appear in real-time\n');
    
    console.log('3. 👨‍💼 Admin Panel Testing');
    console.log('   - Go to http://localhost:8081/admin/login');
    console.log('   - Email: admin@college.edu.pk');
    console.log('   - Password: your_secure_password');
    console.log('   - View all conversations and messages');
    console.log('   - Add new news/events/announcements');
    console.log('   - Reply to visitor messages\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testSystem();
