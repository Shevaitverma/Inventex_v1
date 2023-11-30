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
If register user exists
* ![image](https://github.com/Shevaitverma/Inventex_v1/assets/54855567/bd768865-6c6b-44bb-b2b4-3bada21a5930)
* ![image](https://github.com/Shevaitverma/Inventex_v1/assets/54855567/733f7be0-fdb0-4dd3-a256-48e418f9c2e1)
# 
For login user
* ![image](https://github.com/Shevaitverma/Inventex_v1/assets/54855567/9d396d4f-e440-4b29-8192-18809ddbb9b5)
#
logout user
* ![image](https://github.com/Shevaitverma/Inventex_v1/assets/54855567/d567728e-f26a-499f-80db-c92a92425f47)
#
update user
* ![image](https://github.com/Shevaitverma/Inventex_v1/assets/54855567/0a62fd1e-6da0-46f7-80ad-4a951086d6bb)
#
get user data
* ![image](https://github.com/Shevaitverma/Inventex_v1/assets/54855567/d8724905-ebfd-4e31-8014-4b28eed7aff6)


