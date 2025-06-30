Here’s your cleaned-up and fully corrected `README.md` in valid **Markdown format**, ready to be used for a public GitHub repo:

---

# 🌦️ Weather Email Bot 🎵

This is a simple Node.js + Vercel-based service that sends a **daily email with 2 mood-based songs** based on the **current weather** of a given location.

Perfect for setting the vibe for your day! ☁️🎧

---

## 🚀 Features

- Fetches real-time weather data from OpenWeatherMap.
- Maps weather condition to a music mood (e.g. Rain → Calm, Clear → Energetic).
- Sends 2 hand-picked YouTube songs matching that mood.
- Scheduled to run daily (can be automated via cron/Vercel jobs).
- Works with SendGrid for email delivery.

---

## 📦 Tech Stack

- Node.js
- Vercel (serverless deployment)
- SendGrid (email API)
- OpenWeatherMap API

---

## 📸 Sample Email

> **Subject:** 🎵 Chill Playlist for Today's Clouds Weather
>
> **Body:** Includes the current weather, mood, and two curated songs.

---

## 🛠️ Setup & Installation

### 1. Clone the Repo

````bash
git clone https://github.com/your-username/weather-email-bot.git
cd weather-email-bot


### 2. Install Dependencies

```bash
npm install
````

### 3. Create a `.env` File

In the root of your project, create a file named `.env`:

```env
SENDGRID_API_KEY=your_sendgrid_api_key
WEATHER_API_KEY=your_openweathermap_api_key
FROM_EMAIL=your_verified_sendgrid_sender_email
TO_EMAIL=recipient1@example.com,recipient2@example.com
LOCATION=YourCityName
```

> ✅ Make sure `FROM_EMAIL` is **verified** in SendGrid.

### 4. Run Locally

```bash
node api/sendEmail.js
```

**Expected output:**

```bash
✅ Emails sent successfully to: recipient1@example.com, recipient2@example.com
```

---

## 🌐 Deploy to Vercel (Free Hosting)

### 1. Install Vercel CLI (optional)

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Deploy the Project

```bash
vercel
```

You’ll be prompted to:

- Link or create a new project
- Choose a scope (personal or team)
- Set up environment variables (see next step)

### 4. Add Environment Variables on Vercel

Go to your [Vercel dashboard](https://vercel.com/dashboard):

**Project → Settings → Environment Variables**

Add the following keys:

| Key              | Value                                         |
| ---------------- | --------------------------------------------- |
| SENDGRID_API_KEY | your_sendgrid_api_key                         |
| WEATHER_API_KEY  | your_openweathermap_api_key                   |
| FROM_EMAIL       | your_verified_sender_email                    |
| TO_EMAIL         | recipient1@example.com,recipient2@example.com |
| LOCATION         | e.g. Rishikesh                                |

Then **redeploy** the project.

---

## ⏰ Automate with Vercel Cron (Optional)

Make it run daily using Vercel’s Cron Jobs:

1. Go to **Vercel → Project → Cron Jobs**
2. Add a new cron job:

```text
Path: /api/sendEmail
Schedule: 0 7 * * *   # Every day at 7 AM UTC
```

👉 [More info on Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)

---

## 💡 Customization Ideas

- Add more moods or song links.
- Store previously sent songs in a DB to avoid repetition.
- Add support for unsubscribe links or email preferences.

---

## 🧪 Troubleshooting

- **Not receiving emails?**
  - Ensure your SendGrid sender is verified.
  - Check SendGrid's daily email limits.
- **Error: `"Cannot read properties of undefined (reading 'split')"`**
  - Make sure `.env` variables are loaded locally.
  - Set all environment variables in Vercel properly.
- Use `console.log(process.env)` to debug local environment values.

---

## 🤝 Contributing

Open to improvements! Feel free to submit a pull request or suggest more moods/songs.

---

## 📄 License

MIT

---

> Made with ☕ + 🎧 by Himanshu Haldar who loves music and clean skies.
