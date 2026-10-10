import * as React from "react";
import type { ReactNode } from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { usePluginData } from "@docusaurus/useGlobalData";
import Layout from "@theme/Layout";
import styles from "./index.module.css";
import ReactMarkdown from "react-markdown";

type RecentBlogPost = {
  metadata: {
    title: string;
    description: string;
    date: string;
    permalink: string;
  };
};

type BlogPluginData = {
  default: {
    recentPosts: RecentBlogPost[];
  };
};

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  const logo = useBaseUrl("/img/logo.png");
  return (
    <header className={clsx("hero hero--primary", styles.heroBanner)}>
      <div className="container">
        <img src={logo} className={styles.heroLogo} alt="Buttplug Logo" />
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className={clsx("hero__subtitle", styles.heroSubtitle)}>
          An open-source software library and application ecosystem for
          controlling intimate hardware, including sex toys, fucking machines,
          and more.
        </p>
        <p className={styles.heroTagline}>
          We were vibe coding before it was cool.
        </p>
        <div className={styles.buttons}>
          <Link
            className="button button--primary button--lg"
            to="/docs/dev-guide/getting-started"
          >
            Quickstart Guide
          </Link>
          <Link
            className="button button--secondary button--lg"
            to="/docs/dev-guide/"
          >
            Developer Guide
          </Link>
        </div>
        <div className={styles.infoBox}>
          <p>
            Not a developer? Looking for Intiface Central or other applications?{" "}
            <Link to="https://intiface.com">
              Head over to the Intiface page.
            </Link>
          </p>
        </div>
      </div>
    </header>
  );
}

