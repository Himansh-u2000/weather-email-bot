const fetch = require('node-fetch');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

function getRandomVideos(videos, count) {
  const shuffled = [...videos].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

module.exports = async (req, res) => {
  const location = process.env.LOCATION || 'London';
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${process.env.WEATHER_API_KEY}&units=metric`;

  try {
    const response = await fetch(weatherUrl);
    const data = await response.json();
    const condition = data.weather[0].main.toLowerCase();

    const playlists = {
      rain: [
        'https://youtu.be/song1', 'https://youtu.be/song2', 'https://youtu.be/song3',
        'https://youtu.be/song4', 'https://youtu.be/song5', 'https://youtu.be/song6'
      ],
      clear: [
        'https://youtu.be/song7', 'https://youtu.be/song8', 'https://youtu.be/song9',
        'https://youtu.be/song10', 'https://youtu.be/song11', 'https://youtu.be/song12'
      ],
      snow: [
        'https://youtu.be/song13', 'https://youtu.be/song14', 'https://youtu.be/song15',
        'https://youtu.be/song16', 'https://youtu.be/song17'
      ],
      clouds: [
        'https://youtu.be/song18', 'https://youtu.be/song19', 'https://youtu.be/song20',
        'https://youtu.be/song21', 'https://youtu.be/song22'
      ],
      default: [
        'https://youtu.be/default1', 'https://youtu.be/default2'
      ]
    };

    const weatherKey = playlists[condition] ? condition : 'default';
    const selectedVideos = getRandomVideos(playlists[weatherKey], 1); // Pick 1 random songs

    const videoList = selectedVideos.map((url, idx) => `${idx + 1}. ${url}`).join('\n');

    const msg = {
      to: process.env.TO_EMAIL,
      from: process.env.FROM_EMAIL,
      subject: `Today's Weather in ${location}: ${condition}`,
      text: `Hello!\n\nThe weather today in ${location} is "${condition}".\nHere are some songs for you:\n\n${videoList}`
    };

    await sgMail.send(msg);
    res.status(200).send('Email sent with songs.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error sending email.');
  }
};
