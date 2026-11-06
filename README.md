# Build with Zeno

A full-stack, subscription-based platform that teaches users how to build their own browser-based software tools — replacing expensive monthly subscriptions with skills they own forever. 

**Live Demo:** [Add your Vercel Link Here]

## 🚀 The Problem & The Solution
Big tech charges users monthly fees for simple tools (note-taking, basic design, file converters) that a browser can already do for free. **Build with Zeno** solves this by providing step-by-step guides, downloadable tools, and a private community for people who want to build their own software and own it forever.

## ✨ Features

*   **Authentication Flow:** Users can sign up, log in, and securely manage their accounts.
*   **Manual Payment Verification:** A custom flow that allows users to create an account, see bank details, and submit payment proofs for manual admin approval.
*   **Protected Content:** A "My Library" section that is locked behind an active subscription.
*   **Admin Dashboard:** A private panel for the site owner to publish guides, view user feedback, read custom build requests, and approve pending payments (which automatically activates a user's subscription).
*   **Dynamic Pricing:** A pricing page with a live order summary calculator based on plan and duration.
*   **Responsive Design:** A clean, modern, and fully responsive UI built with vanilla CSS.

## 🛠️ Tech Stack

*   **Frontend:** HTML5, Vanilla JavaScript, CSS3 (Custom properties, Grid, Flexbox).
*   **Backend / Database:** Firebase (v10 Compat Mode).
    *   **Firebase Auth:** Handles email/password authentication.
    *   **Cloud Firestore:** Real-time NoSQL database for users, guides, payments, requests, and feedback.
*   **Deployment:** Vercel.

## 🔐 Security & Architecture Note

The platform uses Firebase for backend services. Firestore Security Rules are implemented to ensure:
1. Users can only read and write their own profile data.
2. Guides are public to read but only writable by the admin.
3. Payment proofs and feedback can be created by authenticated users but only read by the admin.

*(Note: The `firebaseConfig` API keys are public in the frontend code, which is standard for Firebase. Security is enforced entirely via Firestore Rules).*

## ⚙️ How to Run Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/build-with-zeno.git
