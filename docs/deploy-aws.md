# Deploying Professorrank on AWS

The app runs on **AWS Amplify Hosting**, which builds and serves Next.js from this GitHub repo. Its data lives in **Amazon RDS for PostgreSQL**. Real course and professor data comes from the Banner import, not from the sample seeds.

Before you start, create an AWS account and pick one region for everything, for example `us-east-1`.

## 1. Create the database (RDS)

1. Open **RDS → Create database** and choose **Standard create**, then **PostgreSQL**.
2. For **Templates**, choose **Free tier**. Use a `db.t4g.micro` or `db.t3.micro` instance with 20 GB of storage.
3. Set **DB instance identifier** to `professorrank` and **Master username** to `postgres`. Choose a strong password and save it.
4. Under **Connectivity**, set **Public access** to **Yes**. Amplify and your laptop both need to reach the database.
5. Under **Additional configuration**, set **Initial database name** to `professorrank`.
6. Click **Create** and wait until the status is **Available**. Then copy the **Endpoint** from the database's page.
7. Let connections in:
   - Open the database's **VPC security group** and edit the **inbound rules**.
   - Add a rule of type **PostgreSQL** (port 5432) with the source **My IP**, so your laptop can load data.
   - Add another **PostgreSQL** rule with the source `0.0.0.0/0`. Amplify's servers don't have fixed addresses, so they need this rule.
   - The strong password and SSL protect the database while it's open this way.

Your connection URL looks like this:

```
postgresql://postgres:<password>@<endpoint>:5432/professorrank?sslmode=require
```

If the password contains symbols such as `@`, `#` or `/`, percent-encode them.

## 2. Create the tables and load real data (from your Mac)

Run these in `professor/`. The university sites only answer from a normal internet connection, so run the import on your own machine.

```
export DATABASE_URL="postgresql://postgres:<password>@<endpoint>:5432/professorrank?sslmode=require"
npx prisma db push                                             # creates the tables

node scripts/import-banner.mjs --school usfq                   # lists USFQ terms
node scripts/import-banner.mjs --school usfq --term 202610     # all subjects; takes a while
node scripts/import-banner.mjs --school udla                   # lists UDLA terms
node scripts/import-banner.mjs --school udla --term <code>

npm run load-banner -- scripts/out/usfq-202610.json
npm run load-banner -- scripts/out/udla-<code>.json
```

Re-running the import and `load-banner` at the start of each semester updates courses and professors instead of duplicating them. Don't run `seed-db` or `clear-db` against this database: `clear-db` deletes everything.

## 3. Google sign-in

1. In **Google Cloud Console → APIs & Services → Credentials**, open (or create) an **OAuth client ID** of type **Web application**.
2. After step 4 gives you the Amplify URL, add it in two places:
   - **Authorized JavaScript origins:** `https://<your-amplify-domain>`
   - **Authorized redirect URIs:** `https://<your-amplify-domain>/api/auth/callback/google`
3. Keep the client ID and secret for the next step.

## 4. Deploy the app (Amplify)

1. Open **AWS Amplify → Create new app → GitHub** and authorize access to `Lucasabv123/proferankec`. Pick the `main` branch.
2. Check **My app is a monorepo** and set the root directory to `professor`. Amplify reads the build settings from `amplify.yml` in the repo.
3. Under **Advanced settings → Environment variables**, add:

| Name | Value |
| --- | --- |
| `DATABASE_URL` | the RDS URL from step 1 |
| `NEXT_AUTH_SECRET` | the output of `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://<your-amplify-domain>` (fill this in after the first deploy, then redeploy) |
| `GOOGLE_CLIENT_ID` | from step 3 |
| `GOOGLE_CLIENT_SECRET` | from step 3 |

4. Click **Save and deploy**. Every push to `main` deploys again automatically.

The build copies these variables into `.env.production`, because Amplify only passes environment variables to the build, not to the running server.

## 5. Make yourself an admin

Sign in on the live site once. Then run this on your Mac to open a database editor in the browser:

```
DATABASE_URL="<rds url>" npx prisma studio
```

Open the **User** table and set `isAdmin` to `true` on your user. The `/admin` page then shows reported reviews.

## Costs

- The RDS free tier covers one micro instance for 12 months on a new account. After that it costs about USD 15 a month.
- Amplify's free tier covers small traffic.
- Set a **Billing → Budget** alert, for example USD 5, so nothing surprises you.
