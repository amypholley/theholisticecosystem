# Publishing a post

Copy [post-template.txt](posts/post-template.txt) into `posts/` with a `.md`
extension. Fill out the title, publication date (YYYY-MM-DD), short description,
section, category, and Markdown body. The image is optional. Use a public
site path such as `/assets/post-photo.jpg` or an absolute HTTPS URL.

| Section | Category |
| --- | --- |
| Health | Physical, Mental & Emotional, Spiritual, Purpose, or Social Connections |
| Finance | Any relevant category, such as Budgeting |
| Travel | Any relevant category, such as Road Trips |
| Hobby & Lifestyle | Any relevant category, such as Environment |
| Cooking | Any relevant category, such as Meal Prep |

Run `npm install` and `npm run build` to check the post. Vercel builds the
listing, search index and article on deployment. A title like “A Weekend Walk”
gets the URL `/blog/a-weekend-walk`. Titles must generate unique slugs. Editing a
published title changes its URL, so add a redirect when renaming an article.

