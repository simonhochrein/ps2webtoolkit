import React, { FC, useEffect, useState } from "react";
import { useFiles } from "../FileContext";
import { Flex, Input, Layout, Typography } from "antd";
import * as colors from "@ant-design/colors";

export const FMCB: FC = () => {
  const { handle } = useFiles();
  const [text, setText] = useState("");
  useEffect(() => {
    if(handle) {
      handle.getFileHandle("FREEMCB.CNF").then(async cnf => {
        const file = await cnf.getFile();
        setText(await file.text());
      })
    }
  }, [handle]);
  return (
    <Layout style={{ height: "100vh", overflow: "hidden" }}>
      <Layout.Header
        style={{
          backgroundColor: colors.blue[5],
        }}
      >
        <Flex align={"center"} style={{ height: "100%" }}>
          <Typography.Title level={4} style={{ margin: 0, color: "white" }}>
            Free McBoot Configurator
          </Typography.Title>
        </Flex>
      </Layout.Header>
      <Layout.Content
        style={{ flex: 1, height: 0, overflowY: "auto", padding: "1rem" }}
      >
        <Input.TextArea value={text} rows={30}/>
      </Layout.Content>
    </Layout>
  )
}