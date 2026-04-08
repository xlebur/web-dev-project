#🚀 TypeRacer: Real-Time Typing Speed Application

##📌 Project Overview
TypeRacer is a dynamic, interactive web-based application designed to help users test, track, and significantly improve their typing speed and accuracy. Developed as a collaborative web development project, the platform challenges users to type randomly generated passages as quickly and accurately as possible. By providing real-time feedback and competitive modes, TypeRacer transforms typing practice from a tedious task into an engaging, gamified experience.

---

## 👥 Team Members

* Omar Urazakov 24B032086
* Bekbolat Nurislam 24B031002
* Zholdassali Amir 24B031787

---

## 🛠️ Tech Stack

* Angular
* TypeScript
* HTML / CSS
* Node.js 

---

## ⚙️ Core Features & Functionality
Primary Features (MVP):

*⌨️ Real-Time Keystroke Validation: The UI instantly highlights correct keystrokes in green and errors in red, 
preventing the user from progressing until mistakes are corrected.

*📊 Dynamic WPM Calculation: Words Per Minute (WPM) is calculated continuously as the user types, using the standard formula: (Total Characters Typed / 5) / Time in Minutes.

*🎯 Precision Accuracy Tracking: Calculates the percentage of correct keystrokes versus total keystrokes, 
penalizing for backspaces and errors to reflect true typing proficiency.

*⏱️ Timer-Based Race Mode: Users can select different time intervals (e.g., 1 minute, 3 minutes) or race to complete a specific paragraph length.


Advanced & Optional Features (Roadmap):

*🏆 Global & Local Leaderboards: Persistent storage of user high scores, allowing players to compare their best WPM and accuracy metrics against the community.

*🌐 Real-Time Multiplayer Mode: A live racing environment where users can join a "lobby" and see the real-time progress of their opponents represented as moving avatars across the screen.


## 🧠 How It Works

The User Journey
*Initialization: The user navigates to the application and selects a game mode (Practice or Race).
*Preparation: The system queries the Node.js backend to fetch a random, standardized text passage. A 3-second countdown initiates to prepare the user.
*Execution: As the user begins typing, the Angular frontend listens for keyboard events. It actively compares the input string against the target passage string index by index.
*Completion: Once the text is fully typed or the timer expires, the input field is locked.

---

