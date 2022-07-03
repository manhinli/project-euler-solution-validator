import classnames from "classnames";
import React from "react";
import styles from "./ContentContainer.module.css";

export interface Props {
    /** Class to apply to the parent content container */
    className?: string;
    /** Class to apply to the wrapper element around children */
    childrenWrapperClassName?: string;
}

export const ContentContainer: React.FC<React.PropsWithChildren<Props>> = ({
    className,
    childrenWrapperClassName,
    children,
}) => {
    return (
        <div className={classnames(styles.contentContainer, className)}>
            <div className={childrenWrapperClassName}>{children}</div>
        </div>
    );
};

export default ContentContainer;
