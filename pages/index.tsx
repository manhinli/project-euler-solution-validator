import type { NextPage } from "next";
import Link from "next/link";
import useSWRImmutable from "swr/immutable";
import ContentContainer from "../components/ContentContainer";
import Header from "../components/Header";
import { ProblemMetadata } from "../types/Problem";

const Index: NextPage = () => {
    const { data, error } =
        useSWRImmutable<readonly ProblemMetadata[]>("/api/problem");

    return (
        <div>
            <Header breadcrumbs={[{ href: "/", label: "Home" }]} />
            <ContentContainer>
                <h2>Welcome</h2>
                <p>Welcome to the Project Euler Solution Validator service.</p>
                <p>To view problem descriptions, begin submitting solutions, and view leaderboards, select a problem below.</p>
                <table>
                    <tbody>
                        {data?.map(({ problemId, title }) => (
                            <tr key={problemId}>
                                <td>{problemId}</td>
                                <td>
                                    <Link href={`/problem/${problemId}`}>
                                        {title}
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </ContentContainer>
        </div>
    );
};

export default Index;
