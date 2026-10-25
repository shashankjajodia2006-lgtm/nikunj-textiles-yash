# Nikunj Textiles — Official Online Store (Brand: Yash)

A production-grade, responsive e-commerce web application built for **Nikunj Textiles** to showcase and sell garments under the flagship brand **YASH®**.

---

## 🌟 Key Highlights & Brand Theme
- **Official Brand Theme Color:** The signature **YASH Crimson Red** (`#CD221B`) sampled directly from the official brand banner logo, accented with Royal Navy (`#0E2A5A`) and warm Gold accents.
- **Accurate Catalog & Dynamic Pricing:** Meticulously digitized from the two official price lists:
  1. **Innerwear & Casualwear Price List** (W.E.F. 15th May 2026) — Men's, Women's, and Kid's undergarments.
  2. **Winter Innerwear Price List** (W.E.F. 1st July 2026) — Yash Oswal Cottswool and Xpoze thermals.
- **Dynamic Size-Based Pricing:** Garment prices adjust immediately upon selecting different sizes (e.g. Size 75 vs Size 80x90 vs Size 95x100), with automatic breakdown of per-piece cost for 10-piece and 12-piece value packs.
- **B2B Bulk Order Matrix Sheet:** An interactive grid mirroring the physical price list where wholesale dealers and retail shopkeepers can input order quantities across all sizes simultaneously and export a Purchase Order or add to bag in 1-click.
- **Dual Order Channels:**
  - **Online Checkout:** Customer details, delivery address, payment options (Cash on Delivery, Instant UPI with Dynamic QR Code, and Card/NetBanking) + Instant Printable Tax Invoice.
  - **Direct WhatsApp Ordering:** Pre-fills an itemized order message with products, sizes, quantities, and pricing for direct confirmation via WhatsApp.
- **Full Asset Integration:** Embedded real photos from the brochure (female model for Gloria, male model for Judo, kid models, Cottswool packaging, and winter thermals couple).

---

## 📂 Project Structure

```text
nikunj-textiles-yash/
├── assets/
│   ├── yash_logo_banner.jpg         # Official Yash red banner logo
│   ├── yash_box_cottswool.jpg       # Yash Oswal Cottswool packaging box
│   ├── yash_couple_thermals.jpg     # Couple in winter thermals
│   ├── yash_kid_thermal.jpg         # Kid in winter thermal wear
│   ├── model_women_gloria.jpg       # Female model in Gloria slip & panty
│   ├── model_men_judo.jpg           # Male model in Judo vest & trunk
│   ├── model_kids_shorty.jpg        # Kids wearing Yash shorty & bloomer
│   ├── undergarments_pricelist.pdf  # Original PDF undergarments price list (May 2026)
│   └── winter_pricelist_original.jpg# Original JPG winter price list (July 2026)
├── css/
│   └── custom.css                   # Brand theme styles, animations, print styles
├── js/
│   ├── products.js                  # Complete digitized catalog (41 garments)
│   └── app.js                       # Store logic: search, filter, cart, matrix, checkout
├── index.html                       # Modern responsive storefront
├── start.bat                        # 1-click Windows launcher
├── start-server.ps1                 # Optional PowerShell local web server
└── README.md                        # Documentation
```

---

## 🚀 How to Run the Store

### Option 1: Instant Launch (No Installation Required)
Double-click `start.bat` or open `index.html` directly in any modern browser (Google Chrome, Microsoft Edge, Firefox).

### Option 2: Run via PowerShell Web Server
Open PowerShell in the project directory and run:
```powershell
powershell -ExecutionPolicy Bypass -File start-server.ps1
```
The server will start at `http://localhost:8080/` and open automatically.

---

## 🛒 Included Garments & Categories

### 1. Women's Undergarments (10 Pcs & 12 Pcs Packs)
- **Gloria Plain Cut Panty** (10 Pcs)
- **Gloria Print Cut Panty** (10 Pcs)
- **Gloria Plain Long Bloomer** (10 Pcs)
- **Gloria Print Long Bloomer** (10 Pcs)
- **Gloria White Slip Box Pack** (10 Pcs)
- **Gloria Colored Slip Box Pack** (10 Pcs)
- **Gloria White Slip Loose Pack** (12 Pcs Dozen)
- **Gloria Colored Slip Loose Pack** (12 Pcs Dozen)
- **Chandni Plain Bloomer** (10 Pcs)
- **Chandni Print Bloomer** (10 Pcs)

### 2. Men's Undergarments (10 Pcs Packs)
- **Judo White Vest (R.N. - Round Neck)**
- **Judo White Vest (R.N.S. - Sleeveless Special)**
- **Xpoze Drawer (T.E. - Top Elastic Long)**
- **Xpoze Mini Trunk (T.E. - Top Elastic)**
- **Xpoze Mini Trunk (I.E. - Inner Elastic)**
- **Xpoze Interlock (T.E. - H-Back)**
- **Hit Boss Drawer (T.E. - H-Back)**
- **Hit Boss Drawer (I.E. - H-Back)**
- **Force Fit Drawer (T.E. - H-Back)**
- **Force Fit Drawer (I.E. - H-Back)**
- **Force Fit Mini Trunk (T.E. - Top Elastic)**
- **Force Fit Mini Trunk (I.E. - Inner Elastic)**
- **Xpoze Interlock Pocket Drawer (H-Back)**

### 3. Kid's Undergarments (10 Pcs Packs)
- **Yash Shorty (I.E. - Inner Elastic Long)**
- **Yash Xpoze Junior (T.E. - Top Elastic Long)**
- **Chandani Bloomer Plain (Long)**
- **Chandani Bloomer Print (Long)**

### 4. Winter Thermals (Yash Oswal Cottswool & Xpoze)
- **Yash Oswal Cottswool R.N.F.S Men's Top** (Sizes 75 to 100)
- **Yash Oswal Men's Trouser (Inner Elastic & Top Elastic)**
- **Yash Oswal Ladies Thermal Blouse (BL)**
- **Yash Oswal Ladies Thermal Trouser (T.E.)**
- **Xpoze Heavyweight Men's Thermal Top & Trouser**
- **Xpoze Ladies 3/4 Sleeve Thermal Slip & Trouser**
- **Yash Oswal Kids Thermal Pullovers (Dark & Solid)**
- **Yash Oswal Kids Thermal Trousers**
- **Xpoze Kids 2-Piece Thermal Combo Suit** (Sizes 40 to 73)
- **Xpoze Kids Individual Tops & Trousers**

---

## 📞 Order & Wholesale Contact Desk
- **WhatsApp for Orders:** [+91 94151 00235](https://wa.me/919415100235)
- **Direct Phone:** +91 94151 00235
- **Brand Office:** Nikunj Textiles (Flagship Brand Yash), Ahmedabad, Gujarat

