# Editing the posts

Conventions and working notes for prose in `src/content/blog/`. Read this before copy-editing
an existing post or drafting a new one.

The standing brief is: **fix spelling, grammar, wording that sounds off, and sentences that
are too long or convoluted — leave the structure alone unless asked.** Most of the posts were
migrated out of WordPress, so they carry import artifacts as well as ordinary first-draft
habits. Both are catalogued below.

---

## 1. Voice, and what not to "fix"

The blog is deliberately informal. These are **not** errors:

- Sentence fragments used for rhythm: *"A dangerous precedent to set."*, *"Which, in my
  experience, is pretty often."*, *"Not great."*
- Asides and jokes in parentheses: *"(The horror)"*, *"(I mean, yes — but also.)"*
- Stretched words for tone: *"docker-compose makes it sooo much more convenient"*.
- Occasional mild profanity. It is intentional; leave it.
- Rhetorical repetition and anaphora — two paragraphs opening the same way is a device,
  not an accident.
- First person plural (*we*) shifting to second person (*you*) between posts. Within a
  single paragraph it is worth fixing; across posts it is house style.

When in doubt, keep the voice and fix the grammar underneath it.

### Register: explain, don't perform

Informal is not the same as showy. Prose here should sound like someone thinking out loud,
not like someone landing a line. Edits that make a sentence *more quotable* usually make it
worse, and get reverted:

