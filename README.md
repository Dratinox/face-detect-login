Face detection login:
The API works by calling Azure cognitive services face detection and stores user's faceId for later verification during authentication.

*********************************************************************************************
To try out:
Send POST request to /api/user

body:
- email:string
- password:string
- faceImage:string <--- Base64 String represenation of image

Returns JWT authentication token:
- {token: string}

*********************************************************************************************
After registration you can login via POST to /api/auth:

You can login with email:password or email:faceImage

body:
- email:string
- password:string (optional)
- faceImage:string (optional) <--- Base64 String represenation of image

Returns JWT authentication token:
- {token: string}

*********************************************************************************************
To test authentication:
Send GET request with header "x-auth-token" containing the JWT token

Returns user info

