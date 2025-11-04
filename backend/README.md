# Cloud Storage API

- Express + MongoDB + JWT auth
- Multer local storage (S3 hooks included but not wired by default)

## Env variables

Create a `.env` file with:

- `PORT=5000`
- `MONGODB_URI=mongodb://localhost:27017/cloud_storage`
- `JWT_SECRET=change_this_secret`
- `CLIENT_ORIGIN=http://localhost:5173`
- `STORAGE_DRIVER=local`
- `UPLOAD_DIR=uploads`
- For S3 (optional): `AWS_REGION`, `AWS_S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`

## Scripts

- `npm run dev` – start with nodemon
- `npm start` – start production

## API routes

- `POST /api/auth/signup` `{ name, email, password }`
- `POST /api/auth/login` `{ email, password }`
- `GET /api/auth/me`
- `GET /api/files/list?search=&folder=`
- `POST /api/files/upload` form-data: `file`, `folder`
- `GET /api/files/download/:id`
- `GET /api/files/preview/:id`
- `DELETE /api/files/:id`
- `PATCH /api/files/rename/:id` `{ name }`
- `GET /api/folders/list`
- `POST /api/folders/create` `{ name }`
- `DELETE /api/folders/:id`

