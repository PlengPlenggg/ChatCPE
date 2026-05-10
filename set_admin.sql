UPDATE users
SET role = 'admin'
WHERE email = 'chatcpe36@gmail.com';

SELECT id, name, email, role
FROM users
WHERE email = 'chatcpe36@gmail.com';
