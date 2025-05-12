const https = require('https');

const token = '7729661964:AAEhTxjNOj7P3orUPv6OLzw1LG26epZ3ZPU';
const url = `https://api.telegram.org/bot${token}/getUpdates`;

https.get(url, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('Response:', JSON.stringify(response, null, 2));
      
      if (response.ok && response.result && response.result.length > 0) {
        const chatId = response.result[0].message.chat.id;
        console.log('Your chat_id is:', chatId);
      } else {
        console.log('No updates found. Please send a message to your bot first.');
      }
    } catch (e) {
      console.error('Error parsing response:', e);
    }
  });
}).on('error', (err) => {
  console.error('Error fetching updates:', err);
}); 