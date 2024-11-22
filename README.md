# Todo: 

- Fix tweet so its perfectly 150 characters. - done
- maybe make it check for all commits actually not just one project. 
- almost like a code review platform for team managers to see how each person is doing.
- console.log(ouput) -> to get ready to send to database. 
- put first data on database
- personally will use sanity, but will get database ready for scaling. 
- tweet button should direct to the blog/official site/link from my blog. 
- change the prompt for the summarize also. (not that bad of results honestly for a blog post.)
- add automation, which is where database would come in handy, but may have to spin up own server. 
- add checkbox for wether twitter premium or not, so that it will limit the text/break it into threads. 
Each blog should only be from the person who signed in commits, so in this case mine only.

database: 
so start with
- each time you summarize, there will be a button to publish (which will be automated). Those documents used to make the blog, should be stored with the blog id, as a refrerence. The actual blog post, should be saved to the profile, referenced in the blog post table. in the actual blog post table, it should be the title, twitter link, blog link, posted date, created at date, image/video reference link, blog contents. 

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