function FeaturesSection() {
  const features = [
    {
      title: "🦀 Built with Rust",
      description:
        "Implemented in [Rust](https://github.com/buttplugio/buttplug), with bindings for [C#](https://github.com/buttplugio/buttplug-csharp), [JS/TS](https://github.com/buttplugio/buttplug-js), and other languages.",
    },
    {
      title: "🎮 Wide Hardware Support",
      description:
        "Support for over 750 different pieces of hardware, from popular brands like [Lovense](https://lovense.buttplug.io), [Kiiroo](https://kiiroo.buttplug.io), [The Handy](https://thehandy.buttplug.io), WeVibe, Satisfyer, OSR-2/SR-6, and more.",
    },
    {
      title: "🔌 Multiple Protocols",
      description:
        "Support for Bluetooth, USB, HID, Serial, and Network controlled devices.",
    },
    {
      title: "❓ Many Support Options",
      description:
        "Have a problem? Check with us on [our forums](https://discuss.buttplug.io), [Discord](https://discord.buttplug.io), or [Subreddit](https://www.reddit.com/r/buttplugio/)!",
    },
    {
      title: "🎯 Game Engine Plugins",
      description:
        "Plugins for building games and apps in [Unity](https://github.com/buttplugio/buttplug-unity), Godot, Unreal, [Twine](https://github.com/buttplugio/buttplug-twine), and more!",
    },
    {
      title: "📖 Cross-Platform & Open Source",
      description:
        "Libraries available for Desktop/Mobile/Web. Open Source with Permissive License (BSD 3-Clause).",
    },
  ];

  return (
    <section className={styles.features}>
      <div className={clsx("container", styles.featuresContainer)}>
        <h2 className={styles.sectionTitle}>Features</h2>
        <div className="row">
          {features.map((feature, idx) => (
            <div key={idx} className={clsx("col col--4", styles.featureGrid)}>
              <div className={clsx("text--center", styles.featureCard)}>
                <h3>{feature.title}</h3>
                <ReactMarkdown>{feature.description}</ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function NewsSection() {
  const { recentPosts } = (
    usePluginData("docusaurus-plugin-content-blog", "blog") as BlogPluginData
  ).default;

  return (
    <section className={styles.newsSection}>
      <div className="container">
        <h2 className={styles.sectionTitle}>Latest News</h2>
        <div className={styles.newsContainer}>
          {recentPosts.length > 0 ? (
            <ul className={styles.newsList}>
              {recentPosts.map((post, idx) => (
                <li key={idx} className={styles.newsItem}>
                  <span className={styles.newsDate}>
                    {new Date(post.metadata.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })}
                  </span>
                  <span className={styles.newsTitle}>
                    <Link to={post.metadata.permalink}>
                      {post.metadata.title}
                    </Link>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.newsEmpty}>No blog posts available yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}

function ResourcesSection() {
  return (
    <section className={styles.resources}>
      <div className="container">
        <h2 className={styles.sectionTitle}>Resources</h2>
        <div className="row">
          <div className="col col--4">
            <div className={styles.resourceCard}>
              <div className={styles.resourceCardHeader}>
                <h3>📱 Hardware Support</h3>
              </div>
              <div className={styles.resourceCardBody}>
                <p>Want to know if your toy/hardware is supported?</p>
                <Link
                  to="https://iostindex.com"
                  className="button button--primary button--block"
                >
                  Check IOSTIndex
                </Link>
              </div>
            </div>
          </div>
          <div className="col col--4">
            <div className={styles.resourceCard}>
              <div className={styles.resourceCardHeader}>
                <h3>📚 Documentation</h3>
              </div>
              <div className={styles.resourceCardBody}>
                <p className={styles.resourceLink}>
                  <Link to="/docs/dev-guide/">Developer Guide</Link>
                </p>
                <p className={styles.resourceLink}>
                  <Link to="/docs/spec">Protocol Specification</Link>
                </p>
                <p className={styles.resourceLink}>
                  <Link to="/stpihkal">Sex Toy Protocols (STPIHKAL)</Link>
                </p>
              </div>
            </div>
          </div>
          <div className="col col--4">
            <div className={styles.resourceCard}>
              <div className={styles.resourceCardHeader}>
                <h3>🎬 In the Media</h3>
              </div>
              <div className={styles.resourceCardBody}>
                <p className={styles.mediaLink}>
                  <Link to="https://www.rollingstone.com/culture/culture-features/teledildonics-covid-19-sex-toys-967440/">
                    Rolling Stone: Teledildonics and COVID-19
                  </Link>
                </p>
                <p className={styles.mediaLink}>
                  <Link to="https://www.vice.com/en/article/here-s-why-we-need-more-open-source-software-for-buttplugs/">
                    Vice Motherboard: Open Source Software For Buttplugs
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SupportedHardwareSection() {
  const brands = [
    "Lovense (All products)",
    "Kiiroo (All products)",
    "The Handy",
    "Joyhub",
    "Galaku",
    "We-Vibe",
    "Mysteryvibe",
    "Vorze",
    "Vibratissimo",
    "Magic Motion",
    "MotorBunny",
    "Tempest OSR-2/SR-6/SSR-1",
    "XBox Compatible Gamepads (Rumble)",
    "Nintendo Switch Joycons (Rumble)",
    "Protogens",
    "V1 (V2 and Gabriel coming soon)",
    "And more being added regularly!",
  ];

  return (
    <section className={styles.hardware}>
      <div className="container">
        <h2 className={styles.sectionTitle}>Supported Hardware Brands</h2>
        <p className={styles.hardwareSubtitle}>
          See <Link to="https://iostindex.com">iostindex.com</Link> for a
          complete list
        </p>
        <div className="row">
          <div className="col col--8 col--offset-2">
            <div className={styles.brandGrid}>
              {brands.map((brand, idx) => (
                <div key={idx} className={styles.brandChip}>
                  {brand}
                </div>
              ))}
            </div>
          </div>
        </div>
        <p className={styles.hardwareNote}>
          Note: Due to different features and requirements in operating systems
          and programming languages, not all hardware may be supported in all
          Buttplug implementations.
        </p>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title={`Buttplug.io Intimate Hardware Control Library`}
      description="Homepage and Documentation for the Buttplug.io Intimate Hardware Control Library"
    >
      <HomepageHeader />
      <main>
        <FeaturesSection />
        <NewsSection />
        <ResourcesSection />
        <SupportedHardwareSection />
      </main>
    </Layout>
  );
}
