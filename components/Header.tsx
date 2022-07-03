import Head from "next/head";
import Link from "next/link";
import React from "react";
import ContentContainer from "./ContentContainer";
import styles from "./Header.module.css";

export interface Props {
    /** Optional subtitle to render in the <title /> of the document */
    subtitle?: string;
    /** Breadcrumbs to show underneath header */
    breadcrumbs?: readonly { href: string; label: string }[];
}

export const Header: React.FC<Props> = ({ subtitle, breadcrumbs }) => {
    return (
        <>
            {/* HTML <head> contents - not rendered in <body> */}
            <Head>
                <title>
                    Project Euler Solution Validator
                    {subtitle && ` - ${subtitle}`}
                </title>
            </Head>

            <ContentContainer className={styles.header}>
                <Link href="/">Project Euler Solution Validator</Link>
            </ContentContainer>
            {breadcrumbs && (
                <ContentContainer
                    className={styles.nav}
                    childrenWrapperClassName={styles.navChildren}
                >
                    {breadcrumbs.map(({ href, label }) => (
                        <Link key={label} href={href}>
                            {label}
                        </Link>
                    ))}
                </ContentContainer>
            )}
        </>
    );
};

export default Header;
