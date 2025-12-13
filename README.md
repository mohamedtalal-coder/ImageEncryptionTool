# Image Encryption Tool - Report

## What is this project?

A web app that lets users upload images and encrypt them using AES-256 encryption. Users set a password when uploading, and need that same password to view the image again later.

## How does it work?

1. User uploads an image and enters a name + password
2. The server encrypts the image using AES-256 algorithm
3. The encrypted image is stored in MongoDB database
4. To view the image, user enters the password
5. If password matches, the image is decrypted and displayed

## The encryption

We implemented AES-256 from scratch - no crypto libraries. It works by:
- Breaking the image into 16-byte blocks
- Running each block through 14 rounds of transformations (SubBytes, ShiftRows, MixColumns, AddRoundKey)
- Using either ECB or CBC mode

CBC is more secure because each block depends on the previous one, hiding patterns.

## Two passwords?

- **User password**: Just for access control - proves you're allowed to decrypt
- **Server key (.env)**: The actual key that encrypts/decrypts the image data

The user password is like a door lock. The server key is what actually scrambles the data.

## Tech used

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB Atlas
- Encryption: Custom AES-256 implementation

## What's missing

CFB, OFB, and CTR modes are shown in the UI but not actually implemented - they fall back to CBC.

---

*December 2025*
