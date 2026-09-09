---
title: 'How my agent almost brought a billion-dollar company down'
description: 'How a single character an agent added to an NGINX regex would have turned every production request into a redirect, and the test that caught it.'
pubDate: '2026-09-08'
categories: ['AI', 'Networking', 'Testing', 'NGINX']
---

An agent I was working with made a one-character change to a config file that nobody had asked it to make. The change was entirely defensible and plausible-looking. I happened to notice it, asked about it, and the agent came back with a confident, entirely reasonable-sounding justification for it. And yet, that change would have sent 100% of a major retailer's web traffic into a redirect loop.

The change never shipped, but it almost did. This is not because our tests caught it (none of the ones we already had would have), and also not because our rolling deployment would have rolled it back (it wouldn't have either). In fact, the change in question happened to line up at the perfect intersection of the ["Swiss cheese slices"](https://en.wikipedia.org/wiki/Swiss_cheese_model) of our tests.

Ultimately, it was caught because as a human working with a critical system, I was nervous enough to ask for one more test than I strictly needed.

This is the post-mortem of that near miss, and of what I think it says about the short-term future of AI adoption, especially when that adoption sacrifices human oversight.

## Context: a Very Important System for a Very Important Company

The company in question is a household name retailer whose revenue is measured in "Billions with a B". They have a pretty modern tech stack: microservices running on Kubernetes, good testing practices, CI/CD, you name it. Not a legacy enterprise by any means. Like many other companies, probably yours too, they are keen on adopting AI to see if agents will help them deliver more with fewer people.

Our team is in charge of maintaining some basic infrastructure of their website, which we will call `www.company.com`. Remember the `www` part — it will become important.

### The server sitting in front of all servers

Their frontend is accessed through an NGINX instance that handles routing and composes the microfrontends. It reverse proxies to the first layer of 20+ microservices that are the entry point of `www.company.com`, which in turn proxy to even more microservices.

The main routing logic, for all hostnames, is handled by one server block:

```nginx
# Default: handles the public www.company.com hostname, but also internal
# ones like company.qa.internal, company.dev.internal, service.svc.cluster.local, etc.
server {
    listen 80 default_server;
    server_name _;
    location / {
        return 200 'default-block';
    }
}
```

However, `www` isn't the only subdomain.

Some special subdomains are used as "vanity" subdomains, like `deals.company.com`, which hits a special server configured to redirect to `www.company.com/deals-page`. They look pretty in short links, and marketing likes to use them.

So there is another server block that handles them, configured to match anything that ends with `.company.com` but _doesn't_ start with `www`:

```nginx
# every subdomain of .company.com except www goes here
server {
    listen 80;
    server_name ~^(?<subdomain>(?!www)[a-z0-9-]+)\.company\.com$;
    location / {
        return 301 'vanity-block'; # redirect somewhere relevant
    }
}
```

One more detail: all of the above is in production and running. And preferably it should remain that way.

### What we were trying to change: one critical line of configuration

It turns out that our application has another subdomain, besides `www`, that ends with `.company.com` but should be part of the normal routing because it is not a vanity subdomain. No worries! Let's ask Claude to add it to the exception for now. Maybe later we'll figure out whether we need to make this more generic.

> Hey agent, we have another subdomain which should not be covered by the vanity redirects. It needs to go to the same routing as www. Can you modify the routing file and update the tests?

And the change was:

```nginx
server {
    listen 80;
    server_name ~^(?<subdomain>(?!www$|otherdomain$)[a-z0-9-]+)\.company\.com$;
    location / {
        return 301 'vanity-block'; # redirect somewhere relevant
    }
}
```

Did you notice anything wrong — or just _different_ — about the regex, besides the addition of `otherdomain`? Look again.

## The mistake

This is not just another exclusion: there are also some `$` signs, which are new. Interesting.

> **Me:** Why did you add the dollar signs to the regex?
>
> **Claude:** Without $, the lookahead (?!www) would also exclude subdomains that merely start with www, like wwwshop.company.com — which is a valid vanity subdomain. The $ anchors the match to the full subdomain segment (since the next character is the literal \.), so it only excludes the exact names www and otherdomain. That said, the original regex didn't have $ on www and it worked fine in practice because there are no www* subdomains. If you'd prefer to keep it consistent with the original style, I can drop the $ from both.

Well, I am not opposed in principle to making our regex more future-proof. But I didn't ask the agent to do that, and I would at least like to check that it works. This is quite a critical part of our routing, after all, and NGINX regexes are a bit different from the ones I'm used to in other languages. Better to double check.

### How human paranoia saved the day

So I asked the agent to add a new test: not only for our new hostname, but also for the default hostname, which wasn't covered explicitly since the vanity stuff was added later.

```javascript
// This test runs against a Docker image running NGINX with our config, testing
// the system like a black box. Unit testing NGINX config files is not a thing.
test('www.company.com traffic is not caught by the vanity server block', async () => {
  const paths = [ // some common paths of www.company.com
    '<homepage url>',
    '<some other url>',
    '<some more urls>',
  ]

  for (const path of paths) {
    const { statusCode } = await request(`${dockerHost}${path}`, {
      // Explicitly overriding the hostname, which normal tests don't cover:
      // they use localhost or the QA env's hostname.
      headers: { Host: 'www.company.com' },
    })

    expect(statusCode, `expected 200 for ${path}`).toBe(200)
  }
})
```

Guess what? It failed.

With the new regex, the request was falling into the vanity block, so we got a 301 redirect for anything on `www` instead of a 200. I had a minor heart attack thinking of what could have happened, then I fixed it and everything was fine.

## The techie details on why the change was wrong

If you are curious, here is what that `$` sign actually did.

### Why did `$` cause `www` to match the wrong block?

`$` means end-of-string. Inside the lookahead, `(?!www$)` asks: "is the rest of this string exactly `www`?" For `www.company.com`, it isn't. There is still `.company.com` to go. So the lookahead never fires, and it excludes nothing at all.

The `$` didn't narrow the exclusion; instead, it deleted it entirely. The regex was now doing exactly the opposite of what it was supposed to do, matching every subdomain of `.company.com` _including_ `www` and `otherdomain`.

- **With `$`:** `www` and `otherdomain` land in the vanity block along with everything else. The exception is basically dead code. Anything that isn't a `.company.com` subdomain still isn't matched, though, and goes to the default server.
- **Without `$`:** both correctly fall through to the default block, while `deals` still hits the vanity block as expected.

And this isn't an NGINX oddity either, because the same pattern behaves identically in Python, JavaScript, PCRE and other regex dialects.

### Why didn't the default server win?

Because NGINX's `server_name` matching rules prioritise a regex match over the `default_server` fallback. When `$` broke the lookahead, the regex `~^(?<subdomain>...)\.company\.com$` successfully matched `www.company.com` — and a regex match wins over the fallback.

## The incident that didn't happen

Okay, but _what if_ I hadn't noticed it, and had gone ahead and pushed the change?

### Normal tests wouldn't have caught it

If that test hadn't caught the bug, no other test would have. The other tests only overrode the `Host` header to check the other subdomains. No test set it to `www.company.com` explicitly — because why would it? It is the default server. All the normal routing goes there. The `www` subdomain has been live for... a long time. For as long as the website has existed.

### Tests against pre-prod environments wouldn't have caught it

So with no test catching it, the code would have gone to some pre-production environment, where the hostname would have been something like `company.qa.internal`. That would have matched the default block and the routing would have worked perfectly. It would not have been caught by manual or automated journey / end-to-end tests either.

### What production would have looked like

The bug would have been promoted until it reached the only environment using the real `www.company.com` hostname. Production. 100% of user traffic would have gone into the vanity block and received a 301.

And because the vanity block redirects to a path on `www.company.com`, that redirect would have pointed straight back at itself: every request matching the vanity block, redirecting, and matching it again. Browsers would have given up and shown `ERR_TOO_MANY_REDIRECTS`.

It would not have cost us one wasted request per visitor, either. Browsers follow a redirect chain around twenty times before they stop, so a single page load would have hit NGINX twenty times instead of once. The front door would have been absorbing something like twenty times its normal traffic, from users who were getting nothing at all. All while the services behind it went quiet, because every request was now short-circuiting into a redirect before anything got proxied through.

Not great.

### Production monitoring wouldn't have alerted us either

What's worse, a 301 is a perfectly valid response for any of our normal routes. It is not a 500, not even a 400. So our monitoring would not have flagged it, and our rolling deployment system would not have rolled the change back on its own. No alarms on 3XX status codes either. Every single response would have been a valid redirect, and the dashboards would have stayed green while the website was completely unusable.

The only way we could have found out would have been from the outside: orders dropping to zero (that one does have an alarm), customers complaining, or somebody happening to look at the monitoring and noticing that every status code was a 301.

### "But surely if you X..."

Some readers might think "oh but if you only had _this type of test_ you would have caught it", but no company is perfect — and this company is still pretty damn thorough. They know their testing pyramid. I am talking about AI usage in the real world here: there's bound to be some holes in the Swiss cheese, and this was one of ours.

## So why did the agent add that `$`?

I can't know, and neither can anyone else. That's kind of the problem, if you think about it. Nobody gets to open up the model and read off the reason, so everything below is speculation. But some of it is better founded than the rest, and it is worth spending a few words on it.

**The prompt left room for it.** I asked it to modify the routing file and update the tests. I did not say "change nothing else." Agents are trained to be helpful, and helpful can mean a tidier, more rigorous-looking version of the thing you asked for. `(?!www$|otherdomain$)` looks more precise than `(?!www|otherdomain)`. It looks like something a careful person would write.

**The `$` form is the more familiar shape.** When you want to exclude an exact value, `(?!value$)` is usually the right thing to reach for (in every context where the value really is at the end of the string). That is a lot of contexts. Ours just isn't one of them.

**And there is no step where any of this gets checked.** This is the part I keep coming back to. The agent producing that line is predicting text, not executing a regex. Nothing in the process runs the pattern against `www.company.com` and looks at what comes back, like a human might have on an online regex tester while developing. Unless the agent decides, on its own initiative, to go and test it (and it didn't), a plausible answer and a correct answer are indistinguishable from the agent's perspective.

It is worth remembering, too, that the explanation I got back was not a record of a decision the agent had made earlier. It was written at the moment I asked for it. That makes it a reconstruction rather than a readout, which is a reasonable thing for it to produce, but not the same thing as knowing why the change was made.

## Lessons learned

### Agents will change things you didn't ask them to change

I asked for one subdomain to be added to an exception. I got that, but I also got an unrequested edit to a part of the regex that was already working.

The agent didn't _hide_ it, but nothing marked it out as different from the thing I had actually asked for. It arrived in the same diff, bundled with the change I wanted, and a single character inside a regex is about as easy to skim past as a change can be.

And this was basically a one-line change that I asked for: imagine it as part of a larger diff, of a few dozen lines, going to production and bringing everything down like this. It would take me a while to notice that of all the lines changed, the culprit is actually this almost-identical-regex-but-with-one-character-different-from-the-one-I-asked-for.

### Completely spec-driven development, without looking at the code, is still not viable — and possibly never will be

If no human had looked at that code, nobody would have noticed the addition. The agent didn't consider it worth mentioning unprompted, and didn't consider it worth testing, because it was a case that was already working and not part of our changes.

So "programmers will only look at specs, and the code will become a black box" would have been, at least in this case, a recipe for disaster.

### The agent could not see the blast radius

Nothing in that file says _this block is 100% of production traffic_. There is no comment marking it as the front door, no annotation on the `server_name` line explaining that everything the company sells is somewhere behind it. It is seven lines of configuration that look exactly like the blocks around them.

But I knew it, and not because I am clever, but because I had context that exists nowhere in the repository: which environments use which hostname, what the deploy pipeline does and does not check, and how long that subdomain has been quietly serving every request the business depends on.

An agent and a human can read the same file and see very different things: an NGINX configuration block, versus a single point of failure for an entire network of production systems.

### Agents are good tools, but humans have different incentives

You want to know the real reason I, a human, added that test? Was it because I am the best, most disciplined programmer ever, and this post is just a humble brag? (I mean, yes — but also.) The real reason was fear.

As a human, I am a coward, and yes: I do fear making production changes to systems I know to be Very Important Systems belonging to a Very Important Company, which also happens to pay my salary. So I try to be really, really careful when I do it. Because I would very much like to keep my job, thankyouverymuch. And also because I have a healthy sense of reverence for a system I know to be a single point of failure for thousands and thousands of user requests that are generating billions in revenue.

An agent simply does not have the same context, and it does not have the same incentives. So perhaps we should start seeing agents as _complementary_ to human developers, rather than as their replacement.

## Conclusion

So: humans 1, agents 0? Not quite.

I am not going back to writing every line by hand, and I don't think every line deserves this much paranoia. Most lines don't, because they don't belong to systems like these. But that one did, and I believe it takes a human to tell them apart.

Which is the part I would want a director or an executive to take away from this. The agent did most of the work here, but the judgement came from a human who knew what that particular system was, and had something to lose if it broke. This is the quality gate that caught this: not the test suite we already had, not the monitoring, not the automated rollback, all of which would have waved it straight through. And it's the one quality gate that tends to get removed when the rush to adopt AI leads to sacrificing human oversight. No pressure!
