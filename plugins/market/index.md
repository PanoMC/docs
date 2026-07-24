# Market Plugin

The **Market** plugin adds a full web-store to your self-hosted Pano site. From the admin panel you build and manage a product catalog — products, hierarchical categories, comparison tables, gift codes, automatic discounts, coupon and creator codes, orders, and detailed sales statistics — and configure how the store looks and which payment gateways it offers. Visitors browse a public **Store** page on your theme with search, featured and bestseller sections, product details, comparisons, and a cart. It is developed by the Pano team, free to use, and open source.

::: warning Selling isn't live yet — payments are coming soon
Today Market is a complete **store catalog and management system**, not a working checkout. The admin side is finished and polished, but nothing can actually be sold yet: the storefront's **Checkout** button is disabled with the notice *"Payment is coming soon,"* no orders can be created, configured payment gateways don't charge anything, gift and coupon codes have no visitor-redemption flow, and product **delivery actions** are stored but never executed. Set the store up now, and turn selling on when the payment flow ships.
:::

## Features

- **Products:** Name, slug, description, category, separate **money** and **credit** prices, optional stock, prerequisite products (require-all or require-any-one), required permission, `ACTIVE` / `INACTIVE` / `HIDDEN` status, featured flag, lifetime or time-windowed availability, priority ordering, a FontAwesome icon picker, image upload with automatic thumbnails, and one-click clone. Each product carries **delivery actions** (`CREDIT`, `PERMISSION`, `COMMAND`) targeting Minecraft servers connected through **pano-mc-plugin** — *stored and editable today, but not yet executed*.
- **Categories:** A hierarchical, drag-sortable tree with icon, color, image, description, and `ACTIVE` / `INACTIVE` / `HIDDEN` status (an inactive subtree disappears from the storefront entirely).
- **Comparisons:** Build product-comparison tables with feature rows and yes/no/custom cell values per product; clonable and shown on the storefront.
- **Gifts:** Gift codes of type `PRODUCT`, `CREDIT` (an amount), or `RANDOM` (picked from a product list), with status and start/expiry dates. *(Panel CRUD only for now — no visitor redemption yet.)*
- **Discounts & Coupons:** Automatic **discounts** (percent or fixed; scope all / products / categories; minimum amount, date window, usage limit), code-based **coupons** (percent/fixed, per-product or all, min amount, date window, global and per-customer limits), and per-player **creator codes** with a commission percent and tracked use count and earnings.
- **Orders:** List and detail views with status `PENDING` / `COMPLETED` / `REFUNDED` / `FAILED` and per-order exchange-rate view/refresh/override. *(No orders can be created until checkout ships; deleting a user account anonymizes their orders while keeping the username as a financial record.)*
- **Statistics:** Weekly and monthly revenue charts, this-week / this-month / total sales summaries, best-selling products, most-used payment methods, and a recent-sales table with order-status breakdown — all viewable in a separate **stats currency**.
- **Currency & exchange:** Sales and stats currencies (each `TRY` / `USD` / `EUR` / `GBP`) with an exchange rate maintained **AUTO** (fetched on a configurable interval, minimum 1 hour) or **MANUAL**, plus a manual-refresh button. Every refresh is logged.
- **Activity Log:** Every create/update/delete of catalog items, settings and payment-method changes, order and exchange-rate changes, and payment-secret reveals are recorded in Pano's panel activity log.

## Managing the Store

Everything is managed from the **Market** item in the panel sidebar (store icon, added right after Statistics):

- **/market** — Statistics dashboard.
- **/market/orders**, **/market/categories**, **/market/products**, **/market/comparisons**, **/market/gifts** — catalog and order management (with create/edit pages).
- **/market/discounts** — three tabs: general discounts, coupon codes, and creator codes.
- **/market/settings** — three sections:
  - **General:** store name/description, sales and stats currencies, exchange-rate mode/interval, VAT percent and show-in-price, test mode, guest checkout, minimum order amount, remove cents, bestseller/featured/comparison toggles, purchase emails, and combine-discounts-with-coupons.
  - **Payments:** enable and configure 13 gateways — Tebex, iyzico, Shopier, PayTR, Sipay, Param, Mobil Ödeme, Stripe, PayPal, Mollie, Coinbase Commerce, BTCPay Server, and Bank Transfer.
  - **Credits:** enable credits, credit display name, cashback percent, and an "only accept credits" mode.

Settings are stored in the plugin's config and edited entirely from the panel — no hand-editing needed. Defaults are Turkish-market friendly (currency `TRY`, VAT 20% included, `AUTO` exchange on a 6-hour interval, guest checkout on, credits enabled).

::: tip Secret fields are protected
Payment API keys, merchant keys, and other secrets are stored **masked**. Revealing one requires re-entering your admin password, and every reveal is recorded in the activity log.
:::

## What Visitors See

A **Store** link is added to the site navigation, leading to `/store`: a category sidebar (a tree with product counts), product search, toggleable **Featured** and **Bestsellers** sections, a product grid with price / credit-price / stock / featured badges, a product-detail modal, comparison tables, and a slide-out cart persisted in the browser. Category selection is deep-linkable via `?category=`, and your store name and description appear as the page title and subtitle. The storefront requires no login. As noted above, the cart's **Checkout** button is disabled — *"Payment is coming soon."*

## Prerequisites

- A working, fully set-up self-hosted Pano install (the plugin waits for setup to complete).
- Outbound internet access for **AUTO** exchange rates.
- Minecraft servers connected through **pano-mc-plugin** to target product `COMMAND` / `PERMISSION` actions.
- A merchant account and credentials for each payment gateway you enable.

::: tip Free and official
Market is developed and maintained by the Pano team and licensed under **MIT** — no premium account or license key is required. It is localized in **English, Turkish, and Russian**.
:::

::: warning Uninstalling deletes your store data
Uninstalling the plugin drops its database tables and deletes every uploaded product image. Back up anything you want to keep before removing it.
:::

## Required Permission

All panel pages and the sidebar link are gated on a single permission:
`pano.plugin.pano-plugin-market.manage.market`

## Open Source

This plugin is open source and licensed under the **MIT License**. You can access the source code on GitHub:
- [Source Code](https://github.com/PanoMC/pano-plugin-market)
