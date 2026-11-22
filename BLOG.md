# Publishing a post

Copy [post-template.txt](posts/post-template.txt) into `posts/` with a `.md`
extension. Fill out the title, publication date (YYYY-MM-DD), listing description,
section, category, and Markdown body. Add an optional `socialDescription` for
social previews, `tags` as a list of topics, and `author` (defaults to Jamie).
The listing description is used in social previews when `socialDescription`
is omitted. For a cover image, use a path such as `/assets/post-photo.jpg` or an
absolute HTTPS URL, and include `imageAlt` if the cover conveys information.

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

