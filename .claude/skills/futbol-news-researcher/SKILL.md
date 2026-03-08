---
name: futbol-news-researcher
description: Research weekly football news and produce TikTok-ready scripts with hooks, storytelling, and viral optimization. Covers Barcelona, Real Madrid, Champions League, World Cups, and viral player stories. Use when the user asks to research football news for TikTok content.
---

# futbol-news-researcher

Research weekly football (soccer) news and produce TikTok-ready content packages optimized for viral reach.

## Workflow

### Phase 1: Research

Gather the latest football news from **five source categories**. Research each category independently using parallel WebSearches, then aggregate findings.

#### 1. Sports News Outlets

- ESPN FC, Marca, AS, BBC Sport, The Athletic, Goal.com, Fabrizio Romano
- Match results, post-match analysis, injury updates
- Manager quotes and press conference highlights
- Pundit opinions and hot takes

#### 2. Official Sources

- UEFA (Champions League draws, results, sanctions)
- FIFA (World Cup qualifiers, rankings, rule changes)
- Club sites: FC Barcelona, Real Madrid (official announcements, signings, lineup news)
- La Liga, Premier League, Serie A official channels

#### 3. Transfer and Data Sources

- Transfermarkt (transfer rumors, market values, confirmed deals)
- FBref / WhoScored (standout stats, record-breaking performances)
- Salary/contract data when relevant

#### 4. Social Media Trends

- X/Twitter: trending football hashtags, viral clips, player posts
- Instagram: player stories, behind-the-scenes content
- TikTok: trending football sounds, formats, and challenges
- Identify what formats are currently going viral in football TikTok

#### 5. Community Perspectives

- Reddit (r/soccer, r/Barca, r/realmadrid): fan reactions, upvoted takes
- YouTube: popular football creator angles, debate topics
- Fan forums and podcasts: narratives the mainstream media is missing

---

### Phase 2: Structure

Select **8-12 items** from the research. Balance coverage:

- **Max 3 items per focus area** (Barcelona, Real Madrid, Champions League, etc.)
- **~60% evergreen content** (stories that stay relevant for 3-7 days)
- **~40% breaking/timely content** (must-post-today stories)
- Mix of emotional tones: hype, controversy, nostalgia, humor, shock

For each item, build a **TikTok content package** using the 5-part storytelling framework:

#### 1. Hook (1-3 seconds)
The first line the viewer hears. Must stop the scroll. Types:
- **Pattern interrupt**: "Wait... did you see what Vinicius just did?"
- **Controversial take**: "Mbappe is already a bigger flop than Hazard"
- **Shocking stat**: "Barcelona have won 47 of their last 50 home games"
- **Nostalgia trigger**: "Remember when Messi did this in 2015?"
- **Direct challenge**: "Name one player better than Bellingham right now"

#### 2. Setup (3-15 seconds)
Punchy context that frames the story. Keep it conversational --- like telling a friend at a bar.

#### 3. Tension (15-35 seconds)
Build drama and stakes. Use:
- Comparisons and rivalries
- "But here's the thing..." pivot moments
- Stats that create disbelief
- Historical parallels

#### 4. Payoff (35-50 seconds)
The reveal, conclusion, or emotional peak. Deliver on the hook's promise.

#### 5. CTA (last 5-10 seconds)
Engagement prompt to boost algorithm reach:
- Poll-style: "Who you got? Comment 1 or 2"
- Debate: "Drop your take in the comments"
- Follow: "Follow for more football content like this"
- Share: "Send this to a Madrid fan"

---

### Phase 3: Output

Generate a single markdown file: `futbol-news-{week}.md`

Where `{week}` is the ISO week identifier (e.g., `2026-W10`).

## Output Format

The file must contain:

### YAML Frontmatter

```yaml
---
title: "Futbol News - Week {week}"
week: "{week}"
date_generated: "YYYY-MM-DD"
total_items: <number>
focus_breakdown:
  barcelona: <count>
  real_madrid: <count>
  champions_league: <count>
  la_liga_other: <count>
  international: <count>
  viral_stories: <count>
evergreen_ratio: "<percentage>"
---
```

### Per-Item Fields

For each of the 8-12 items, include:

```markdown
## Item <N>: <Short Title>

**Description:** 2-3 sentence summary of the story and why it matters for TikTok.

**Sources:**
- [Source Name](URL)
- [Source Name](URL)

**Content Type:** <Transfer Rumor | Match Highlight | Hot Take | Historical | Player Profile | Tactical Breakdown | Viral Moment | Fan Culture>

**TikTok Video Title:** <Title optimized for TikTok SEO, max 80 chars>

**Estimated Duration:** <30s | 45s | 60s | 90s>

**Target Audience:** <Barca fans | Madrid fans | General football | Casual viewers>

**Language Recommendation:** <English | Spanish | Bilingual>

### TikTok Script

<The full spoken-word script with pacing markers>
```

### Script Pacing Markers

Use these inline markers in scripts to guide delivery:

- `[pause]` --- brief 0.5-1s silence for dramatic effect
- `[slow down]` --- reduce speaking pace for emphasis
- `[speed up]` --- increase pace to build energy
- `[whisper]` --- lower volume for conspiratorial tone
- `[excited]` --- high energy delivery

### Example Script

```
[excited] WAIT. Did you see what Lamine Yamal just did?! [pause]

So Barcelona are playing Atletico Madrid, right? It's the 87th minute.
They're down 1-0. [slow down] And everyone thinks it's over. [pause]

But here's the thing about Yamal --- this kid doesn't know what pressure means.
He picks up the ball on the right wing, cuts inside past TWO defenders...
[speed up] dribbles past Koke, nutmegs Gimenez, and then [pause]
[slow down] curls it. Top. Corner. Oblak doesn't even move.

[pause] He's 18 years old. EIGHTEEN. And he just saved Barcelona's season.
[pause]

Who's the best young player in the world right now? [pause]
Comment Yamal or Bellingham. Follow for more.
```

## Constraints

- **No fabricated stats or URLs** --- every stat and link must come from actual research
- **Scripts are spoken word** --- write as if speaking, not reading. Use contractions, incomplete sentences, and natural rhythm
- **Max 3 items per focus area** --- ensure variety across stories
- **~60% evergreen content** --- most items should stay relevant for at least 3 days
- **Language flexibility** --- recommend Spanish for La Liga-heavy stories if TikTok audience skews Spanish-speaking
- **No copyrighted music references** --- suggest sound styles, not specific songs
