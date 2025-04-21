import React, { FC, PropsWithChildren, JSX } from "react";
import { Flex, Layout, Typography } from "antd";
import * as colors from "@ant-design/colors";

type PS2WTLayoutProps = PropsWithChildren<{
  title: React.ReactNode;
  header?: () => JSX.Element | null;
}>;

export const PS2WTLayout: FC<PS2WTLayoutProps> = ({
  title,
  header,
  children,
}) => {
  return (
    <Layout style={{ height: "100vh", overflow: "hidden" }}>
      <Layout.Header
        style={{
          backgroundColor: colors.blue[5],
        }}
      >
        <Flex align={"center"} style={{ height: "100%" }}>
          <Typography.Title level={4} style={{ margin: 0, color: "white" }}>
            {title}
          </Typography.Title>
          {header?.()}
        </Flex>
      </Layout.Header>
      <Layout.Content
        style={{ flex: 1, height: 0, overflowY: "auto", padding: "1rem" }}
      >
        {children}
      </Layout.Content>
    </Layout>
  );
};