- **Aphorisms and epigrams.** A closing line built for screenshotting ("X can do this. Only
  a person can do that.") reads as performance. Prefer the plain statement of the same idea.
- **Fragment flourishes.** One-beat fragments are fine for rhythm (§1) but not as a
  drumroll. *"The `$` didn't narrow the exception. It deleted it."* was reworked into an
  ordinary sentence for exactly this reason.
- **Rhetorical questions aimed at the reader**, especially at the end of a section. They
  imply the reader is the one at fault. Make the claim instead.

Preferred shape, when a passage needs strengthening: **more concrete, not louder.** Reach for
a specific image already established in the post rather than an abstraction ("balance",
"rigour"), and keep the judgement first-person ("that is the part worth keeping") rather than
addressed at the reader ("you should…").

### Conclusions specifically

Conclusions have two opposite failure modes and have hit both:

- **Trailing off** — ending on a vague abstraction instead of a point.
- **Overcorrecting** — a conclusion rewritten to be "punchier" turning into a scolding. The
  tell is a closing rhetorical question with an obvious right answer, or an instruction to
  the reader about what to take away.

Watch for *"let's think about…"* and *"if you take anything from this article…"* as lecturing
register. A conclusion that explains its point lands better than one that warns about it, and
one that credits what worked reads as more considered than one that only cautions.

---

## 2. Recurring language patterns

These recur across many posts. Grepping for them first is the fastest way in.

| Pattern | Example | Fix |
|---|---|---|
| `allow to` + infinitive | "SSH also allows to read the same options" | "SSH can also read" / "allows **us** to" |
| `suggest to` + infinitive | "I suggest to use this type of test" | "suggest **using**" |
| Missing `that` | "noticed the information … doesn't paint a clear picture" | "noticed **that** the information" |
| Preposition slips | "in my laptop", "arriving to the host" | on / at |
| `less` vs `fewer` | "machines might have less resources" | "fewer resources" |
| `little` vs `few` | "we have little guarantees" | "few guarantees" |
| Missing inversion after *not only* | "not only this mindset belongs in the past" | "not only **does this mindset belong**" |
| Number agreement | "Most application make use of" | "applications" |
| Doubled words | "to to connect", "the same the same context" | remove one |
| Blended constructions | "How that looks like", "is a strong contradiction to" | "What that looks like", "strongly contradicts" |
| Missing article | "environment like container" | "like **a** container" |
| Compound modifiers unhyphenated | "day to day", "man in the middle", "long running" | hyphenate before a noun |
| `-ing` where a noun is meant | "a set up", "straightforward to setup" | "a setup" / "to set up" |
| Comma splices | "It didn't narrow it, instead it deleted it" | semicolon, dash, or two sentences |
| Mixed conditionals | "what if I didn't notice it, went ahead and pushed" | "if I **hadn't noticed** it, and **had gone** ahead" |
| Idiom slips | "once in a full moon", "got a heart attack" | "once in a blue moon", "**had** a heart attack" |
| Fragments starting with *Which* | "Which will perform every step." | "**This** will perform…" |
| Dangling modifiers | "In addition to containing your public key, **you** can use `authorized_keys`" | make the subject the thing that contains |

Two structural habits worth watching:

- **Colons before code blocks.** The convention is that every sentence introducing a code
  block ends in a colon.
- **Single newlines between sentences.** See §5.

Also check **italics style** (`_underscores_` is the house convention, not `*asterisks*`)
and **hostname/identifier formatting** — names like `www.company.com` are set in backticks
in prose.

---

## 3. Run the code — and run the claims

This produces the most valuable findings of any editing pass.

**Every snippet, every time.** Four snippets were found broken in one pass, all in short
"Snippets" posts — the ones most likely to be copy-pasted:

| Bug | Symptom |
|---|---|
| `{ …; echo "Hello World"}` | `bash -n` → syntax error; the post's point did not run |
| `lsof -ti:8888 \| kill -9` | `kill` reads arguments, not stdin. Needs `xargs` |
| `SSH_AUTH_SOCK=… myuser@myserver` | missing the `ssh` command entirely |
| `object.myField = "123"` | `object` was never defined; the variable is `instance` |

Cheap checks: `bash -n` for shell, `node --check` then actually running it for JavaScript,
`docker inspect` against a real container for Docker templates.

**The counter-lesson matters just as much.** Two things looked broken and were not — a Go
template missing a space, and callback pseudo-code where a `//` comment swallows a line
break. Both were tested, confirmed fine, and left alone. Test before fixing.

**Test the explanation, not just the snippet.** When a post explains *why* something
behaved a certain way, that explanation is a claim and deserves the same treatment. In one
case a post's central technical account — that a regex behaved differently "inside nginx's
PCRE context" — was disproved by running the same pattern in Python, JavaScript, PCRE, and
finally a real nginx container: every flavour behaved identically. The incident the post
described was real, but the stated cause was not, and two of its conclusions rested on it.

Standing up the actual thing in Docker is usually the fastest way to settle it. Keep test
fixtures local — a `Location` header without a port will send `curl -L` to the real public
host of whatever domain the example uses.

When a fix requires *inventing* content — a port number, a variable name, a missing step —
raise it instead of guessing.

---

## 4. Imported-content artifacts

A checklist worth re-running over any newly imported content:

- **Non-breaking spaces** — invisible, break search and text selection. `grep -c $' '`.
  Those inside ASCII directory trees are harmless indentation; the rest are prose.
- **U+2028 LINE SEPARATOR inside a URL** — rendered as `href="…%E2%80%A8"`, a silent 404.
  Sweep the whole invisible-character family: U+2028/2029, zero-width space, soft hyphen,
  BOM, word joiner.
- **Whitespace-only lines** — harmless to Markdown, but they defeat line-based tooling.
- **HTML entities inside code blocks** — `i &lt; INT_MAX` rendered literally.
- **Smart quotes inside code blocks** — terminal output should carry straight apostrophes.
- **Mis-tagged fences** — a ```` ```powershell ```` block holding a shell command.
- **Alt text scraped from the image's origin** — one was a Google Images result caption,
  another a browser download page title.
- **Lost embeds** — a video and a screenshot both vanished, leaving sentences ending in a
  colon that promised something. Ask before inventing a replacement.

---

## 5. Line breaks: joined or split, never left

A recurring habit is: sentence, single newline (a Markdown hard break, `  \n`), another
sentence. The rule applied:

- **Join** when the second sentence continues the same thought — and always when the break
  falls mid-sentence.
- **Split** into a new paragraph when it starts a new move: a new instruction, an example,
  or a bold label.

> **Do not blanket-strip trailing whitespace.** `  \n` is a Markdown hard break. A regex
> cleanup once destroyed 10 real ones and had to be reverted. If a script touches
> whitespace, assert the hard-break count before and after:
> `assert s.count('  \n') == before`. In a post with a genuine count of zero, stripping
> trailing spaces is safe — but verify first rather than assuming.

---

## 6. Structure and headings

- **Posts start at `##`.** The layout renders the frontmatter `title` as the page's `<h1>`,
  so a `#` in the body is a second h1. Most posts already start at `##`.
- **Don't skip levels.** `##` → `####` happens easily when heading weight is chosen for
  looks. Pick the level for the hierarchy, not the font size.
- **The table of contents is generated** by `src/components/TableOfContents.astro` from the
  post's real headings, at every depth, indented relative to the shallowest level present.
  Never hand-write one — it will drift. Do check the rendered TOC after restructuring: long
  or context-dependent headings (`"But surely if you X..."`) read poorly in a sidebar.
- **Promote a section that outgrows its parent.** A subsection running longer than the
  section containing it is usually a top-level part in disguise.
- **Watch for orphans after a reorder.** Swapping two sections can strand a trailing
  subsection under the wrong parent — check the outline, not just the diff.

---

## 7. Conventions

- **Descriptions**: one sentence, under 160 characters, saying what the post *is* — not its
  first sentence, and never repeating the title.
- **Cross-references**: series posts are separate pages now. Link to the sibling
  (`[SSH Agent](/blog/ssh-agent/)`); don't say "the previous section".
- **Spelling**: British (organisation, visualisation, behaviour, tunnelling). One file is
  internally American and is left alone pending a site-wide decision.
- **No comment section.** Invitations to comment point at `/about/`.
- **Frontmatter keys must exist in `src/content.config.ts`.** Zod silently strips unknown
  keys, so a new flag that isn't in the schema disappears without an error.
- **Categories** come from an existing taxonomy; adding a new one creates a category page
  with a single post in it. Fine, but deliberate.
- **Quoted material is not copy-edited.** Transcripts, tool output, and quotations from
  other sources stay verbatim, typos included. If an editing pass introduces a change
  inside one, restore it.

---

## 8. Working method

1. **One file at a time**, reported back before moving on. Summaries surface things a bulk
   diff buries.
2. **Exact-string replacements with assertions** (`assert old in s`, and assert the match is
   unique) rather than regex over prose. A failed assertion is a caught mistake; a silent
   regex miss is not.
3. **Diff against a known-good copy before every write.** Posts get edited in a parallel
   editor between turns. An editor buffer saved after a write will silently clobber it, and
   the reverse is just as possible. Keep a copy, `diff` before writing, and re-read rather
   than assuming the file is as it was left.
4. **Group the report by kind** — grammar, wording, consistency, structure — not by line
   number. It reads as feedback rather than a changelog.
5. **Separate language from content.** Fix language directly. *Raise* content issues and
   wait: wrong facts, chapter numbers, mismatched port numbers, a claim that doesn't hold.
   Several have turned into improvements; none should have been silent edits.
6. **Sweep posts drawn from client work for real identifiers.** Hostnames, subdomains,
   URLs, paths, ports, and proper nouns. Check the staged git blob and history as well as
   the working tree — a redaction in the working file does not help if the original is
   still what `git commit` would record.
7. **Verify with a build** (`npx astro build`) after content changes, and in the browser
   when the change is visual.

---

## 9. Open items

- Titles still needing hyphens: *"junior to mid level developers"* (three posts, plus
  matching link text in the series nav) and *"One line Bash HTTP Server"*.
- Code fences: 239 untagged vs 82 tagged across the blog, so highlighting is inconsistent
  from post to post.
- `serializing-…` uses American spellings while the rest of the blog is British.
- `ssh-tunnelling-and-port-forwarding`: the Remote Port Forwarding example was made
  self-consistent (`-R 8080:localhost:8888`), but `image-10.png` may still show the old
  port numbers.
- `an-isolated-developer-setup-with-docker` ends promising a follow-up post on automated
  end-to-end testing that does not appear to exist.
- `hello-world.md` is deliberately skipped.
