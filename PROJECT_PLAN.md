# Ghost Chat - Technical Specification & Development Plan

## Project Overview

Ghost Chat is a privacy-focused anonymous messaging platform.

The application must not require:

* Email
* Phone number
* Username
* Password
* Social login

The application should use:

* Device-based identity
* Secret code authentication
* End-to-end encrypted messaging (future phase)
* Audio calling (future phase)
* Video calling (future phase)

The goal is to provide a secure communication platform while collecting the minimum amount of user information possible.

---

# Core Principles

## Privacy First

The system should never collect:

* Name
* Email
* Phone Number
* Address
* Date of Birth
* Contacts
* Social Profiles

## Minimal Data Storage

The system may store:

* Device ID
* Secret Code Hash
* Public Encryption Key
* Encrypted Messages
* Message Metadata

The system should never store:

* Plaintext Secret Codes
* Private Encryption Keys
* Unencrypted Messages

---

# Technology Stack

## Frontend

* Next.js (App Router)
* TypeScript
* Tailwind CSS

## Backend Services

* Supabase PostgreSQL
* Supabase Realtime
* Supabase Storage
* Supabase Edge Functions

## Hosting

* Vercel

## Future Technologies

### Encryption

* Web Crypto API

### Calling

* WebRTC
* Google STUN Servers

---

# High-Level Architecture

Browser
↓
Next.js Frontend
↓
Supabase Realtime
↓
PostgreSQL

For Calls:

User A
↓
Supabase Signaling
↓
User B

After Signaling:

User A ←→ User B
(WebRTC Peer Connection)

---

# Development Roadmap

## Phase 1 - Foundation

Goal:

Build a fully functional anonymous chat application.

Features:

* Device Registration
* Secret Code Creation
* Secret Code Verification
* Chat History
* Real-Time Messaging

Deliverable:

Users can create identities and chat with each other.

---

## Phase 2 - Security

Features:

* AES Encryption
* Public/Private Keys
* Secure Message Storage

Deliverable:

Messages are encrypted before reaching the database.

---

## Phase 3 - Communication

Features:

* Voice Calls
* Video Calls
* WebRTC Signaling

Deliverable:

Users can place audio and video calls.

---

## Phase 4 - Advanced Features

Features:

* Group Chats
* File Sharing
* Voice Notes
* Read Receipts
* Typing Indicators
* Presence Detection

---

# Database Design

## devices

Purpose:

Stores anonymous device identities.

Columns:

id UUID PRIMARY KEY

secret_hash TEXT NOT NULL

created_at TIMESTAMP DEFAULT NOW()

public_key TEXT NULL

last_seen TIMESTAMP NULL

---

## messages

Purpose:

Stores messages.

Columns:

id BIGINT PRIMARY KEY

sender_id UUID NOT NULL

receiver_id UUID NOT NULL

content TEXT NOT NULL

created_at TIMESTAMP DEFAULT NOW()

---

## conversations

Purpose:

Tracks relationships between users.

Columns:

id UUID PRIMARY KEY

participant_one UUID

participant_two UUID

created_at TIMESTAMP

---

# Authentication Design

## Registration

First Visit:

1. Generate UUID
2. User creates secret code
3. Secret code is hashed
4. Store UUID locally
5. Save UUID and hash in database

Store locally:

deviceId

Store in database:

deviceId

secretHash

createdAt

---

## Login

1. Read local device ID
2. Ask for secret code
3. Hash entered secret code
4. Compare against stored hash
5. Grant access if valid

---

# Local Storage Design

Keys:

deviceId

Example:

550e8400-e29b-41d4-a716-446655440000

Future:

publicKey

privateKey

---

# Realtime Messaging Design

## Sending

User A
↓
Insert message
↓
Supabase Database
↓
Supabase Realtime Event
↓
User B receives update

## Receiving

Subscribe to:

messages table

Filter:

receiver_id == current user

---

# Folder Structure

src/

app/

components/

chat/

auth/

layout/

lib/

supabase.ts

crypto.ts

hooks/

types/

utils/

services/

messages/

devices/

public/

---

# UI Pages

## Landing Page

Route:

/

Features:

* Create Device
* Enter Secret Code
* Continue

---

## Login Page

Route:

/login

Features:

* Enter Secret Code
* Verify

---

## Dashboard

Route:

/dashboard

Features:

* Device ID Display
* Copy Device ID
* Start Conversation

---

## Chat Page

Route:

/chat/[deviceId]

Features:

* Message List
* Message Input
* Send Button

---

# Security Rules

## Secret Codes

Never store plaintext.

Always hash before storage.

Use:

SHA256 initially

Future:

Argon2 or bcrypt

---

## Database Security

Enable:

Row Level Security (RLS)

Policies:

Users can only read their own messages.

Users can only send messages as themselves.

---

# Future Encryption Architecture

Phase 2 Only

On registration:

Generate:

Public Key

Private Key

Store:

Public Key → Database

Private Key → Browser Only

Message Flow:

Sender
↓
Encrypt
↓
Database Stores Ciphertext
↓
Receiver Decrypts

Server never sees plaintext.

---

# Future Audio & Video Calls

Technology:

WebRTC

Signaling:

Supabase Realtime

Media:

Peer-to-Peer

Fallback:

Google STUN Server

Example ICE Configuration:

{
iceServers: [
{
urls: "stun:stun.l.google.com:19302"
}
]
}

---

# Development Rules

1. Use TypeScript everywhere.

2. Use reusable components.

3. Keep business logic in services folder.

4. Avoid duplicate code.

5. Validate all user inputs.

6. Use environment variables for secrets.

7. Maintain strict separation of UI and logic.

8. Write production-quality code.

9. Keep files modular and maintainable.

10. Do not implement video/audio calling until messaging is stable.

---

# Immediate Tasks For Agent

Task 1

Create Supabase client configuration.

Task 2

Create database schema.

Task 3

Create registration flow.

Task 4

Create login flow.

Task 5

Create dashboard.

Task 6

Create real-time chat.

Task 7

Store chat history.

Task 8

Enable RLS policies.

Task 9

Refactor codebase for maintainability.

Task 10

Prepare architecture for future encryption and WebRTC integration.

End Goal:

A production-ready anonymous chat application with device-based identities, secret-code authentication, real-time messaging, chat history, and a foundation for encrypted communication and WebRTC calling.