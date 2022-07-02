import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import useSWRImmutable from "swr/immutable";
import { ProblemMetadata } from "../types/Problem";

const Index: NextPage = () => {
    const { data, error } =
        useSWRImmutable<readonly ProblemMetadata[]>("/api/problem");

    return (
        <div>
            <Head>
                <title>Project Euler Solution Validator</title>
            </Head>

            <main>
                <ul>
                    {data?.map(({ problemId, title }) => (
                        <li key={problemId}>
                            <Link href={`/problem/${problemId}`}>{title}</Link>
                        </li>
                    ))}
                </ul>
            </main>
        </div>
    );
};

export default Index;
