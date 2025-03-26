"use client";
import React from "react";
import Link from "next/link";
import styles from "@/styles/policy/Policy.module.css";

export default function PolicyPage() {
  return (
    <>
      <div className={styles.container}>
        <h1 className={styles.title}>Privacy & Cookie Policy</h1>

        <div className={styles.section}>
          <h2 className={styles.policyTitle}>
            INFORMATION NOTICE ON THE PROCESSING OF PERSONAL DATA PURSUANT TO
            ARTICLES 13 AND 14 OF EU REGULATION 679/2016 (&quot;GDPR&quot;)
          </h2>

          <p className={styles.emphasis}>
            Your privacy is extremely important to us, please read this
            information notice carefully.
          </p>

          <p>
            We wish to inform you in a complete and transparent manner about the
            personal data processing that the company listed in paragraph 1
            below will carry out on your personal data provided by you and/or
            collected in the context of the contacts you will possibly have with
            us, including for example the following:
          </p>
          <ul className={styles.bulletList}>
            <li>
              visiting the website https://www.santowrldwide.com/ (hereinafter
              the &quot;Site&quot;) and/or the other websites referring to the
              brand, interacting with our pages on the social networks (e.g.,
              Facebook, Twitter, Instagram, Weibo, Wechat, etc.),
            </li>
            <li>contacting our Customer Service.</li>
          </ul>

          <p>
            When we collect your personal data, we differentiate between active
            and passive users, depending on how you use our Site or services.
          </p>

          <p>
            You are an <strong>active user</strong> (&quot;User&quot;) when you:
          </p>
          <ul className={styles.bulletList}>
            <li>Register an account;</li>
            <li>Sign up for a newsletter on our website;</li>
            <li>Download and use our applications;</li>
            <li>Engage with us on social networks.</li>
          </ul>

          <p>
            You are a <strong>passive user</strong> (&quot;Passive User&quot;)
            when you visit any and all websites and applications without
            registering.
          </p>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            1. WHO COLLECTS YOUR PERSONAL DATA
          </h2>
          <p>
            The company collecting and processing personal data as an autonomous
            data controller (hereinafter the &quot;Data Controller&quot; or the
            &quot;Company&quot;) is:
          </p>

          <p className={styles.companyInfo}>
            Santowrldwide, with registered office in [City, Country], [Address],
            telephone +[Phone Number], email{" "}
            <a href="mailto:privacy@santowrldwide.com" className={styles.link}>
              privacy@santowrldwide.com
            </a>
            .
          </p>

          <p>
            To facilitate your understanding of the processing activities
            carried out by the above-mentioned subject as the Data Controller,
            we have prepared this document explaining the processing activities
            carried out.
          </p>

          <p>
            This Information Notice is incorporated into our{" "}
            <Link href="/terms" className={styles.link}>
              Terms of Use
            </Link>
            .
          </p>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            2. WHAT PERSONAL DATA WE PROCESS
          </h2>
          <p>
            The Company collects different categories of personal data according
            to the purpose for which it processes them.
          </p>

          <p>
            Herein below we specify which categories of personal data are
            collected; in the following paragraph we will explain for what
            purposes each category of data is processed by the Data Controller
            as appropriate (hereinafter also &quot;Personal Data&quot; if
            processed jointly).
          </p>

          <ul className={styles.dataList}>
            <li>
              <strong>Biographical Data:</strong> name, middle name, surname,
              date of birth, gender;
            </li>
            <li>
              <strong>Contact Data:</strong> address of residence (street, city,
              province, state, cap code), domicile, email address, telephone
              number, mobile number;
            </li>
            <li>
              <strong>Sales Data:</strong> shipping and billing address, method
              of delivery and payment, name of the credit card holder and expiry
              date of the card, information requested by the customer service,
              VAT number and/or tax code, passport number (the passport number
              will be used only for purposes related to payment where required
              by law and within its limits), Global Blue card number;
            </li>
            <li>
              <strong>Tracking of Newsletters and Actions Data:</strong>{" "}
              information relating to the opening of newsletters or links;
            </li>
            <li>
              <strong>Purchase Data:</strong> details of the purchased products
              (e.g., size, price, discount, model, collection, calculated
              spending level, abandoned cart, etc.);
            </li>
            <li>
              <strong>Navigation Data:</strong> data relating to browsing
              behaviour and/or use of the websites of the Data Controller using,
              for example, cookies or information relating to the pages that
              have been visited or searched for, or data related to wishlists
              collected while browsing or shopping on the online store. As for
              the use of cookies, please refer to the Cookie Policy available at
              [https://www.santowrldwide.com/cookie-policy/company-cookie-policy.html].
            </li>
          </ul>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            3. FOR WHAT PURPOSES WE PROCESS YOUR PERSONAL DATA
          </h2>
          <p>
            In this paragraph, we explain for what purposes each category of
            data is processed by the Data Controller.
          </p>

          <h3 className={styles.subsectionTitle}>
            3.1 PURPOSES OF SANTOWRLDWIDE
          </h3>
          <p>
            Santowrldwide is the company that designs and promotes its products.
            It is also the company that manages the shop where you purchase our
            products.
          </p>

          {/* The content appears to be cut off here, so I'm adding a note */}
          <p className={styles.note}>
            This policy continues with additional sections detailing how we use
            your data, your rights, and other legal requirements. For the
            complete policy, please contact us at{" "}
            <a href="mailto:privacy@santowrldwide.com" className={styles.link}>
              privacy@santowrldwide.com
            </a>
            .
          </p>
        </div>

        <div className={styles.footer}>
          <p>Last updated: November 2023</p>
          <p>
            If you have any questions about this Privacy Policy, please contact
            us at{" "}
            <a href="mailto:privacy@santowrldwide.com" className={styles.link}>
              privacy@santowrldwide.com
            </a>
            .
          </p>
        </div>
      </div>
    </>
  );
}
