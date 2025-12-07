🟣 SOULBOX — Digital Time Capsule Platform
<div align="center"> <img src="https://readme-typing-svg.herokuapp.com?size=30&duration=3500&color=9F6BFF&center=true&vCenter=true&lines=Preserve+Your+Memories+%F0%9F%8C%9F;Unlock+Them+in+the+Future+%F0%9F%94%90;A+Journey+Through+Time+%E2%9C%A8;SoulBox+by+SNAPDG+%F0%9F%8C%88" />
<img height="300" src="https://i.imgur.com/UtGQkMG.gif" />
🚀 A place where emotions sleep in time… and wake with love 💜






</div>
🌑 Dark Futuristic Theme

SoulBox is designed with a cosmic purple-dream aesthetic, creating an atmosphere where memories feel magical and timeless.

✨ What is SoulBox?

A futuristic digital time-capsule system that allows you to store memories, lock them, and unlock them later using a secret key.

Features That Make SoulBox Special 💜

✔ Create a future-timed memory capsule
✔ Add images, videos, audio
✔ Auto state management: Active → Ready → Unlocked
✔ Unlock with secret key
✔ Email notifications & reminders
✔ Beautiful downloadable certificate (Puppeteer-rendered)
✔ Timeline UI
✔ Full responsive design
✔ Shareable capsule links
✔ Works on phone, desktop & tablet

🌌 Tech Stack
<div align="center">
Frontend	Backend	Database	Tools
⚛️ React	🟩 Node.js	🗄️ MySQL	🖼️ HTML2Canvas
🔀 React Router	🚏 Express	🔐 JWT	📄 jsPDF
🎨 CSS Gradient UI	🤖 Puppeteer		📧 Nodemailer
</div>
🖥️ Preview Screenshots
🌌 Dark Futuristic Certificate
<img src="https://i.imgur.com/F2FMa4O.jpeg" width="800">
🔐 Unlock Page
<img src="https://i.imgur.com/z4tHMoX.jpeg" width="800">
🕒 Timeline View
<img src="https://i.imgur.com/cyQqCsM.png" width="800">
📦 Installation
1️⃣ Clone the Repo
git clone https://github.com/YOUR-USERNAME/soulbox.git
cd soulbox

⚙️ Backend Setup
cd backend
npm install


Create .env:

PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=yourpassword
DB_NAME=soulbox

JWT_SECRET=your_secret
BASE_URL=http://localhost:3000

EMAIL_USER=your@gmail.com
EMAIL_PASS=yourAppPassword


Start server:

node server.js

🎨 Frontend Setup
cd frontend
npm install


Create .env:

REACT_APP_API_URL=http://localhost:5000/api


Start:

npm start

🧾 API Structure
/api/auth           - Login, Signup
/api/capsule        - Create, Unlock, Status, Delete
/api/certificate    - Generate & Download PDF certificate

🪄 Interactive Features
<details> <summary>🎁 Capsule Creation</summary> <br> Create a digital memory containing text, media and a future unlock date. </details> <details> <summary>🔒 Unlocking Logic</summary> <br> Capsules unlock only after the time is reached AND correct secret key is entered. </details> <details> <summary>📬 Email System</summary> <br> Automatic email reminders using cron jobs. </details> <details> <summary>🧾 Certificate Generation</summary> <br> High-quality gradient PDF using Puppeteer. </details>
🧡 Support the Project

If you like SoulBox, please support by giving a ⭐ on GitHub!
It motivates and inspires more awesome updates.

<div align="center">
⭐ Star the Repo & Become a Part of SoulBox Journey
<img src="https://i.imgur.com/BBQw8Hf.gif" width="300"> </div>
📝 License

MIT License © 2025 – SNAPDG Team