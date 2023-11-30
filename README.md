## Inventex_v1
* It is a Login system for a inventory management system. This project is created for implementation of my current backend skills with concepts like JWT and cookies for session managemnt.
#
why we use cookies and tokens?
* Cookies and tokens are two common ways of setting up authentication. Cookies are chunks of data created by the server and sent to the client for communication purposes. 
Tokens, usually referring to JSON Web Tokens (JWTs), are signed credentials encoded into a long string of characters created by the server.
# 
* Also used encryption for secure password storage to database
* While submitting a form, there are some sensitive data (like passwords) that must not be visible to anyone, not even to the database admin. To avoid the sensitive data being visible to anyone, Node.js uses “bcryptjs”. This module enables storing passwords as hashed passwords instead of plaintext.
#
* Used "authMiddleware" as middlewalre to ensure authorized user is performing operations on it's own data by login token varification.
#
