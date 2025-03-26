"use client";
import React from "react";
import Link from "next/link";
import styles from "@/styles/shipping/ShippingReturns.module.css";

export default function ShippingReturnsPage() {
  return (
    <>
      <div className={styles.container}>
        <h1 className={styles.title}>Shipping & Returns</h1>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Returns & Exchanges</h2>
          <p>
            You have <strong>30 days</strong> from the date of purchase to
            return your items for a refund or store credit. All returned
            products must be unworn, unwashed, and in their original packaging.
          </p>
          <p>
            To initiate a return or exchange, please visit{" "}
            <a
              href="https://santowrldwide.happyreturns.com"
              className={styles.link}
            >
              https://santowrldwide.happyreturns.com
            </a>
            .
          </p>
        </div>

        <div className={styles.section}>
          <h3 className={styles.subsectionTitle}>Holiday Returns:</h3>
          <p>
            Purchases made between <strong>November 1</strong> and{" "}
            <strong>December 31</strong> are eligible for returns until{" "}
            <strong>February 1, 2024</strong>.
          </p>
          <h4 className={styles.itemTitle}>Special Product Returns (OOFOS):</h4>
          <ul className={styles.bulletList}>
            <li>
              For <strong>OOFOS Classic Flex Slide</strong>, please email us at{" "}
              <a href="mailto:hello@santowrldwide.com" className={styles.link}>
                hello@santowrldwide.com
              </a>
              .
            </li>
            <li>
              For all other OOFOS products, initiate your return at{" "}
              <a
                href="https://santowrldwide.happyreturns.com"
                className={styles.link}
              >
                https://santowrldwide.happyreturns.com
              </a>
              .
            </li>
          </ul>
        </div>

        <div className={styles.section}>
          <h3 className={styles.subsectionTitle}>International Returns:</h3>
          <p>
            At this time, returns are <strong>not accepted</strong> for
            international purchases.
          </p>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Shipping Information</h2>
          <h3 className={styles.subsectionTitle}>Order Processing:</h3>
          <p>
            Orders are processed and shipped Monday through Friday, excluding
            Canadian holidays. You will receive a tracking number via email once
            your order ships. Santowrldwide is not responsible for shipping
            delays once the product leaves our warehouse.
          </p>
        </div>

        <div className={styles.section}>
          <h3 className={styles.subsectionTitle}>Shipping Options:</h3>
          <ul className={styles.bulletList}>
            <li>
              <strong>Standard Domestic Shipping</strong> (Canada Post): 3–5
              business days
            </li>
            <li>
              <strong>Local Pickup</strong> (Toronto): Free pickup available at
              788 Islington Ave, Toronto, Ontario.
            </li>
            <li>
              <strong>Drop-off Service</strong> (Toronto area): Deliveries
              dispatched every Sunday ($15.99 fee).
            </li>
          </ul>
          <p>
            We offer <strong>free standard domestic shipping</strong> for all
            Canadian orders over $150.
          </p>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>International Shipping</h2>
          <p>
            We offer international shipping to the following countries, with
            duties and taxes included at checkout:
          </p>
          <p className={styles.countryList}>
            Australia, Austria, Belgium, Bulgaria, Canada, Croatia, Cyprus,
            Czechia, Denmark, Estonia, Finland, France, Germany, Greece, Hong
            Kong SAR, Hungary, Ireland, Israel, Italy, Latvia, Lithuania,
            Luxembourg, Malta, Mexico, Netherlands, New Zealand, Poland,
            Portugal, Romania, Singapore, Slovakia, Slovenia, South Korea,
            Spain, Sweden, United Kingdom.
          </p>
          <p>
            For countries not listed above, a flat fee of <strong>$20</strong>{" "}
            applies, shipped DDU (Delivery Duty Unpaid). Additional duties or
            taxes may be the responsibility of the customer.
          </p>
          <p>
            At this time, shipments are <strong>suspended</strong> for Belarus,
            Russia, and Ukraine.
          </p>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Final Sale Items</h2>
          <p>
            The following items are final sale and <strong>not eligible</strong>{" "}
            for returns or exchanges:
          </p>
          <ul className={styles.bulletList}>
            <li>Sale items</li>
            <li>Intimates (e.g., underwear, socks)</li>
            <li>Gift cards</li>
            <li>Paper products (posters, prints)</li>
            <li>Custom or limited-edition artwork</li>
          </ul>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Refund Processing</h2>
          <p>
            Refunds are processed within <strong>3–5 business days</strong>{" "}
            after the returned items are delivered to our warehouse. Original
            payment methods or store credits will be issued accordingly.
          </p>
          <p>
            To initiate a return, visit{" "}
            <a
              href="https://santowrldwide.happyreturns.com"
              className={styles.link}
            >
              https://santowrldwide.happyreturns.com
            </a>
            .
          </p>
        </div>

        <div className={styles.disclaimer}>
          <p>
            <strong>Disclaimer:</strong> Shipping terms, conditions, and prices
            are subject to change without notice. Estimated delivery times may
            vary due to circumstances beyond our control. By purchasing from
            Santowrldwide, you agree to our{" "}
            <Link href="/policy" className={styles.link}>
              Terms & Conditions
            </Link>{" "}
            and{" "}
            <Link href="/policy" className={styles.link}>
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </>
  );
}
