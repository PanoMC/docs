# Mail Templates

Every e-mail Pano sends — the platform's own mails and the mails of your plugins — can be rewritten from the panel,
in every language your site offers. Open **Panel → Settings → Mail templates**. Sending itself (SMTP or Pano Mail) is
set up in [Services → Email](../services/#email-smtp).

You need the **Manage Mail Templates** permission. Every save and reset is recorded in the activity log.

## What you can edit

The page lists mails grouped by who sends them:

- **Platform:** account activation, e-mail change confirmation, password updated, password reset, banned, and server
  alerts.
- **Plugins:** every installed and running plugin that sends mail, for example Auth Guard's magic login link, Premium
  Login's username change mail and the Market's store mails. A plugin's mails disappear from the list while the plugin
  is stopped.

Some mails come in **variants**: one mail with a separate text for each situation. Server alerts have one variant per
alert (server crashed, node offline, backup failed, disk low, TPS low, schedule failed, plugin updates); the Market has
one per order, subscription and shipment mail. Mails without such kinds have a single **Default** variant.

You edit one **mail × variant × language** at a time. A badge marks the languages you have changed.

## The editor

The shared look (logo, white card, button, footer line) comes from the layout, so a template is only its texts:

| Field | What it is |
| --- | --- |
| **Subject** | The subject line (required, at most 255 characters) |
| **Preheader** | The short preview line mail apps show next to the subject; hidden in the mail itself |
| **Body** | The message, as HTML in a code editor (shown formatted, saved compact) |
| **Button label / URL** | The main button; leave the URL empty for a mail without a button |
| **Footer** | A small note under the card, e.g. "If you did not ask for this, ignore this mail" |

::: v-pre

**Inserting variables.** The side list shows what the selected mail knows (username, links, amounts…). Click one to
insert it at the cursor as `{{username}}`. Variables work in every
field, including the subject and the button URL. Some variables are ready-made **blocks** the plugin builds for you,
such as the Market's items table or bank transfer instructions; they are inserted as `{{{items}}}` (three braces) and
should stay on a line of their own.

These are available in every mail: `{{websiteName}}`, `{{websiteUrl}}`, `{{websiteLogo}}`, `{{year}}`, `{{locale}}`.

**Advanced (HTML).** The **Advanced** tab shows the whole mail as one HTML document: the shared layout with your
fields already in it. Saving there stores that full HTML, and the mail then no longer follows the shared layout.


**Handlebars.** Every field, the body, the full HTML and the layout are [Handlebars](https://handlebarsjs.com/guide/)
templates: `{{name}}` prints a variable, `{{{name}}}` prints a ready-made HTML block, `{{#if name}}…{{else}}…{{/if}}`
shows a part only when a value is there, and `{{#each list}}…{{/each}}` repeats a part. Only the built-in helpers work
(`if`, `unless`, `each`, `with`, `lookup`); custom helpers are not available. See the
[Handlebars guide](https://handlebarsjs.com/guide/) for the full syntax.
:::

**Preview** renders your unsaved changes with sample values, so you see the mail before anyone gets it. **Send test
mail** sends that preview to your own address; it needs working mail settings and tells you when sending is off or
Pano Mail is not reachable. **Save** checks the template first and points at the field with a mistake (empty subject,
a subject that is too long, or Handlebars that does not compile).

**Reset to default** drops your version of that language, and the default text comes back.

### The layout

::: v-pre

**Edit layout** opens the one HTML layout every mail is wrapped in: the logo header, the card, the button and the
footer. It holds no text of its own, so one layout serves every language. It must keep the `{{{content}}}` slot,
where each mail's body goes. **Reset to default** brings back Pano's layout.

:::

## Which language is sent

A mail goes out in the recipient's language (their account language, otherwise the site language). For that language
Pano uses the first text it finds:

1. your edited version of that language,
2. the default text of that language,
3. the default text of the base language (`pt-BR` falls back to `pt`),
4. your edited English (`en-US`) version,
5. the default English text.

So a language you add in **Panel → Translations** sends English mails until you write its templates here; opening it
in the editor starts from the English text, and the editor says which language the default came from.

## Updates

Your edits are kept in the database and survive Pano and plugin updates. When an update brings new default wording,
you see it only in the languages you never changed; use **Reset to default** to take the new text for a language you
did change.
