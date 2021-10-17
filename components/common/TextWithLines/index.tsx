import React, { JSXElementConstructor, ReactElement } from "react";
import { Box, BoxProps } from "@chakra-ui/layout";

import styles from "./TextWithLines.module.css";

type Props = BoxProps & {
  text: string | ReactElement<any, string | JSXElementConstructor<any>>[];
};
const TextWithLines: React.FC<Props> = ({ text, ...props }) => {
  return (
    <Box {...props} className={styles.linesLimiter}>
      {text}
    </Box>
  );
};

export default TextWithLines;
