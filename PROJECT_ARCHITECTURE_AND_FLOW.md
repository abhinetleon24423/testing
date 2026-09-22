# Moolchandani Chat System — Sirf Flow Samjhao (No Code)

> Ye document sirf ye samjhane ke liye hai ke **chat system kaam kaise karta hai** — end to end. Koi code, koi file path, koi variable name nahi diya gaya, sirf "kya hota hai, kis order me" wala flow.

---

## 1. Sabse Pehle — Bade Picture Me Kya Hai

Teen alag-alag cheezein mil kar ye pura system banati hain:

1. **Base Admin Website** — Ye ek alag, purana system hai jaha doctor/staff/patient sabse pehle login karte hain. Yahi asli "sach" hai ke koi user hai kaun, admin hai ya patient hai.
2. **Chat App (ye wala project)** — Ye sirf chatting ka kaam karta hai. Isme apna khud ka database hai jisme sirf chat se related cheezein (rooms, messages) store hoti hain.
3. **Socket Server** — Ye ek alag chota sa program hai jo "real-time" kaam karta hai — matlab jaise hi koi message bheje, doosre banda ko turant dikh jaye, bina page refresh kiye.

In teeno ka kaam samajhna zaroori hai kyunki chat ka har action in teeno se hoke guzarta hai.

---

## 2. Login Kaise Hota Hai (Chat App Me Entry)

Yaha par ek important cheez samajhni hai: **is chat app me "real login" nahi hota.**

- Asli login **base admin website** par hota hai (username/password waghera).
- Jab koi user (doctor/staff/patient) base website par "Chat" button dabata hai, to base website ek **special secret code (token)** banata hai jisme user ka pehchaan chhupi hoti hai (encrypted form me).
- Us token ke sath user ko is chat app ke URL par bhej diya jata hai.
- Chat app us token ko "decrypt" karke (yani kholker) pata lagata hai ke ye kaun sa user hai, aur uska ek "session" bana deta hai — matlab ab is banda ko chat app pehchanne laga.
- Agar token expire ho chuka ho ya galat ho, to user ko ek "session expired" wala page dikh jata hai.

**Simple shabdon me:** Base website → "ye user hai, isko chat kholne do" wala secret pass deti hai → chat app us pass ko check karke andar aane deta hai.

Iske alawa ek **tester login** bhi hai — sirf development/testing ke liye, jisme direct is chat app me ek secret key daal kar kisi bhi role (admin/patient/staff) ka profile choose karke login kiya ja sakta hai. Ye normal users ke liye nahi hai.

---

## 3. Do Alag "Pehchaan" — User vs Chat Profile

Ye samajhna sabse zaroori hai, warna aage sab confuse lagega.

- Base website ke database me har banda ek **"User"** ya **"Patient"** hota hai (apna naam, email waghera).
- Lekin **chat system ke andar** har banda ka ek alag record banta hai jise **"Chat Profile"** kehte hain.
- Chat Profile me hota hai: naam, profile picture, role (admin/patient/staff), aur ye kis "User"/"Patient" se linked hai.

Yaani: **Chat me jo bhi hota hai (room banna, message bhejna) wo sab Chat Profile ke through hota hai, direct User ke through nahi.**

Ye link ek **background process (cron/sync job)** ke through banta hai — matlab time-time par ek automatic job chalta hai jo base website ke Users/Patients ko dekh kar unke liye Chat Profile bana deta hai (agar pehle se nahi hai to). Isi job ke through naye patients ke liye automatically ek room bhi create ho jata hai (aage section 5 me detail).

---

## 4. Chat App Kholne Par Kya Hota Hai

1. User token ke sath chat page par aata hai.
2. Chat app token decrypt karta hai, user ka Chat Profile pehchan leta hai, session set kar deta hai.
3. Browser me chat ka page load hota hai — ismein ek WhatsApp jaisa UI hai (left side rooms/conversations ki list, right side messages).
4. Page load hote hi browser (JavaScript) do kaam karta hai:
   - **Rooms ki list mangwata hai** — "is user ke kaun kaun se chat rooms hain" (jaise WhatsApp me left side chat list).
   - **Socket server se connect hota hai** — real-time connection banata hai taake naye messages turant aa sakein.

---

## 5. Room Kaise Create Hota Hai

Chat me har conversation ek **"Room"** hota hai — chahe wo 1-on-1 ho ya (future me) group ho.

