"use client";
import React, { useState } from "react";
import Link from "next/link";
import styles from "@/styles/faq/FAQ.module.css";

type FAQItem = {
  question: string;
  answer: React.ReactNode;
};

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(3); // Start with shipping question open

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqItems: FAQItem[] = [
    {
      question: "What is Santowrldwide?",
      answer: (
        <div>
          <p>
            Santowrldwide is a <strong>premium lifestyle brand</strong>{" "}
            dedicated to creating timeless, high-quality apparel. We blend
            modern style with responsible production, ensuring our pieces are
            both fashion-forward and sustainably made.
          </p>
          <p>
            <Link href="/about" className={styles.link}>
              Learn more about us →
            </Link>
          </p>
        </div>
      ),
    },
    {
      question: "Where are Santowrldwide clothes manufactured?",
      answer: (
        <div>
          <p>
            All Santowrldwide apparel is <strong>designed in Canada</strong> and
            ethically produced by carefully selected manufacturing partners
            globally, ensuring high standards for craftsmanship, sustainability,
            and ethical practices.
          </p>
          <p>
            <Link href="/about#production" className={styles.link}>
              Read about our production process →
            </Link>
          </p>
        </div>
      ),
    },
    {
      question: "How do I track my order?",
      answer: (
        <div>
          <p>
            Once your order is shipped, you&apos;ll receive a shipping
            confirmation email containing a tracking number. Use this number to
            track your package via our delivery partner&apos;s website.
          </p>
          <p>
            <Link href="/account/orders" className={styles.link}>
              Track your order →
            </Link>
          </p>
        </div>
      ),
    },
    {
      question: "What are your shipping options and costs?",
      answer: (
        <div>
          <p>We offer the following shipping methods for Canadian customers:</p>
          <ul>
            <li>
              <strong>Canada Post Standard</strong> (3-5 business days): FREE
            </li>
            <li>
              <strong>Local Pickup:</strong> FREE (788 Islington Ave, Toronto,
              Ontario, Canada)
            </li>
            <li>
              <strong>Drop-off delivery service:</strong> $15.99 (weekly Sunday
              delivery)
            </li>
          </ul>
          <p>
            For international orders, please review our dedicated International
            Shipping Page.
          </p>
          <p>
            <Link href="/shipping-returns" className={styles.link}>
              Shipping Information →
            </Link>
          </p>
        </div>
      ),
    },
    {
      question: "What is your returns policy?",
      answer: (
        <div>
          <p>
            You have 30 days from the date of purchase to return your item(s)
            for a refund or store credit. Items must be unworn, unwashed, and in
            original condition with tags attached.
          </p>
          <p>
            <Link href="/shipping-returns#returns" className={styles.link}>
              Start a return →
            </Link>
          </p>
        </div>
      ),
    },
    {
      question: "How do I contact Santowrldwide customer support?",
      answer: (
        <div>
          <p>For customer service assistance, reach us via:</p>
          <ul>
            <li>Email: support@santowrldwide.com</li>
            <li>Phone: +1 (416) 123-4567</li>
            <li>Contact form available on our website.</li>
          </ul>
          <p>Our team is available Monday–Friday, 9:00 am–5:00 pm (EST).</p>
          <p>
            <Link href="/contact" className={styles.link}>
              Contact Us →
            </Link>
          </p>
        </div>
      ),
    },
    {
      question: "What payment methods do you accept?",
      answer: (
        <div>
          <p>
            We accept all major credit cards (Visa, MasterCard, American
            Express), PayPal, Apple Pay, and Google Pay. All transactions are
            securely processed and protected.
          </p>
        </div>
      ),
    },
    {
      question: "Can I exchange an item?",
      answer: (
        <div>
          <p>
            Yes, you can request an exchange within 30 days of purchase for a
            different size or colour of the same product, subject to
            availability. Exchanges must be for items in original, unworn, and
            unwashed condition.
          </p>
          <p>
            <Link href="/shipping-returns#exchanges" className={styles.link}>
              Start an exchange →
            </Link>
          </p>
        </div>
      ),
    },
    {
      question: "Do you have a size guide?",
      answer: (
        <div>
          <p>
            Yes, we provide a detailed sizing guide to help you select the right
            fit. Our sizing charts include specific measurements and
            recommendations for each product.
          </p>
          <p>
            <Link href="/size-guide" className={styles.link}>
              View our size guide →
            </Link>
          </p>
        </div>
      ),
    },
    {
      question: "How can I unsubscribe from your newsletters?",
      answer: (
        <div>
          <p>
            You can unsubscribe by clicking the &quot;unsubscribe&quot; link
            located at the bottom of every email newsletter we send, or manage
            your subscription preferences in your account settings.
          </p>
          <p>
            <Link href="/account/preferences" className={styles.link}>
              Manage your preferences →
            </Link>
          </p>
        </div>
      ),
    },
    {
      question: "Do you have physical store locations?",
      answer: (
        <div>
          <p>
            Yes, you can visit our flagship store located at 788 Islington Ave,
            Toronto, Canada. Additional locations and retailers carrying our
            brand can be found on our Store Locator page.
          </p>
          <p>
            <Link href="/store-locations" className={styles.link}>
              Find store locations →
            </Link>
          </p>
        </div>
      ),
    },
    {
      question: "Is my personal information secure with Santowrldwide?",
      answer: (
        <div>
          <p>
            Yes. Santowrldwide is committed to protecting your privacy and
            ensuring the security of your personal information. We comply
            strictly with data protection regulations, such as GDPR. For further
            details, please refer to our full Privacy Policy.
          </p>
          <p>
            <Link href="/policy" className={styles.link}>
              Privacy Policy →
            </Link>
          </p>
        </div>
      ),
    },
    {
      question: "Can I modify or cancel my order after placing it?",
      answer: (
        <div>
          <p>
            If your order has not been processed yet, modifications or
            cancellations may be possible. Contact our customer service as soon
            as possible to request changes. Once shipped, the order cannot be
            changed or canceled.
          </p>
          <p>
            <Link href="/contact" className={styles.link}>
              Contact us immediately →
            </Link>
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Frequently Asked Questions</h1>

      <div className={styles.faqList}>
        {faqItems.map((item, index) => (
          <div key={index} className={styles.faqItem}>
            <button
              className={`${styles.question} ${
                openIndex === index ? styles.active : ""
              }`}
              onClick={() => toggleFAQ(index)}
            >
              <div className={styles.questionText}>{item.question}</div>
              <div className={styles.icon}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="12"
                  viewBox="0 0 24 12"
                  fill="none"
                  className={openIndex === index ? styles.iconRotated : ""}
                >
                  <g clipPath="url(#clip0_2100_29995)">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12.7116 1.84294L18.3686 7.49994L16.9546 8.91394L12.0046 3.96394L7.05463 8.91394L5.64062 7.49994L11.2976 1.84294C11.4852 1.65547 11.7395 1.55015 12.0046 1.55015C12.2698 1.55015 12.5241 1.65547 12.7116 1.84294Z"
                      fill="#161616"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_2100_29995">
                      <rect
                        width="12"
                        height="24"
                        fill="white"
                        transform="matrix(0 -1 1 0 0 12)"
                      />
                    </clipPath>
                  </defs>
                </svg>
              </div>
            </button>
            {openIndex === index && (
              <div className={styles.answer}>{item.answer}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
