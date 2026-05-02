#!/bin/bash
TOKEN='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjUsImV4cCI6MTcxMzE1OTA3MH0.test'
echo  Testing /auth/users endpoint:
curl -s http://localhost:8000/auth/users -H Authorization: Bearer  | jq . 2>/dev/null ; echo 'Failed to call API'
echo 
echo Testing /auth/profile endpoint:
curl -s http://localhost:8000/auth/profile -H Authorization: Bearer  | jq . 2>/dev/null ; echo 'Failed to call API'
