// api/sendEmail.js
const sgMail = require('@sendgrid/mail');
const fetch = require('node-fetch');

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
    "https://www.youtube.com/watch?v=VdyBtGaspss",
    "https://www.youtube.com/watch?v=GtPvCa3vvxA",
    "https://www.youtube.com/watch?v=_iktURk0X-A"
  ],
  Chill: [
    "https://www.youtube.com/watch?v=sXdG1SbRd3A&list=RDEMa_EYmHyXjUx2YUwQ3j4-UQ&start_radio=1&rv=1sRaLqtHXQU",
    "https://www.youtube.com/watch?v=UlWAjd9bcKw&list=RDEMa_EYmHyXjUx2YUwQ3j4-UQ&index=10",
    "https://www.youtube.com/watch?v=9SE6B0h-4-Q&list=RDEMa_EYmHyXjUx2YUwQ3j4-UQ&index=22",
    "https://www.youtube.com/watch?v=rS4G5az-MKA",
    "https://www.youtube.com/watch?v=oMesPehN_Do",
    "https://www.youtube.com/watch?v=ThPinA3THas"
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


  ],
  "Lo-fi": [
    "https://www.youtube.com/watch?v=0pOq8ag0Z0Y&list=RDbw9x-OtqLDg&index=28",
    "https://www.youtube.com/watch?v=b5ilHrVoVCU",
    "https://www.youtube.com/watch?v=YIucrdfR6rI",
    "https://www.youtube.com/watch?v=_s3iubAXihM",
    "https://www.youtube.com/watch?v=NeXbmEnpSz0",

  ],
  Soft: [
    "https://www.youtube.com/watch?v=bw9x-OtqLDg&list=RDbw9x-OtqLDg&start_radio=1",
    "https://www.youtube.com/watch?v=ThPinA3THas",
    "https://www.youtube.com/watch?v=OXkD2izG7nI",
  ],
};

// Memory cache to avoid repeating songs (optional, resets on each deployment)
const lastSent = {};

function getRandomSongs(mood) {
  const allSongs = moodToSongs[mood] || moodToSongs["Chill"];
  const prev = lastSent[mood] || [];

  const available = allSongs.filter(song => !prev.includes(song));
  const shuffled = (available.length > 0 ? available : allSongs)
    .sort(() => 0.5 - Math.random());

  const selected = shuffled.slice(0, Math.min(15, shuffled.length));
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

    const songListHTML = songLinks.map((link, i) => `<li><a href="${link}">Song ${i + 1}</a></li>`).join("");

    const htmlBody = `
      <h3>Good Morning! 🌤️</h3>
      <p>Today's weather in <strong>${process.env.LOCATION}</strong> is <strong>${weatherType}</strong>.<br>
      So here's a <strong>${mood}</strong> playlist for you:</p>
      <ul>${songListHTML}</ul>
      <p>Enjoy your day! 🎵</p>
    `;

    const recipients = process.env.TO_EMAILS.split(',').map(email => email.trim());

    const messages = recipients.map(email => ({
      to: email,
      from: process.env.FROM_EMAIL,
      subject: `🎵 ${mood} Playlist for Today's ${weatherType} Weather`,
      html: htmlBody
    }));

    await sgMail.send(messages, true); // true for multiple recipients
    console.log("✅ Emails sent successfully to:", recipients.join(', '));

    res.status(200).json({ success: true, recipients, mood, weatherType });
  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};
