import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useCallback } from "react";
import { useSWRConfig } from "swr";
import useSWRImmutable from "swr/immutable";
import ContentContainer from "../../components/ContentContainer";
import Header from "../../components/Header";
import ProblemLeaderboard from "../../components/ProblemLeaderboard";
import ProblemSubmitAttempt from "../../components/ProblemSubmitAttempt";
import styles from "../../styles/ProblemId.module.css";
import { ProblemMetadata } from "../../types/Problem";

const ProblemId: NextPage = () => {
    // Problem ID is encoded in query parameters captured by the Next.js router
    const { query } = useRouter();
    const problemId = Array.isArray(query.id) ? query.id[0] : query.id;

    const { data, error } = useSWRImmutable<ProblemMetadata>(
        problemId ? `/api/problem/${problemId}` : null
    );

    const { mutate } = useSWRConfig();

    const onSolutionSubmit = useCallback(() => {
        // Trigger update of leaderboard
        mutate(`/api/problem/${problemId}/leaderboard`);
    }, [mutate, problemId]);

    return (
        <div>
            <Header
                subtitle={data?.title}
                breadcrumbs={[
                    { href: "/", label: "Home" },
                    { href: "#", label: data?.title ?? "" },
                ]}
            />
            <ContentContainer childrenWrapperClassName={styles.pageContainer}>
                <div className={styles.title}>
                    <h2>{data?.title}</h2>
                    <span>Problem {problemId}</span>
                </div>

                <div className={styles.description}>
                    <h3>Description</h3>
                    <div
                        className={styles.descriptionContent}
                        dangerouslySetInnerHTML={{
                            __html: data?.description ?? "",
                        }}
                    />
                    <p className={styles.linkToSource}>
                        This problem can be viewed on the Project Euler website
                        at{" "}
                        <a
                            href={data?.url}
                            rel="noreferrer noopener"
                            target="_blank"
                        >
                            {data?.url}
                        </a>
                    </p>
                    <p className={styles.license}>{data?.license}</p>
                </div>

                <div className={styles.solution}>
                    <div className={styles.solutionContent}>
                        <h3>Submit your solution</h3>
                        <ProblemSubmitAttempt
                            problemId={problemId}
                            onSubmit={onSolutionSubmit}
                        />
                    </div>
                </div>

                <div className={styles.leaderboard}>
                    <h3>Leaderboard</h3>
                    <ProblemLeaderboard problemId={problemId} />
                </div>
            </ContentContainer>
        </div>
    );
};

export default ProblemId;
