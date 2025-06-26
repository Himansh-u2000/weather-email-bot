// api/sendEmail.js
require('dotenv').config();
const sgMail = require('@sendgrid/mail');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const emailTemplate = fs.readFileSync(path.join(__dirname, 'emailTemplate.html'), 'utf8');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const weatherToMood = {
  Rain: "Calm",
  Drizzle: "Soft",
  Thunderstorm: "Lo-fi",
  Clear: "Energetic",
  Clouds: "Chill",
  Haze: "Lo-fi",
  Smoke: "Soft"
};

const moodToSongs = {
  Calm: [
    "https://www.youtube.com/watch?v=1sRaLqtHXQU",
    "https://www.youtube.com/watch?v=wejaREXePtg",
    "https://www.youtube.com/watch?v=BNfAf4To73c",
    "https://www.youtube.com/watch?v=pVwIiRGFEXc",
    "https://www.youtube.com/watch?v=YWmKdKig_Pc",
    "https://www.youtube.com/watch?v=4HRC6c5-2lQ",
    "https://www.youtube.com/watch?v=KVh4KtUSW3A",
    "https://www.youtube.com/watch?v=VdyBtGaspss",
    "https://www.youtube.com/watch?v=GtPvCa3vvxA",
    "https://www.youtube.com/watch?v=_iktURk0X-A",
    "https://www.youtube.com/watch?v=sVRwZEkXepg",
  ],
  Chill: [
    "https://www.youtube.com/watch?v=sXdG1SbRd3A",
    "https://www.youtube.com/watch?v=UlWAjd9bcKw",
    "https://www.youtube.com/watch?v=9SE6B0h-4-Q",
    "https://www.youtube.com/watch?v=rS4G5az-MKA",
    "https://www.youtube.com/watch?v=oMesPehN_Do",
    "https://www.youtube.com/watch?v=ThPinA3THas",
    "https://www.youtube.com/watch?v=2ltGXfmI6mk"
  ],
  Energetic: [
    "https://www.youtube.com/watch?v=ruEQPQX90fI",
    "https://www.youtube.com/watch?v=yWjElYXgviM",
    "https://www.youtube.com/watch?v=vJQMhj6WYZA",
    "https://www.youtube.com/watch?v=B9_nql5xBFo",
    "https://www.youtube.com/watch?v=oAVhUAaVCVQ",
    "https://www.youtube.com/watch?v=j9cQ8FFGkxw",
    "https://www.youtube.com/watch?v=yDv0WSgXJVg",
    "https://www.youtube.com/watch?v=JlgkMXex2DI",
    "https://www.youtube.com/watch?v=zwsc1rVdPxA",
    "https://www.youtube.com/watch?v=hoNb6HuNmU0",
    "https://www.youtube.com/watch?v=BBAyRBTfsOU"


  ],
  "Lo-fi": [
    "https://www.youtube.com/watch?v=0pOq8ag0Z0Y",
    "https://www.youtube.com/watch?v=b5ilHrVoVCU",
    "https://www.youtube.com/watch?v=YIucrdfR6rI",
    "https://www.youtube.com/watch?v=_s3iubAXihM",
    "https://www.youtube.com/watch?v=NeXbmEnpSz0",

  ],
  Soft: [
    "https://www.youtube.com/watch?v=bw9x-OtqLDg",
    "https://www.youtube.com/watch?v=ThPinA3THas",
    "https://www.youtube.com/watch?v=OXkD2izG7nI",
  ],
};

// Memory cache to avoid repeating songs (optional, resets on each deployment)

// console.log("SENDGRID_API_KEY starts with:", process.env.SENDGRID_API_KEY?.slice(0, 5));
console.log("TO_EMAILS:", process.env.TO_EMAILS);


const lastSent = {};

function getRandomSongs(mood) {
  const allSongs = moodToSongs[mood] || moodToSongs["Chill"];
  const prev = lastSent[mood] || [];

  const available = allSongs.filter(song => !prev.includes(song));
  const shuffled = (available.length > 0 ? available : allSongs)
    .sort(() => 0.5 - Math.random());

  // const selected = shuffled.slice(0, Math.min(15, shuffled.length));
  const selected = shuffled.slice(0, 2); // send exactly 2 songs

  lastSent[mood] = selected;
  return selected;
}

async function getWeather(location, apiKey) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.cod !== 200) throw new Error(`Weather API error: ${data.message}`);
  return data.weather[0].main; // e.g., 'Rain', 'Clear'
}

module.exports = async (req, res) => {
  try {
    const weatherType = await getWeather(process.env.LOCATION, process.env.WEATHER_API_KEY);
    const mood = weatherToMood[weatherType] || "Chill";
    const songLinks = getRandomSongs(mood);

    // Get individual song recommendations
    const songRecommendation1 = songLinks[0] ? `<a href="${songLinks[0]}">Song 1</a>` : "No song available";
    const songRecommendation2 = songLinks[1] ? `<a href="${songLinks[1]}">Song 2</a>` : "No song available";

    // Replace template variables
    let htmlBody = emailTemplate
      .replace(/\$\{process\.env\.LOCATION\}/g, process.env.LOCATION)
      .replace(/\$\{weatherType\}/g, weatherType)
      .replace(/\$\{songRecommendation1\}/g, songRecommendation1)
      .replace(/\$\{songRecommendation2\}/g, songRecommendation2);

    const recipients = process.env.TO_EMAILS.split(',').map(email => email.trim());

    const messages = recipients.map(email => ({
      to: email,
      from: process.env.FROM_EMAIL,
      subject: `🎵 ${mood} Playlist for Today's ${weatherType} Weather`,
      html: htmlBody
    }));

    // await sgMail.send(messages, true); // true for multiple recipients
    for (const message of messages) {
      await sgMail.send({
        ...message,
        trackingSettings: {
          clickTracking: { enable: false, enableText: false }
        }
      });
    }


    console.log("✅ Emails sent successfully to:", recipients.join(', '));

    res.status(200).json({ success: true, recipients, mood, weatherType });
  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};


// If running from CLI (node api/sendEmail.js), simulate req/res
if (require.main === module) {
  module.exports(
    {}, // dummy req
    {
      status: (code) => ({
        json: (data) => console.log(`Response ${code}:`, data)
      })
    }
  );
}