Rooms banne ke do tarike hain:

### (A) Automatic — Naye Patient Ke Liye
Jab bhi koi naya patient base system me aata hai aur uska Chat Profile sync ho jata hai, ek automatic background process chalta hai jo us patient ke liye **doctor/clinic ke sath ek room bana deta hai** — taake patient chat app khole to usko already ek conversation mile, khud se room banane ki zaroorat na pade.

### (B) Manual/On-demand — 1-on-1 Chat Start Karna
Jab koi user kisi doosre se chat start karta hai:
1. System pehle check karta hai — **"in dono ke beech already koi room to nahi hai?"** (duplicate room na bane isliye).
2. Agar nahi hai, to naya room create hota hai.
3. Room create hone ke turant baad, dono logon ko us room me "member" ke tor par add kar diya jata hai (ek link table me — kaun kaunse room me hai).
4. Room ka status hota hai: **Active / Inactive / Archived** — taake purane ya band chats ko hide/archive kiya ja sake.
5. Room ke andar har member ka apna status bhi hota hai: **Active / Left / Blocked** — matlab koi member room chhod sakta hai ya block ho sakta hai bina poora room delete kiye.

**Group chat** ka structure database me already ready hai (`is_group` flag, room ka naam), lekin abhi UI/flow me sirf 1-on-1 chat use ho raha hai.

---

## 6. Message Bhejne Ka Poora Flow (Text Message)

Jab user "Send" dabata hai:

1. **Browser (Frontend):** Message ko turant ek "temporary" version ke tor par screen par dikha deta hai (taake user ko lage message turant gaya) — is temporary message ka ek chota sa internal ID hota hai jo baad me asli message se match kiya jata hai.
2. Ye message **socket server** ko bheja jata hai (real-time channel ke through), na ke seedha chat app ke database me.
3. **Socket server** message ko verify karta hai (jaise: kya ye user sach me is room ka member hai) — ye verification ke liye wapas **chat app se poochta hai** (ek background request ke through).
4. Verify hone ke baad, socket server chat app ko bolta hai: **"ye message save kar do"**.
5. Chat app message ko database me save karta hai, status **"Pending"** se shuru hoke **"Sent"** ban jata hai.
6. Chat app socket server ko confirm karta hai ke message save ho gaya.
7. Socket server ab is message ko **room ke doosre members tak forward karta hai** — agar wo online hain to unko turant milta hai.
8. Jaise hi doosre banda ka device message receive karta hai, uska status **"Delivered"** ho jata hai.
9. Jab wo banda chat khol kar message dekh leta hai, status **"Seen"** ho jata hai (screen par double-tick blue ho jata hai — WhatsApp jaisa).

**Important baat:** Ye status (Pending/Sent/Delivered/Seen/Failed) **har member ke liye alag-alag track hota hai** — matlab agar ek room me 3 log hain, to system ye jaanta hai ke kis-kis ne message dekha aur kis-kis ne nahi.

Agar user offline hai (app band hai), to us tak message turant nahi pahunch sakta — is case me system ek **push notification (FCM)** bhejta hai uske mobile par, taake usko pata chale ke naya message aaya hai. Jab wo dobara app kholta hai, chat app se **"pending messages"** mangwa liye jate hain jo miss ho gaye the.

---

## 7. File/Photo/Video Bhejne Ka Flow (Attachment)

Ye thoda alag hai text message se, kyunki files bade size ki ho sakti hain:

1. Browser file ko **chote-chote tukdo (chunks)** me tod deta hai (jaise 2MB ke pieces).
2. Har chunk ek-ek karke chat app ko bheja jata hai.
3. **Pehla chunk** aate hi chat app ek "placeholder" message aur attachment record bana deta hai (matlab jagah reserve kar leta hai, file abhi poori nahi aayi).
4. Baki chunks aate rehte hain, chat app unko jod-jod kar poori file banata hai.
5. Poori file ban jaane ke baad, wo file **cloud storage (S3)** par upload ho jati hai (ek organized folder structure me, date-wise).
6. Agar file **video** hai, to ek automatic process uska **thumbnail (chota preview image)** bhi bana deta hai.
7. Upload complete hote hi, message ka status update hota hai aur baaki logon tak forward ho jata hai (jaise text message wale flow me).
8. Screen par pehle ek "uploading..." wala temporary message dikhta hai, jo baad me asli file/image se replace ho jata hai.

---

