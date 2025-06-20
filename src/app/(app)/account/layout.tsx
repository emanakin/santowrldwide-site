import React, { ReactNode } from "react";
import AccountNav from "@/components/account/AccountNav";
import styles from "@/styles/account/Account.module.css";

interface AccountLayoutProps {
  children: ReactNode;
}

export default function AccountLayout({ children }: AccountLayoutProps) {
  return (
    <div className={styles.accountContainer}>
      <div className={styles.accountContent}>
        <div className={styles.accountSidebar}>
          <AccountNav />
        </div>
        <div className={styles.accountMain}>{children}</div>
      </div>
    </div>
  );
}