## 8. Purane Messages Load Karna (Chat Kholte Waqt)

Jab user kisi room ko kholta hai:

1. Browser chat app se poochta hai — "is room ke messages do" (with pagination — matlab ek baar me sab nahi, thode-thode messages, jaise 20-20 karke).
2. Jaise-jaise user upar scroll karta hai (purane messages dekhne ke liye), aur messages load hote jate hain — isko **"infinite scroll"** bolte hain.
3. Messages screen par date ke hisaab se groups me dikhte hain (jaise "Today", "Yesterday", specific date).
4. Har message ke sath uska status icon bhi dikhta hai (sent/delivered/seen).

---

## 9. Notifications (Push) Ka Flow

- Jab bhi koi naya message aata hai aur receiver online nahi hai (ya app background me hai), chat app ek notification system ko bolta hai ke "in logo ko batao".
- Ye system Google/Firebase ke through mobile par push notification bhejta hai — jisme sender ka naam aur message ki jhalak hoti hai.
- iPhone/Android dono ke liye alag format hota hai, aur notification ke sath ek alert sound bhi set hoti hai.

---

## 10. Background/Automatic Processes (Cron Jobs)

In processes ka kaam hai bina kisi user ke action liye khud-ba-khud chalna (scheduled time par):

1. **User → Chat Profile Sync:** Base website ke naye users/patients ko dekh kar unke liye chat profile bana deta hai (agar nahi hai to). Role bhi set hota hai (admin/patient/staff) base website ki info se.
2. **Patient → Room Auto-create:** Naye patients ke liye automatically doctor/clinic ke sath ek chat room bana deta hai.
3. Ek aur manual/console command bhi hai jo bulk me sare profiles ko sync kar sakta hai (jab bade scale par data update karna ho).

> ⚠️ **Ek known issue hai (abhi tak fix nahi hua working code me):** Naye patients ka naam sync hote waqt kabhi-kabhi hardcoded "Dr. Moolchandani" jaisa generic naam set ho raha hai, patient ke asli naam ki jagah. Ye deploy se pehle fix hona chahiye — is baare me tumhe apni team ko batana chahiye agar abhi tak sort nahi hua.

---

## 11. Poora Flow — Ek Chitra Me (Sirf Steps)

```
1. User base website par login karta hai
        ↓
2. "Chat" par click → secret token generate hota hai
        ↓
3. Chat app token decrypt karta hai → user pehchana jata hai → session bana
        ↓
4. Chat page khulta hai → rooms list load hoti hai + socket se connect hota hai
        ↓
5. User kisi room me message likhta hai → Send dabata hai
        ↓
6. Temporary message screen par dikhta hai → socket server ko bheja jata hai
        ↓
7. Socket server verify karta hai (chat app se poochkar) → chat app database me save karta hai
        ↓
8. Status: Pending → Sent
        ↓
9. Socket server doosre room-members ko forward karta hai (agar online)
        ↓
10. Unke device par: Delivered → jab dekhte hain: Seen
        ↓
11. Agar offline the → Push Notification (FCM) mil jati hai
```

---

## 12. Yaad Rakhne Wali Simple Baatein

- **Real login** base website par hota hai, chat app sirf ek "pass" (token) ke through user ko pehchanta hai.
- Chat me har banda ka ek "Chat Profile" hota hai jo uski asli User/Patient identity se linked hota hai — chat ka sara kaam is Chat Profile ke naam se hota hai.
- **Room** = ek conversation ka container. Naye patients ke liye ye automatically ban jata hai; manual chat start karne par bhi duplicate room nahi banta, purana hi use hota hai.
- **Message bhejna** = pehle socket server ko jata hai → wahan verify hota hai → phir chat app ke database me save hota hai → phir doosre members tak forward hota hai.
- **File bhejna** = chunks me todkar bheja jata hai, cloud storage (S3) par store hota hai.
- **Status tracking** (Pending/Sent/Delivered/Seen) har member ke liye alag hoti hai, taake pata chale kisne message dekha.
- **Notifications** offline logon tak message ka pata pahunchane ke liye hain (push notification ke through).
- Kuch **background/automatic jobs** hain jo naye users ko chat me register karte hain aur naye patients ke liye rooms bana dete hain — ye sab bina kisi manual action ke, scheduled time par chalte hain.

---

*Ye document sirf flow samjhane ke liye hai, koi code ya technical implementation detail nahi diya gaya.*